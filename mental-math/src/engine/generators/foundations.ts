import type { Problem, TechniqueId } from '../../types/problem';

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function problemId(technique: TechniqueId, ...operands: number[]): string {
  return `${technique}:${operands.join(':')}`;
}

export function additionProblem(maxA = 10, maxB = 10): Problem {
  const a = randomInt(0, maxA);
  const b = randomInt(0, maxB);
  return {
    id: problemId('foundations', Math.min(a, b), Math.max(a, b)),
    techniqueId: 'foundations',
    question: `${a} + ${b}`,
    operands: [a, b],
    answer: a + b,
    hint: 'Add left to right',
  };
}

export function multiplicationProblem(table?: number): Problem {
  const a = table ?? randomInt(2, 12);
  const b = randomInt(2, 12);
  const [lo, hi] = [Math.min(a, b), Math.max(a, b)];
  return {
    id: problemId('foundations', lo, hi),
    techniqueId: 'foundations',
    question: `${a} × ${b}`,
    operands: [a, b],
    answer: a * b,
    hint: `${a} × ${b} = ?`,
  };
}

export function subtractionProblem(max = 20): Problem {
  const a = randomInt(5, max);
  const b = randomInt(0, a);
  return {
    id: problemId('foundations', a, b),
    techniqueId: 'foundations',
    question: `${a} − ${b}`,
    operands: [a, b],
    answer: a - b,
    hint: 'Count up from the smaller number',
  };
}
