# Original Micro Machines game files

`MicroMac/` contains original Micro Machines game files. They are separate from the
TypeScript reimplementation and are **not** licensed under this repository's
GPL-3.0-only code licence. Permission for public use of these files in this
experimental project has been confirmed. No general reuse licence is asserted.

The FigJam widget reads these files directly from GitHub's raw file host. It
does not embed them in the widget bundle or synchronise them through FigJam.
`manifest.json` lists their sizes and SHA-256 hashes.

`figjam/map-previews/` contains small images generated from those original map,
tile, and palette files. These previews are also original-game-derived data,
separate from the GPL TypeScript code. The relay serves them as individual PNG
files for the FigJam track selector; they are not embedded in `figjam/ui.html`.
