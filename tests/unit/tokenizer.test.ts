import { describe, expect, it } from 'vitest';
import { tokenizeText } from '../../src/engine/tokenizer';

describe('tokenizeText', () => {
  it('extracts word tokens with accurate start/end coordinates', () => {
    const text = 'At the end of the day, truth matters.';
    const tokens = tokenizeText(text);

    expect(tokens.length).toBe(8);
    expect(tokens[0]).toEqual({
      raw: 'At',
      clean: 'at',
      start: 0,
      end: 2,
      line: 1,
    });
    expect(tokens[5]).toEqual({
      raw: 'day',
      clean: 'day',
      start: 18,
      end: 21,
      line: 1,
    });
  });

  it('preserves contractions as single word tokens', () => {
    const text = "He didn't know what he didn’t know.";
    const tokens = tokenizeText(text);

    expect(tokens[1].raw).toBe("didn't");
    expect(tokens[1].clean).toBe("didn't");
    expect(tokens[5].raw).toBe("didn’t");
    expect(tokens[5].clean).toBe("didn’t");
  });

  it('tracks line numbers across multiple line breaks', () => {
    const text = 'Line one.\nLine two.\n\nLine four.';
    const tokens = tokenizeText(text);

    expect(tokens[0].line).toBe(1);
    expect(tokens[2].line).toBe(2);
    expect(tokens[4].line).toBe(4);
  });
});
