import { z } from 'zod';
import { ContentGenerator } from '../services/content-generator.js';
import { logger } from '../services/logger.js';
import { Keyword, MCPError, OptimizedContent, PageStructure } from '../types/index.js';

const inputSchema = z.object({
  structure: z.object({
    title: z.string(),
    description: z.string().optional(),
    sections: z.array(z.object({ heading: z.string(), keywords: z.array(z.string()).optional() })),
  }),
  primaryKeyword: z.object({ phrase: z.string() }),
  secondaryKeywords: z.array(z.object({ phrase: z.string() })).default([]),
});

export type GenerateContentInput = z.infer<typeof inputSchema>;

export const generateContent = async (
  input: unknown,
): Promise<{ result?: OptimizedContent; error?: MCPError }> => {
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: { source: 'system', message: parsed.error.message } };
  }

  try {
    const structure: PageStructure = parsed.data.structure;
    const primary: Keyword = { ...parsed.data.primaryKeyword, source: 'system' };
    const secondary: Keyword[] = parsed.data.secondaryKeywords.map((kw) => ({ ...kw, source: 'system' }));
    const generator = new ContentGenerator();
    const result = generator.generate(structure, primary, secondary);
    return { result };
  } catch (error: any) {
    logger.error('generateContent failed', { error });
    return { error: { source: 'system', message: error?.message ?? 'Generate content failed' } };
  }
};
