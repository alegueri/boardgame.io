import { useState } from 'react';
import { Client } from 'boardgame.io/react';
import { Local } from 'boardgame.io/multiplayer';
import { KingOfTokyo } from './game/game';
import Board from './components/Board';
import Lobby from './components/Lobby';
import { HowToPlayGrid, HowToPlayDrawer } from './components/HowToPlay';
import { CardBrowserDrawer } from './components/CardBrowser';

// boardgame.io Client returns a React component class
type GameClientComponent = ReturnType<typeof Client>;

// ── Home screen — choose local or online ──────────────────────────────────────

interface HomeProps {
  onLocal: () => void;
  onOnline: () => void;
}

function HomeScreen({ onLocal, onOnline }: HomeProps) {
  return (
    <div className="picker">
      <div className="picker-hero">
        <h1>👑 King of Tokyo</h1>
        <p className="picker-subtitle">
          Battle for control of the city. Roll dice, deal damage, and claim Tokyo!
        </p>
        <div className="home-mode-row">
          <button className="btn btn-start" onClick={onLocal}>
            Play Locally
          </button>
          <button className="btn btn-online" onClick={onOnline}>
            Play Online
          </button>
        </div>
      </div>
      <HowToPlayGrid />
    </div>
  );
}

// ── Local player count picker ─────────────────────────────────────────────────

interface LocalPickerProps {
  onStart: (n: number) => void;
  onBack: () => void;
}

function LocalPicker({ onStart, onBack }: LocalPickerProps) {
  const [count, setCount] = useState<number>(2);
  return (
    <div className="picker">
      <div className="picker-hero">
        <h1>👑 King of Tokyo</h1>
        <p className="picker-subtitle">Pass-and-play on one device.</p>
        <div className="picker-start-row">
          <span className="picker-label">Players:</span>
          <div className="picker-buttons">
            {([2, 3, 4] as const).map((n) => (
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
        <button className="btn btn-quit" style={{ marginTop: '0.75rem' }} onClick={onBack}>
          ← Back
        </button>
      </div>
      <HowToPlayGrid />
    </div>
  );
}

// ── Build a local boardgame.io Client for N players ───────────────────────────

function buildLocalClient(numPlayers: number): GameClientComponent {
  return Client({
    game: KingOfTokyo,
    board: Board,
    numPlayers,
    multiplayer: Local(),
    debug: false,
  });
}

// ── Root App ──────────────────────────────────────────────────────────────────

type AppMode = null | 'local' | 'online';

export default function App() {
  const [mode, setMode] = useState<AppMode>(null);
  const [numPlayers, setNumPlayers] = useState<number | null>(null);
  const [activePlayer, setActivePlayer] = useState<string>('0');
  const [GameClient, setGameClient] = useState<GameClientComponent | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cardBrowserOpen, setCardBrowserOpen] = useState(false);

  function handleLocalStart(n: number) {
    setNumPlayers(n);
    setGameClient(() => buildLocalClient(n));
    setActivePlayer('0');
  }

  function handleQuit() {
    setGameClient(null);
    setNumPlayers(null);
    setMode(null);
    setDrawerOpen(false);
    setCardBrowserOpen(false);
  }

  // ── Online mode delegates entirely to Lobby ───────────────────────────────

  if (mode === 'online') {
    return <Lobby onBack={() => setMode(null)} />;
  }

  // ── Local mode: in-game ───────────────────────────────────────────────────

  if (mode === 'local' && GameClient && numPlayers !== null) {
    return (
      <div className="app">
        <div className="game-topbar">
          <div className="player-tabs">
            {Array.from({ length: numPlayers }, (_, i) => String(i)).map((pid) => (
              <button
                key={pid}
                className={`tab ${activePlayer === pid ? 'active' : ''}`}
                onClick={() => setActivePlayer(pid)}
              >
                Player {parseInt(pid) + 1}
              </button>
            ))}
          </div>
          <div className="topbar-right">
            <button
              className="btn btn-rules"
              onClick={() => setCardBrowserOpen(true)}
              title="Browse all cards"
            >
              🃏 Cards
            </button>
            <button
              className="btn btn-rules"
              onClick={() => setDrawerOpen(true)}
              title="How to play"
            >
              📖 Rules
            </button>
            <button
              className="btn btn-quit"
              onClick={handleQuit}
              title="Return to main menu"
            >
              ✕ Quit
            </button>
          </div>
        </div>

        <GameClient playerID={activePlayer} />

        <HowToPlayDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
        <CardBrowserDrawer open={cardBrowserOpen} onClose={() => setCardBrowserOpen(false)} />
      </div>
    );
  }

  // ── Local mode: player count picker ──────────────────────────────────────

  if (mode === 'local') {
    return <LocalPicker onStart={handleLocalStart} onBack={() => setMode(null)} />;
  }

  // ── Home screen ───────────────────────────────────────────────────────────

  return <HomeScreen onLocal={() => setMode('local')} onOnline={() => setMode('online')} />;
}
