/**
 * Replaces a matched cliché substring with a selected alternative,
 * preserving original capitalization conventions where appropriate.
 */
export function replaceCliche(
  text: string,
  start: number,
  end: number,
  replacement: string,
): string {
  const original = text.slice(start, end);
  if (!original) return text;

  let formattedReplacement = replacement;

  // If original started with an uppercase letter, capitalize the replacement
  const isFirstUpper = /^[A-Z]/.test(original);
  if (isFirstUpper && replacement.length > 0) {
    formattedReplacement = replacement.charAt(0).toUpperCase() + replacement.slice(1);
  }

  return text.slice(0, start) + formattedReplacement + text.slice(end);
}
