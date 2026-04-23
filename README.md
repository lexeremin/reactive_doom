# reactive_doom

A compact Doom-like retro FPS built with React, Vite, TypeScript, and a custom canvas raycasting engine.

## What this project is
This project is a browser-based first person shooter prototype with a pixelated retro style.
It is intentionally lightweight and currently uses a custom raycasting renderer instead of a heavy 3D engine.

Current features:
- React + Vite + TypeScript setup
- custom canvas renderer
- first-person movement
- mouse look with pointer lock
- shooting
- simple enemies
- HUD with health, ammo, and kills
- retro pixel-style presentation

## Project status
This is an active prototype, not a finished game.

For the current state of the project, roadmap, todos, and handoff notes for future sessions/models, read:

- [`STATUS.md`](./STATUS.md)

That file should be treated as the main continuity document for this repo.

## Controls
- `WASD` move
- `Arrow Left / Arrow Right` turn
- click the canvas to lock the pointer
- move mouse to look around
- `Space` to shoot
- on-screen `SHOOT` button is also available

## Run locally
```bash
npm install
npm run dev
```

To expose on LAN:
```bash
npm run dev -- --host 0.0.0.0
```

## Build
```bash
npm run build
```

## Technical direction
The current direction is:
- keep the app lightweight
- keep the custom raycasting approach for now
- improve gameplay feel before expanding scope too far
- use `STATUS.md` as the source of truth for roadmap and session handoff

## Repository workflow
Preferred workflow:
- make focused improvements
- keep `STATUS.md` updated when priorities or project state change
- commit small meaningful chunks
- push regularly
