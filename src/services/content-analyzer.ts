import sanitizeHtml from 'sanitize-html';
import * as cheerio from 'cheerio';
import { ContentSegment } from '../types/index.js';

const PAGE_TYPE_PATTERNS: Record<string, RegExp> = {
  service: /services?|solutions/i,
  blog: /blog|post/i,
  about: /about|team/i,
};

export const inferPageType = (path: string): string | undefined => {
  for (const [type, pattern] of Object.entries(PAGE_TYPE_PATTERNS)) {
    if (pattern.test(path)) return type;
  }
  return undefined;
};

export const stripMaliciousHtml = (html: string): string =>
  sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
    allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, img: ['src', 'alt'] },
  });

export const htmlToText = (html: string): string => {
  const $ = cheerio.load(html);
  return $('body').text().replace(/\s+/g, ' ').trim();
};

export const segmentContent = (title: string, content: string): ContentSegment[] => {
  const paragraphs = content.split(/\n+/).filter(Boolean);
  return paragraphs.map((body, index) => ({
    title: `${title} - Segment ${index + 1}`,
    body: body.trim(),
  }));
};

export const extractEntities = (content: string): string[] => {
  const words = content.split(/\W+/).filter((w) => w.length > 4);
  const unique = new Set(words.map((w) => w.toLowerCase()));
  return Array.from(unique).slice(0, 10);
};
