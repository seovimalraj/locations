import { Keyword } from '../types/index.js';

export class KeywordProcessor {
  filterAndDeduplicate(keywords: Keyword[]): Keyword[] {
    const seen = new Set<string>();
    return keywords.filter((keyword) => {
      const normalized = keyword.phrase.toLowerCase();
      if (seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    });
  }

  selectPrimaryKeyword(keywords: Keyword[]): Keyword {
    const sorted = [...keywords].sort((a, b) => (b.volumeScore ?? 0) - (a.volumeScore ?? 0));
    return sorted[0] ?? { phrase: 'placeholder primary keyword', source: 'google-keywords' };
  }

  clusterKeywords(keywords: Keyword[]): Keyword[][] {
    const clusters: Record<string, Keyword[]> = {};
    keywords.forEach((keyword) => {
      const bucket = keyword.intent ?? 'informational';
      clusters[bucket] = clusters[bucket] || [];
      clusters[bucket].push(keyword);
    });
    return Object.values(clusters);
  }
}
