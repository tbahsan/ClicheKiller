import { describe, expect, it } from 'vitest';
import { replaceCliche } from '../../src/engine/replacer';

describe('replaceCliche', () => {
  it('replaces targeted substring accurately by character coordinates', () => {
    const text = 'At the end of the day, we won.';
    const updated = replaceCliche(text, 0, 21, 'ultimately');

    // Capitalized original 'At the end of the day' should cause 'Ultimately'
    expect(updated).toBe('Ultimately, we won.');
  });

  it('preserves lowercase formatting when original was lowercase', () => {
    const text = 'We realized that, at the end of the day, we won.';
    const start = text.indexOf('at the end of the day');
    const end = start + 'at the end of the day'.length;

    const updated = replaceCliche(text, start, end, 'ultimately');
    expect(updated).toBe('We realized that, ultimately, we won.');
  });

  it('handles empty replacement string cleanly', () => {
    const text = 'It was, needless to say, fantastic.';
    const start = text.indexOf('needless to say');
    const end = start + 'needless to say'.length;

    const updated = replaceCliche(text, start, end, '');
    expect(updated).toBe('It was, , fantastic.');
  });
});
