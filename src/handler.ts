import { extractWordPressContent, extractWordpressSchema } from './tools/extract-wordpress-content.js';
import { researchKeywords, researchKeywordsSchema } from './tools/research-keywords.js';
import { generateContent, generateContentSchema } from './tools/generate-content.js';
import { logger } from './services/logger.js';
import { metrics } from './services/metrics.js';
import { loadEnv } from './services/env.js';

const tools = {
  extract_wordpress_content: {
    description: 'Fetch and sanitize WordPress pages and posts with optional path filtering.',
    schema: extractWordpressSchema,
    handler: extractWordPressContent,
  },
  research_keywords: {
    description: 'Generate keyword ideas with Google suggestions and Trends enrichment.',
    schema: researchKeywordsSchema,
    handler: researchKeywords,
  },
  generate_optimized_content: {
    description: 'Create structured, keyword-aware content in Indian English with quality metrics.',
    schema: generateContentSchema,
    handler: generateContent,
  },
} as const;

const MAX_EXECUTION_MS = 30_000;
const validatedEnv = loadEnv();

const jsonResponse = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });

export async function handleRequest(req: Request): Promise<Response> {
  if (req.method === 'GET') {
    return jsonResponse({
      tools: Object.entries(tools).map(([name, value]) => ({
        name,
        description: value.description,
        input_schema: value.schema,
      })),
      env: { logLevel: validatedEnv.LOG_LEVEL ?? 'info' },
      metrics: metrics.snapshot(),
    });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, { status: 405 });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), MAX_EXECUTION_MS);

  try {
    const payload = await req.json();
    const { tool, input } = payload ?? {};
    if (!tool || !(tool in tools)) {
      return jsonResponse({ error: 'Unknown tool requested' }, { status: 400 });
    }

    const entry = tools[tool as keyof typeof tools];
    metrics.recordRequest(tool);
    const started = Date.now();
    const result = await entry.handler(input);
    metrics.recordDuration(tool, Date.now() - started);

    return jsonResponse(result);
  } catch (error: any) {
    metrics.recordError('unknown');
    logger.error('Unhandled request error', { error: error?.message || error });
    return jsonResponse({ error: error?.message ?? 'Unhandled error' }, { status: 500 });
  } finally {
    clearTimeout(timer);
  }
}
