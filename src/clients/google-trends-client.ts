import googleTrends from 'google-trends-api';
import { InMemoryCache } from '../services/cache.js';
import { logger } from '../services/logger.js';
import { Keyword } from '../types/index.js';

const CACHE_TTL = 60 * 60 * 1000;

export class GoogleTrendsClient {
  private cache = new InMemoryCache(CACHE_TTL);

  constructor(private readonly proxy?: string) {}

  private async fetchTrend(keyword: string) {
    try {
      const result = await googleTrends.interestOverTime({
        keyword,
        startTime: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        proxy: this.proxy,
      });
      return JSON.parse(result);
    } catch (error) {
      logger.error('Trend fetch failed', { error });
      throw error;
    }
  }

  private async fetchRelated(keyword: string) {
    try {
      const result = await googleTrends.relatedQueries({ keyword, proxy: this.proxy });
      return JSON.parse(result);
    } catch (error) {
      logger.warn('Related queries failed', { error });
      return null;
    }
  }

  async getTrendData(keyword: string): Promise<{ trendScore: number; related: Keyword[] }> {
    const cached = this.cache.get<{ trendScore: number; related: Keyword[] }>(keyword);
    if (cached) return cached;

    const interest = await this.fetchTrend(keyword);
    const timeline = interest.default?.timelineData ?? [];
    const trendScore = timeline.length ? Number(timeline.at(-1).value[0]) : 0;
    const relatedResponse = await this.fetchRelated(keyword);
    const related: Keyword[] = relatedResponse?.default?.rankedList?.[0]?.rankedKeyword?.map((item: any) => ({
      phrase: item.query,
      trendScore: item.value,
      source: 'google-trends',
    })) ?? [];

    const result = { trendScore, related };
    this.cache.set(keyword, result);
    return result;
  }
}
