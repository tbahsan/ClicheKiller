# ClicheKiller — Matching Rules & Overlap Policy

## 1. Tokenization & Normalization
- Words are split on word boundaries (`\b`), preserving internal hyphens and apostrophes (e.g. `didn't`, `low-hanging`).
- Outer punctuation (`.`, `,`, `!`, `?`, `"`, `(`, `)`) is stripped from tokens during comparison but original character offsets in the raw string are preserved with 100% precision.
- Comparison is case-insensitive and NFD-normalized (accents stripped).

## 2. Overlap & Subsumption Policy
When multiple clichés overlap within the same word tokens:
1. Candidate matches are sorted by token count descending (longest phrase first).
2. The longest candidate claims the tokens.
3. Shorter overlapping candidates are discarded.
*Example:* In "This is the tip of the iceberg", the 4-token cliché "tip of the iceberg" takes priority over any subset, preventing broken or nested highlights.

## 3. Capitalization Matching
When the user clicks an alternative to replace a cliché:
- If the original match began with a capital letter (e.g. `"At the end of the day"`), the replacement is automatically capitalized (e.g. `"Ultimately"`).
- If the original was lowercase, the replacement remains lowercase.
