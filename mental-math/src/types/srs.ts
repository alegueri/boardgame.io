export type SRSGrade = 0 | 1 | 2 | 3 | 4 | 5;

export interface SRSCard {
  id: string;
  interval: number;
  easeFactor: number;
  repetitions: number;
  nextReviewAt: number;
  lastReviewedAt: number | null;
}

export interface ReviewResult {
  card: SRSCard;
  grade: SRSGrade;
  responseTimeMs: number;
  wasCorrect: boolean;
  timestamp: number;
}
