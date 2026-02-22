import type { CardType } from './types';

/** Card definition without imageUrl — safe to import on the server (no import.meta.glob). */
export interface CardData {
  id: number;
  name: string;
  cost: number;
  type: CardType;
  effect: string;
}

export const CARD_DATA: CardData[] = [
  { id: 1,  name: 'Acid Attack',                    cost: 6, type: 'keep',    effect: 'Deal 1 extra damage each turn, even without attacking.' },
  { id: 2,  name: 'Alien Metabolism',               cost: 3, type: 'keep',    effect: 'Buying cards costs 1 less ⚡.' },
  { id: 3,  name: 'Alpha Monster',                  cost: 5, type: 'keep',    effect: 'Gain 1 VP whenever you deal damage.' },
  { id: 4,  name: 'Apartment Building',             cost: 5, type: 'discard', effect: '+3 VP.' },
  { id: 5,  name: 'Armor Plating',                  cost: 4, type: 'keep',    effect: 'Ignore 1 point of damage each time you are hit.' },
  { id: 6,  name: 'Background Dweller',             cost: 4, type: 'keep',    effect: 'You can always reroll any ③ you have.' },
  { id: 7,  name: 'Burrowing',                      cost: 5, type: 'keep',    effect: 'Deal 1 extra damage to Tokyo. Deal 1 damage when yielding Tokyo.' },
  { id: 8,  name: 'Camouflage',                     cost: 3, type: 'keep',    effect: 'Roll a die for each damage point taken. On ❤️ ignore that damage.' },
  { id: 9,  name: 'Commuter Train',                 cost: 4, type: 'discard', effect: '+2 VP.' },
  { id: 10, name: 'Complete Destruction',           cost: 3, type: 'keep',    effect: 'If you roll ①②③❤️🐾⚡ gain 9 VP in addition to regular results.' },
  { id: 11, name: 'Corner Store',                   cost: 3, type: 'discard', effect: '+1 VP.' },
  { id: 12, name: 'Dedicated News Team',            cost: 3, type: 'keep',    effect: 'Gain 1 VP whenever you buy a card.' },
  { id: 13, name: 'Drop from High Altitude',        cost: 5, type: 'discard', effect: '+2 VP and take control of Tokyo if you don\'t already.' },
  { id: 14, name: 'Eater of the Dead',              cost: 4, type: 'keep',    effect: 'Gain 3 VP every time a monster is eliminated.' },
  { id: 15, name: 'Energize',                       cost: 8, type: 'discard', effect: '+9 ⚡.' },
  { id: 16, name: 'Energy Hoarder',                 cost: 3, type: 'keep',    effect: 'Gain 1 VP for every 6 ⚡ you have at the end of your turn.' },
  { id: 17, name: 'Evacuation Orders',              cost: 7, type: 'discard', effect: 'All other monsters lose 5 VP.' },
  { id: 18, name: 'Even Bigger',                    cost: 4, type: 'keep',    effect: '+2 maximum HP. Gain 2 HP when you get this card.' },
  { id: 19, name: 'Extra Head',                     cost: 7, type: 'keep',    effect: 'You roll 1 extra die each turn.' },
  { id: 20, name: 'Fire Blast',                     cost: 3, type: 'discard', effect: 'Deal 2 damage to all other monsters.' },
  { id: 21, name: 'Fire Breathing',                 cost: 4, type: 'keep',    effect: 'Your neighbours take 1 extra damage when you deal damage.' },
  { id: 22, name: 'Freeze Time',                    cost: 5, type: 'keep',    effect: 'On a turn you score ①①①, take another turn with one less die.' },
  { id: 23, name: 'Frenzy',                         cost: 7, type: 'discard', effect: 'Take another turn immediately after this one.' },
  { id: 24, name: 'Friend of Children',             cost: 3, type: 'keep',    effect: 'Gain 1 extra ⚡ whenever you gain any ⚡.' },
  { id: 25, name: 'Gas Refinery',                   cost: 6, type: 'discard', effect: '+2 VP and deal 3 damage to all other monsters.' },
  { id: 26, name: 'Giant Brain',                    cost: 5, type: 'keep',    effect: 'You get 1 extra reroll each turn.' },
  { id: 27, name: 'Gourmet',                        cost: 4, type: 'keep',    effect: 'When scoring ①①① gain 2 extra VP.' },
  { id: 28, name: 'Heal',                           cost: 3, type: 'discard', effect: 'Heal 2 HP.' },
  { id: 29, name: 'Healing Ray',                    cost: 4, type: 'keep',    effect: 'Heal other monsters with ❤️. They pay you 2 ⚡ per HP healed.' },
  { id: 30, name: 'Herbivore',                      cost: 5, type: 'keep',    effect: 'Gain 1 VP on your turn if you don\'t damage anyone.' },
  { id: 31, name: 'Herd Culler',                    cost: 3, type: 'keep',    effect: 'You can change one of your dice to a ① each turn.' },
  { id: 32, name: 'High Altitude Bombing',          cost: 4, type: 'discard', effect: 'All monsters (including you) take 3 damage.' },
  { id: 33, name: 'It Has a Child',                 cost: 7, type: 'keep',    effect: 'If eliminated, discard your cards and VP, heal to 10 HP and restart.' },
  { id: 34, name: 'Jet Fighters',                   cost: 5, type: 'discard', effect: '+5 VP and take 4 damage.' },
  { id: 35, name: 'Jets',                           cost: 5, type: 'keep',    effect: 'You suffer no damage when yielding Tokyo.' },
  { id: 36, name: 'Made in a Lab',                  cost: 2, type: 'keep',    effect: 'When purchasing cards, peek at and optionally buy the top deck card.' },
  { id: 37, name: 'Metamorph',                      cost: 3, type: 'keep',    effect: 'Discard any of your KEEP cards at end of turn to recover their ⚡ cost.' },
  { id: 38, name: 'Mimic',                          cost: 8, type: 'keep',    effect: 'Copy a card any monster has. Spend 1 ⚡ to change what you are copying.' },
  { id: 39, name: 'Monster Batteries',              cost: 2, type: 'keep',    effect: 'Load with ⚡ from your reserve. Take 2 ⚡ per turn. Discard when empty.' },
  { id: 40, name: 'National Guard',                 cost: 3, type: 'discard', effect: '+2 VP and take 2 damage.' },
  { id: 41, name: 'Nova Breath',                    cost: 7, type: 'keep',    effect: 'Your attacks damage all other monsters.' },
  { id: 42, name: 'Nuclear Power Plant',            cost: 6, type: 'discard', effect: '+2 VP and heal 3 HP.' },
  { id: 43, name: 'Omnivore',                       cost: 4, type: 'keep',    effect: 'Once per turn score ①②③ for 2 VP. Dice can still be used in other combos.' },
  { id: 44, name: 'Opportunist',                    cost: 3, type: 'keep',    effect: 'Buy a newly revealed market card immediately when it is flipped.' },
  { id: 45, name: 'Parasitic Tentacles',            cost: 4, type: 'keep',    effect: 'You can purchase KEEP cards from other monsters at their ⚡ cost.' },
  { id: 46, name: 'Plot Twist',                     cost: 3, type: 'keep',    effect: 'Change one die to any result. Discard after use.' },
  { id: 47, name: 'Poison Quills',                  cost: 3, type: 'keep',    effect: 'When you score ②②② also deal 2 damage.' },
  { id: 48, name: 'Poison Spit',                    cost: 4, type: 'keep',    effect: 'Dealing damage gives targets a poison counter. They take 1 damage per counter at end of their turn.' },
  { id: 49, name: 'Psychic Probe',                  cost: 3, type: 'keep',    effect: 'Reroll one die of each other monster once per turn. Discard if result is ❤️.' },
  { id: 50, name: 'Rapid Healing',                  cost: 3, type: 'keep',    effect: 'Spend 2 ⚡ at any time to heal 1 HP.' },
  { id: 51, name: 'Regeneration',                   cost: 4, type: 'keep',    effect: 'When you heal, heal 1 extra HP.' },
  { id: 52, name: 'Rooting for the Underdog',       cost: 3, type: 'keep',    effect: 'Gain 1 VP at end of a turn when you have the fewest VP.' },
  { id: 53, name: 'Shrink Ray',                     cost: 6, type: 'keep',    effect: 'Dealing damage gives targets a shrink counter. They roll 1 less die per counter.' },
  { id: 54, name: 'Skyscraper',                     cost: 6, type: 'discard', effect: '+4 VP.' },
  { id: 55, name: 'Smoke Cloud',                    cost: 4, type: 'keep',    effect: 'Has 3 charges. Spend a charge for an extra reroll. Discard when empty.' },
  { id: 56, name: 'Solar Powered',                  cost: 2, type: 'keep',    effect: 'Gain 1 ⚡ at the end of your turn if you have none.' },
  { id: 57, name: 'Spiked Tail',                    cost: 5, type: 'keep',    effect: 'Deal 1 extra damage when you attack.' },
  { id: 58, name: 'Stretchy',                       cost: 3, type: 'keep',    effect: 'Spend 2 ⚡ to change one of your dice to any result.' },
  { id: 59, name: 'Tanks',                          cost: 4, type: 'discard', effect: '+4 VP and take 3 damage.' },
  { id: 60, name: 'Telepath',                       cost: 4, type: 'keep',    effect: 'Spend 1 ⚡ for 1 extra reroll.' },
  { id: 61, name: 'Urbavore',                       cost: 4, type: 'keep',    effect: '+1 VP when starting a turn in Tokyo. Deal 1 extra damage when attacking from Tokyo.' },
  { id: 62, name: 'Vast Storm',                     cost: 6, type: 'discard', effect: '+2 VP. All other monsters lose half their ⚡ (rounded down).' },
  { id: 63, name: "We're Only Making It Stronger",  cost: 3, type: 'keep',    effect: 'When you lose 2+ HP in one hit, gain 1 ⚡.' },
  { id: 64, name: 'Wings',                          cost: 6, type: 'keep',    effect: 'Spend 2 ⚡ to negate all damage to you for one turn.' },
];

export const CARD_DATA_MAP: Record<number, CardData> = Object.fromEntries(
  CARD_DATA.map(c => [c.id, c])
);
