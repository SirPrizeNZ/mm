# MiniGrid Racers FigJam widget

One widget on a shared FigJam board owns the lobby and final standings. **Create Race** or **New Race** opens a fresh local game window for the person who clicks it; the first person to connect is admin. Everyone else clicks **Join Race** on the same widget. The admin chooses one of three original tracks and 1–10 laps, then can start with 2–10 people. A five-second countdown follows the readiness handshake. Each person sees the full track and all named cars; arrow keys control only their own car. Results return to the shared widget. A new race makes a new lobby.

The game renders in each user's local Figma widget window. FigJam synced state carries only session, names, settings, and final standings. The existing Render WebSocket relay carries input bytes. No original Micro Machines assets or data are loaded by this widget; track previews are drawn by the same original canvas code as the game.

## Build and local verification

Run `npm ci && npm run build:figjam`. Commit the generated `code.js` and `ui.html` with source changes. `node test/manual/minigrid-browser-smoke.mjs 2` runs two isolated headless Edge clients against a local relay; repeat with `4` and `10` for higher counts. The test captures screenshots under `figjam-evidence/`. The automated simulation test covers input independence and deterministic updates for 2, 4, 6, 8, and 10 cars.

The default manifest allows only the Render relay. Render uses `npm install`, `node server/relay.mjs`, host port `PORT`, and `/api/relay` as its health check. The free instance can sleep or restart, ending active in-memory races.

## Sharing

A development widget is visible only to its developer. To share with coworkers, publish this widget through Figma Community and add the published version once to the board. Collaborators with board edit access can then use it without importing files. Before submitting, verify the current widget inside Figma desktop with separate Figma accounts, capture an accurate board screenshot, and complete the privacy and review checklist in [`community/REVIEW_READINESS.md`](../community/REVIEW_READINESS.md).
