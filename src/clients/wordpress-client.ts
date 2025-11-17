import { setTimeout as delay } from 'timers/promises';
import { InMemoryCache } from '../services/cache.js';
import { htmlToText, inferPageType, stripMaliciousHtml } from '../services/content-analyzer.js';
import { logger } from '../services/logger.js';
import { WordPressContent, WordPressPage } from '../types/index.js';

const DEFAULT_TIMEOUT = 25_000;
const PAGE_CACHE_TTL = 5 * 60 * 1000;

export interface WordPressClientOptions {
  siteUrl: string;
  apiKey?: string;
  oauthToken?: string;
  maxPages?: number;
}

export class WordPressClient {
  private cache = new InMemoryCache();

  constructor(private readonly options: WordPressClientOptions) {}

  private authHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    if (this.options.apiKey) headers['Authorization'] = `Bearer ${this.options.apiKey}`;
    if (this.options.oauthToken) headers['Authorization'] = `Bearer ${this.options.oauthToken}`;
    return headers;
  }

  private async request<T>(path: string, signal?: AbortSignal): Promise<T> {
    const url = `${this.options.siteUrl.replace(/\/$/, '')}${path}`;
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...this.authHeaders(),
      },
      signal,
    });
    if (!res.ok) {
      const message = await res.text();
      throw new Error(`WordPress API error ${res.status}: ${message}`);
    }
    return (await res.json()) as T;
  }

  private async withRetry<T>(fn: () => Promise<T>): Promise<T> {
    const delays = [1000, 2000, 4000];
    let lastError: unknown;
    for (const wait of delays) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        logger.warn('WordPress request failed, retrying', { wait });
        await delay(wait);
      }
    }
    throw lastError;
  }

  private sanitizePage(raw: any): WordPressPage {
    const contentHtml = stripMaliciousHtml(raw.content?.rendered ?? '');
    const contentText = htmlToText(contentHtml);
    return {
      id: raw.id,
      slug: raw.slug,
      title: raw.title?.rendered ?? 'Untitled',
      path: raw.link ?? '',
      contentHtml,
      contentText,
      pageType: inferPageType(raw.link ?? ''),
    };
  }

  private paginatePath(resource: 'pages' | 'posts', page: number, perPage: number, search?: string) {
    const params = new URLSearchParams({ page: page.toString(), per_page: perPage.toString() });
    if (search) params.set('search', search);
    return `/wp-json/wp/v2/${resource}?${params.toString()}`;
  }

  private async fetchResource(resource: 'pages' | 'posts', pattern?: RegExp): Promise<WordPressPage[]> {
    const cacheKey = `${resource}:${pattern?.source ?? 'all'}`;
    const cached = this.cache.get<WordPressPage[]>(cacheKey);
    if (cached) return cached;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);
    try {
      const results: WordPressPage[] = [];
      let page = 1;
      const perPage = 10;
      const max = this.options.maxPages ?? 5;
      while (page <= max) {
        const path = this.paginatePath(resource, page, perPage);
        const response = await this.withRetry(() => this.request<any[]>(path, controller.signal));
        if (!response.length) break;
        response.forEach((item) => {
          const sanitized = this.sanitizePage(item);
          if (!pattern || pattern.test(sanitized.path)) results.push(sanitized);
        });
        page += 1;
      }
      this.cache.set(cacheKey, results, PAGE_CACHE_TTL);
      return results;
    } finally {
      clearTimeout(timeout);
    }
  }

  async fetchPages(pattern?: RegExp): Promise<WordPressPage[]> {
    return this.fetchResource('pages', pattern);
  }

  async fetchPosts(pattern?: RegExp): Promise<WordPressPage[]> {
    return this.fetchResource('posts', pattern);
  }

  async fetchContent(pattern?: RegExp): Promise<WordPressContent> {
    const pages = await this.fetchPages(pattern);
    const posts = await this.fetchPosts(pattern);
    const combined = [...pages, ...posts];
    return {
      siteUrl: this.options.siteUrl,
      pages: combined,
      fetchedAt: new Date().toISOString(),
      pageCount: combined.length,
    };
  }
}
