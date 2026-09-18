import { ClicheItem, ClicheMatch, DetectionOptions, DetectionResult } from './types';
import { tokenizeText } from './tokenizer';

/**
 * Builds an n-gram lookup map from the list of cliché items.
 */
export function buildClicheMap(cliches: ClicheItem[]): {
  phraseMap: Map<string, ClicheItem>;
  maxWordLength: number;
} {
  const phraseMap = new Map<string, ClicheItem>();
  let maxWordLength = 1;

  for (const item of cliches) {
    const norm = item.phrase.trim().toLowerCase();
    phraseMap.set(norm, item);
    const wordCount = norm.split(/\s+/).length;
    if (wordCount > maxWordLength) {
      maxWordLength = wordCount;
    }
  }

  return { phraseMap, maxWordLength };
}

/**
 * Detects clichés in input text according to options and overlap resolution rules.
 */
export function detectCliches(
  text: string,
  cliches: ClicheItem[],
  options: DetectionOptions = {},
): DetectionResult {
  const tokens = tokenizeText(text);
  const totalWordCount = tokens.length;

  const categoryCounts = {
    dead_metaphor: 0,
    fiction_trope: 0,
    business_jargon: 0,
    filler: 0,
  };

  if (totalWordCount === 0) {
    return {
      matches: [],
      totalWordCount: 0,
      clicheWordCount: 0,
      coveragePercentage: 0,
      categoryCounts,
    };
  }

  const { phraseMap, maxWordLength } = buildClicheMap(cliches);
  const enabledCategories = options.enabledCategories || {};
  const ignoredSet = new Set(options.ignoredMatchIds || []);

  interface CandidateMatch {
    cliche: ClicheItem;
    tokenStartIndex: number;
    tokenEndIndex: number; // exclusive
    tokenCount: number;
    start: number;
    end: number;
    line: number;
  }

  const candidates: CandidateMatch[] = [];

  // Slide an n-gram window from 1 up to maxWordLength
  for (let i = 0; i < tokens.length; i++) {
    const limit = Math.min(tokens.length, i + maxWordLength);
    const wordsAccum: string[] = [];

    for (let j = i; j < limit; j++) {
      wordsAccum.push(tokens[j].clean);
      const phrase = wordsAccum.join(' ');

      const matchedCliche = phraseMap.get(phrase);
      if (matchedCliche) {
        // Check if category is disabled
        if (
          enabledCategories[matchedCliche.category] !== undefined &&
          !enabledCategories[matchedCliche.category]
        ) {
          continue;
        }

        const start = tokens[i].start;
        const end = tokens[j].end;
        const id = `${start}_${end}`;

        if (!ignoredSet.has(id)) {
          candidates.push({
            cliche: matchedCliche,
            tokenStartIndex: i,
            tokenEndIndex: j + 1,
            tokenCount: j - i + 1,
            start,
            end,
            line: tokens[i].line,
          });
        }
      }
    }
  }

  // Longest-Match-First Overlap Resolution
  // Sort candidates:
  // 1. tokenCount descending (longer phrases take priority)
  // 2. tokenStartIndex ascending
  candidates.sort((a, b) => {
    if (b.tokenCount !== a.tokenCount) return b.tokenCount - a.tokenCount;
    return a.tokenStartIndex - b.tokenStartIndex;
  });

  const occupiedTokens = new Uint8Array(tokens.length);
  const acceptedMatches: ClicheMatch[] = [];

  for (const cand of candidates) {
    // Check if any token in this candidate is already claimed by a longer match
    let hasOverlap = false;
    for (let t = cand.tokenStartIndex; t < cand.tokenEndIndex; t++) {
      if (occupiedTokens[t]) {
        hasOverlap = true;
        break;
      }
    }

    if (!hasOverlap) {
      // Mark tokens as occupied
      for (let t = cand.tokenStartIndex; t < cand.tokenEndIndex; t++) {
        occupiedTokens[t] = 1;
      }

      const matchId = `${cand.start}_${cand.end}`;
      const matchedText = text.slice(cand.start, cand.end);

      acceptedMatches.push({
        id: matchId,
        clicheId: cand.cliche.id,
        phrase: cand.cliche.phrase,
        matchedText,
        start: cand.start,
        end: cand.end,
        line: cand.line,
        category: cand.cliche.category,
        severity: cand.cliche.severity,
        explanation: cand.cliche.explanation,
        alternatives: cand.cliche.alternatives,
      });

      categoryCounts[cand.cliche.category]++;
    }
  }

  // Sort accepted matches in chronological text order (start ascending)
  acceptedMatches.sort((a, b) => a.start - b.start);

  // Calculate unique covered word tokens
  let coveredWordTokens = 0;
  for (let i = 0; i < occupiedTokens.length; i++) {
    if (occupiedTokens[i]) coveredWordTokens++;
  }

  const coveragePercentage =
    totalWordCount > 0 ? Math.round((coveredWordTokens / totalWordCount) * 1000) / 10 : 0;

  return {
    matches: acceptedMatches,
    totalWordCount,
    clicheWordCount: coveredWordTokens,
    coveragePercentage,
    categoryCounts,
  };
}
