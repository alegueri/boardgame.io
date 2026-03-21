import type { SRSCard } from './srs';
import type { TechniqueId } from './problem';
import type { Session, DailyStats } from './session';

export interface FactStats {
  cardId: string;
  srsCard: SRSCard;
  responseTimes: number[];
  accuracyWindow: boolean[];
  totalAttempts: number;
  totalCorrect: number;
}

export type AchievementId =
  | 'first_session'
  | 'streak_7'
  | 'streak_30'
  | 'sub_1s_fact'
  | 'flash_10_numbers'
  | 'all_techniques';

export interface ProgressStore {
  version: number;
  facts: Record<string, FactStats>;
  sessions: Session[];
  dailyStats: Record<string, DailyStats>;
  streak: number;
  lastSessionDate: string | null;
  unlockedTechniques: TechniqueId[];
  unlockedAchievements: AchievementId[];
}
