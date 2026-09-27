# MiniGrid Racers — proposed Community listing

**Name:** MiniGrid Racers

**Tagline:** Race together from a shared FigJam board

**Description:** Add MiniGrid Racers to a FigJam board, create a race, and invite 2–10 people on that board to join. Each racer drives a differently colored car with the arrow keys in their own local Figma window while everyone sees the same track and named cars. The admin chooses one of three original tracks and a lap count. A five-second countdown starts the race, and the results appear on the shared widget. A new race resets the lobby.

The widget carries the lobby and standings. A Node WebSocket relay forwards small input packets. Live car positions are not stored in FigJam. All current track and car artwork is original, drawn locally by the widget; the game does not fetch or use files from the original Micro Machines game.

**Support:** https://github.com/SirPrizeNZ/mm/issues

**Source and licence:** https://github.com/SirPrizeNZ/mm — GPL-3.0-only code. Earlier repository commits contain original game data; the current FigJam bundle and current tree do not load those files.

**Privacy policy:** https://github.com/SirPrizeNZ/mm/blob/main/community/PRIVACY.md

## Images to submit

- `images/icon-128x128.png` — icon.
- `images/cover-minigrid-racers.png` — illustrative cover, not a gameplay screenshot.
- `images/minigrid-lobby-original.png` — actual local browser lobby capture.
- `images/minigrid-race-10.png` — actual ten-client local relay capture; one player's view.

Capture the current widget on an actual FigJam board before submission. Do not submit screenshots of the earlier game-data build.

## Data security disclosure

The widget reads each participant's Figma display name. It shares the session ID, lobby names, selected track, lap count, and final standings through FigJam synced state. The local game windows send display names, arrow-key input packets, and final scores through `mm-0sdy.onrender.com`, which holds rooms and recent results in memory. No account database, analytics SDK, or ad tracking is used. See the [privacy notice](PRIVACY.md).

## Reviewer notes

The original MiniGrid simulation and build passed deterministic tests for 2, 4, 6, 8, and 10 players. Separate local headless Edge clients joined the bundled UI through a local relay at 2, 4, and 10 players, saw unique names and cars, and rendered the race. Full browser races at 2, 4, and 10 clients reached named standings, matching relay results and FigJam result messages. The current development widget was also opened on a real FigJam board in Figma desktop: Join Race and New Race each opened the original game lobby with the local user's name and track preview. A start-to-finish run with separate human Figma accounts on the same board remains outstanding. The free Render relay may sleep or restart between sessions.
