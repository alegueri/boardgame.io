import type { Ctx } from 'boardgame.io';
import type { GameState } from '../game/types';

interface Props {
  G: GameState;
  ctx: Ctx;
}

export default function TurnInfo({ G, ctx }: Props) {
  const monster = G.monsters.find(m => m.id === ctx.currentPlayer);
  if (!monster) return null;

  const phase = !G.resolved
    ? `Rolling (${G.rollsLeft} reroll${G.rollsLeft !== 1 ? 's' : ''} left)`
    : G.pendingDamage > 0
    ? 'Yield decision'
    : 'Turn resolved — end turn';

  return (
    <div className="turn-info">
      <span className="turn-monster">{monster.emoji} {monster.name}'s turn</span>
      <span className="turn-phase">{phase}</span>
    </div>
  );
}
