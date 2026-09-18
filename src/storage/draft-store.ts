import { ClicheCategory } from '../engine/types';

const SETTINGS_KEY = 'clichekiller.settings.v1';
const DRAFT_KEY = 'clichekiller.draft.v1';

export interface SavedDraft {
  text: string;
  ignoredMatchIds: string[];
  enabledCategories: Partial<Record<ClicheCategory, boolean>>;
  savedAt: string;
}

export interface UserSettings {
  optInStorage: boolean;
  theme?: 'dark' | 'light';
}

export class DraftStore {
  static getSettings(): UserSettings {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return { optInStorage: false };
      return JSON.parse(raw);
    } catch {
      return { optInStorage: false };
    }
  }

  static setOptIn(enabled: boolean): void {
    try {
      const settings: UserSettings = { optInStorage: enabled };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      if (!enabled) {
        localStorage.removeItem(DRAFT_KEY);
      }
    } catch {
      // Ignore
    }
  }

  static saveDraft(draft: SavedDraft): boolean {
    const settings = this.getSettings();
    if (!settings.optInStorage) return false;

    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      return true;
    } catch {
      return false;
    }
  }

  static loadDraft(): SavedDraft | null {
    const settings = this.getSettings();
    if (!settings.optInStorage) return null;

    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  static clearDraft(): void {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      // Ignore
    }
  }
}
