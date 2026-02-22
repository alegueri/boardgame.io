import { Server } from 'boardgame.io/server';
import { KingOfTokyo } from './src/game/game';

const PORT = parseInt(process.env.PORT ?? '8000');

// Allow any string origins from env, or allow all if unset (dev-friendly default)
const originsEnv = process.env.ALLOWED_ORIGINS;
const origins: (string | RegExp)[] | true = originsEnv
  ? originsEnv.split(',').map((s) => s.trim())
  : true;

const server = Server({
  games: [KingOfTokyo],
  origins,
});

server.run(PORT, () => {
  console.log(`King of Tokyo server listening on port ${PORT}`);
});
