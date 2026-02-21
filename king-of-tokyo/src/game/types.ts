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

export interface GameState {
  monsters: Monster[];
  dice: string[];
  keptDice: boolean[];
  rollsLeft: number;
  tokyoOccupant: string | null;
  pendingDamage: number;
  attackerId: string | null;
  resolved: boolean;
  log: string[];
}

export interface DiceResolution {
  vp: number;
  damage: number;
  heal: number;
  energy: number;
}
