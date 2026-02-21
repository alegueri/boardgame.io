import { INVALID_MOVE } from 'boardgame.io/core';
import type { Game, Ctx } from 'boardgame.io';
import { MONSTERS } from './monsters';
import { resolveDice } from './dice';
import { DICE_FACES, NUM_DICE, MAX_HEALTH, VP_TO_WIN, MAX_ROLLS } from './constants';
import type { GameState, Monster } from './types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function rollAllUnkept(G: GameState, random: { Die: (n: number) => number }): void {
  G.dice = G.dice.map((face, i) =>
    G.keptDice[i] ? face : DICE_FACES[random.Die(DICE_FACES.length) - 1]
  );
}

function clampHealth(val: number): number {
  return Math.max(0, Math.min(MAX_HEALTH, val));
}

function getMonster(G: GameState, playerId: string): Monster | undefined {
  return G.monsters.find(m => m.id === playerId);
}

function applyResolution(G: GameState, ctx: Ctx): void {
  const monster = getMonster(G, ctx.currentPlayer);
  if (!monster) return;

  const { vp, damage, heal, energy } = resolveDice(G.dice, monster.inTokyo);
  const log = [...G.log];

  if (vp > 0) {
    monster.vp += vp;
    log.push(`${monster.name} rolls: +${vp} VP`);
  }
  if (heal > 0) {
    const before = monster.health;
    monster.health = clampHealth(monster.health + heal);
    const gained = monster.health - before;
    if (gained > 0) log.push(`${monster.name} heals: +${gained} HP`);
  }
  if (energy > 0) {
    monster.energy += energy;
    log.push(`${monster.name} gets: +${energy} ⚡`);
  }

  if (damage > 0) {
    if (monster.inTokyo) {
      // Damage all monsters outside Tokyo
      G.monsters.forEach(m => {
        if (m.id !== monster.id && m.alive && !m.inTokyo) {
          m.health = clampHealth(m.health - damage);
          if (m.health <= 0) m.alive = false;
          log.push(`${monster.name} attacks ${m.name}: -${damage} HP`);
        }
      });
    } else if (G.tokyoOccupant !== null) {
      // Damage the Tokyo occupant — they choose to yield or stay
      const tokyoMonster = getMonster(G, G.tokyoOccupant);
      if (tokyoMonster?.alive) {
        G.pendingDamage = damage;
        G.attackerId = monster.id;
        log.push(`${monster.name} attacks Tokyo for ${damage} damage! ${tokyoMonster.name}: yield or stay?`);
      }
    }
  }

  G.log = log;

  // Enter empty Tokyo after resolving
  if (G.tokyoOccupant === null && monster.alive) {
    monster.inTokyo = true;
    G.tokyoOccupant = monster.id;
    monster.vp += 1;
    G.log = [...G.log, `${monster.name} enters Tokyo! +1 VP`];
  }

  G.resolved = true;
}

// ─── Game ────────────────────────────────────────────────────────────────────

export const KingOfTokyo: Game<GameState> = {
  name: 'king-of-tokyo',

  setup: ({ ctx }) => {
    const monsters: Monster[] = Array.from({ length: ctx.numPlayers }, (_, i) => ({
      id: String(i),
      name: MONSTERS[i].name,
      emoji: MONSTERS[i].emoji,
      health: MAX_HEALTH,
      vp: 0,
      energy: 0,
      alive: true,
      inTokyo: false,
    }));

    return {
      monsters,
      dice: Array<string>(NUM_DICE).fill('1'),
      keptDice: Array<boolean>(NUM_DICE).fill(false),
      rollsLeft: MAX_ROLLS - 1,
      tokyoOccupant: null,
      pendingDamage: 0,
      attackerId: null,
      resolved: false,
      log: [],
    };
  },

  turn: {
    onBegin: ({ G, ctx, random }) => {
      const monster = getMonster(G, ctx.currentPlayer);
      if (!monster?.alive) return;

      G.resolved = false;
      G.pendingDamage = 0;
      G.attackerId = null;

      const log: string[] = [];
      if (monster.inTokyo) {
        monster.vp += 2;
        log.push(`${monster.name} starts in Tokyo: +2 VP`);
      }

      G.keptDice = Array<boolean>(NUM_DICE).fill(false);
      G.rollsLeft = MAX_ROLLS - 1;
      rollAllUnkept(G, random);
      G.log = log;
    },

    order: {
      first: () => 0,
      next: ({ G, ctx }) => {
        const numPlayers = ctx.numPlayers;
        let pos = (ctx.playOrderPos + 1) % numPlayers;
        for (let i = 0; i < numPlayers; i++) {
          const pid = ctx.playOrder[pos];
          const monster = G.monsters.find(m => m.id === pid);
          if (monster?.alive) return pos;
          pos = (pos + 1) % numPlayers;
        }
        return pos;
      },
    },

    // Give the Tokyo occupant a stage to decide yield/stay after being attacked.
    // The attacker's finishRolling/rollDice move calls events.setActivePlayers
    // to place the occupant into this stage.
    stages: {
      yieldDecision: {
        moves: {
          decideYield: ({ G, events }, shouldYield: boolean) => {
            if (G.pendingDamage === 0) return INVALID_MOVE;

            const tokyoMonster = G.tokyoOccupant ? getMonster(G, G.tokyoOccupant) : undefined;
            if (!tokyoMonster) return INVALID_MOVE;

            if (shouldYield) {
              tokyoMonster.health = clampHealth(tokyoMonster.health - G.pendingDamage);
              if (tokyoMonster.health <= 0) tokyoMonster.alive = false;
              tokyoMonster.inTokyo = false;

              const attacker = G.attackerId ? getMonster(G, G.attackerId) : undefined;
              if (attacker?.alive) {
                attacker.inTokyo = true;
                G.tokyoOccupant = G.attackerId;
                attacker.vp += 1;
                G.log = [...G.log, `${tokyoMonster.name} yields! ${attacker.name} enters Tokyo: +1 VP`];
              } else {
                G.tokyoOccupant = null;
              }
            } else {
              tokyoMonster.health = clampHealth(tokyoMonster.health - G.pendingDamage);
              if (tokyoMonster.health <= 0) {
                tokyoMonster.alive = false;
                tokyoMonster.inTokyo = false;
                G.tokyoOccupant = null;
              }
              G.log = [...G.log, `${tokyoMonster.name} stays in Tokyo! -${G.pendingDamage} HP`];
            }

            G.pendingDamage = 0;
            G.attackerId = null;
            events.endStage();
          },
        },
      },
    },
  },

  moves: {
    toggleKeep: ({ G }, index: number) => {
      if (G.resolved) return INVALID_MOVE;
      if (index < 0 || index >= NUM_DICE) return INVALID_MOVE;
      G.keptDice[index] = !G.keptDice[index];
    },

    rollDice: ({ G, ctx, random, events }) => {
      if (G.resolved) return INVALID_MOVE;
      if (G.rollsLeft <= 0) return INVALID_MOVE;
      rollAllUnkept(G, random);
      G.rollsLeft--;
      if (G.rollsLeft <= 0) {
        applyResolution(G, ctx);
        if (G.pendingDamage > 0 && G.tokyoOccupant !== null) {
          events.setActivePlayers({ value: { [G.tokyoOccupant]: 'yieldDecision' }, moveLimit: 1 });
        }
      }
    },

    finishRolling: ({ G, ctx, events }) => {
      if (G.resolved) return INVALID_MOVE;
      G.rollsLeft = 0;
      applyResolution(G, ctx);
      if (G.pendingDamage > 0 && G.tokyoOccupant !== null) {
        events.setActivePlayers({ value: { [G.tokyoOccupant]: 'yieldDecision' }, moveLimit: 1 });
      }
    },

    endMyTurn: ({ G, events }) => {
      if (!G.resolved) return INVALID_MOVE;
      if (G.pendingDamage > 0) return INVALID_MOVE;
      events.endTurn();
    },
  },

  endIf: ({ G }) => {
    const alive = G.monsters.filter(m => m.alive);
    if (alive.length === 0) return { draw: true };
    if (alive.length === 1) return { winner: alive[0].id };
    const byVP = alive.find(m => m.vp >= VP_TO_WIN);
    if (byVP) return { winner: byVP.id };
  },
};
