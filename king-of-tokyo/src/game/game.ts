import { INVALID_MOVE } from 'boardgame.io/core';
import type { Game, Ctx } from 'boardgame.io';
import { MONSTERS } from './monsters';
import { resolveDice } from './dice';
import { DICE_FACES, NUM_DICE, MAX_HEALTH, VP_TO_WIN, MAX_ROLLS } from './constants';
import type { GameState, Monster } from './types';
import { CARD_DATA as CARDS, CARD_DATA_MAP as CARD_MAP } from './cardData';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function playerHasCard(G: GameState, playerId: string, cardId: number): boolean {
  return (G.playerCards[playerId] ?? []).includes(cardId);
}

function getMaxHealth(G: GameState, playerId: string): number {
  return MAX_HEALTH + (playerHasCard(G, playerId, 18) ? 2 : 0); // Even Bigger
}

function clampHealth(val: number, max: number = MAX_HEALTH): number {
  return Math.max(0, Math.min(max, val));
}

function getMonster(G: GameState, playerId: string): Monster | undefined {
  return G.monsters.find(m => m.id === playerId);
}

function rollAllUnkept(G: GameState, random: { Die: (n: number) => number }): void {
  G.dice = G.dice.map((face, i) =>
    G.keptDice[i] ? face : DICE_FACES[random.Die(DICE_FACES.length) - 1]
  );
}

/** Apply damage to a monster, respecting Armor Plating and Even Bigger max HP.
 *  Also handles Tokyo-exit and Eater of the Dead on kill. */
function dealDamageToMonster(G: GameState, target: Monster, amount: number): void {
  const armor = playerHasCard(G, target.id, 5) ? 1 : 0; // Armor Plating
  const actual = Math.max(0, amount - armor);
  const maxHp = getMaxHealth(G, target.id);
  target.health = clampHealth(target.health - actual, maxHp);
  if (target.health <= 0 && target.alive) {
    target.alive = false;
    if (target.inTokyo) {
      target.inTokyo = false;
      G.tokyoOccupant = null;
    }
    // Eater of the Dead: all alive holders gain 3 VP
    G.monsters.forEach(eater => {
      if (eater.alive && playerHasCard(G, eater.id, 14)) {
        eater.vp += 3;
        G.log.push(`${eater.name} Eater of the Dead: +3 VP`);
      }
    });
  }
}

function fillMarket(G: GameState): void {
  for (let i = 0; i < G.market.length; i++) {
    if (G.market[i] === null && G.deck.length > 0) {
      G.market[i] = G.deck[0];
      G.deck.splice(0, 1);
    }
  }
}

/** Apply the one-shot effect of a DISCARD card immediately on purchase. */
function applyDiscardEffect(G: GameState, ctx: Ctx, cardId: number): void {
  const monster = getMonster(G, ctx.currentPlayer);
  if (!monster) return;

  switch (cardId) {
    case 4: { // Apartment Building: +3 VP
      monster.vp += 3;
      G.log.push(`${monster.name} Apartment Building: +3 VP`);
      break;
    }
    case 9: { // Commuter Train: +2 VP
      monster.vp += 2;
      G.log.push(`${monster.name} Commuter Train: +2 VP`);
      break;
    }
    case 11: { // Corner Store: +1 VP
      monster.vp += 1;
      G.log.push(`${monster.name} Corner Store: +1 VP`);
      break;
    }
    case 13: { // Drop from High Altitude: +2 VP + seize Tokyo
      monster.vp += 2;
      if (G.tokyoOccupant !== null && G.tokyoOccupant !== monster.id) {
        const occupant = getMonster(G, G.tokyoOccupant);
        if (occupant) occupant.inTokyo = false;
        monster.inTokyo = true;
        G.tokyoOccupant = monster.id;
        G.log.push(`${monster.name} Drop from High Altitude: +2 VP, seizes Tokyo!`);
      } else if (G.tokyoOccupant === null) {
        monster.inTokyo = true;
        G.tokyoOccupant = monster.id;
        G.log.push(`${monster.name} Drop from High Altitude: +2 VP, enters Tokyo!`);
      } else {
        G.log.push(`${monster.name} Drop from High Altitude: +2 VP`);
      }
      break;
    }
    case 15: { // Energize: +9 energy
      monster.energy += 9;
      G.log.push(`${monster.name} Energize: +9 ⚡`);
      break;
    }
    case 17: { // Evacuation Orders: all others lose 5 VP
      G.monsters.forEach(m => {
        if (m.id !== monster.id) m.vp = Math.max(0, m.vp - 5);
      });
      G.log.push(`${monster.name} Evacuation Orders: all others -5 VP`);
      break;
    }
    case 20: { // Fire Blast: deal 2 damage to all others
      G.monsters.forEach(m => {
        if (m.id !== monster.id && m.alive) dealDamageToMonster(G, m, 2);
      });
      G.log.push(`${monster.name} Fire Blast: deal 2 damage to all!`);
      break;
    }
    case 23: { // Frenzy: extra turn
      G.extraTurn = true;
      G.log.push(`${monster.name} Frenzy: extra turn coming!`);
      break;
    }
    case 25: { // Gas Refinery: +2 VP + 3 damage to all others
      monster.vp += 2;
      G.monsters.forEach(m => {
        if (m.id !== monster.id && m.alive) dealDamageToMonster(G, m, 3);
      });
      G.log.push(`${monster.name} Gas Refinery: +2 VP, deal 3 damage to all!`);
      break;
    }
    case 28: { // Heal: heal 2 HP (3 with Regeneration)
      const healAmt28 = playerHasCard(G, monster.id, 51) ? 3 : 2;
      const maxHp28 = getMaxHealth(G, monster.id);
      const before28 = monster.health;
      monster.health = clampHealth(monster.health + healAmt28, maxHp28);
      G.log.push(`${monster.name} Heal: +${monster.health - before28} HP`);
      break;
    }
    case 32: { // High Altitude Bombing: all take 3 damage (including self)
      G.monsters.forEach(m => { if (m.alive) dealDamageToMonster(G, m, 3); });
      G.log.push(`${monster.name} High Altitude Bombing: all take 3 damage!`);
      break;
    }
    case 34: { // Jet Fighters: +5 VP, take 4 damage
      monster.vp += 5;
      dealDamageToMonster(G, monster, 4);
      G.log.push(`${monster.name} Jet Fighters: +5 VP, -4 HP`);
      break;
    }
    case 40: { // National Guard: +2 VP, take 2 damage
      monster.vp += 2;
      dealDamageToMonster(G, monster, 2);
      G.log.push(`${monster.name} National Guard: +2 VP, -2 HP`);
      break;
    }
    case 42: { // Nuclear Power Plant: +2 VP, heal 3 HP (4 with Regeneration)
      monster.vp += 2;
      const healAmt42 = playerHasCard(G, monster.id, 51) ? 4 : 3;
      const maxHp42 = getMaxHealth(G, monster.id);
      const before42 = monster.health;
      monster.health = clampHealth(monster.health + healAmt42, maxHp42);
      G.log.push(`${monster.name} Nuclear Power Plant: +2 VP, +${monster.health - before42} HP`);
      break;
    }
    case 54: { // Skyscraper: +4 VP
      monster.vp += 4;
      G.log.push(`${monster.name} Skyscraper: +4 VP`);
      break;
    }
    case 59: { // Tanks: +4 VP, take 3 damage
      monster.vp += 4;
      dealDamageToMonster(G, monster, 3);
      G.log.push(`${monster.name} Tanks: +4 VP, -3 HP`);
      break;
    }
    case 62: { // Vast Storm: +2 VP, others lose half energy
      monster.vp += 2;
      G.monsters.forEach(m => {
        if (m.id !== monster.id && m.alive) m.energy = Math.floor(m.energy / 2);
      });
      G.log.push(`${monster.name} Vast Storm: +2 VP, others lose half ⚡`);
      break;
    }
  }
}

function applyResolution(G: GameState, ctx: Ctx): void {
  const monster = getMonster(G, ctx.currentPlayer);
  if (!monster) return;

  const { vp, damage, heal, energy } = resolveDice(G.dice, monster.inTokyo);

  // Calculate effective damage including KEEP card bonuses
  let damageToDeal = damage;
  if (damage > 0 && playerHasCard(G, monster.id, 57)) damageToDeal += 1; // Spiked Tail
  if (playerHasCard(G, monster.id, 1)) damageToDeal += 1; // Acid Attack (even without claws)

  if (vp > 0) {
    monster.vp += vp;
    G.log.push(`${monster.name} rolls: +${vp} VP`);
  }
  if (heal > 0) {
    let healAmt = heal;
    if (playerHasCard(G, monster.id, 51)) healAmt += 1; // Regeneration
    const maxHp = getMaxHealth(G, monster.id);
    const before = monster.health;
    monster.health = clampHealth(monster.health + healAmt, maxHp);
    const gained = monster.health - before;
    if (gained > 0) G.log.push(`${monster.name} heals: +${gained} HP`);
  }
  if (energy > 0) {
    let energyGain = energy;
    if (playerHasCard(G, monster.id, 24)) energyGain += 1; // Friend of Children
    monster.energy += energyGain;
    G.log.push(`${monster.name} gets: +${energyGain} ⚡`);
  }

  let dealtDamage = false;
  if (damageToDeal > 0) {
    if (monster.inTokyo) {
      // Damage all monsters outside Tokyo
      G.monsters.forEach(m => {
        if (m.id !== monster.id && m.alive && !m.inTokyo) {
          dealDamageToMonster(G, m, damageToDeal);
          dealtDamage = true;
          G.log.push(`${monster.name} attacks ${m.name}: -${damageToDeal} HP`);
        }
      });
    } else if (G.tokyoOccupant !== null) {
      // Damage the Tokyo occupant — they choose to yield or stay
      const tokyoMonster = getMonster(G, G.tokyoOccupant);
      if (tokyoMonster?.alive) {
        G.pendingDamage = damageToDeal;
        G.attackerId = monster.id;
        dealtDamage = true;
        G.log.push(`${monster.name} attacks Tokyo for ${damageToDeal} damage! ${tokyoMonster.name}: yield or stay?`);
      }
    }
    // Alpha Monster: +1 VP for dealing damage
    if (dealtDamage && playerHasCard(G, monster.id, 3)) {
      monster.vp += 1;
      G.log.push(`${monster.name} Alpha Monster: +1 VP`);
    }
  }

  // Herbivore: +1 VP on your turn if you deal no damage (and not in Tokyo)
  if (!dealtDamage && !monster.inTokyo && playerHasCard(G, monster.id, 30)) {
    monster.vp += 1;
    G.log.push(`${monster.name} Herbivore: +1 VP`);
  }

  G.log = [...G.log]; // flush for Immer

  // Enter empty Tokyo after resolving
  if (G.tokyoOccupant === null && monster.alive) {
    monster.inTokyo = true;
    G.tokyoOccupant = monster.id;
    monster.vp += 1;
    G.log.push(`${monster.name} enters Tokyo! +1 VP`);
  }

  G.resolved = true;
}

// ─── Game ────────────────────────────────────────────────────────────────────

export const KingOfTokyo: Game<GameState> = {
  name: 'king-of-tokyo',

  setup: ({ ctx, random }) => {
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

    const allIds = CARDS.map(c => c.id);
    const shuffled: number[] = random.Shuffle(allIds);
    const market: (number | null)[] = [
      shuffled[0] ?? null,
      shuffled[1] ?? null,
      shuffled[2] ?? null,
    ];
    const deck = shuffled.slice(3);

    const playerCards: Record<string, number[]> = {};
    for (let i = 0; i < ctx.numPlayers; i++) {
      playerCards[String(i)] = [];
    }

    return {
      monsters,
      dice: Array<string>(NUM_DICE).fill('1'),
      keptDice: Array<boolean>(NUM_DICE).fill(false),
      rollsLeft: MAX_ROLLS - 1,
      tokyoOccupant: null,
      pendingDamage: 0,
      attackerId: null,
      resolved: false,
      extraTurn: false,
      log: [],
      deck,
      market,
      playerCards,
    };
  },

  turn: {
    onBegin: ({ G, ctx, random }) => {
      const monster = getMonster(G, ctx.currentPlayer);
      if (!monster?.alive) return;

      G.resolved = false;
      G.pendingDamage = 0;
      G.attackerId = null;
      G.log = [];

      if (monster.inTokyo) {
        let tokyoVP = 2;
        if (playerHasCard(G, ctx.currentPlayer, 61)) tokyoVP += 1; // Urbavore: +1 extra VP in Tokyo
        monster.vp += tokyoVP;
        G.log.push(`${monster.name} starts in Tokyo: +${tokyoVP} VP`);
      }

      // Giant Brain: 1 extra reroll per turn
      const extraRolls = playerHasCard(G, ctx.currentPlayer, 26) ? 1 : 0;
      G.keptDice = Array<boolean>(NUM_DICE).fill(false);
      G.rollsLeft = MAX_ROLLS - 1 + extraRolls;
      rollAllUnkept(G, random);
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
    stages: {
      yieldDecision: {
        moves: {
          decideYield: ({ G, events }, shouldYield: boolean) => {
            if (G.pendingDamage === 0) return INVALID_MOVE;
            const tokyoMonster = G.tokyoOccupant ? getMonster(G, G.tokyoOccupant) : undefined;
            if (!tokyoMonster) return INVALID_MOVE;

            if (shouldYield) {
              dealDamageToMonster(G, tokyoMonster, G.pendingDamage);
              tokyoMonster.inTokyo = false;
              if (G.tokyoOccupant === tokyoMonster.id) G.tokyoOccupant = null;

              const attacker = G.attackerId ? getMonster(G, G.attackerId) : undefined;
              if (attacker?.alive) {
                attacker.inTokyo = true;
                G.tokyoOccupant = G.attackerId;
                attacker.vp += 1;
                G.log.push(`${tokyoMonster.name} yields! ${attacker.name} enters Tokyo: +1 VP`);
              } else {
                G.log.push(`${tokyoMonster.name} yields Tokyo!`);
              }
            } else {
              dealDamageToMonster(G, tokyoMonster, G.pendingDamage);
              if (tokyoMonster.alive) {
                G.log.push(`${tokyoMonster.name} stays in Tokyo! -${G.pendingDamage} HP`);
              }
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

    buyCard: ({ G, ctx }, marketIndex: number) => {
      if (!G.resolved) return INVALID_MOVE;
      if (G.pendingDamage > 0) return INVALID_MOVE;
      if (marketIndex < 0 || marketIndex >= G.market.length) return INVALID_MOVE;
      const cardId = G.market[marketIndex];
      if (cardId === null) return INVALID_MOVE;
      const card = CARD_MAP[cardId];
      if (!card) return INVALID_MOVE;

      const monster = getMonster(G, ctx.currentPlayer);
      if (!monster?.alive) return INVALID_MOVE;

      // Alien Metabolism: buying costs 1 less energy
      const discount = playerHasCard(G, ctx.currentPlayer, 2) ? 1 : 0;
      const cost = Math.max(0, card.cost - discount);
      if (monster.energy < cost) return INVALID_MOVE;

      monster.energy -= cost;
      G.market[marketIndex] = null;

      // Dedicated News Team: +1 VP whenever buying a card
      if (playerHasCard(G, ctx.currentPlayer, 12)) {
        monster.vp += 1;
        G.log.push(`${monster.name} Dedicated News Team: +1 VP`);
      }

      if (card.type === 'discard') {
        applyDiscardEffect(G, ctx, cardId);
      } else {
        G.playerCards[ctx.currentPlayer] = [
          ...(G.playerCards[ctx.currentPlayer] ?? []),
          cardId,
        ];
        // Even Bigger: immediate +2 max HP and heal 2 HP on acquisition
        if (cardId === 18) {
          const maxHp = getMaxHealth(G, ctx.currentPlayer); // already includes the +2
          const before = monster.health;
          monster.health = clampHealth(monster.health + 2, maxHp);
          G.log.push(`${monster.name} Even Bigger: max HP +2, +${monster.health - before} HP`);
        } else {
          G.log.push(`${monster.name} buys ${card.name}`);
        }
      }

      fillMarket(G);
    },

    sweepMarket: ({ G, ctx }) => {
      const monster = getMonster(G, ctx.currentPlayer);
      if (!monster?.alive) return INVALID_MOVE;
      if (monster.energy < 2) return INVALID_MOVE;

      monster.energy -= 2;
      // Discard all current market cards to bottom of deck, then refill
      for (let i = 0; i < G.market.length; i++) {
        const cardId = G.market[i];
        if (cardId !== null) {
          G.deck.push(cardId);
          G.market[i] = null;
        }
      }
      fillMarket(G);
      G.log.push(`${monster.name} sweeps the market: 3 new cards for 2 ⚡`);
    },

    endMyTurn: ({ G, ctx, random, events }) => {
      if (!G.resolved) return INVALID_MOVE;
      if (G.pendingDamage > 0) return INVALID_MOVE;

      const monster = getMonster(G, ctx.currentPlayer);
      if (monster) {
        // Energy Hoarder: gain 1 VP per 6 energy at end of turn
        if (playerHasCard(G, ctx.currentPlayer, 16)) {
          const bonus = Math.floor(monster.energy / 6);
          if (bonus > 0) {
            monster.vp += bonus;
            G.log.push(`${monster.name} Energy Hoarder: +${bonus} VP`);
          }
        }
        // Solar Powered: gain 1 energy if you have none at end of turn
        if (playerHasCard(G, ctx.currentPlayer, 56) && monster.energy === 0) {
          monster.energy += 1;
          G.log.push(`${monster.name} Solar Powered: +1 ⚡`);
        }
      }

      if (G.extraTurn) {
        G.extraTurn = false;
        G.resolved = false;
        G.keptDice = Array<boolean>(NUM_DICE).fill(false);
        const extraRolls = playerHasCard(G, ctx.currentPlayer, 26) ? 1 : 0;
        G.rollsLeft = MAX_ROLLS - 1 + extraRolls;
        rollAllUnkept(G, random);
        G.log.push(`${monster?.name ?? 'Player'} takes an extra turn!`);
        return;
      }

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
