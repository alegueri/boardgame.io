import type { GameState } from '../game/types';
import { CARD_MAP } from '../game/cards';
import CardDisplay from './CardDisplay';

interface PlayerCardsProps {
  G: GameState;
  playerId: string;
}

export default function PlayerCards({ G, playerId }: PlayerCardsProps) {
  const cardIds = G.playerCards[playerId] ?? [];
  const cards = cardIds.map(id => CARD_MAP[id]).filter((c): c is NonNullable<typeof c> => !!c);

  if (cards.length === 0) return null;

  return (
    <div className="player-cards-area">
      <div className="player-cards-title">Your Cards ({cards.length})</div>
      <div className="player-cards-scroll">
        {cards.map(card => (
          <CardDisplay key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}
