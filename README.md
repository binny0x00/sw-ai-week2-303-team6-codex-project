# Civilization Sim Demo

An observation-first 2D civilization simulation that starts with a primitive tribe and lets fire, stone tools, fishing, cooperation, and shelters emerge over time.

## Run

```bash
npm install
npm start
```

Then open http://localhost:4173.

## Verify

```bash
npm run verify
```

This assumes the local server is already running on port 4173.

## Structure

- `index.html`: top controls, canvas, side panel, and start overlay
- `styles.css`: warm diorama-focused UI styling
- `app.js`: world generation, villager AI, disasters, rendering, and browser hooks
- `server.mjs`: zero-dependency static server
- `verify.mjs`: Playwright smoke test that captures screenshots and state JSON
- `progress.md`: implementation notes and follow-up ideas

## Core Systems

- Villagers manage hunger, health, warmth, and energy while choosing work automatically.
- The tribe unlocks new behaviors from accumulated world exposure instead of research buttons.
- Disasters affect movement, food regeneration, health, temperature, and map hazards.
- `window.render_game_to_text()` exposes simulation state for automation.
- `window.advanceTime(ms)` steps the sim deterministically for testing.

## Follow-Up Ideas

- Add births or migration to make population recover dynamically.
- Layer in season cycles and terrain-specific migration.
- Add a mini timeline or replay scrubber for key civilization milestones.
