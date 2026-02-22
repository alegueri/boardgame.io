import { MAX_HEALTH, VP_TO_WIN } from '../game/constants';
import type { Monster } from '../game/types';

interface Props {
  monster: Monster;
  isActive: boolean;
  playerName?: string;
}

export default function MonsterPanel({ monster, isActive, playerName }: Props) {
  if (!monster.alive) {
    return (
      <div className="monster-panel dead">
        <div className="monster-header">
          <span className="monster-emoji">{monster.emoji}</span>
          <span className="monster-name">{monster.name}</span>
        </div>
        {playerName && <div className="monster-player-name">{playerName}</div>}
        <div className="monster-dead-label">Eliminated</div>
      </div>
    );
  }

  const hpPct = (monster.health / MAX_HEALTH) * 100;
  const vpPct = Math.min((monster.vp / VP_TO_WIN) * 100, 100);

  return (
    <div className={`monster-panel ${isActive ? 'active' : ''} ${monster.inTokyo ? 'in-tokyo' : ''}`}>
      <div className="monster-header">
        <span className="monster-emoji">{monster.emoji}</span>
        <span className="monster-name">{monster.name}</span>
        {monster.inTokyo && <span className="tokyo-badge">TOKYO</span>}
      </div>
      {playerName && <div className="monster-player-name">{playerName}</div>}

      <div className="stat-row">
        <span className="stat-label">HP</span>
        <div className="bar-track">
          <div className="bar hp-bar" style={{ width: `${hpPct}%` }} />
        </div>
        <span className="stat-value">{monster.health}/{MAX_HEALTH}</span>
      </div>

      <div className="stat-row">
        <span className="stat-label">VP</span>
        <div className="bar-track">
          <div className="bar vp-bar" style={{ width: `${vpPct}%` }} />
        </div>
        <span className="stat-value">{monster.vp}/{VP_TO_WIN}</span>
      </div>

      <div className="stat-row energy-row">
        <span className="stat-label">⚡</span>
        <span className="stat-value">{monster.energy}</span>
      </div>
    </div>
  );
}
