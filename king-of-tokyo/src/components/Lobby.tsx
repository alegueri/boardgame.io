import { useState, useEffect, useRef } from 'react';
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';
import { KingOfTokyo } from '../game/game';
import Board from './Board';
import { HowToPlayDrawer } from './HowToPlay';
import { CardBrowserDrawer } from './CardBrowser';

const SERVER_URL = (import.meta.env.VITE_SERVER_URL as string | undefined) ?? 'http://localhost:8000';
const GAME_NAME = 'king-of-tokyo';

type GameClientComponent = ReturnType<typeof Client>;

interface LobbyPlayer {
  id: number;
  name?: string;
}

type Phase =
  | { type: 'home' }
  | { type: 'setup' }
  | { type: 'joining' }
  | { type: 'waiting'; matchID: string; playerID: string; credentials: string; numPlayers: number }
  | { type: 'playing'; matchID: string; playerID: string; credentials: string };

interface Props {
  onBack: () => void;
}

function buildOnlineClient(numPlayers: number): GameClientComponent {
  return Client({
    game: KingOfTokyo,
    board: Board,
    numPlayers,
    multiplayer: SocketIO({ server: SERVER_URL }),
    debug: false,
  });
}

export default function Lobby({ onBack }: Props) {
  const [phase, setPhase] = useState<Phase>({ type: 'home' });
  const [playerName, setPlayerName] = useState('');
  const [numPlayers, setNumPlayers] = useState(2);
  const [matchCode, setMatchCode] = useState('');
  const [players, setPlayers] = useState<LobbyPlayer[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cardBrowserOpen, setCardBrowserOpen] = useState(false);
  const [GameClient, setGameClient] = useState<GameClientComponent | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Poll the server while in the waiting room
  useEffect(() => {
    if (phase.type !== 'waiting') return;
    const { matchID, playerID, credentials, numPlayers: n } = phase;

    async function poll() {
      try {
        const res = await fetch(`${SERVER_URL}/games/${GAME_NAME}/${matchID}`);
        if (!res.ok) return;
        const data = (await res.json()) as { players: LobbyPlayer[] };
        setPlayers(data.players);
        const allJoined = data.players.length > 0 && data.players.every((p) => p.name != null);
        if (allJoined) {
          if (pollRef.current) clearInterval(pollRef.current);
          setGameClient(() => buildOnlineClient(n));
          setPhase({ type: 'playing', matchID, playerID, credentials });
        }
      } catch {
        // ignore transient network errors
      }
    }

    poll();
    pollRef.current = setInterval(poll, 2000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [phase]);

  async function handleCreate() {
    if (!playerName.trim()) {
      setError('Enter your name first.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const createRes = await fetch(`${SERVER_URL}/games/${GAME_NAME}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numPlayers }),
      });
      if (!createRes.ok) throw new Error('Create failed');
      const { matchID } = (await createRes.json()) as { matchID: string };

      const joinRes = await fetch(`${SERVER_URL}/games/${GAME_NAME}/${matchID}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerID: 0, playerName: playerName.trim() }),
      });
      if (!joinRes.ok) throw new Error('Join failed');
      const { playerCredentials } = (await joinRes.json()) as { playerCredentials: string };

      setPhase({ type: 'waiting', matchID, playerID: '0', credentials: playerCredentials, numPlayers });
    } catch (e) {
      setError(`Could not reach the server (${SERVER_URL}). Check that VITE_SERVER_URL is set and Vercel was redeployed after adding it.`);
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    if (!playerName.trim()) {
      setError('Enter your name first.');
      return;
    }
    if (!matchCode.trim()) {
      setError('Enter a match code.');
      return;
    }
    setLoading(true);
    setError('');
    const code = matchCode.trim();
    try {
      const infoRes = await fetch(`${SERVER_URL}/games/${GAME_NAME}/${code}`);
      if (!infoRes.ok) {
        setError('Match not found. Check the code and try again.');
        return;
      }
      const { players: matchPlayers } = (await infoRes.json()) as { players: LobbyPlayer[] };

      const openSlot = matchPlayers.find((p) => p.name == null);
      if (!openSlot) {
        setError('This match is already full.');
        return;
      }

      const joinRes = await fetch(`${SERVER_URL}/games/${GAME_NAME}/${code}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerID: openSlot.id, playerName: playerName.trim() }),
      });
      if (!joinRes.ok) throw new Error('Join failed');
      const { playerCredentials } = (await joinRes.json()) as { playerCredentials: string };

      setPhase({
        type: 'waiting',
        matchID: code,
        playerID: String(openSlot.id),
        credentials: playerCredentials,
        numPlayers: matchPlayers.length,
      });
    } catch (e) {
      setError(`Could not reach the server (${SERVER_URL}). Check CORS/env vars, or open browser devtools for details.`);
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function handleQuit() {
    if (pollRef.current) clearInterval(pollRef.current);
    setGameClient(null);
    setPhase({ type: 'home' });
    setDrawerOpen(false);
    setCardBrowserOpen(false);
    onBack();
  }

  // ── Playing ───────────────────────────────────────────────────────────────────

  if (phase.type === 'playing' && GameClient) {
    return (
      <div className="app">
        <div className="game-topbar">
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
              title="Leave game"
            >
              ✕ Quit
            </button>
          </div>
        </div>

        <GameClient
          matchID={phase.matchID}
          playerID={phase.playerID}
          credentials={phase.credentials}
        />

        <HowToPlayDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
        <CardBrowserDrawer open={cardBrowserOpen} onClose={() => setCardBrowserOpen(false)} />
      </div>
    );
  }

  // ── Waiting room ──────────────────────────────────────────────────────────────

  if (phase.type === 'waiting') {
    return (
      <div className="lobby">
        <div className="lobby-card">
          <h2>Waiting for players…</h2>
          <div className="lobby-match-code-box">
            <span className="lobby-code-label">Match code</span>
            <span className="lobby-code">{phase.matchID}</span>
          </div>
          <p className="lobby-hint">Share this code with your friends so they can join.</p>
          <div className="lobby-player-list">
            {players.map((p) => (
              <div key={p.id} className={`lobby-player-slot ${p.name ? 'joined' : 'empty'}`}>
                {p.name ?? '— waiting —'}
              </div>
            ))}
          </div>
          <button
            className="btn"
            onClick={() => {
              if (pollRef.current) clearInterval(pollRef.current);
              setPhase({ type: 'home' });
              setPlayers([]);
            }}
          >
            ← Cancel
          </button>
        </div>
      </div>
    );
  }

  // ── Join ──────────────────────────────────────────────────────────────────────

  if (phase.type === 'joining') {
    return (
      <div className="lobby">
        <div className="lobby-card">
          <h2>Join a game</h2>
          {error && <p className="lobby-error">{error}</p>}
          <label className="lobby-label">Your name</label>
          <input
            className="lobby-input"
            placeholder="e.g. Alice"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
          />
          <label className="lobby-label">Match code</label>
          <input
            className="lobby-input"
            placeholder="e.g. ABCDEF"
            value={matchCode}
            onChange={(e) => setMatchCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            style={{ fontFamily: 'monospace' }}
          />
          <div className="lobby-actions">
            <button
              className="btn"
              onClick={() => {
                setPhase({ type: 'home' });
                setError('');
              }}
            >
              ← Back
            </button>
            <button className="btn btn-start" onClick={handleJoin} disabled={loading}>
              {loading ? 'Joining…' : 'Join Game'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Setup (host picks player count) ───────────────────────────────────────────

  if (phase.type === 'setup') {
    return (
      <div className="lobby">
        <div className="lobby-card">
          <h2>Create a game</h2>
          {error && <p className="lobby-error">{error}</p>}
          <label className="lobby-label">Your name</label>
          <input
            className="lobby-input"
            placeholder="e.g. Alice"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <label className="lobby-label">Number of players</label>
          <div className="picker-buttons">
            {([2, 3, 4] as const).map((n) => (
              <button
                key={n}
                className={`btn ${numPlayers === n ? 'selected' : ''}`}
                onClick={() => setNumPlayers(n)}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="lobby-actions">
            <button
              className="btn"
              onClick={() => {
                setPhase({ type: 'home' });
                setError('');
              }}
            >
              ← Back
            </button>
            <button className="btn btn-start" onClick={handleCreate} disabled={loading}>
              {loading ? 'Creating…' : 'Create Game'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Home ──────────────────────────────────────────────────────────────────────

  return (
    <div className="lobby">
      <div className="lobby-card">
        <h1 className="lobby-title">👑 King of Tokyo</h1>
        <p className="lobby-hint">Play online with friends. Each person opens this page on their own device.</p>
        <div className="lobby-actions">
          <button
            className="btn btn-start"
            onClick={() => {
              setPhase({ type: 'setup' });
              setError('');
            }}
          >
            Create Game
          </button>
          <button
            className="btn"
            onClick={() => {
              setPhase({ type: 'joining' });
              setError('');
            }}
          >
            Join Game
          </button>
        </div>
        <button className="btn btn-quit lobby-back-btn" onClick={onBack}>
          ← Back to menu
        </button>
      </div>
    </div>
  );
}
