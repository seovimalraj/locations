import { OptimizedContent, PageStructure, Keyword } from '../types/index.js';

const readability = (text: string): number => {
  const sentences = text.split(/[.!?]/).filter(Boolean).length || 1;
  const words = text.split(/\s+/).filter(Boolean).length || 1;
  const syllables = Math.max(words * 1.3, 1);
  return 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
};

const density = (text: string, keyword: string): number => {
  const wordCount = text.split(/\s+/).filter(Boolean).length || 1;
  const occurrences = (text.toLowerCase().match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
  return occurrences / wordCount;
};

export class ContentGenerator {
  generate(structure: PageStructure, primary: Keyword, secondary: Keyword[]): OptimizedContent {
    const sections = structure.sections.map((section) => {
      const content = this.buildSection(section.heading, primary, secondary);
      const wordCount = content.split(/\s+/).filter(Boolean).length;
      const keywordDensity: Record<string, number> = {};
      keywordDensity[primary.phrase] = density(content, primary.phrase);
      secondary.forEach((kw) => (keywordDensity[kw.phrase] = density(content, kw.phrase)));
      return {
        heading: section.heading,
        content,
        wordCount,
        keywordDensity,
      };
    });

    const totalWords = sections.reduce((sum, s) => sum + s.wordCount, 0);
    const secondaryDensity: Record<string, number> = {};
    secondary.forEach((kw) => (secondaryDensity[kw.phrase] = density(sections.map((s) => s.content).join(' '), kw.phrase)));

    const combinedText = sections.map((s) => s.content).join(' ');
    return {
      title: structure.title,
      summary: structure.description ?? `Overview of ${structure.title} using Indian English and active voice.`,
      sections,
      metrics: {
        totalWords,
        primaryDensity: density(combinedText, primary.phrase),
        secondaryDensity,
        readability: readability(combinedText),
      },
    };
  }

  private buildSection(heading: string, primary: Keyword, secondary: Keyword[]): string {
    const secondaryList = secondary.slice(0, 2).map((kw) => kw.phrase).join(', ');
    return `${heading}: ${primary.phrase} explained in short sentences. We include ${secondaryList} naturally. Clear CTA encourages quick action.`;
  }
}
