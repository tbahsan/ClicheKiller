import clichesData from './data/cliches.json';
import {
  ClicheCategory,
  ClicheItem,
  ClicheMatch,
  DetectionOptions,
  DetectionResult,
  detectCliches,
  replaceCliche,
} from './engine/index';
import { DraftStore } from './storage/draft-store';

const cliches: ClicheItem[] = clichesData as ClicheItem[];

// State
const enabledCategories: Record<ClicheCategory, boolean> = {
  dead_metaphor: true,
  fiction_trope: true,
  business_jargon: true,
  filler: true,
};
const ignoredMatchIds = new Set<string>();
let activeMatch: ClicheMatch | null = null;
let currentResult: DetectionResult | null = null;

// DOM Elements
const editorInput = document.getElementById('editor-input') as HTMLTextAreaElement;
const editorHighlights = document.getElementById('editor-highlights') as HTMLElement;
const metricCount = document.getElementById('metric-count') as HTMLElement;
const metricCoverage = document.getElementById('metric-coverage') as HTMLElement;
const metricTotalWords = document.getElementById('metric-total-words') as HTMLElement;
const metricHealth = document.getElementById('metric-health') as HTMLElement;
const matchesList = document.getElementById('matches-list') as HTMLElement;
const sidebarCount = document.getElementById('sidebar-count') as HTMLElement;
const suggestionCard = document.getElementById('suggestion-card') as HTMLElement;
const cardPhrase = document.getElementById('card-phrase') as HTMLElement;
const cardBadge = document.getElementById('card-badge') as HTMLElement;
const cardExplanation = document.getElementById('card-explanation') as HTMLElement;
const cardAlternatives = document.getElementById('card-alternatives') as HTMLElement;
const cardIgnoreBtn = document.getElementById('card-ignore-btn') as HTMLButtonElement;
const samplePicker = document.getElementById('sample-picker') as HTMLSelectElement;
const copyBtn = document.getElementById('copy-btn') as HTMLButtonElement;
const downloadTxtBtn = document.getElementById('download-txt-btn') as HTMLButtonElement;
const clearBtn = document.getElementById('clear-btn') as HTMLButtonElement;
const themeToggle = document.getElementById('theme-toggle') as HTMLButtonElement;
const themeIcon = document.getElementById('theme-icon') as HTMLElement;
const themeText = document.getElementById('theme-text') as HTMLElement;
const optInStorage = document.getElementById('opt-in-storage') as HTMLInputElement;
const clearDraftBtn = document.getElementById('clear-draft-btn') as HTMLButtonElement;

// Category Checkboxes
const catToggles: Record<ClicheCategory, HTMLInputElement> = {
  dead_metaphor: document.getElementById('cat-dead_metaphor') as HTMLInputElement,
  fiction_trope: document.getElementById('cat-fiction_trope') as HTMLInputElement,
  business_jargon: document.getElementById('cat-business_jargon') as HTMLInputElement,
  filler: document.getElementById('cat-filler') as HTMLInputElement,
};

const SAMPLE_TEXTS: Record<string, string> = {
  corporate: `At the end of the day, moving forward we need to touch base and synergize our low-hanging fruit. Let's take it offline and circle back when you have the bandwidth to push the envelope. When all is said and done, this game changer will move the needle and provide a true value-add for all stakeholders.`,
  thriller: `A cold sweat broke across his forehead as his heart sank. The dead silence in the dark corridor was deafening. He let out a breath he didn't know he was holding while a shudder ran down his spine. Blood ran cold in his veins when a piercing scream shattered the night.`,
  idioms: `It goes without saying that this is just the tip of the iceberg. We will have to bite the bullet and play with fire if we want to hit the nail on the head. Needless to say, water under the bridge won't help us find a needle in a haystack.`,
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function getCategoryLabel(cat: ClicheCategory): string {
  switch (cat) {
    case 'dead_metaphor':
      return 'Dead Metaphor';
    case 'fiction_trope':
      return 'Fiction Trope';
    case 'business_jargon':
      return 'Corporate Jargon';
    case 'filler':
      return 'Filler Phrase';
  }
}

/**
 * Renders the synchronized highlight backdrop.
 */
function renderHighlights(text: string, matches: ClicheMatch[]): void {
  if (!text) {
    editorHighlights.innerHTML = '';
    return;
  }

  if (matches.length === 0) {
    editorHighlights.innerHTML = escapeHtml(text) + '\n';
    return;
  }

  let html = '';
  let lastIndex = 0;

  for (const m of matches) {
    if (m.start < lastIndex) continue;

    // Normal text before match
    html += escapeHtml(text.slice(lastIndex, m.start));

    // Highlighted match
    const matchedText = text.slice(m.start, m.end);
    html += `<mark class="cliche-mark cat-${m.category}" data-match-id="${m.id}" title="${escapeHtml(m.explanation)}">${escapeHtml(matchedText)}</mark>`;

    lastIndex = m.end;
  }

  html += escapeHtml(text.slice(lastIndex));
  editorHighlights.innerHTML = html + '\n';
}

/**
 * Displays the interactive suggestion card for a selected match.
 */
function showSuggestionCard(match: ClicheMatch): void {
  activeMatch = match;
  suggestionCard.style.display = 'flex';

  cardPhrase.textContent = match.matchedText;
  cardBadge.textContent = getCategoryLabel(match.category);
  cardBadge.className = `card-badge ${match.category}`;
  cardExplanation.textContent = match.explanation;

  // Render clickable alternatives
  cardAlternatives.innerHTML = match.alternatives
    .map(
      (alt) => `
      <button class="alt-pill" data-alternative="${escapeHtml(alt)}">
        <span>"${escapeHtml(alt)}"</span>
        <span class="arrow">Replace ↵</span>
      </button>
    `,
    )
    .join('');
}

function hideSuggestionCard(): void {
  activeMatch = null;
  suggestionCard.style.display = 'none';
}

/**
 * Updates metrics and list of detected clichés.
 */
function updateUI(result: DetectionResult): void {
  currentResult = result;
  const count = result.matches.length;

  metricCount.textContent = String(count);
  metricCoverage.textContent = `${result.coveragePercentage}%`;
  metricTotalWords.textContent = String(result.totalWordCount);
  sidebarCount.textContent = String(count);

  if (count === 0) {
    metricCount.className = 'metric-value clean';
    metricHealth.className = 'metric-value clean';
    metricHealth.textContent = 'Crisp & Clean';
    matchesList.innerHTML = `<p style="color: var(--success); font-size: 0.85rem">✓ No clichés detected. Your writing is remarkably original!</p>`;
    hideSuggestionCard();
  } else {
    metricCount.className = 'metric-value alert';
    if (result.coveragePercentage >= 8.0) {
      metricHealth.className = 'metric-value alert';
      metricHealth.textContent = 'Cliché Heavy';
    } else {
      metricHealth.className = 'metric-value';
      metricHealth.style.color = 'var(--warning)';
      metricHealth.textContent = 'Needs Polish';
    }

    matchesList.innerHTML = result.matches
      .slice(0, 40)
      .map(
        (m) => `
        <div class="match-item ${activeMatch?.id === m.id ? 'selected' : ''}" data-match-id="${m.id}">
          <span style="font-weight: 600">"${escapeHtml(m.matchedText)}"</span>
          <span class="card-badge ${m.category}" style="font-size: 0.65rem">${getCategoryLabel(m.category)}</span>
        </div>
      `,
      )
      .join('');
  }
}

/**
 * Main detection cycle.
 */
function runDetection(): void {
  const text = editorInput.value;
  const options: DetectionOptions = {
    enabledCategories,
    ignoredMatchIds: Array.from(ignoredMatchIds),
  };

  const result = detectCliches(text, cliches, options);
  renderHighlights(text, result.matches);
  updateUI(result);

  // Auto-save if opted-in
  if (DraftStore.getSettings().optInStorage) {
    DraftStore.saveDraft({
      text,
      ignoredMatchIds: Array.from(ignoredMatchIds),
      enabledCategories,
      savedAt: new Date().toISOString(),
    });
  }
}

/**
 * Event Listeners & Interactive Binding.
 */
function setupEvents(): void {
  editorInput.addEventListener('input', runDetection);

  // Synchronize scrolling
  editorInput.addEventListener('scroll', () => {
    const backdrop = document.querySelector('.editor-backdrop') as HTMLElement;
    if (backdrop) {
      backdrop.scrollTop = editorInput.scrollTop;
      backdrop.scrollLeft = editorInput.scrollLeft;
    }
  });

  // Cursor-based click inside editor textarea to open suggestions for the clicked cliché
  editorInput.addEventListener('click', () => {
    if (!currentResult || currentResult.matches.length === 0) return;
    const cursor = editorInput.selectionStart;
    const clickedMatch = currentResult.matches.find(
      (m) => cursor >= m.start && cursor <= m.end
    );
    if (clickedMatch) {
      showSuggestionCard(clickedMatch);
    }
  });

  // Clicking an interactive cliché item in the sidebar list
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;

    // Check if clicked inside a sidebar match item
    const matchEl = target.closest('[data-match-id]') as HTMLElement | null;
    if (matchEl && currentResult) {
      const matchId = matchEl.getAttribute('data-match-id');
      const found = currentResult.matches.find((m) => m.id === matchId);
      if (found) {
        showSuggestionCard(found);
      }
    }

    // Check if clicked an alternative replacement button
    const altBtn = target.closest('.alt-pill') as HTMLElement | null;
    if (altBtn && activeMatch) {
      const replacement = altBtn.getAttribute('data-alternative') || '';
      const text = editorInput.value;
      const updated = replaceCliche(text, activeMatch.start, activeMatch.end, replacement);
      editorInput.value = updated;
      hideSuggestionCard();
      runDetection();
    }
  });

  // Ignore button
  cardIgnoreBtn.addEventListener('click', () => {
    if (activeMatch) {
      ignoredMatchIds.add(activeMatch.id);
      hideSuggestionCard();
      runDetection();
    }
  });

  // Category Filter Toggles
  for (const [cat, checkbox] of Object.entries(catToggles)) {
    checkbox.addEventListener('change', () => {
      enabledCategories[cat as ClicheCategory] = checkbox.checked;
      runDetection();
    });
  }

  // Sample Text Picker
  samplePicker.addEventListener('change', () => {
    const key = samplePicker.value;
    if (key && SAMPLE_TEXTS[key]) {
      editorInput.value = SAMPLE_TEXTS[key];
      ignoredMatchIds.clear();
      hideSuggestionCard();
      runDetection();
    }
  });

  // Copy Clean Text
  copyBtn.addEventListener('click', async () => {
    const text = editorInput.value;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      const orig = copyBtn.textContent;
      copyBtn.textContent = '✓ Copied!';
      setTimeout(() => {
        copyBtn.textContent = orig;
      }, 1500);
    } catch {
      editorInput.select();
      document.execCommand('copy');
    }
  });

  // Download TXT
  downloadTxtBtn.addEventListener('click', () => {
    const text = editorInput.value;
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clichekiller-draft.txt`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // Clear
  clearBtn.addEventListener('click', () => {
    if (editorInput.value && confirm('Are you sure you want to clear the editor?')) {
      editorInput.value = '';
      ignoredMatchIds.clear();
      hideSuggestionCard();
      runDetection();
    }
  });

  // Theme Toggle
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    themeText.textContent = newTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
  });

  // LocalStorage Opt-in
  const settings = DraftStore.getSettings();
  optInStorage.checked = settings.optInStorage;

  optInStorage.addEventListener('change', () => {
    DraftStore.setOptIn(optInStorage.checked);
    if (optInStorage.checked) {
      runDetection();
    }
  });

  clearDraftBtn.addEventListener('click', () => {
    DraftStore.clearDraft();
    alert('Saved draft cleared from this browser.');
  });

  // Restore saved draft or default sample
  const saved = DraftStore.loadDraft();
  if (saved && saved.text) {
    editorInput.value = saved.text;
    if (saved.ignoredMatchIds) {
      saved.ignoredMatchIds.forEach((id) => ignoredMatchIds.add(id));
    }
  } else {
    // Default to the corporate sample to demonstrate detection immediately
    editorInput.value = SAMPLE_TEXTS.corporate;
  }
}

// Boot
setupEvents();
runDetection();
