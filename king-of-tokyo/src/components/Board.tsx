import type { BoardProps } from 'boardgame.io/react';
import type { GameState } from '../game/types';
import MonsterPanel from './MonsterPanel';
import DiceArea from './DiceArea';
import TokyoBoard from './TokyoBoard';
import TurnInfo from './TurnInfo';

type KoTBoardProps = BoardProps<GameState>;

export default function Board({ G, ctx, moves, playerID }: KoTBoardProps) {
  const isMyTurn = ctx.currentPlayer === playerID;
  const myMonster = G.monsters.find(m => m.id === playerID);

  // ── Game over ──────────────────────────────────────────────────────────────
  if (ctx.gameover) {
    const winner =
      ctx.gameover.winner !== undefined
        ? G.monsters.find(m => m.id === ctx.gameover.winner)
        : undefined;
    return (
      <div className="gameover-screen">
        <h1>
          {ctx.gameover.draw
            ? 'Draw! Everyone is eliminated.'
            : `${winner?.emoji} ${winner?.name} wins!`}
        </h1>
        <p>Refresh the page to play again.</p>
      </div>
    );
  }

  // ── Yield prompt ───────────────────────────────────────────────────────────
  const showYieldPrompt =
    G.pendingDamage > 0 &&
    G.tokyoOccupant !== null &&
    playerID === G.tokyoOccupant;

  const tokyoMonster = G.tokyoOccupant
    ? G.monsters.find(m => m.id === G.tokyoOccupant)
    : undefined;
  const attackerMonster = G.attackerId
    ? G.monsters.find(m => m.id === G.attackerId)
    : undefined;

  return (
    <div className="board">
      <TurnInfo G={G} ctx={ctx} />

      {G.log.length > 0 && (
        <div className="game-log">
          {G.log.map((entry, i) => (
            <div key={i} className="log-entry">{entry}</div>
          ))}
        </div>
      )}

      <div className="monster-panels">
        {G.monsters.map(monster => (
          <MonsterPanel
            key={monster.id}
            monster={monster}
            isActive={monster.id === ctx.currentPlayer}
          />
        ))}
      </div>

      <TokyoBoard G={G} />

      {showYieldPrompt && (
        <div className="yield-prompt">
          <p>
            {attackerMonster?.emoji}{' '}
            <strong>{attackerMonster?.name}</strong> attacks for{' '}
            <strong>{G.pendingDamage} damage</strong>!
          </p>
          <p>
            {myMonster?.emoji} {myMonster?.name}, do you want to yield Tokyo?
          </p>
          <div className="yield-buttons">
            <button
              className="btn btn-yield"
              onClick={() => (moves as unknown as { decideYield: (v: boolean) => void }).decideYield(true)}
            >
              🏃 Yield Tokyo (take {G.pendingDamage} damage & flee)
            </button>
            <button
              className="btn btn-stay"
              onClick={() => (moves as unknown as { decideYield: (v: boolean) => void }).decideYield(false)}
            >
              💪 Stay in Tokyo (take {G.pendingDamage} damage)
            </button>
          </div>
        </div>
      )}

      {G.pendingDamage > 0 && playerID !== G.tokyoOccupant && (
        <div className="waiting-banner">
          Waiting for {tokyoMonster?.name} to decide...
        </div>
      )}

      {!G.pendingDamage && (
        <DiceArea
          G={G}
          ctx={ctx}
          moves={moves as unknown as { rollDice: () => void; toggleKeep: (i: number) => void; finishRolling: () => void }}
          isMyTurn={isMyTurn}
        />
      )}

      {isMyTurn && G.resolved && G.pendingDamage === 0 && (
        <button
          className="btn btn-end-turn"
          onClick={() => (moves as unknown as { endMyTurn: () => void }).endMyTurn()}
        >
          ➡ End Turn
        </button>
      )}
    </div>
  );
}
