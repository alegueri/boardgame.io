# 👑 King of Tokyo

A browser-based digital implementation of the **King of Tokyo** board game, built with [boardgame.io](https://boardgame.io/) and React + Vite + TypeScript.

Play **2–4 players** on a single device (pass-and-play). Roll dice Yahtzee-style, battle for Tokyo, collect Power Cards, and race to 20 VP — or be the last monster standing.

---

## Getting Started

### 1. Install Homebrew (macOS)

If you don't have Homebrew installed:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Follow the on-screen instructions. When it finishes, add Homebrew to your PATH if prompted (the installer will print the exact commands for your machine).

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

Open [http://localhost:5173](http://localhost:5173) in your browser. Pick a player count and start playing.

---

## Other commands

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server with hot reload |
| `npm run build` | Production build (output in `dist/`) |
| `npm run preview` | Preview the production build locally |
| `npx tsc --noEmit` | Type-check without building |

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
- Pass-and-play via boardgame.io's `Local()` multiplayer transport (all clients share state in-browser)
