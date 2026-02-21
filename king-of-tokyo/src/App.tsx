import { useState } from 'react';
import { Client } from 'boardgame.io/react';
import { Local } from 'boardgame.io/multiplayer';
import { KingOfTokyo } from './game/game';
import Board from './components/Board';
import { HowToPlayGrid, HowToPlayDrawer } from './components/HowToPlay';

// boardgame.io Client returns a React component class
type GameClientComponent = ReturnType<typeof Client>;

// ── Player count picker (start screen) ───────────────────────────────────────

interface PickerProps {
  onStart: (n: number) => void;
}

function PlayerCountPicker({ onStart }: PickerProps) {
  const [count, setCount] = useState<number>(2);
  return (
    <div className="picker">
      <div className="picker-hero">
        <h1>👑 King of Tokyo</h1>
        <p className="picker-subtitle">
          Battle for control of the city. Roll dice, deal damage, and claim Tokyo!
        </p>
        <div className="picker-start-row">
          <span className="picker-label">Players:</span>
          <div className="picker-buttons">
            {([2, 3, 4] as const).map(n => (
              <button
                key={n}
                className={`btn ${count === n ? 'selected' : ''}`}
                onClick={() => setCount(n)}
              >
                {n}
              </button>
            ))}
          </div>
          <button className="btn btn-start" onClick={() => onStart(count)}>
            Start Game
          </button>
        </div>
      </div>

      <HowToPlayGrid />
    </div>
  );
}

// ── Build a boardgame.io Client for N players ─────────────────────────────────

function buildClient(numPlayers: number): GameClientComponent {
  return Client({
    game: KingOfTokyo,
    board: Board,
    numPlayers,
    multiplayer: Local(),
    debug: false,
  });
}

// ── Root App ──────────────────────────────────────────────────────────────────

export default function App() {
  const [numPlayers, setNumPlayers] = useState<number | null>(null);
  const [activePlayer, setActivePlayer] = useState<string>('0');
  const [GameClient, setGameClient] = useState<GameClientComponent | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  function handleStart(n: number) {
    setNumPlayers(n);
    setGameClient(() => buildClient(n));
    setActivePlayer('0');
  }

  if (!GameClient || numPlayers === null) {
    return <PlayerCountPicker onStart={handleStart} />;
  }

  return (
    <div className="app">
      <div className="game-topbar">
        <div className="player-tabs">
          {Array.from({ length: numPlayers }, (_, i) => String(i)).map(pid => (
            <button
              key={pid}
              className={`tab ${activePlayer === pid ? 'active' : ''}`}
              onClick={() => setActivePlayer(pid)}
            >
              Player {parseInt(pid) + 1}
            </button>
          ))}
        </div>
        <button
          className="btn btn-rules"
          onClick={() => setDrawerOpen(true)}
          title="How to play"
        >
          📖 Rules
        </button>
      </div>

      <GameClient playerID={activePlayer} />

      <HowToPlayDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
