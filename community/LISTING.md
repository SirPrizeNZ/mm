# MiniGrid Racers — Community submission

## Describe your resource

**Name:** MiniGrid Racers

**Tagline:** Race together from a shared FigJam board

**Description:**

Start a shared miniature-car race from a FigJam widget. Create Race or New Race opens the lobby and makes the creator admin. Other people on the board click Join Race. Each participant gets a separate car and camera view in a local Figma window and drives with the arrow keys on a desktop keyboard. The admin picks a track from 24 map previews, sets the laps, and starts once at least two players have joined and loaded. A five-second countdown starts all views together; standings return to the shared board when the race ends. Up to ten people can race; AI fills unused places in the original four-car grid.

The widget is a lobby and results card. Gameplay runs in each person's local Figma game modal using the existing TypeScript engine. A small WebSocket relay carries race inputs; car positions are not written through FigJam synced state.

**Category:** Games / Fun (choose the closest available category in the form)

**Support:** https://github.com/SirPrizeNZ/mm/issues

**Source and licence:** https://github.com/SirPrizeNZ/mm ; game code is GPL-3.0-only. Original game files have a separate notice at https://github.com/SirPrizeNZ/mm/blob/main/GAME_DATA_NOTICE.md and are not covered by the code licence.

**Privacy policy:** https://github.com/SirPrizeNZ/mm/blob/main/community/PRIVACY.md

**Rights disclosure:** The gameplay and images use data from the original Micro Machines game. The original game files and derived artwork should be presented to Figma as such. MiniGrid Racers is a separate working title, not a claim of official affiliation.

## Images

- Icon: `images/icon-128x128.png` (128 × 128)
- Cover: `images/cover-minigrid-racers.png` (1672 × 941; illustrative title graphic)
- Test capture: `images/ten-client-live-relay.png` (960 × 600; actual ten-client live Render-relay run)
- Lobby capture: `images/minigrid-lobby-with-map.png` (actual new bundled UI with two players and a selected map)

The cover is an AI-generated illustration, not a gameplay screenshot. The other listed images are actual test captures. `images/figjam-lobby-1920x1080.png` and `images/simple-lobby-with-map.png` are retained only as old-brand evidence and must not be submitted with this listing. Capture the renamed widget in Figma desktop before submission.

## Data security disclosure

The widget reads each participant's Figma display name. The name, race inputs, and final scores go to `mm-0sdy.onrender.com`, a public Node WebSocket relay. The same host serves track-preview PNGs. Active rooms and recent results are held in memory; this project has no account database. The game downloads its original data files from the pinned `SirPrizeNZ/mm` GitHub commit using `raw.githubusercontent.com`. The manifest lists both network destinations. The shared FigJam widget stores the room identifier, lobby names, selected track and laps, and final standings; it does not store live car positions. See the [public privacy notice](PRIVACY.md) for retention and sharing details.

## Reviewer notes / honest verification

- The widget was inserted on an actual FigJam board in Figma desktop. The prior **Create race** and **Join race** flow worked, the local participant and selected map preview appeared, and required game files downloaded automatically with no folder picker. The newer automatic-admin Create/New Race flow passed a widget regression test but has not yet been visually rechecked in Figma desktop.
- The bundled UI was tested with four separate headless Chromium clients against the deployed Render relay. All four joined distinct slots and rendered on one computer; headless frame counts do not predict performance on separate users' devices.
- The same bundle was tested twice with ten separate headless Chromium clients against the deployed relay. All ten joined distinct slots and every canvas changed during the race. Headless frame counts varied substantially between runs, so these numbers are not a reliable FPS prediction for ten separate users.
- The renamed MiniGrid Racers bundle joined two separate headless Chromium clients against the deployed relay. Both showed Sam as admin, saw the selected track/laps, and loaded the 256-pixel map preview.
- On 28 September 2026, the full suite passed: 217 tests passed and 35 were skipped. Tests cover independent input, ten-car simulation, and the automatic-admin widget flow. Run the suite again for the final submitted build.
- Four or ten separate human Figma accounts have **not** yet been tested together in FigJam. The headless runs verify the game bundle and relay, while the Figma desktop check verifies the widget entry point.
- Extended races support rounds 1–6 and 8. Round 7 is restricted to four cars by an existing terrain handler gap; the host is informed before starting.
- Relay rooms are in memory; a host restart ends an active race. The free Render instance can sleep when idle.

## Final publication steps

1. Enable two-factor authentication on the publishing Figma account. Figma's Publish widget wizard currently blocks this account until that is enabled.
2. Confirm that the rights-holder permission covers public Figma Community distribution of the original files, derived images, and intended name. Preserve a copy of those terms for the review process.
3. Recheck Create/New Race in Figma desktop and run a race with separate human accounts. Capture the renamed board widget for an accurate listing preview.
4. In Figma desktop, select the development widget, open **Publish widget**, and enter the fields above. Add the icon and images, complete the data-security questions using the disclosure above, and review the final details.
5. Submit for Community review. After approval, replace the development widget on the shared FigJam board with the published listing once. Collaborators with board edit access then use that shared widget; they do not import code individually.

The development widget is already registered at `D:\micromachines\figjam\manifest.json` on this computer. The exact tested release files are in this repository's `figjam/` directory.
