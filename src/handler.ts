import { extractWordPressContent } from './tools/extract-wordpress-content.js';
import { researchKeywords } from './tools/research-keywords.js';
import { generateContent } from './tools/generate-content.js';
import { logger } from './services/logger.js';

const toolMap = {
  extract_wordpress_content: extractWordPressContent,
  research_keywords: researchKeywords,
  generate_optimized_content: generateContent,
} as const;

export async function handleRequest(req: Request): Promise<Response> {
  try {
    const payload = await req.json();
    const { tool, input } = payload;
    if (!tool || !(tool in toolMap)) {
      return new Response(JSON.stringify({ error: 'Unknown tool requested' }), { status: 400 });
    }
    const handler = toolMap[tool as keyof typeof toolMap];
    const result = await handler(input);
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    logger.error('Unhandled request error', { error });
    return new Response(JSON.stringify({ error: error?.message ?? 'Unhandled error' }), { status: 500 });
  }
}
