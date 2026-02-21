import type { Ctx } from 'boardgame.io';
import type { GameState } from '../game/types';

const FACE_DISPLAY: Record<string, string> = {
  '1': '①',
  '2': '②',
  '3': '③',
  'claw': '🐾',
  'heart': '❤️',
  'lightning': '⚡',
};

interface Moves {
  rollDice: () => void;
  toggleKeep: (index: number) => void;
  finishRolling: () => void;
}

interface Props {
  G: GameState;
  ctx: Ctx;
  moves: Moves;
  isMyTurn: boolean;
}

export default function DiceArea({ G, moves, isMyTurn }: Props) {
  const canRoll = isMyTurn && !G.resolved && G.rollsLeft > 0;
  const canFinish = isMyTurn && !G.resolved;

  return (
    <div className="dice-area">
      <div className="dice-row">
        {G.dice.map((face, i) => (
          <button
            key={i}
            className={`die ${G.keptDice[i] ? 'kept' : ''} ${!isMyTurn || G.resolved ? 'disabled' : ''}`}
            onClick={() => isMyTurn && !G.resolved && moves.toggleKeep(i)}
            title={G.keptDice[i] ? 'Click to unkeep' : 'Click to keep'}
          >
            {FACE_DISPLAY[face] ?? face}
          </button>
        ))}
      </div>

      <div className="dice-actions">
        <button className="btn btn-roll" onClick={() => moves.rollDice()} disabled={!canRoll}>
          🎲 Reroll ({G.rollsLeft} left)
        </button>
        <button className="btn btn-finish" onClick={() => moves.finishRolling()} disabled={!canFinish}>
          ✔ Lock dice
        </button>
      </div>

      <p className="dice-hint">
        {!isMyTurn
          ? 'Waiting for other player...'
          : G.resolved
          ? 'Dice resolved.'
          : 'Click dice to keep them, then reroll the rest.'}
      </p>
    </div>
  );
}
