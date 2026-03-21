import type { SRSCard, SRSGrade } from '../types/srs';

export function createCard(id: string): SRSCard {
  return {
    id,
    interval: 0,
    easeFactor: 2.5,
    repetitions: 0,
    nextReviewAt: Date.now(),
    lastReviewedAt: null,
  };
}

export function gradeCard(card: SRSCard, grade: SRSGrade): SRSCard {
  const now = Date.now();
  const newEF = Math.max(1.3, card.easeFactor + 0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));

  let newInterval: number;
  let newRepetitions: number;

  if (grade < 3) {
    newRepetitions = 0;
    newInterval = 1;
  } else {
    newRepetitions = card.repetitions + 1;
    if (card.repetitions === 0) newInterval = 1;
    else if (card.repetitions === 1) newInterval = 6;
    else newInterval = Math.round(card.interval * newEF);
  }

  return {
    ...card,
    interval: newInterval,
    easeFactor: newEF,
    repetitions: newRepetitions,
    nextReviewAt: now + newInterval * 86_400_000,
    lastReviewedAt: now,
  };
}

export function gradeFromResponseTime(correct: boolean, responseTimeMs: number): SRSGrade {
  if (!correct) return 1;
  if (responseTimeMs < 1000) return 5;
  if (responseTimeMs < 2000) return 4;
  if (responseTimeMs < 4000) return 3;
  return 2;
}
