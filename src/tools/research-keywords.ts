import { z } from 'zod';
import { GoogleKeywordSuggestionClient } from '../clients/google-keyword-client.js';
import { GoogleTrendsClient } from '../clients/google-trends-client.js';
import { extractEntities, segmentContent } from '../services/content-analyzer.js';
import { IntentClassifier } from '../services/intent-classifier.js';
import { KeywordProcessor } from '../services/keyword-processor.js';
import { SegmentRouter } from '../services/segment-router.js';
import { logger } from '../services/logger.js';
import { KeywordResearchResult, MCPError, Keyword } from '../types/index.js';

const inputSchema = z.object({
  title: z.string().min(3),
  content: z.string().max(100_000),
  cluster: z.boolean().optional(),
});

export const researchKeywordsSchema = {
  type: 'object',
  properties: {
    title: { type: 'string', minLength: 3, description: 'Title of the source content' },
    content: {
      type: 'string',
      description: 'Full text of the content (max 100KB)',
      maxLength: 100_000,
    },
    cluster: {
      type: 'boolean',
      description: 'Whether to group related keywords into clusters',
    },
  },
  required: ['title', 'content'],
};

export type ResearchKeywordsInput = z.infer<typeof inputSchema>;

export const researchKeywords = async (
  input: unknown,
): Promise<{ result?: KeywordResearchResult; error?: MCPError }> => {
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: { source: 'system', message: parsed.error.message } };
  }

  try {
    const { title, content, cluster } = parsed.data;
    const segments = segmentContent(title, content);
    const router = new SegmentRouter();
    const routedSegments = router.route(segments);
    const entities = extractEntities(content);
    const seedPhrases = [title, ...entities];

    const suggestionClient = new GoogleKeywordSuggestionClient();
    const trendClient = new GoogleTrendsClient(process.env.GOOGLE_TRENDS_PROXY);
    const suggestions = await suggestionClient.batchGetSuggestions(seedPhrases);

    const intentClassifier = new IntentClassifier();
    const keywordProcessor = new KeywordProcessor();

    const enriched: Keyword[] = [];
    for (const keyword of suggestions) {
      const intent = intentClassifier.classify(keyword);
      try {
        const trend = await trendClient.getTrendData(keyword.phrase);
        enriched.push({ ...keyword, intent, trendScore: trend.trendScore });
        enriched.push(...trend.related);
      } catch (error) {
        logger.warn('Trend enrichment failed; continuing with base keyword', { keyword: keyword.phrase, error });
        enriched.push({ ...keyword, intent, trendScore: 0 });
      }
    }

    const filtered = keywordProcessor.filterAndDeduplicate(enriched);
    const primaryKeyword = keywordProcessor.selectPrimaryKeyword(filtered);
    const secondaryKeywords = filtered.filter((kw) => kw.phrase !== primaryKeyword.phrase).slice(0, 10);
    if (cluster) keywordProcessor.clusterKeywords(filtered);

    const result: KeywordResearchResult = {
      primaryKeyword,
      secondaryKeywords,
      relatedQueries: filtered.filter((kw) => kw.source === 'google-trends').slice(0, 10),
      segments: routedSegments,
      generatedAt: new Date().toISOString(),
    };

    return { result };
  } catch (error: any) {
    logger.error('researchKeywords failed', { error });
    return { error: { source: 'system', message: error?.message ?? 'Keyword research failed' } };
  }
};
