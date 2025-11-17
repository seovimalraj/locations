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
  title: z.string(),
  content: z.string(),
  cluster: z.boolean().optional(),
});

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
      const trend = await trendClient.getTrendData(keyword.phrase);
      enriched.push({ ...keyword, intent, trendScore: trend.trendScore });
      enriched.push(...trend.related);
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
