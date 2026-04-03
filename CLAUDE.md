# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pitch Class Clock is a music theory education tool that visualizes pitch class relationships on an interactive circular (clock) interface. Users select notes on the clock, and the app draws SVG connections between them, filters scales to show matches, and highlights the selected degrees within those scales.

Live site: https://runshengzhao.com/pitch-class-clock/

## Tech Stack

Pure vanilla web app — no frameworks, no build tools, no package manager, no dependencies.

- **HTML** (`index.html`) — shell markup only; the clock notes and scale sheet are injected at runtime
- **CSS** (`styles.css`) — custom styles; `modern-nomalize.css` is a vendored CSS reset (v3.0.1)
- **JavaScript** (`data.js`) — declares `notesData` (12 clock positions) and `scalesData` (scale definitions) as globals
- **JavaScript** (`script.js`) — ~900 lines of procedural, event-driven code; loaded after `data.js`
- **Node script** (`scripts/inject-version.js`) — runs `git describe --tags --always` and writes the result into the `#app-version` span in `index.html`

## Development

No build step. Open `index.html` in a browser or serve locally:

```bash
python3 -m http.server 8000
```

To update the version string in `index.html` after tagging:

```bash
node scripts/inject-version.js
```

No automated tests or linting are configured. Testing is manual in-browser.

## Architecture

**State:** Six globals manage app state — `notes` (DOM NodeList), `svg` (SVG element), `selectedIndices` (array of 0–11 clock positions), `selectedPitches` (array of pitch values), `anchorIndex` (the rotation pivot note), `scaleGroupState` (Map of group key → expanded boolean).

**Data:** `data.js` defines `notesData` (array of 12 `{pitch, label}` objects) and `scalesData` (array of scale objects with `className`, `label`, and `degrees` — a 12-element array where empty strings indicate absent degrees). `validateData()` checks these at startup.

**Initialization:** `init()` builds clock note elements via `buildNotesMarkup()` and injects the full scale sheet HTML via `buildScaleSheetMarkup()`. Scale rows are grouped into collapsible `<div class="scale-group">` elements driven by `scaleGroupState`.

**Flow:** User clicks a `.note` → toggle in `selectedIndices`/`selectedPitches` → `drawConnections()` redraws SVG lines → `updateHighlightAndFilter()` shows only scale groups/rows containing all selected pitches and highlights matching `.degree` cells.

**Note input:** The text field (`#note-input`) accepts space/comma/dash-separated note names (e.g. `C E G B`). `calcDegreesFromInput()` parses them, treats the first note as root (pitch 0), computes offsets, and calls `updateSelectionFromIndices()`.

**Rotation:** Rotate buttons call `animateRotation()`, which visually rotates the SVG connection group, then shifts `selectedIndices` by the step amount (mod 12). The "Rotate as inversions" checkbox enables `getRotateStep()` to compute the interval to the next note rather than always stepping by 1.

**Positioning:** `positionNotes()` calculates note positions using trigonometry (12 positions on a circle) and stores coordinates in `data-x`/`data-y` attributes for SVG line endpoints. Recalculates on window resize.

**Scale grouping:** Scales whose labels match the pattern `N of <GroupName>:` are grouped under a collapsible mode-family header. All other scales are grouped by note count (pentatonic, hexatonic, etc.) under note-count headers. An "All Scales" header toggles all groups at once.

## Adding or Editing Scales

Edit `data.js`. Each entry in `scalesData` needs:
- `className` — lowercase CSS class (used for styling hooks)
- `label` — display name; use `"N of GroupName: ModeName"` format to auto-group into a collapsible family
- `degrees` — 12-element array; non-empty strings at the pitch positions that belong to the scale

## Conventions

- Vanilla ES6+ (const/let, arrow functions, template literals, array methods)
- 2-space indentation
- camelCase for variables and functions
- Git commit messages: lowercase, imperative mood, no conventional commit prefixes
- Accent color: `#c87c68`
- Responsive breakpoint: `@media (max-width: 700px)` for mobile overrides
