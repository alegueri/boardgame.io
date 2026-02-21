import type { GameState } from '../game/types';

interface Props {
  G: GameState;
}

export default function TokyoBoard({ G }: Props) {
  const occupant = G.tokyoOccupant !== null
    ? G.monsters.find(m => m.id === G.tokyoOccupant)
    : undefined;

  return (
    <div className="tokyo-board">
      <div className="tokyo-title">🏙️ Tokyo City</div>
      {occupant ? (
        <div className="tokyo-occupant">
          <span className="tokyo-emoji">{occupant.emoji}</span>
          <span>{occupant.name}</span>
        </div>
      ) : (
        <div className="tokyo-empty">Empty</div>
      )}
    </div>
  );
}
