import type { CardDef } from '../game/types';

interface CardDisplayProps {
  card: CardDef;
  /** Show buy button — only passed when in market context */
  canBuy?: boolean;
  onBuy?: () => void;
  /** Current player's energy, used to disable the buy button if unaffordable */
  playerEnergy?: number;
  /** True discount from Alien Metabolism */
  discount?: number;
}

export default function CardDisplay({
  card,
  canBuy,
  onBuy,
  playerEnergy,
  discount = 0,
}: CardDisplayProps) {
  const effectiveCost = Math.max(0, card.cost - discount);
  const affordable =
    playerEnergy !== undefined ? playerEnergy >= effectiveCost : true;

  return (
    <div className={`card-display card-display--${card.type}`}>
      <div className="card-image-wrapper">
        {card.imageUrl ? (
          <img src={card.imageUrl} alt={card.name} className="card-image" />
        ) : (
          <div className="card-image-placeholder">{card.name[0]}</div>
        )}
        <span className="card-cost-badge">
          ⚡{discount > 0 ? <><s>{card.cost}</s> {effectiveCost}</> : card.cost}
        </span>
        <span className={`card-type-badge card-type-badge--${card.type}`}>
          {card.type === 'keep' ? 'KEEP' : 'DISCARD'}
        </span>
      </div>
      <div className="card-info">
        <div className="card-name">{card.name}</div>
        <div className="card-effect">{card.effect}</div>
      </div>
      {canBuy && onBuy && (
        <button
          className="btn btn-buy"
          onClick={onBuy}
          disabled={!affordable}
          title={!affordable ? `Need ${effectiveCost} ⚡ (have ${playerEnergy})` : undefined}
        >
          Buy ⚡{effectiveCost}
        </button>
      )}
    </div>
  );
}
