export interface Monster {
  id: string;
  name: string;
  emoji: string;
  health: number;
  vp: number;
  energy: number;
  alive: boolean;
  inTokyo: boolean;
}

export type CardType = 'keep' | 'discard';

export interface CardDef {
  id: number;
  name: string;
  cost: number;
  type: CardType;
  effect: string;
  imageUrl: string;
}

export interface GameState {
  monsters: Monster[];
  // Dice
  dice: string[];
  keptDice: boolean[];
  rollsLeft: number;
  // Tokyo
  tokyoOccupant: string | null;
  pendingDamage: number;
  attackerId: string | null;
  // Turn state
  resolved: boolean;
  extraTurn: boolean;
  log: string[];
  // Card market
  deck: number[];
  market: (number | null)[];
  playerCards: Record<string, number[]>;
}

export interface DiceResolution {
  vp: number;
  damage: number;
  heal: number;
  energy: number;
}
