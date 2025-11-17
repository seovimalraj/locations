import { ContentSegment } from '../types/index.js';

export class SegmentRouter {
  route(segments: ContentSegment[]): ContentSegment[] {
    return segments.map((segment) => ({
      ...segment,
      pageType: segment.pageType || this.inferSegmentType(segment),
    }));
  }

  private inferSegmentType(segment: ContentSegment): string | undefined {
    if (/contact|cta/i.test(segment.body)) return 'conversion';
    if (/guide|how to|steps/i.test(segment.body)) return 'guide';
    return undefined;
  }
}
