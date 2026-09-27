# MiniGrid Racers for FigJam

MiniGrid Racers is an original, shared top-down racing game for 2–10 people on one FigJam board. The widget is the lobby and results card; each person drives their own car with the arrow keys in a local Figma game window. Every window sees every car. Live input travels through the small Node WebSocket relay, never through FigJam synced state.

The public widget uses three original tracks (Harbour Loop, Garden Circuit, Desert Ring), procedural canvas art, ten distinct car and helmet colors, an authored fixed-step simulation, and the existing relay and packet protocol. It does not download or bundle Micro Machines files, sprites, sounds, maps, palettes, or executable data. The older Scale Miniatures reverse-engineered engine remains in the source tree for reference under the repository's GPL-3.0-only license, but the FigJam build does not import it.

## Build

Requires Node.js 20 or newer.

```sh
npm ci
npm run build:figjam
npx vitest run test/app/minigrid.test.ts test/server/relay.socket.test.ts test/figjam/widget-lobby.test.ts
```

Import `figjam/manifest.json` as a development widget in Figma desktop. The distributable files are `figjam/manifest.json`, `figjam/code.js`, and `figjam/ui.html`. To let coworkers use it without importing it individually, publish the widget to Figma Community and add the published widget once to the shared FigJam board. See [FigJam setup](figjam/README.md).

## Relay

`server/relay.mjs` runs on a simple Node web service. The included `render.yaml` deploys it; the current widget connects to `wss://mm-0sdy.onrender.com/api/relay`. Health check: [mm-0sdy.onrender.com/api/relay](https://mm-0sdy.onrender.com/api/relay). Rooms and results are held in memory, so a service restart ends an active race. No database or accounts are used.

## License and asset history

Code is [GPL-3.0-only](LICENSE). The current MiniGrid tracks and canvas graphics were authored for this project. Earlier commits in this Git history included original Micro Machines files and derived previews; deleting them from the current tree does **not** remove them from Git history. Do not use earlier data-bearing commits as publication material. This change does not constitute legal or trademark clearance.

See the [privacy notice](community/PRIVACY.md) and [Community submission notes](community/REVIEW_READINESS.md).
