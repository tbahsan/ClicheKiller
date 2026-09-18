import { WordToken } from './types';

/**
 * Tokenizes text into word tokens with exact start/end character offsets into original string.
 * Strips outer punctuation while keeping contractions (e.g. "don't") intact.
 */
export function tokenizeText(text: string): WordToken[] {
  const tokens: WordToken[] = [];
  // Matches word characters, internal apostrophes, and internal hyphens
  const regex = /\b[A-Za-z0-9]+(?:['’\-][A-Za-z0-9]+)*\b/gu;
  let match: RegExpExecArray | null;

  let currentLine = 1;
  let lastIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    const start = match.index;
    const raw = match[0];
    const end = start + raw.length;

    // Count line breaks up to current token
    for (let i = lastIndex; i < start; i++) {
      if (text[i] === '\n') {
        currentLine++;
      }
    }
    lastIndex = start;

    // Clean word: lowercase, strip diacritics
    const clean = raw
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    tokens.push({
      raw,
      clean,
      start,
      end,
      line: currentLine,
    });
  }

  return tokens;
}
