# Figma Community review readiness — 28 September 2026

## Assessment

**Prepare, but do not submit yet.** The FigJam lobby is compact and understandable, and the listing has an icon, screenshots, support URL, accurate network destinations, and a public privacy notice. The main review risks are rights scope, unverified current widget behaviour with separate Figma users, and one cropped cover image.

## Name and provenance

`MicroMachine` differs from `Micro Machines` by only a space and the plural ending. The screenshots and downloaded files come from the original game. A different title alone would not resolve rights in the original files or artwork. Keep the origin and the separate game-data licence notice visible. Before a public submission, confirm that the rights-holder permission covers **public Figma Community distribution**, the original game files, derived track previews/screenshots, and the proposed product name. Do not claim an official affiliation unless that permission includes one.

If the permission covers game data but not the mark, a distinct working title such as **Pocket Circuit Racing** is clearer for the listing and widget UI. That would require coordinated changes to the manifest, widget, game modal, listing, and images. Do not rename solely to disguise the original content.

## UI and listing fixes before submission

1. Reopen the newly built widget in Figma desktop. Verify **Create Race** and **New Race** immediately open the creator's lobby and show that person as admin. The latest flow passed a widget regression test, but the desktop visual check is still outstanding.
2. Run a race from one shared board with at least two separate Figma accounts, then four. Check each person's keyboard controls, map selection, countdown, finish, return of results, and close/rejoin. The earlier local headless multi-client tests do not substitute for this.
3. Repair the known quick close/rejoin case that can leave admin vacant before the race starts.
4. Replace `images/cover-1920x1080.png`: the ten-car crop cuts off the bottom car/name labels. Use a clean capture of the actual widget and game; avoid a mockup that looks like live gameplay if it is not.
5. Keep the listing instructions short: creator becomes admin; others click Join Race; desktop keyboard required; two players minimum. Update reviewer notes to match the exact build submitted.
6. Enable two-factor authentication on the publisher's Figma account if the publication wizard still requires it.

## Data disclosure

The manifest declares the Render and pinned GitHub hosts. The public [privacy notice](PRIVACY.md) describes Figma display names, race inputs/results, room retention, and sharing. Link it in the listing and answer the security questionnaire consistently. Do not describe board data as ephemeral: FigJam keeps lobby names and results until a new race or widget removal.

## Figma guidance checked

- [Publish widgets to the Figma Community](https://help.figma.com/hc/en-us/articles/4410337103639-Publish-widgets-to-the-Figma-Community): desktop publishing, listing fields, icon/cover, review, two-factor authentication.
- [Plugin and widget review guidelines](https://help.figma.com/hc/en-us/articles/360039958914-Plugin-and-widget-review-guidelines): functional completeness, accurate previews, privacy, external connections, IP rights, and suitability for a public Community audience. Figma says Community is not intended for tools meant only for a small internal group.
- [Create private widgets for an organization](https://help.figma.com/hc/en-us/articles/5736579713943-Create-private-widgets-for-an-organization): organization-only publishing requires an Organization or Enterprise plan.
