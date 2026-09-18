import { describe, expect, it } from 'vitest';
import clichesData from '../../src/data/cliches.json';
import { detectCliches } from '../../src/engine/matcher';
import { ClicheItem } from '../../src/engine/types';

const testCliches = clichesData as ClicheItem[];

describe('detectCliches', () => {
  it('detects a single cliché accurately', () => {
    const text = 'At the end of the day, we need results.';
    const result = detectCliches(text, testCliches);

    expect(result.matches.length).toBe(1);
    expect(result.matches[0].phrase).toBe('at the end of the day');
    expect(result.matches[0].matchedText).toBe('At the end of the day');
    expect(result.matches[0].start).toBe(0);
    expect(result.matches[0].end).toBe(21);
    expect(result.matches[0].category).toBe('dead_metaphor');
  });

  it('is case-insensitive and punctuation-resilient', () => {
    const text = 'Her argument was CRYSTAL CLEAR, but his heart sank.';
    const result = detectCliches(text, testCliches);

    expect(result.matches.length).toBe(2);
    expect(result.matches[0].matchedText).toBe('CRYSTAL CLEAR');
    expect(result.matches[1].matchedText).toBe('heart sank');
  });

  it('implements longest-match-first to prevent duplicate/overlapping highlights', () => {
    // If a short phrase is part of a longer cliché, the longer one must subsume it
    const text = 'This is just the tip of the iceberg, nothing more.';
    const result = detectCliches(text, testCliches);

    expect(result.matches.length).toBe(1);
    expect(result.matches[0].phrase).toBe('tip of the iceberg');
    expect(result.matches[0].matchedText).toBe('tip of the iceberg');
  });

  it('respects category filter toggles', () => {
    const text = 'We need to touch base and synergize our low-hanging fruit.';
    const optionsWithBusinessDisabled = {
      enabledCategories: {
        business_jargon: false,
        dead_metaphor: true,
        fiction_trope: true,
        filler: true,
      },
    };

    const result = detectCliches(text, testCliches, optionsWithBusinessDisabled);
    expect(result.matches.length).toBe(0);
  });

  it('respects ignored match IDs', () => {
    const text = 'At the end of the day, it is what it is.';
    const initialResult = detectCliches(text, testCliches);
    expect(initialResult.matches.length).toBe(1);

    const matchId = initialResult.matches[0].id;
    const ignoredResult = detectCliches(text, testCliches, {
      ignoredMatchIds: [matchId],
    });

    expect(ignoredResult.matches.length).toBe(0);
  });

  it('calculates cliché word coverage percentage correctly', () => {
    // Text has 10 words, 'tip of the iceberg' has 5 words -> 50% coverage
    const text = 'This is just the tip of the iceberg right now.';
    const result = detectCliches(text, testCliches);

    expect(result.totalWordCount).toBe(10);
    expect(result.clicheWordCount).toBe(4);
    expect(result.coveragePercentage).toBe(40.0);
  });
});
