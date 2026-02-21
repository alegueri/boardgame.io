import { DICE_FACES } from './constants';
import type { DiceResolution } from './types';

/**
 * Resolve final dice values and return a delta object describing all effects.
 * @param dice     - array of 6 face strings
 * @param inTokyo  - whether the active player is currently in Tokyo
 */
export function resolveDice(dice: string[], inTokyo: boolean): DiceResolution {
  const counts: Record<string, number> = {};
  for (const face of DICE_FACES) counts[face] = 0;
  for (const face of dice) {
    if (face in counts) counts[face]++;
  }

  let vp = 0;
  let damage = 0;
  let heal = 0;
  let energy = 0;

  // Number dice: 3-of-a-kind scores the number value, +1 VP per extra die
  for (const num of ['1', '2', '3'] as const) {
    if (counts[num] >= 3) {
      vp += parseInt(num) + (counts[num] - 3);
    }
  }

  damage = counts['claw'];
  heal = inTokyo ? 0 : counts['heart']; // no healing in Tokyo
  energy = counts['lightning'];

  return { vp, damage, heal, energy };
}
