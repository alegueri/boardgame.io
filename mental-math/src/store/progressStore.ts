import type { ProgressStore, FactStats } from '../types/progress';
import type { ProblemResult } from '../types/problem';
import type { Session } from '../types/session';
import type { TechniqueId } from '../types/problem';
import { loadStore, saveStore, todayString } from './storage';
import { gradeCard, gradeFromResponseTime, createCard } from '../engine/srs';

export function getStore(): ProgressStore {
  return loadStore();
}

export function recordResult(result: ProblemResult): void {
  const store = loadStore();
  const cardId = result.problem.id;

  if (!store.facts[cardId]) {
    store.facts[cardId] = {
      cardId,
      srsCard: createCard(cardId),
      responseTimes: [],
      accuracyWindow: [],
      totalAttempts: 0,
      totalCorrect: 0,
    };
  }

  const fact = store.facts[cardId];
  const grade = gradeFromResponseTime(result.wasCorrect, result.responseTimeMs);
  fact.srsCard = gradeCard(fact.srsCard, grade);
  fact.responseTimes = [...fact.responseTimes.slice(-19), result.responseTimeMs];
  fact.accuracyWindow = [...fact.accuracyWindow.slice(-19), result.wasCorrect];
  fact.totalAttempts++;
  if (result.wasCorrect) fact.totalCorrect++;

  saveStore(store);
}

export function recordSession(session: Session): void {
  const store = loadStore();
  store.sessions = [...store.sessions.slice(-99), session];

  const dateStr = todayString();
  const daily = store.dailyStats[dateStr] ?? {
    date: dateStr,
    problemsSolved: 0,
    correctCount: 0,
    totalTimeMs: 0,
  };
  daily.problemsSolved += session.results.length;
  daily.correctCount += session.results.filter(r => r.wasCorrect).length;
  daily.totalTimeMs += session.results.reduce((s, r) => s + r.responseTimeMs, 0);
  store.dailyStats[dateStr] = daily;

  // Update streak
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  if (store.lastSessionDate === yesterdayStr || store.lastSessionDate === dateStr) {
    if (store.lastSessionDate !== dateStr) {
      store.streak += 1;
    }
  } else {
    store.streak = 1;
  }
  store.lastSessionDate = dateStr;

  saveStore(store);
}

export function unlockTechnique(id: TechniqueId): void {
  const store = loadStore();
  if (!store.unlockedTechniques.includes(id)) {
    store.unlockedTechniques.push(id);
    saveStore(store);
  }
}

export function getDueCards(store: ProgressStore): FactStats[] {
  const now = Date.now();
  return Object.values(store.facts).filter(f => f.srsCard.nextReviewAt <= now);
}

export function getAvgResponseTime(fact: FactStats): number | null {
  if (fact.responseTimes.length === 0) return null;
  return Math.round(fact.responseTimes.reduce((s, t) => s + t, 0) / fact.responseTimes.length);
}
