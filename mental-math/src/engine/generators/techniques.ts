import type { Problem, TechniqueId } from '../../types/problem';

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pid(technique: TechniqueId, ...ops: number[]): string {
  return `${technique}:${ops.join(':')}`;
}

export function times5Problem(): Problem {
  const n = randomInt(2, 99);
  return {
    id: pid('times5', n),
    techniqueId: 'times5',
    question: `${n} × 5`,
    operands: [n, 5],
    answer: n * 5,
    hint: `Divide ${n} by 2, then multiply by 10`,
    steps: [
      `${n} ÷ 2 = ${n / 2}`,
      `${n / 2} × 10 = ${n * 5}`,
    ],
  };
}

export function times9Problem(): Problem {
  const n = randomInt(2, 99);
  return {
    id: pid('times9', n),
    techniqueId: 'times9',
    question: `${n} × 9`,
    operands: [n, 9],
    answer: n * 9,
    hint: `Think: ${n} × 10 − ${n}`,
    steps: [
      `${n} × 10 = ${n * 10}`,
      `${n * 10} − ${n} = ${n * 9}`,
    ],
  };
}

export function times11Problem(): Problem {
  const n = randomInt(10, 99);
  const [tens, ones] = [Math.floor(n / 10), n % 10];
  const mid = tens + ones;
  const answer = n * 11;
  const steps = mid < 10
    ? [`Outer digits: ${tens} and ${ones}`, `Middle = ${tens} + ${ones} = ${mid}`, `Answer: ${tens}${mid}${ones} = ${answer}`]
    : [`Outer digits: ${tens} and ${ones}`, `Middle = ${tens} + ${ones} = ${mid} (carry 1)`, `Answer: ${tens + 1}${mid - 10}${ones} = ${answer}`];
  return {
    id: pid('times11', n),
    techniqueId: 'times11',
    question: `${n} × 11`,
    operands: [n, 11],
    answer,
    hint: `Outer digits stay; middle digit = sum of digits (${tens}+${ones})`,
    steps,
  };
}

export function times25Problem(): Problem {
  const n = randomInt(2, 99);
  return {
    id: pid('times25', n),
    techniqueId: 'times25',
    question: `${n} × 25`,
    operands: [n, 25],
    answer: n * 25,
    hint: `Divide ${n} by 4, then multiply by 100`,
    steps: [
      `${n} ÷ 4 = ${n / 4}`,
      `${n / 4} × 100 = ${n * 25}`,
    ],
  };
}

export function times99Problem(): Problem {
  const n = randomInt(2, 99);
  return {
    id: pid('times99', n),
    techniqueId: 'times99',
    question: `${n} × 99`,
    operands: [n, 99],
    answer: n * 99,
    hint: `Think: ${n} × 100 − ${n}`,
    steps: [
      `${n} × 100 = ${n * 100}`,
      `${n * 100} − ${n} = ${n * 99}`,
    ],
  };
}

export function square5Problem(): Problem {
  const tens = randomInt(1, 9);
  const n = tens * 10 + 5;
  const answer = n * n;
  return {
    id: pid('square5', n),
    techniqueId: 'square5',
    question: `${n}²`,
    operands: [n],
    answer,
    hint: `Tens digit × (tens digit + 1), then append 25`,
    steps: [
      `Tens digit: ${tens}`,
      `${tens} × ${tens + 1} = ${tens * (tens + 1)}`,
      `Append 25: ${tens * (tens + 1)}25 = ${answer}`,
    ],
  };
}

export function nearSquareProblem(): Problem {
  const bases = [10, 20, 25, 50, 100];
  const base = bases[randomInt(0, bases.length - 1)];
  const maxOffset = base <= 25 ? 4 : base <= 50 ? 8 : 15;
  const d = randomInt(1, maxOffset);
  const a = base - d;
  const b = base + d;
  const answer = a * b;
  return {
    id: pid('nearSquare', a, b),
    techniqueId: 'nearSquare',
    question: `${a} × ${b}`,
    operands: [a, b],
    answer,
    hint: `Difference of squares: ${base}² − ${d}²`,
    steps: [
      `Both are ${d} away from ${base}`,
      `${base}² = ${base * base}`,
      `${d}² = ${d * d}`,
      `${base * base} − ${d * d} = ${answer}`,
    ],
  };
}

export function twoDigitMulProblem(): Problem {
  const a = randomInt(11, 99);
  const b = randomInt(11, 99);
  const [a1, a0] = [Math.floor(a / 10), a % 10];
  const [b1, b0] = [Math.floor(b / 10), b % 10];
  const answer = a * b;
  return {
    id: pid('twoDigitMul', Math.min(a, b), Math.max(a, b)),
    techniqueId: 'twoDigitMul',
    question: `${a} × ${b}`,
    operands: [a, b],
    answer,
    hint: `Break apart: (${a1}×${b1})00 + (${a1}×${b0} + ${a0}×${b1})10 + ${a0}×${b0}`,
    steps: [
      `Left: ${a1} × ${b1} = ${a1 * b1} → ${a1 * b1 * 100}`,
      `Cross: ${a1}×${b0} + ${a0}×${b1} = ${a1 * b0 + a0 * b1} → ${(a1 * b0 + a0 * b1) * 10}`,
      `Right: ${a0} × ${b0} = ${a0 * b0}`,
      `Total: ${a1 * b1 * 100} + ${(a1 * b0 + a0 * b1) * 10} + ${a0 * b0} = ${answer}`,
    ],
  };
}

export function nikhilamProblem(): Problem {
  const a = randomInt(85, 115);
  const b = randomInt(85, 115);
  const da = a - 100;
  const db = b - 100;
  const answer = a * b;
  const left = a + db; // = b + da
  const right = da * db;
  return {
    id: pid('nikhilam', Math.min(a, b), Math.max(a, b)),
    techniqueId: 'nikhilam',
    question: `${a} × ${b}`,
    operands: [a, b],
    answer,
    hint: `Both near 100. Deviations: ${da >= 0 ? '+' : ''}${da} and ${db >= 0 ? '+' : ''}${db}`,
    steps: [
      `${a} deviates ${da >= 0 ? '+' : ''}${da} from 100`,
      `${b} deviates ${db >= 0 ? '+' : ''}${db} from 100`,
      `Left part: ${a} + (${db}) = ${left}`,
      `Right part: ${da} × ${db} = ${right}${right < 0 ? ' (borrow!)' : ''}`,
      `Answer: ${left}${right < 0 ? String(right).replace('-', '').padStart(2, '0') : String(Math.abs(right)).padStart(2, '0')} = ${answer}`,
    ],
  };
}

export function leftToRightProblem(): Problem {
  const count = randomInt(3, 5);
  const operands = Array.from({ length: count }, () => randomInt(10, 99));
  const answer = operands.reduce((s, n) => s + n, 0);
  const steps: string[] = [];
  let running = 0;
  for (const n of operands) {
    running += n;
    steps.push(`+ ${n} = ${running}`);
  }
  return {
    id: pid('leftToRight', ...operands),
    techniqueId: 'leftToRight',
    question: operands.join(' + '),
    operands,
    answer,
    hint: 'Add left to right, keeping a running total',
    steps,
  };
}
