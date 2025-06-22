import { ParsedNote, NoteSection, ImageReference } from './types';

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

  static extractImages(content: string): ImageReference[] {
    const images: ImageReference[] = [];
    const lines = content.split('\n');
    let currentlyInPublicSection = false;

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      const trimmedLine = line.trim();

      // Track if we're in a public section
      if (trimmedLine === '[PUBLIC]') {
        currentlyInPublicSection = true;
        continue;
      }
      if (trimmedLine === '[!PUBLIC]') {
        currentlyInPublicSection = false;
        continue;
      }

      // Extract markdown-style images: ![alt](path)
      const markdownRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
      let match;
      while ((match = markdownRegex.exec(line)) !== null) {
        const altText = match[1] || undefined;
        const path = match[2];

        if (this.isImagePath(path)) {
          images.push({
            localPath: path,
            altText,
            type: 'markdown',
            lineNumber: lineIndex + 1,
            isInPublicSection: currentlyInPublicSection,
          });
        }
      }

      // Extract wikilink-style images: ![[path]]
      const wikilinkRegex = /!\[\[([^\]]+)\]\]/g;
      while ((match = wikilinkRegex.exec(line)) !== null) {
        const path = match[1];

        if (this.isImagePath(path)) {
          images.push({
            localPath: path,
            altText: undefined,
            type: 'wikilink',
            lineNumber: lineIndex + 1,
            isInPublicSection: currentlyInPublicSection,
          });
        }
      }
    }

    return images;
  }

  static getPublicImages(content: string): ImageReference[] {
    return this.extractImages(content).filter(img => img.isInPublicSection);
  }

  private static isImagePath(path: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp', '.tiff'];
    const lowercasePath = path.toLowerCase();
    return imageExtensions.some(ext => lowercasePath.endsWith(ext));
  }

  static replaceImagePathsInContent(content: string, pathMap: Map<string, string>): string {
    let updatedContent = content;

    // Replace markdown-style images
    updatedContent = updatedContent.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, altText, path) => {
      const newPath = pathMap.get(path);
      return newPath ? `![${altText}](${newPath})` : match;
    });

    // Replace wikilink-style images
    updatedContent = updatedContent.replace(/!\[\[([^\]]+)\]\]/g, (match, path) => {
      const newPath = pathMap.get(path);
      return newPath ? `![](${newPath})` : match; // Convert to markdown style
    });

    return updatedContent;
  }
}
