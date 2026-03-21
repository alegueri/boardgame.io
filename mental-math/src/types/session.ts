import type { TechniqueId, ProblemResult } from './problem';

export type SessionMode = 'foundations' | 'technique' | 'flashAnzan' | 'mixed';

export interface FlashAnzanConfig {
  digitCount: number;
  numberCount: number;
  flashSpeedMs: number;
}

export interface SessionConfig {
  mode: SessionMode;
  techniqueId?: TechniqueId;
  timerSeconds: number | null;
  targetProblemCount: number;
  flashAnzanConfig?: FlashAnzanConfig;
}

export interface Session {
  id: string;
  config: SessionConfig;
  startedAt: number;
  endedAt: number | null;
  results: ProblemResult[];
}

export interface DailyStats {
  date: string;
  problemsSolved: number;
  correctCount: number;
  totalTimeMs: number;
}
