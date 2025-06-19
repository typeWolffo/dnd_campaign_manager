import { ParsedNote, NoteSection } from './types';

export class NoteParser {
  static parseNote(content: string, title: string): ParsedNote {
    const sections: NoteSection[] = [];
    let currentSection = '';
    let isPublic = false;
    let orderIndex = 0;

    const lines = content.split('\n');

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Check for [PUBLIC] marker
      if (trimmedLine === '[PUBLIC]') {
        // Save previous section if it exists
        if (currentSection.trim()) {
          sections.push({
            content: currentSection.trim(),
            isPublic: isPublic,
            orderIndex: orderIndex++,
          });
          currentSection = '';
        }
        isPublic = true;
        continue;
      }

      // Check for [!PUBLIC] marker
      if (trimmedLine === '[!PUBLIC]') {
        // Save previous section if it exists
        if (currentSection.trim()) {
          sections.push({
            content: currentSection.trim(),
            isPublic: isPublic,
            orderIndex: orderIndex++,
          });
          currentSection = '';
        }
        isPublic = false;
        continue;
      }

      // Add line to current section
      currentSection += line + '\n';
    }

    // Add final section if it exists
    if (currentSection.trim()) {
      sections.push({
        content: currentSection.trim(),
        isPublic: isPublic,
        orderIndex: orderIndex++,
      });
    }

    // If no markers found, treat entire content as private
    if (sections.length === 0 && content.trim()) {
      sections.push({
        content: content.trim(),
        isPublic: false,
        orderIndex: 0,
      });
    }

    return {
      title,
      sections,
    };
  }

  static getPublicContent(parsed: ParsedNote): string {
    return parsed.sections
      .filter(section => section.isPublic)
      .map(section => section.content)
      .join('\n\n');
  }

  static getPrivateContent(parsed: ParsedNote): string {
    return parsed.sections
      .filter(section => !section.isPublic)
      .map(section => section.content)
      .join('\n\n');
  }

  static hasPublicContent(parsed: ParsedNote): boolean {
    return parsed.sections.some(section => section.isPublic);
  }

  static getSectionCount(parsed: ParsedNote): { public: number; private: number } {
    const publicCount = parsed.sections.filter(s => s.isPublic).length;
    const privateCount = parsed.sections.filter(s => !s.isPublic).length;

    return { public: publicCount, private: privateCount };
  }
}
