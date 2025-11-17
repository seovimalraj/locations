import { z } from 'zod';
import { WordPressClient } from '../clients/wordpress-client.js';
import { segmentContent } from '../services/content-analyzer.js';
import { logger } from '../services/logger.js';
import { WordPressContent, MCPError } from '../types/index.js';

const inputSchema = z.object({
  siteUrl: z.string().url(),
  pathPattern: z.string().optional(),
  maxPages: z.number().int().positive().max(50).optional(),
});

export type ExtractWordpressInput = z.infer<typeof inputSchema>;

export const extractWordPressContent = async (
  input: unknown,
): Promise<{ result?: WordPressContent; error?: MCPError }> => {
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: { source: 'system', message: parsed.error.message } };
  }

  try {
    const pattern = parsed.data.pathPattern ? new RegExp(parsed.data.pathPattern) : undefined;
    const client = new WordPressClient({
      siteUrl: parsed.data.siteUrl,
      apiKey: process.env.WORDPRESS_API_KEY,
      oauthToken: process.env.WORDPRESS_OAUTH_TOKEN,
      maxPages: parsed.data.maxPages ?? (Number(process.env.MAX_PAGES_PER_REQUEST) || 5),
    });
    const content = await client.fetchContent(pattern);
    content.pages = content.pages.map((page) => ({
      ...page,
      pageType: page.pageType || segmentContent(page.title, page.contentText)[0]?.pageType,
    }));
    return { result: content };
  } catch (error: any) {
    logger.error('extractWordPressContent failed', { error });
    return {
      error: {
        source: 'wordpress',
        message: error?.message || 'Unknown WordPress error',
      },
    };
  }
};
