import type { ProgressStore } from '../types/progress';

const STORE_KEY = 'mental-math-v1';
const SCHEMA_VERSION = 1;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export const DEFAULT_STORE: ProgressStore = {
  version: SCHEMA_VERSION,
  facts: {},
  sessions: [],
  dailyStats: {},
  streak: 0,
  lastSessionDate: null,
  unlockedTechniques: ['foundations'],
  unlockedAchievements: [],
};

export function loadStore(): ProgressStore {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { ...DEFAULT_STORE };
    const parsed = JSON.parse(raw) as ProgressStore;
    if (parsed.version !== SCHEMA_VERSION) {
      // Future: run migrations here
      return { ...DEFAULT_STORE };
    }
    return parsed;
  } catch {
    return { ...DEFAULT_STORE };
  }
}

export function saveStore(store: ProgressStore): void {
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

export function todayString(): string {
  return today();
}
