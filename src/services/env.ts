import { z } from 'zod';

const envSchema = z.object({
  WORDPRESS_API_KEY: z.string().optional(),
  WORDPRESS_SITE_URL: z.string().url().optional(),
  WORDPRESS_OAUTH_TOKEN: z.string().optional(),
  GOOGLE_TRENDS_PROXY: z.string().url().optional(),
  MAX_PAGES_PER_REQUEST: z
    .string()
    .transform((val) => Number(val))
    .refine((val) => Number.isFinite(val), 'MAX_PAGES_PER_REQUEST must be a number')
    .optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

export const loadEnv = (): EnvConfig => {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Environment validation failed: ${parsed.error.message}`);
  }
  return parsed.data;
};
