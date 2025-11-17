export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class InMemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();

  constructor(private readonly defaultTtlMs = 0) {}

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs?: number): void {
    const expiresAt = ttlMs === undefined ? this.defaultTtlMs : ttlMs;
    this.store.set(key, {
      value,
      expiresAt: expiresAt ? Date.now() + expiresAt : 0,
    });
  }
}
