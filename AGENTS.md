# AGENTS.md

## What this is

Vanilla HTML5 canvas Asteroids clone. **No toolchain**: no `package.json`, no build, no tests, no lint, no CI. The entire game lives in `game.js` (~420 lines); `index.html` is just a canvas shell (1600×1200) plus a `<script>` tag. Don't introduce dependencies, bundlers, or frameworks — the README explicitly states "sin dependencias ni bundler".

## Run it

```bash
npx serve .   # then open http://localhost:3000
```

Opening `index.html` directly (file://) also works. There is nothing else to run.

## Structure & conventions

- `game.js` is the single file for all game logic, rendering, input, and HUD. Keep it that way unless asked.
- Section banners (`// ── Name ──...`) separate concerns: Input, Utils, Bullet, Asteroid, Skins, Ship, Particle, then functions (`initGame`, `update`, `draw`, `loop`). Follow this layout when adding code.
- `W`/`H` are defined in `game.js` **and** hardcoded as the canvas `width`/`height` in `index.html`. Change both together.
- Asteroid `size` runs 3 (big) → 1 (small); it splits via `size - 1` until `size <= 1`. Lookup tables `RADII`/`SPEEDS`/`POINTS` are indexed by size, so points are `[0, 100, 50, 20]` (small → big).
- Input edge-triggering: `keys[code]` is held state; `pressed(code)` returns true once per press (consumes `justPressed`). Use `pressed()` for single-shot actions (fire, start/restart) and `keys[]` for continuous ones (thrust, rotate). Note `pressed()` clears the flag, so calling it twice in one frame misses the second call.
- README and code comments are in **Spanish**; keep new docs/comments consistent with that.

## Gotchas

- `dt`-based game loop (`loop(ts)` → `update(dt)`); keep movement/frame logic delta-time aware, not per-frame constants.
- Ship respawn invulnerability and edge-wrapping (`wrap()`, toroidal space) are core mechanics — don't remove the blinking/invincibility after death.
- Scoring, split behavior, and level progression (`spawnAsteroids(3 + level)` when the field is empty) are documented in `README.md`; update the README if you change them.
- Special asteroid: `ShootingStar extends Asteroid`, marked with `special = true` and its own `points` (300). Spawned by `starTimer` every 6–12 s; expires on its own (`ttl` = 5 s), never splits, drops no power-ups, and kills on contact. Level completion ignores `special` asteroids: `!asteroids.some(a => !a.special)`.
