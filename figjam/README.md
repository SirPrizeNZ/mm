# FigJam multiplayer race

The FigJam widget is the shared lobby and results card. Clicking **Play in FigJam** opens the existing Scale Miniatures game in a local Figma modal for that person. Each client runs the deterministic TypeScript engine and follows its own car. The Node WebSocket relay forwards input packets; FigJam synced state holds only the session and final standings. Each person's FigJam name appears beside their boat and in the results.

## Playing

1. Insert one **Scale Miniatures Race Lobby** widget on a FigJam board and click **Create race**.
2. Each person on the board clicks **Play in FigJam**. The first person to join is the host and sees **Start the race**.
3. The host can start whenever at least two people have joined and all current players show **ready**. There is no need to fill all ten slots. The host chooses the total number of cars; unclaimed cars are driven by the existing AI. Once Start is pressed, that race is closed to late joiners.
4. After all clients confirm identical game files, everyone sees a five-second countdown. Arrow keys control only the local car: up accelerates, down brakes/reverses, left and right steer. Each view follows its own car; other cars remain in the same simulated world and appear when inside that view.
5. At the finish, every client gets the standings. Each player's modal sends the named result back to the shared FigJam widget. The relay also exposes the most recent result at `/api/relay/result?session=SESSION`.

Cars 5–10 use separate extended car records and extra starting rows behind the original four. Their car sprites, helmet details and HUD icons use distinct orange, cyan, violet, white/charcoal, black and grey tints. The original four colours and four-car game path remain unchanged. Extended races support rounds 1–6 and 8. Round 7 is limited to four cars because the current engine lacks its terrain handler `66b2`; the host gets a message before the race starts if that combination is selected.

## Build and deployment

The repository includes the built `figjam/code.js` and `figjam/ui.html` alongside `figjam/manifest.json`, so the GitHub checkout has a complete development widget. After editing source, run `npm ci && npm run build:figjam` and commit both generated files. The bundle contains the GPL TypeScript reimplementation, not the original game files. Each client fetches those proprietary files separately from the pinned `MicroMac/` GitHub commit. See [GAME_DATA_NOTICE.md](../GAME_DATA_NOTICE.md).

The default widget points to `wss://mm-0sdy.onrender.com/api/relay`. The relay runs on Render as a Node Web Service from this repository's `main` branch: blank root directory, `npm install`, `node server/relay.mjs`, health check `/api/relay`, free instance, and auto-deploy on commit. `PORT` is honored and the server binds `0.0.0.0`. There is no database or account service. Rooms are in memory, so a Render restart ends an active race. The service's free tier can sleep when idle; check [relay health](https://mm-0sdy.onrender.com/api/relay) before a session.

To test locally, set `$env:SM_RELAY_URL='ws://localhost:8788/api/relay'`, run `npm run build:figjam`, and run `npm run relay`. Restore the default URL and rebuild before committing. `SM_GAME_DATA_ROOT` can point to a different HTTPS asset directory; an empty value enables the local folder picker.

## Share it with everyone

The development widget is only for the developer's own Figma desktop. It is not the way to share the game with coworkers. Publish this widget once from Figma desktop, then insert that published widget into the shared FigJam board. It becomes a shared board object: people with edit access can use the same race lobby there; they do not import files or install the development widget on their computers. They each click **Play in FigJam** to open their own local game view, while the relay keeps the race in sync.

Before submitting the first Community listing, build the committed bundle with `npm ci && npm run build:figjam`, open or create a FigJam file in Figma desktop, go to **Widgets → Manage widgets**, and choose **Publish** for Scale Miniatures. Use the current widget id when publishing an update; if Figma asks to assign an id for a first publish, keep the Figma-assigned id in `manifest.json` and rebuild. The manifest restricts requests to the Render relay and the pinned GitHub game-data path. In the listing, describe the name/score data sent through the relay, link this repository's `GAME_DATA_NOTICE.md` for asset provenance, and use the GitHub Issues page as the support contact. Submit it as a free Community widget. Figma reviews a first Community release; its current guidance says this usually takes 5–10 business days and may take up to two weeks. Organization-private publishing requires an Organization or Enterprise plan, so Community is the broad-sharing path.

When approved, open the listing, add the published widget to the actual shared FigJam board once, and save the board. Collaborators must have edit access to interact with widgets. They can then click the widget in that board; they do not need the ZIP or a separate widget import. If the board currently contains a development widget, remove that instance and add the Community-published one.

### Listing disclosure draft

Scale Miniatures displays each player's Figma profile name and race results. The widget sends the display name and race input packets to the public Render relay, which holds active rooms and recent results in memory; it has no accounts or database. The widget downloads the game files from the pinned GitHub repository. Network access is restricted in the manifest to those services. The relay is a shared experimental service and its free Render instance may sleep while idle.

The game code in this repository is GPL-3.0-only. The original Micro Machines game files are separate, are not covered by that license, and are served separately from the TypeScript bundle. The repository owner has stated permission for their public use in this experiment; see [GAME_DATA_NOTICE.md](../GAME_DATA_NOTICE.md).

## Verification

The TypeScript build, FigJam bundle build, and 215 automated tests pass locally. Deterministic engine tests cover 5, 6, 8, and 10 independently driven cars. Twenty-one supported tracks advanced a ten-car simulation for 2,000 steps without a runtime error; all 24 tracks placed the extra grid rows on drivable cells. Separate headless Chromium clients joined the bundled FigJam UI at 5, 6, 8, and 10 players through a local relay, displayed the countdown, rendered changing views, and reported no page errors. A ten-client forced-finish test sent names and results through the relay and the widget message bridge. The ten-tab test measured roughly 50 FPS per tab on one computer; this is a local load result, not a measured Auckland-to-Render latency.

On 26 September 2026, the current release widget was inserted on an actual FigJam board in Figma desktop. Its shared lobby created a race, opened the game in the FigJam modal, connected to the live Render relay, and loaded the pinned game files automatically; the local participant reached **ready**. The current bundle also joined four separate headless Chromium clients to the deployed relay with four distinct names and about 60 FPS per tab. A ten-client run joined ten distinct names and rendered 25–29 FPS per tab under simultaneous load on one computer. These headless runs verify the bundle and deployed relay, while the Figma desktop run verifies the widget entry point. A published widget used by four or ten separate human FigJam accounts has not yet been tested.

Prepared Community listing text, disclosure, and images are in [`community/`](../community/LISTING.md). The Figma desktop publishing wizard currently requires the publishing account to enable two-factor authentication before submission.
