export type TechniqueId =
  | 'times5'
  | 'times9'
  | 'times11'
  | 'times25'
  | 'times99'
  | 'square5'
  | 'nearSquare'
  | 'leftToRight'
  | 'twoDigitMul'
  | 'nikhilam'
  | 'flashAnzan'
  | 'foundations';

export interface Problem {
  id: string;
  techniqueId: TechniqueId;
  question: string;
  operands: number[];
  answer: number;
  hint?: string;
  steps?: string[];
}

export interface ProblemResult {
  problem: Problem;
  userAnswer: number | null;
  wasCorrect: boolean;
  responseTimeMs: number;
  timedOut: boolean;
  timestamp: number;
}
