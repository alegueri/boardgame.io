import type { GameState } from '../game/types';
import { CARD_MAP } from '../game/cards';
import CardDisplay from './CardDisplay';

interface MarketAreaProps {
  G: GameState;
  currentPlayerId: string;
  isMyTurn: boolean;
  onBuy: (index: number) => void;
  onSweep: () => void;
}

export default function MarketArea({
  G,
  currentPlayerId,
  isMyTurn,
  onBuy,
  onSweep,
}: MarketAreaProps) {
  const myMonster = G.monsters.find(m => m.id === currentPlayerId);
  const myEnergy = myMonster?.energy ?? 0;
  const canInteract = isMyTurn && G.resolved && G.pendingDamage === 0;
  // Alien Metabolism: cards cost 1 less
  const discount = (G.playerCards[currentPlayerId] ?? []).includes(2) ? 1 : 0;

  return (
    <div className="market-area">
      <div className="market-header">
        <span className="market-title">🃏 Power Cards</span>
        <span className="market-deck">{G.deck.length} left in deck</span>
        {canInteract && (
          <button
            className="btn btn-sweep"
            disabled={myEnergy < 2}
            onClick={onSweep}
            title="Discard all 3 cards and draw new ones for 2 ⚡"
          >
            🔄 Sweep ⚡2
          </button>
        )}
      </div>
      <div className="market-slots">
        {G.market.map((cardId, i) => (
          <div key={i} className="market-slot">
            {cardId !== null && CARD_MAP[cardId] ? (
              <CardDisplay
                card={CARD_MAP[cardId]}
                canBuy={canInteract}
                onBuy={() => onBuy(i)}
                playerEnergy={myEnergy}
                discount={discount}
              />
            ) : (
              <div className="market-empty">
                {G.deck.length === 0 ? 'Deck empty' : 'Empty slot'}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
