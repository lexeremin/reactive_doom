# STATUS.md

## Project
**reactive_doom**

A React + Vite browser game aiming to become a compact Doom-like retro FPS with a pixelated presentation.
Current version is a playable prototype built with a custom raycasting renderer, randomized pickups, fixed early levels, and later-level enemy randomization.

## Current state
The project is working as a playable prototype, not a finished game.
It currently includes:
- React + Vite + TypeScript project setup
- custom canvas-based raycasting engine
- first-person movement
- mouse look with pointer lock
- left-click shooting
- simple enemy AI with stronger balance tuning
- enemy sprite polish and hit feedback
- HUD with health, ammo, key, kills, level info
- retro pixel-style visual treatment
- pause/menu/death/win screens
- sound effects
- level progression across fixed early levels
- randomized pickups on maps
- randomized enemy spawns from level 2 onward

## Controls
- `WASD` move
- `Arrow Left / Arrow Right` turn
- click canvas to lock pointer
- mouse movement to look around
- left click to shoot
- `E` use exit door
- `P` or `Esc` pause
- `Enter` start/restart from menu-style screens

## Architecture notes
Main files:
- `src/App.tsx` — app shell and overlay/menu UI
- `src/game/Game.ts` — main game orchestration, rendering, combat, HUD drawing, progression
- `src/game/raycaster.ts` — wall raycasting logic
- `src/game/player.ts` — player movement, turning, health, key state
- `src/game/enemy.ts` — enemy state, AI, hit flash
- `src/game/weapon.ts` — weapon and ammo behavior
- `src/game/pickup.ts` — pickups
- `src/game/map.ts` — fixed level definitions and map creation helpers
- `src/game/sound.ts` — synthesized sound effects
- `src/game/engine.ts` — canvas engine loop / resize handling

## Known limitations
This is still not a full Doom-quality implementation.
Current limitations include:
- only the first 2 levels are structured manually
- no procedural level generation yet
- level cap is not yet expanded to 100
- no save/load system
- no sensitivity settings
- no minimap/debug view
- no mobile controls
- generated balance beyond early levels is still basic

## Current roadmap
### Already done
- textured walls
- improved enemy sprites and stronger enemies
- pickups for health/ammo/key
- pause/menu/restart flow
- sound effects
- level progression with exit doors
- random pickups per map
- random enemy spawns from level 2 onward
- first-person weapon sprite + HUD cleanup

### Next major initiative
**Procedural progression from level 3 to level 100**

This should be done in a few safe steps instead of one big jump.

## Procedural generation TODO breakdown
- [ ] step 1: refactor map system so fixed levels 1 and 2 can coexist cleanly with generated levels
- [ ] step 2: add a simple procedural map generator for level 3+ that creates walkable room/corridor layouts
- [ ] step 3: guarantee generated maps always have a valid path from spawn to key to exit
- [ ] step 4: place one random health pickup, one random ammo pickup, and one random key pickup on generated maps
- [ ] step 5: spawn enemies randomly on generated maps with safe spawn distance from player
- [ ] step 6: add difficulty scaling for generated levels from 3 to 100
- [ ] step 7: set max level to 100 and make exit progression continue through generated maps
- [ ] step 8: test for broken maps, softlocks, unreachable exits, and impossible starts

## Working TODO
- [ ] procedural level generation from level 3 onward
- [ ] guaranteed valid route from spawn to key to exit on generated maps
- [ ] difficulty scaling through level 100
- [ ] add minimap debug toggle
- [ ] add sensitivity setting
- [ ] add mobile movement controls
- [ ] consider third enemy behavior variant or ranged attacks later

## Session handoff notes
If another AI session or model picks this up, the current biggest task is:
**implement procedural map generation for levels 3 through 100 in small reliable steps, prioritizing valid playable maps over fancy generation.**

Recommended approach:
- keep levels 1 and 2 fixed
- start procedural generation at level 3
- prefer simple reliable rectangular rooms/corridors first
- validate map playability before adding extra complexity
- avoid overengineering or introducing a heavy game engine

## Git
- repo: `git@github.com:lexeremin/reactive_doom.git`
- branch: `main`

## Last updated
2026-04-23 UTC
