import { setTimeout as delay } from 'timers/promises';
import { InMemoryCache } from '../services/cache.js';
import { logger } from '../services/logger.js';
import { Keyword } from '../types/index.js';

const CACHE_TTL = 24 * 60 * 60 * 1000;

export class GoogleKeywordSuggestionClient {
  private cache = new InMemoryCache(CACHE_TTL);
  private lastRequest = 0;
  private minInterval = 250; // basic rate limiting

  private async rateLimit() {
    const now = Date.now();
    const elapsed = now - this.lastRequest;
    if (elapsed < this.minInterval) {
      await delay(this.minInterval - elapsed);
    }
    this.lastRequest = Date.now();
  }

  private async withRetry<T>(fn: () => Promise<T>): Promise<T> {
    const waits = [500, 1000];
    let lastError: unknown;
    for (const wait of waits) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        logger.warn('Keyword suggestion retry', { wait });
        await delay(wait);
      }
    }
    throw lastError;
  }

  async getSuggestions(seed: string): Promise<Keyword[]> {
    const cached = this.cache.get<Keyword[]>(seed);
    if (cached) return cached;

    await this.rateLimit();
    const fetchSuggestions = async () => {
      const url = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(seed)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Suggestion error: ${res.status}`);
      const json = (await res.json()) as [string, string[]];
      const phrases = json[1] ?? [];
      const keywords: Keyword[] = phrases.map((phrase) => ({ phrase, source: 'google-keywords' }));
      this.cache.set(seed, keywords);
      return keywords;
    };

    try {
      return await this.withRetry(fetchSuggestions);
    } catch (error) {
      logger.error('Failed to get suggestions', { error });
      return [];
    }
  }

  async batchGetSuggestions(seeds: string[]): Promise<Keyword[]> {
    const all: Keyword[] = [];
    for (const seed of seeds) {
      const suggestions = await this.getSuggestions(seed);
      all.push(...suggestions);
    }
    return all;
  }
}
