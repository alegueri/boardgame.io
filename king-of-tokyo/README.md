# 👑 King of Tokyo

A browser-based digital implementation of the **King of Tokyo** board game, built with [boardgame.io](https://boardgame.io/) and React + Vite + TypeScript.

Play **2–4 players** — pass-and-play on one device, or online with friends on separate devices. Roll dice Yahtzee-style, battle for Tokyo, collect Power Cards, and race to 20 VP — or be the last monster standing.

---

## Getting Started

### 1. Install Homebrew (macOS)

If you don't have Homebrew installed:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Follow the on-screen instructions. When it finishes, add Homebrew to your PATH if prompted.

### 2. Install Node.js

```bash
brew install node
```

Verify it worked:

```bash
node --version   # should print v20 or higher
npm --version
```

### 3. Clone the repo and install dependencies

```bash
git clone <your-repo-url>
cd king-of-tokyo
npm install
```

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. Choose **Play Locally** for pass-and-play on one device, or **Play Online** to connect with friends.

---

## Online multiplayer (local dev)

To use **Play Online**, run the game server in a second terminal alongside the Vite dev server:

```bash
npm run server:dev
```

This starts the boardgame.io server on port 8000. The frontend connects to it automatically.

**To play with someone on your local network:**
1. Find your machine's local IP (e.g. `192.168.1.42`)
2. Create a `.env.local` file:
   ```
   VITE_SERVER_URL=http://192.168.1.42:8000
   ALLOWED_ORIGINS=http://192.168.1.42:5173
   ```
3. Restart both servers — your friend opens `http://192.168.1.42:5173` and joins your game.

---

## Deploying online

The frontend and backend are deployed separately: **Vercel** for the frontend (static site) and **Render** for the backend (Node.js server with WebSocket support).

> **Deploy the backend first** — you need its URL before setting up the frontend.

### Backend → Render (free)

1. Push your repo to GitHub if you haven't already.
2. Go to [render.com](https://render.com) → **New → Web Service** → connect your GitHub repo.
3. Render will detect `render.yaml` automatically. Confirm these settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm run server`
4. Add an environment variable:
   - Key: `ALLOWED_ORIGINS`
   - Value: `https://your-app.vercel.app` *(use a placeholder for now, update after Vercel deploy)*
5. Click **Deploy**. Once it's live, copy the URL — it'll look like `https://king-of-tokyo.onrender.com`.

> **Free tier note:** Render spins the server down after 15 minutes of inactivity. The first person to use Play Online after a period of inactivity may wait ~30 seconds for it to wake up.

### Frontend → Vercel (free)

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your GitHub repo.
2. Vercel auto-detects Vite — the defaults are correct.
3. Before deploying, add an environment variable:
   - Key: `VITE_SERVER_URL`
   - Value: `https://king-of-tokyo.onrender.com` *(your Render URL)*
4. Click **Deploy**. Copy your Vercel URL (e.g. `https://king-of-tokyo.vercel.app`).

### Finish wiring them together

Go back to Render → your service → **Environment** → update `ALLOWED_ORIGINS` to your real Vercel URL → **Save**. Render redeploys automatically.

### Environment variables summary

| Service | Variable | Value |
|---|---|---|
| Render (backend) | `ALLOWED_ORIGINS` | `https://your-app.vercel.app` |
| Vercel (frontend) | `VITE_SERVER_URL` | `https://your-app.onrender.com` |

---

## Other commands

| Command | Description |
|---|---|
| `npm run dev` | Start frontend dev server with hot reload |
| `npm run server:dev` | Start game server with auto-restart on changes |
| `npm run server` | Start game server (production) |
| `npm run build` | Production build (output in `dist/`) |
| `npm run preview` | Preview the production build locally |

---

## How to play

- **Dice** — Roll 6 dice up to 3 times per turn. Click a die to keep it between rolls (Yahtzee-style).
- **🐾 Claws** — Deal damage to opponents. Outside Tokyo you hit the occupant; inside you hit everyone outside.
- **❤️ Hearts** — Heal 1 HP each (only works outside Tokyo).
- **⚡ Lightning** — Gain energy to spend on Power Cards.
- **①②③ Numbers** — Three-of-a-kind scores that number in VP; each extra matching die adds +1 VP.
- **Tokyo** — Enter the city when empty (+1 VP). Start each turn there for +2 VP. When attacked, choose to yield or take the hit.
- **Power Cards** — 64 unique cards available in a 3-card market. Buy on your turn after rolling, or pay 2⚡ to sweep and reveal 3 new cards.
- **Win** — First to 20 VP, or last monster standing.

Use the **📖 Rules** button during play for a quick reference, and **🃏 Cards** to browse all 64 Power Cards.

---

## Tech stack

- [boardgame.io](https://boardgame.io/) v0.50 — game state, moves, turn order, stages, multiplayer transport
- [React](https://react.dev/) + [Vite](https://vitejs.dev/) — UI and build tooling
- [TypeScript](https://www.typescriptlang.org/) — strict mode throughout
- Pass-and-play via boardgame.io's `Local()` transport
- Online multiplayer via boardgame.io's `SocketIO()` transport + Node.js server (`tsx`)
- Frontend hosted on [Vercel](https://vercel.com), backend hosted on [Render](https://render.com)
