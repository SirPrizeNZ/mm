# MiniGrid Racers widget privacy notice

Last updated: 28 September 2026

MiniGrid Racers is a multiplayer racing widget for FigJam. This notice covers the widget and its game relay at `mm-0sdy.onrender.com`.

## Information used

- The widget reads your Figma display name when you join. It does not request your email address, Figma user ID, password, or access to other board content.
- The shared FigJam widget stores the race session identifier, lobby display names, selected track and lap count, and race standings. People who can view the board can see this information.
- Your game window sends your display name, gameplay input packets, and final standings through the WebSocket relay so everyone in the same race can play together. The relay sends those packets to the other players in your room.
- The game draws its original tracks, map previews, and cars locally. The Render relay receives ordinary network requests and its infrastructure may process connection information under its own policies.

## Storage and retention

The relay keeps active rooms and recent results in server memory only. It has no account or race database. An idle room becomes eligible for removal after 20 minutes without activity and is removed on the next cleanup pass; a relay restart also clears it. A room that remains active may persist longer. The relay application does not store or log players' IP addresses, though hosting and network providers may have operational logs outside this application.

FigJam stores the shared lobby and result data on the board until someone starts a new race or removes the widget, subject to Figma's own retention practices. Someone who knows a session identifier can request its recent result from the relay while that result remains in memory.

## Purpose and sharing

The information above is used only to connect players, run the race, and display results. It is shared with other participants in the race and with the infrastructure providers needed to operate the widget: Figma and Render. This project has no ads, analytics SDK, accounts, or data sales.

## Your choices and contact

Do not join a race if you do not want your Figma display name and result visible to other participants and on the board. A board editor can start a new race or remove the widget to clear the displayed lobby and standings. For a question or data request, open an issue at [SirPrizeNZ/mm](https://github.com/SirPrizeNZ/mm/issues). Do not include sensitive information in a public issue.
