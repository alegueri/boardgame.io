import type { AbacusState, AbacusColumn } from '../types/abacus';

export function numberToAbacusState(n: number): AbacusState {
  const digits: number[] = [];
  const absN = Math.abs(Math.floor(n));
  if (absN === 0) {
    digits.push(0);
  } else {
    let remaining = absN;
    while (remaining > 0) {
      digits.push(remaining % 10);
      remaining = Math.floor(remaining / 10);
    }
  }
  // digits[0] = ones, digits[1] = tens, etc.

  const columns: AbacusColumn[] = digits.map((digit, i) => {
    const heavenValue = digit >= 5 ? 1 : 0;
    const earthValue = digit % 5;
    return {
      heavenBead: { active: heavenValue === 1 },
      earthBeads: [
        { active: earthValue >= 1 },
        { active: earthValue >= 2 },
        { active: earthValue >= 3 },
        { active: earthValue >= 4 },
      ],
      placeValue: Math.pow(10, i),
    };
  });

  return { columns, value: absN };
}
