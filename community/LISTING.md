# Scale Miniatures Race Lobby — Community submission

## Describe your resource

**Name:** Scale Miniatures Race Lobby

**Tagline:** Race together from a shared FigJam board

**Description:**

Start a shared miniature-car race from a FigJam widget. Each participant opens the game in FigJam, gets a separate car and camera view, and drives with the arrow keys. The first player to join hosts the race and starts it when everyone is ready. A five-second countdown starts all views together; standings return to the shared board when the race ends. Choose two to ten cars, with AI filling unused places.

The widget is a lobby and results card. Gameplay runs in each person's local Figma game modal using the existing TypeScript engine. A small WebSocket relay carries race inputs; car positions are not written through FigJam synced state.

**Category:** Games / Fun (choose the closest available category in the form)

**Support:** https://github.com/SirPrizeNZ/mm/issues

**Source and licence:** https://github.com/SirPrizeNZ/mm ; game code is GPL-3.0-only. Original game files have a separate notice at https://github.com/SirPrizeNZ/mm/blob/main/GAME_DATA_NOTICE.md and are not covered by the code licence.

## Images

- Icon: `images/icon-128x128.png` (128 × 128)
- Cover: `images/cover-1920x1080.png` (1920 × 1080)
- Additional image: `images/figjam-lobby-1920x1080.png` (1920 × 1080; actual Figma desktop board)

The cover uses a cropped screenshot of the current ten-car game view. The screenshots are visual examples; the local ten-client load check is described below.

## Data security disclosure

The widget reads each participant's Figma display name. The name, race inputs, and final scores go to `mm-0sdy.onrender.com`, a public Node WebSocket relay. Active rooms and recent results are held in memory; this project has no account database. The game downloads its original data files from the pinned `SirPrizeNZ/mm` GitHub commit using `raw.githubusercontent.com`. The manifest lists both network destinations. The shared FigJam widget stores the room identifier and final standings; it does not store live car positions.

## Reviewer notes / honest verification

- The widget was inserted on an actual FigJam board in Figma desktop. **Create race** and **Play in FigJam** worked, the local participant showed **ready**, and required game files downloaded automatically with no folder picker.
- The bundled UI was tested with four separate headless Chromium clients against the deployed Render relay. All four joined distinct slots and rendered about 60 FPS on one computer.
- The same bundle was tested with ten separate headless Chromium clients against the deployed relay. All ten joined distinct slots; frame measurements were 25–29 FPS per tab on one computer under ten-tab load.
- Automated tests: 215 passed, 35 skipped. Engine tests cover independent input and ten-car simulation.
- Four or ten separate human Figma accounts have **not** yet been tested together in FigJam. The headless runs verify the game bundle and relay, while the Figma desktop check verifies the widget entry point.
- Extended races support rounds 1–6 and 8. Round 7 is restricted to four cars by an existing terrain handler gap; the host is informed before starting.
- Relay rooms are in memory; a host restart ends an active race. The free Render instance can sleep when idle.

## Final publication steps

1. Enable two-factor authentication on the publishing Figma account. Figma's Publish widget wizard currently blocks this account until that is enabled.
2. In Figma desktop, select the development widget, open **Publish widget**, and enter the fields above. Add the icon and images, complete the data-security questions using the disclosure above, and review the final details.
3. Submit for Community review. After approval, replace the development widget on the shared FigJam board with the published listing once. Collaborators with board edit access then use that shared widget; they do not import code individually.

The development widget is already registered at `D:\micromachines\figjam\manifest.json` on this computer. The exact tested release files are in this repository's `figjam/` directory.
