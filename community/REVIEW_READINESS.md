# Figma Community readiness — 28 September 2026

## Status

**Do not submit yet.** The current widget is renamed MiniGrid Racers and uses three original tracks, procedural car and helmet art, and an authored fixed-step race simulation. The FigJam bundle no longer fetches original game files or map previews. The WebSocket relay and packet protocol are reused. A quick name search is not trademark clearance, and older Git commits remain accessible with original game data.

## Verified locally

- FigJam bundle and TypeScript typecheck compile.
- Deterministic simulation tests agree across 2, 4, 6, 8, and 10 players; a car can finish a lap with arrow inputs.
- Headless Edge runs reached the race with 2, 4, and 10 browser clients through a local relay, with unique names and about 30 FPS reported by the active tab in the 10-client run. Full runs at all three counts produced matching named standings, relay results, and FigJam result messages. This is not a performance guarantee on separate users' machines.
- The current manifest allows the Render relay only; map previews are created locally from the same original track code.
- The current development widget was re-rendered in Figma desktop on a FigJam board. Join Race and New Race each opened the original game iframe, showing the local user as admin and the original map preview. The earlier instant-closing modal was fixed by keeping the widget click handler alive with a pending promise.

## Before publication

1. Verify track selection, countdown, steering, finish, result return, and New Race from one board using at least two separate Figma accounts; repeat with four. Check close and rejoin, including admin departure. The single-account desktop entry works, and the multi-client browser flow works, but this combined test remains outstanding.
2. Capture the current board widget for the Community listing and ensure all previews match the submitted build. The cover is an illustration and must be labeled accordingly.
3. Confirm publishing-account two-factor authentication and complete Figma's current security and privacy questionnaire.
4. If the goal is to remove older original game data from public GitHub access too, clean the repository's Git history in a coordinated separate migration. Current-tree deletion alone does not erase prior commits.
5. Have the name, visuals, and GPL obligations reviewed for the intended public release; the new artwork direction lowers a specific asset dependency but is not legal clearance.

## Figma guidance

- [Publish widgets to the Figma Community](https://help.figma.com/hc/en-us/articles/4410337103639-Publish-widgets-to-the-Figma-Community)
- [Plugin and widget review guidelines](https://help.figma.com/hc/en-us/articles/360039958914-Plugin-and-widget-review-guidelines)
