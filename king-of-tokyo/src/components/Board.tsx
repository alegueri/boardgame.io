import { useState } from 'react';
import type { BoardProps } from 'boardgame.io/react';
import type { GameState } from '../game/types';
import MonsterPanel from './MonsterPanel';
import DiceArea from './DiceArea';
import TokyoBoard from './TokyoBoard';
import TurnInfo from './TurnInfo';
import MarketArea from './MarketArea';
import PlayerCards from './PlayerCards';

type KoTBoardProps = BoardProps<GameState>;

type KoTMoves = {
  rollDice: () => void;
  toggleKeep: (i: number) => void;
  finishRolling: () => void;
  endMyTurn: () => void;
  decideYield: (v: boolean) => void;
  buyCard: (index: number) => void;
  sweepMarket: () => void;
};

export default function Board({ G, ctx, moves, playerID, matchData }: KoTBoardProps) {
  const typedMoves = moves as unknown as KoTMoves;
  const isMyTurn = ctx.currentPlayer === playerID;
  const myMonster = G.monsters.find(m => m.id === playerID);

  // ── Disconnect detection (online mode only) ────────────────────────────────
  // matchData has isConnected populated only when using SocketIO transport
  const hasConnectionInfo = matchData?.some(p => p.isConnected !== undefined) ?? false;
  const disconnectedOpponents = hasConnectionInfo
    ? (matchData ?? []).filter(p => p.isConnected === false && String(p.id) !== playerID)
    : [];
  const isTwoPlayer = G.monsters.length === 2;
  const [bannerDismissed, setBannerDismissed] = useState(false);

  function displayName(id: number) {
    const meta = matchData?.find(p => p.id === id);
    const monster = G.monsters.find(m => m.id === String(id));
    return meta?.name ?? monster?.name ?? `Player ${id + 1}`;
  }

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

  // 2-player: blocking overlay — game can't continue
  if (disconnectedOpponents.length > 0 && isTwoPlayer) {
    const gone = disconnectedOpponents[0];
    return (
      <div className="board">
        <div className="disconnect-overlay">
          <div className="disconnect-card">
            <div className="disconnect-icon">📡</div>
            <h2>{displayName(gone.id)} has disconnected</h2>
            <p>The game cannot continue. Use the <strong>✕ Quit</strong> button above to return to the menu.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="board">
      {disconnectedOpponents.length > 0 && !bannerDismissed && (
        <div className="disconnect-banner">
          <span>
            ⚠️ {disconnectedOpponents.map(p => displayName(p.id)).join(', ')}{' '}
            {disconnectedOpponents.length === 1 ? 'has' : 'have'} disconnected.
            Their turns will be skipped until they reconnect.
          </span>
          <button className="disconnect-banner-close" onClick={() => setBannerDismissed(true)}>✕</button>
        </div>
      )}
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
            playerName={matchData?.find(p => String(p.id) === monster.id)?.name}
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
              onClick={() => typedMoves.decideYield(true)}
            >
              🏃 Yield Tokyo (take {G.pendingDamage} damage & flee)
            </button>
            <button
              className="btn btn-stay"
              onClick={() => typedMoves.decideYield(false)}
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
          moves={typedMoves}
          isMyTurn={isMyTurn}
        />
      )}

      <MarketArea
        G={G}
        currentPlayerId={playerID ?? '0'}
        isMyTurn={isMyTurn}
        onBuy={(i) => typedMoves.buyCard(i)}
        onSweep={() => typedMoves.sweepMarket()}
      />

      {playerID && (
        <PlayerCards G={G} playerId={playerID} />
      )}

      {isMyTurn && G.resolved && G.pendingDamage === 0 && (
        <button
          className="btn btn-end-turn"
          onClick={() => typedMoves.endMyTurn()}
        >
          ➡ End Turn
        </button>
      )}
    </div>
  );
}
