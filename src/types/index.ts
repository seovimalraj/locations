export type Source = 'wordpress' | 'google-keywords' | 'google-trends' | 'system';

export interface MCPError {
  source: Source;
  message: string;
  status?: number;
  details?: unknown;
}

export interface WordPressPage {
  id: number;
  slug: string;
  title: string;
  path: string;
  contentHtml: string;
  contentText: string;
  pageType?: string;
}

export interface WordPressContent {
  siteUrl: string;
  pages: WordPressPage[];
  fetchedAt: string;
  pageCount: number;
}

export interface Keyword {
  phrase: string;
  intent?: 'informational' | 'navigational' | 'transactional' | 'commercial';
  volumeScore?: number;
  trendScore?: number;
  source?: Source;
}

export interface ContentSegment {
  title: string;
  body: string;
  pageType?: string;
}

export interface KeywordResearchResult {
  primaryKeyword: Keyword;
  secondaryKeywords: Keyword[];
  relatedQueries: Keyword[];
  segments: ContentSegment[];
  generatedAt: string;
}

export interface PageStructureSection {
  heading: string;
  keywords?: string[];
  intent?: Keyword['intent'];
}

export interface PageStructure {
  title: string;
  description?: string;
  sections: PageStructureSection[];
}

export interface OptimizedSection {
  heading: string;
  content: string;
  wordCount: number;
  keywordDensity: Record<string, number>;
}

export interface OptimizedContent {
  title: string;
  summary: string;
  sections: OptimizedSection[];
  metrics: {
    totalWords: number;
    primaryDensity: number;
    secondaryDensity: Record<string, number>;
    readability: number;
  };
}
