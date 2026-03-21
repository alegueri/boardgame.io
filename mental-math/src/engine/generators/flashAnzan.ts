import type { Problem } from '../../types/problem';
import type { FlashAnzanConfig } from '../../types/session';

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function flashAnzanProblem(config: FlashAnzanConfig): Problem {
  const max = Math.pow(10, config.digitCount) - 1;
  const min = Math.pow(10, config.digitCount - 1);
  const operands = Array.from({ length: config.numberCount }, () => randomInt(min, max));
  const answer = operands.reduce((s, n) => s + n, 0);
  return {
    id: `flashAnzan:${operands.join(':')}`,
    techniqueId: 'flashAnzan',
    question: operands.join(', '),
    operands,
    answer,
    hint: `${config.numberCount} numbers, each ${config.digitCount} digit(s)`,
  };
}
