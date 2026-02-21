export const DICE_FACES = ['1', '2', '3', 'claw', 'heart', 'lightning'] as const;
export type DiceFace = typeof DICE_FACES[number];

export const NUM_DICE = 6;
export const MAX_HEALTH = 10;
export const VP_TO_WIN = 20;
export const MAX_ROLLS = 3; // initial roll + 2 rerolls
