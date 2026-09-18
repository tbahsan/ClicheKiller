/**
 * ClicheKiller Core Types
 */

export type ClicheCategory = 'dead_metaphor' | 'fiction_trope' | 'business_jargon' | 'filler';

export interface ClicheItem {
  id: string;
  phrase: string; // Lowercase, whitespace-normalized
  category: ClicheCategory;
  severity: 'high' | 'medium';
  explanation: string;
  explanationBn?: string;
  alternatives: string[];
}

export interface ClicheMatch {
  id: string; // Unique match identifier: `${start}_${end}`
  clicheId: string;
  phrase: string;
  matchedText: string; // Original substring from user's input
  start: number; // Character offset start
  end: number;   // Character offset end
  line: number;
  category: ClicheCategory;
  severity: 'high' | 'medium';
  explanation: string;
  alternatives: string[];
}

export interface DetectionOptions {
  enabledCategories?: Partial<Record<ClicheCategory, boolean>>;
  ignoredMatchIds?: string[];
}

export interface DetectionResult {
  matches: ClicheMatch[];
  totalWordCount: number;
  clicheWordCount: number;
  coveragePercentage: number; // (clicheWordCount / totalWordCount) * 100
  categoryCounts: Record<ClicheCategory, number>;
}

export interface WordToken {
  raw: string;
  clean: string;
  start: number;
  end: number;
  line: number;
}
