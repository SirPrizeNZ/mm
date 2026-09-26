# Scale Miniatures FigJam Racing

The FigJam widget lets people on one board join a shared Micro Machines style race. Each player opens their own game view, drives their own car with the arrow keys, and sees the same race simulation. Races support up to ten players.

## Use it in FigJam

The checked-in widget bundle is in `figjam/`. A local development widget is only visible to its developer. To share it with coworkers without asking them to install development files, publish the widget through Figma's desktop app, then add the published widget once to the shared FigJam board. People need edit access to interact with board widgets. See [the FigJam instructions](figjam/README.md).

## Multiplayer relay

`server/relay.mjs` is a small Node WebSocket relay with no database or account system. `render.yaml` describes the free Render web service. The current widget uses `wss://mm-0sdy.onrender.com/api/relay`. Check that endpoint's health before a race. Rooms and results are held in memory and disappear after a service restart.

## Build the FigJam widget

Requires Node.js 20 or newer.

```sh
npm ci
npm run build:figjam
```

The distributable widget files are `figjam/manifest.json`, `figjam/code.js`, and `figjam/ui.html`. The UI downloads original game data separately from the pinned GitHub commit listed in its bundle; that data is not embedded in the widget.

## Game data and license

The TypeScript implementation is distributed under [GPL-3.0-only](LICENSE). `MicroMac/` contains original Micro Machines game files, which are separate from the GPL code and are not granted a general reuse license. Permission for public use of the data in this experiment has been confirmed. The widget downloads the files from this repository and checks the hashes in [`manifest.json`](manifest.json). See [the data notice](GAME_DATA_NOTICE.md).

This is an unofficial fan project and is not endorsed by the game's rights holders.
