# CLAUDE.md - SFF Wheel Library

## Project Overview

PWA for the SFF Wheel Warehouse roller skating community to browse, filter, and borrow wheels from a shared library. Beta/prototype on GitHub Pages.

- **Architecture**: Single-file app — all HTML/CSS/JS in `index.html` (~1,800 lines, ~520 KB)
- **Stack**: Vanilla JS (ES6+), CSS3, HTML5 — no frameworks, no build tools
- **Deployment**: GitHub Pages (static), auto-deploys from `main` branch

## File Organization

```
index.html              # MAIN APP - all HTML/CSS/JS in one file
service-worker.js       # PWA caching (network-first strategy)
manifest.json           # PWA metadata
apps-script-backend.js  # Google Apps Script backend (reference copy)
APPS_SCRIPT_DEPLOYMENT.md
```

**IMPORTANT**: `index.html` is large. Always use `offset`/`limit` when reading, or use Grep to find specific sections.

## Key URLs

```
Production:    https://peachpaulison.github.io/SFF_Wheel_Library
GitHub Repo:   https://github.com/PeachPaulison/SFF_Wheel_Library
Sheets CSV:    https://docs.google.com/spreadsheets/d/e/2PACX-1vTX7hy9M2WFiK5F_idUtMvnvfDZnz6-PdqeLP660gPQJI50eBQygHbWdhd3pvYF4H307QqK-0nIFero/pub?gid=0&single=true&output=csv
Apps Script:   https://script.google.com/macros/s/AKfycbxi6hK6R9e1Q9F0z93q2aBTroefytf3Sofc0if1A0FJPc76H18aZYAnYawq51MyrjDQ/exec
```

## Backend Integration

### Google Sheets (Read)
- Published CSV endpoint, no auth required
- Inventory sheet (gid=0): wheel_id, wheel_name, brand, wheel_size, wheel_material, durometer_category, best_for, status, lender_id

### Google Apps Script (Write)
Handles multiple POST actions via `data.action` or payload shape:
- **signup** — member registration (requires phone verification)
- **checkout** — borrow a wheel (updates inventory status)
- **review** — submit wheel review (detected by `rating` field)
- **add wheel** — add to inventory (detected by `wheel_name` + `brand`)

**System accounts** (MAINTENANCE, LIBRARY, ADMIN) bypass phone verification.

**Required sheets**: Inventory, Reviews, Members, Signups

## Design & Theme

Retro roller rink aesthetic — neon colors on dark background, mobile-first.

### CSS Variables
```css
--neon-pink: #ff1493;    /* Durometer filter */
--neon-blue: #00bfff;    /* Environment filter */
--neon-lime: #bfff00;    /* Size filter */
--neon-purple: #9b30ff;  /* Material filter */
--neon-orange: #ff6f00;
--neon-yellow: #ffd700;
--bg: #0d0d0d;
```

### Filter Groups
```
Environment (blue):   rhythm, jam, artistic, derby, parks, street, trail, indoor
Size (lime):          57mm, 59mm, 62mm, 65mm+
Durometer (pink):     soft (88A-92A), mid (93A-96A), hard (97A-103A)
Material (purple):    urethane, vanathane, fiberglass, wood, clay, other
```

## Code Conventions

- **camelCase** for JS functions/variables, **kebab-case** for CSS classes, **SCREAMING_SNAKE_CASE** for constants
- 2-space indentation throughout
- Async/await for data fetching, template literals for HTML building
- Fonts: Baloo 2 (headings), Space Grotesk (body)

## Constraints

- **No build tools** — no webpack, Vite, TypeScript, Sass
- **No frameworks** — no React, Vue, Angular, jQuery
- **Keep Eruda** — mobile debugging console stays during beta
- **Don't commit secrets** — no API keys, phone numbers, or real borrower data
- **Stage specific files** — avoid `git add .` or `git add -A`
- **Service worker versioning** — bump `CACHE_NAME` in service-worker.js after significant changes

## Last Updated
2026-02-15 | Version 1.3
