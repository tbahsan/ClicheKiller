# ClicheKiller — Scope & Architecture Contract

## 1. Problem Statement & Target Audience
Writers, essayists, fiction novelists, copywriters, and students looking to identify weary clichés, dead metaphors, and corporate buzzwords. Existing tools either:
- Charge subscriptions or require cloud accounts.
- Send draft manuscripts to remote AI servers, violating author privacy.
- Lack actionable, one-click replacement options.

ClicheKiller is a 100% client-side, zero-tracking, offline-first tool with interactive 1-click replacement.

## 2. Invariants & Guarantees
1. **Zero Text Surrender:** User text is NEVER sent over the network or analyzed remotely.
2. **Deterministic Phrase Matching:** Uses normalized token n-gram matching with exact character coordinate tracking into the original string.
3. **Longest Match Precedence:** When phrases overlap in word space (e.g. "at the end of the day" vs "at the end"), the longer phrase subsumes the shorter one without duplicate highlights.
4. **Honest Metric:** "Phrase Coverage" measures the exact percentage of word tokens belonging to detected clichés; it does NOT claim to be a subjective "writing quality score".
5. **Preserved Casing:** Replacements automatically inherit the capitalization of the matched phrase (e.g. capitalizing "ultimately" to "Ultimately" if the cliché was capitalized).

## 3. Database Categories (v0.1)
- **Dead Metaphors (45+):** Figures of speech that have lost their imagery through endless repetition.
- **Fiction Tropes (35+):** Melodramatic storytelling and physical reaction clichés.
- **Corporate Jargon (35+):** Vague, inflated business buzzwords.
- **Filler Phrases (30+):** Wordy, bloated transitional padding.

## 4. Out of Scope (v0.1)
- Blanket claims that all metaphors or idioms are inherently wrong (context matters).
- Full sentence generative AI rewriting.
