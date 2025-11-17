import { Keyword } from '../types/index.js';

export class IntentClassifier {
  classify(keyword: Keyword): Keyword['intent'] {
    const phrase = keyword.phrase.toLowerCase();
    if (/buy|price|quote|service/.test(phrase)) return 'transactional';
    if (/best|top|vs|review/.test(phrase)) return 'commercial';
    if (/how|what|why|guide/.test(phrase)) return 'informational';
    return 'navigational';
  }
}
