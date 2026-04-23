# STATUS.md

## Project
**reactive_doom**

A React + Vite browser game aiming to become a compact Doom-like retro FPS with a pixelated presentation.
Current version is a playable prototype built with a custom raycasting renderer, simple enemy logic, shooting, HUD, and keyboard/mouse controls.

## Current state
The project is working as a playable prototype, not a finished game.
It currently includes:
- React + Vite + TypeScript project setup
- custom canvas-based raycasting engine
- first-person movement
- mouse look with pointer lock
- keyboard controls
- shooting system
- simple enemies with basic chase/attack behavior
- HUD with health, ammo, and kills
- retro pixel-style visual treatment

## Controls
- `WASD` move
- `Arrow Left / Arrow Right` turn
- click canvas to lock pointer
- mouse movement to look around
- `Space` to shoot
- on-screen `SHOOT` button for quick/touch interaction

## Architecture notes
Main files:
- `src/App.tsx` — app shell and overlay UI
- `src/game/Game.ts` — main game orchestration, rendering, combat, HUD drawing
- `src/game/raycaster.ts` — wall raycasting logic
- `src/game/player.ts` — player movement, turning, health
- `src/game/enemy.ts` — enemy state and AI
- `src/game/weapon.ts` — weapon and ammo behavior
- `src/game/map.ts` — current level layout
- `src/game/engine.ts` — canvas engine loop / resize handling

## Known limitations
This is not yet a full Doom-quality implementation.
Current limitations include:
- flat-color walls instead of proper textures
- simple square enemy sprites
- only one level
- no title screen / menu / pause flow
- no pickups
- no doors / switches / keys
- no sound effects or music
- no save/load system
- no mobile movement controls
- combat and enemy line-of-sight are still very simple

## Next recommended priorities
1. Improve rendering fidelity
   - textured walls
   - better sprite rendering
   - damage flash / hit feedback
   - weapon animation polish

2. Improve gameplay loop
   - pickups for ammo and health
   - proper enemy hit detection
   - better enemy line-of-sight and path behavior
   - level completion trigger

3. Add level structure
   - multiple maps
   - spawn points
   - doors / keys / switches
   - basic progression flow

4. Add presentation layer
   - title screen
   - pause / restart
   - sound effects
   - music
   - settings for sensitivity / resolution

5. Improve device support
   - mobile joystick controls
   - touch aiming/shooting
   - responsive HUD scaling

## Working TODO
- [ ] add textured wall rendering
- [ ] replace placeholder enemy blocks with proper sprite art
- [ ] add pickups: health and ammo
- [ ] add restart flow after death
- [ ] add win/level transition flow
- [ ] add second level
- [ ] add sound effects
- [ ] add title screen and pause menu
- [ ] improve hit detection so shots depend on aim and wall occlusion
- [ ] add minimap debug toggle
- [ ] add mobile movement controls
- [ ] run stable LAN/dev server again after next gameplay pass

## Session handoff notes
If another AI session or model picks this up, the best next task is:
**turn the prototype into a stronger vertical slice by adding textured walls, pickups, and a proper restart/win loop before expanding scope further.**

Recommended approach:
- keep the current React + Vite structure
- keep the custom raycasting approach
- avoid introducing heavy 3D engines unless there is a clear reason
- prioritize shippable feel over technical overengineering

## Git
- repo: `git@github.com:lexeremin/reactive_doom.git`
- branch: `main`

## Last updated
2026-04-23 UTC
