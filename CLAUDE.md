# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NinjaTruck is a top-down 2D browser game built for a 6-year-old (Peter). The player drives a monster truck in an arena, dodging enemies that try to climb on. Each mounted enemy slows the truck; game over when speed hits zero. 5 levels with progressive difficulty and ability unlocks.

Hosted at ninjatruck.kroehling.de via GitHub Pages from main branch.

## Tech Stack

- HTML5 Canvas + vanilla JavaScript (ES modules)
- Zero dependencies, no build step, no bundler
- Served as static files — `index.html` is the entry point

## Running Locally

Requires a local HTTP server (ES modules don't work with `file://`):
```bash
npx serve . -p 8080
```

## Architecture

The game uses a state machine (`game.js`) driving a `requestAnimationFrame` loop. States: `title`, `playing`, `lostLife`, `levelComplete`, `gameOver`, `victory`, `paused`.

**Game loop flow:** `main.js` → creates `Game` → `Game.start()` shows title → user picks theme → `startLevel()` → update/render loop.

Key relationships:
- `game.js` orchestrates everything: owns the truck, enemies array, particles, input, audio, UI, and level config
- `input.js` unifies keyboard and touch into a single interface (`moveX/moveY`, `consumeTurbo()`, `consumeShake()`, `consumePause()`)
- `renderer.js` draws the background starfield, arena, HUD (speed bar, hearts, timer, ability cooldowns), and pause overlay — all on canvas
- `ui.js` manages HTML overlay screens (title, level complete, lost life, game over, victory) using safe DOM methods (no innerHTML)
- `themes.js` defines 5 enemy themes (ninjas, tartarugas, ninjago, gummibärchen, pokémons) with color variants
- `level.js` holds the 5 level configs (spawn rate, enemy speed, duration, which abilities are unlocked)

**Ability progression:** Level 1 = dodge only, Level 2 = +turbo, Level 3 = +shake. Each enemy that mounts permanently reduces speed by 15% of base.

**Lives system:** 3 lives total. Dying retries the same level (not level 1). All lives gone = true game over.

## Language

The game UI and user-facing text is in Portuguese (Brazilian). Code comments and variable names are in English.

## Visual Style

Cartoon style inspired by the sibling project `jogos-gummibaerchens`. Uses Fredoka One + Nunito fonts, gradient backgrounds with twinkling starfield, glow effects, glassmorphism UI panels, and particle effects (stars, sparks with gravity). All rendering is procedural canvas drawing — no sprite image files.
