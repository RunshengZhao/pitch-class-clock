# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pitch Class Clock is a music theory education tool that visualizes pitch class relationships on an interactive circular (clock) interface. Users select notes on the clock, and the app draws SVG connections between them, filters a sheet of 47 predefined scales/modes to show matches, and highlights the selected degrees within those scales.

Live site: https://runshengzhao.com/pitch-class-clock/

## Tech Stack

Pure vanilla web app — no frameworks, no build tools, no package manager, no dependencies.

- **HTML** (`index.html`) — all markup including 47 inline scale definitions (each a `.scale-row` with 12 `.degree` spans)
- **CSS** (`styles.css`) — custom styles; `modern-nomalize.css` is a vendored CSS reset (v3.0.1)
- **JavaScript** (`script.js`) — ~175 lines of procedural, event-driven code

## Development

No build step. Open `index.html` in a browser or serve locally:

```bash
python3 -m http.server 8000
```

No automated tests or linting are configured. Testing is manual in-browser.

## Architecture

**State:** Four globals manage app state — `notes` (DOM NodeList), `svg` (SVG element), `selectedIndices` (array of 0–11 clock positions), `selectedPitches` (array of pitch values).

**Flow:** User clicks a `.note` element → toggle in `selectedIndices`/`selectedPitches` → `drawConnections()` redraws SVG lines between selected notes in clockwise order → `updateHighlightAndFilter()` shows only `.scale-row` entries that contain all selected pitches and highlights matching `.degree` cells.

**Rotation:** Rotate buttons shift all `selectedIndices` by ±1 (mod 12), then rebuild visual state.

**Positioning:** `positionNotes()` calculates note positions using trigonometry (12 positions on a circle) and stores coordinates in `data-x`/`data-y` attributes for SVG line endpoints. Recalculates on window resize.

**Scale data:** Defined entirely in HTML as `.scale-row` divs inside `.scale-sheet`. Each row has a `.scale-label` and 12 `.degree` spans with `data-pitch` attributes. Empty spans indicate absent degrees.

## Conventions

- Vanilla ES6+ (const/let, arrow functions, template literals, array methods)
- 2-space indentation
- camelCase for variables and functions
- Git commit messages: lowercase, imperative mood, no conventional commit prefixes
- Accent color: `#c87c68`
- Responsive breakpoint: `@media (max-width: 700px)` for mobile overrides
