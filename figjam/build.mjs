import { build } from 'esbuild';
import { readFile, writeFile } from 'node:fs/promises';

const relayUrl = process.env.SM_RELAY_URL ?? 'wss://mm-0sdy.onrender.com/api/relay';
if (!/^wss?:\/\/[a-z0-9.:-]+\/api\/relay$/i.test(relayUrl)) throw new Error(`Invalid relay URL: ${relayUrl}`);
const gameDataRoot = process.env.SM_GAME_DATA_ROOT
  ?? 'https://raw.githubusercontent.com/SirPrizeNZ/mm/main/';
if (gameDataRoot) {
  const url = new URL(gameDataRoot);
  const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  if ((url.protocol !== 'https:' && !(local && url.protocol === 'http:'))
      || !gameDataRoot.endsWith('/') || url.username || url.password || url.search || url.hash) {
    throw new Error(`Invalid game data root: ${gameDataRoot}`);
  }
}
await build({
  entryPoints: ['figjam/code.tsx'], outfile: 'figjam/code.js', bundle: true,
  platform: 'browser', target: 'es2022', format: 'iife',
  jsxFactory: 'figma.widget.h', jsxFragment: 'figma.widget.Fragment',
  define: { __RELAY_URL__: JSON.stringify(relayUrl) },
});

const game = await build({
  entryPoints: ['figjam/game-entry.ts'], bundle: true, write: false,
  platform: 'browser', target: 'es2022', format: 'iife',
  define: {
    'import.meta.env': JSON.stringify({ BASE_URL: '/' }),
    __GAME_DATA_ROOT__: JSON.stringify(gameDataRoot),
  },
});
const script = game.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
const shell = await readFile('figjam/game-shell.html', 'utf8');
if (!shell.includes('<!-- GAME_SCRIPT -->')) throw new Error('Missing game script marker');
await writeFile('figjam/ui.html', shell.replace('<!-- GAME_SCRIPT -->', `<script>${script}</script>`));
