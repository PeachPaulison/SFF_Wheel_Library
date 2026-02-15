# CLAUDE.md - AI Assistant Guide for SFF Wheel Library

## Project Overview

**SFF Wheel Library** is a Progressive Web App (PWA) designed for a roller skating community to browse, filter, and "borrow" wheels from a shared library. This is a proof-of-concept/beta application built for the SFF Wheel Warehouse community.

### Key Characteristics
- **Type**: Progressive Web App (PWA) - installable on iOS/Android
- **Architecture**: Single-page application with monolithic structure
- **Deployment**: GitHub Pages (static hosting)
- **Current Status**: Beta/prototype with active development
- **Target Users**: Roller skating community members

### Project Goals
1. Allow skaters to explore and filter available wheels by multiple criteria
2. Provide contextual guidance for wheel selection based on skating discipline
3. Enable borrowing/checkout tracking (currently mockup, will be real)
4. Collect wheel reviews from community members (in development)
5. Sync with live inventory data from Google Sheets

---

## Codebase Structure

### File Organization

```
/home/user/SFF_Wheel_Library/
├── index.html (520 KB)           # MAIN APPLICATION - All HTML/CSS/JS in one file
├── service-worker.js (1.8 KB)    # PWA caching strategy
├── manifest.json (446 B)         # PWA metadata and configuration
├── README.md (6.3 KB)            # User-facing documentation
├── apple-touch-icon.png          # iOS app icon (180x180)
├── wheel_library_icon_192*.png   # Android launcher icon
├── wheel_library_icon_512*.png   # Splash screen icon
└── wheel_library_banner.png      # Marketing/header banner
```

### Monolithic Architecture

**IMPORTANT**: This is a **single-file application**. All HTML, CSS, and JavaScript are embedded in `index.html` (1,759 lines). There are NO separate `.js` or `.css` files.

**Why this matters for AI assistants:**
- When making changes, you'll edit `index.html` directly
- The file is large (507.9KB), so use `offset` and `limit` when reading
- CSS is in `<style>` tags in the `<head>` section
- JavaScript is in `<script>` tags at the bottom before `</body>`
- No build tools, bundlers, or transpilation required

---

## Key Technologies & Dependencies

### Core Stack
- **HTML5** - Semantic structure with PWA meta tags
- **CSS3** - Custom properties, flexbox, grid, gradients
- **Vanilla JavaScript (ES6+)** - Async/await, arrow functions, template literals
- **No frameworks** - Pure JavaScript, no React/Vue/Angular

### External Dependencies (CDN-loaded)

1. **Google Fonts** (Preconnected)
   - Baloo 2 (headings, playful font)
   - Space Grotesk (body text, modern font)

2. **Eruda.js** (Mobile debugging - TEMPORARY)
   - Loaded from CDN: `https://cdn.jsdelivr.net/npm/eruda`
   - Provides on-device console for mobile testing
   - **MUST BE REMOVED** before official community launch

### Backend Integrations

1. **Google Sheets API (Read-only)**
   ```javascript
   SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTX7hy9M2WFiK5F_idUtMvnvfDZnz6-PdqeLP660gPQJI50eBQygHbWdhd3pvYF4H307QqK-0nIFero/pub?gid=0&single=true&output=csv"
   ```
   - Fetches live inventory data as CSV
   - Published sheet endpoint (no auth required)
   - Network-first strategy with offline fallback

2. **Google Apps Script (Write endpoint)**
   ```javascript
   REVIEW_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxi6hK6R9e1Q9F0z93q2aBTroefytf3Sofc0if1A0FJPc76H18aZYAnYawq51MyrjDQ/exec"
   ```
   - Handles review form submissions
   - POST endpoint with JSON payload
   - Connected to "Reviews" sheet in workbook

---

## Development Workflows

### Local Development

**No build step required!** This is a static site with no compilation.

1. **Edit files directly**
   ```bash
   # Edit the main app
   code index.html

   # Edit service worker
   code service-worker.js

   # Edit PWA config
   code manifest.json
   ```

2. **Test locally**
   - Open `index.html` directly in browser (file:// protocol)
   - Or use a simple HTTP server:
     ```bash
     python3 -m http.server 8000
     # Then visit http://localhost:8000
     ```

3. **Test PWA features**
   - Service worker requires HTTPS or localhost
   - Use Chrome DevTools > Application > Service Workers
   - Test offline mode by checking "Offline" in Network tab

### Git Workflow

**Current Branch**: `claude/add-claude-documentation-ZwJ7m`

**Branch Naming Convention**:
- Feature branches: `claude/<description>-<sessionId>`
- Example: `claude/add-claude-documentation-ZwJ7m`
- **CRITICAL**: Branch must start with `claude/` and end with matching session ID

**Typical Workflow**:
```bash
# 1. Check current branch
git status

# 2. Make changes to files
# (edit index.html, service-worker.js, etc.)

# 3. Stage specific files (avoid git add -A or git add .)
git add index.html
git add service-worker.js

# 4. Commit with descriptive message
git commit -m "Add feature X to improve Y

https://claude.ai/code/session_XXX"

# 5. Push to branch (with retry on network errors)
git push -u origin claude/add-claude-documentation-ZwJ7m
```

**Push Requirements**:
- Always use `git push -u origin <branch-name>`
- Branch must match pattern: `claude/*-<sessionId>`
- Retry up to 4 times with exponential backoff (2s, 4s, 8s, 16s) if network fails

### Creating Pull Requests

When ready for review:

```bash
# 1. Ensure all changes are committed and pushed
git status
git push -u origin <branch-name>

# 2. Create PR using GitHub CLI
gh pr create --title "Descriptive title" --body "## Summary
- Bullet point summary of changes
- What was added/fixed/improved

## Test plan
- [ ] Tested on iOS Safari
- [ ] Tested on Android Chrome
- [ ] Verified service worker updates
- [ ] Checked offline functionality

https://claude.ai/code/session_XXX"
```

---

## Code Conventions

### JavaScript Patterns

#### 1. State Management
```javascript
// Global state objects (no external state library)
const selections = {
  environment: null,
  size: null,
  duro: null,
  material: null
};
const loans = [];        // Session-only checkout records
const inventory = [];    // Loaded from Google Sheets
```

#### 2. Event Handling
```javascript
// Chip selection - single-select per group
chip.addEventListener("click", () => {
  const group = chip.dataset.group;
  const value = chip.dataset.value;

  // Clear other selections in same group
  document.querySelectorAll(`.chip[data-group="${group}"]`)
    .forEach(c => c.classList.remove("selected"));

  // Update state
  selections[group] = selections[group] === value ? null : value;
  chip.classList.toggle("selected", selections[group] === value);

  // Trigger updates
  updateOutput();
  updateMatches();
});
```

#### 3. Data Fetching
```javascript
// Always use async/await with try-catch
async function loadInventoryFromSheet() {
  try {
    setDataStatus("Loading data…");
    const res = await fetch(SHEET_URL);
    const text = await res.text();
    const rows = parseCSV(text);

    // Transform data
    const data = rows.slice(1).map(row => ({
      id: row[headers.indexOf("wheel_id")],
      name: row[headers.indexOf("wheel_name")],
      // ... etc
    }));

    setDataStatus("live", "LIVE DATA (synced)");
    return data;
  } catch (err) {
    console.error("❌ Failed to load:", err);
    setDataStatus("offline", "OFFLINE / NO LIVE DATA");
  }
}
```

#### 4. DOM Manipulation
```javascript
// Build HTML strings with template literals
function updateMatches() {
  const matchesDiv = document.getElementById("matches");

  if (matches.length === 0) {
    matchesDiv.innerHTML = `<div class="matches-empty">No wheels match...</div>`;
    return;
  }

  matchesDiv.innerHTML = matches.map(wheel => `
    <div class="wheel-card">
      <div class="wheel-header">
        <div class="wheel-name">${wheel.name}</div>
        <div class="wheel-availability ${availClass}">
          ${availableSets} set${availableSets !== 1 ? 's' : ''}
        </div>
      </div>
      <!-- ... more HTML ... -->
    </div>
  `).join("");
}
```

#### 5. Naming Conventions
- **camelCase**: Functions, variables (`updateMatches`, `handleBorrow`)
- **kebab-case**: CSS classes, data attributes (`wheel-card`, `data-group`)
- **SCREAMING_SNAKE_CASE**: Constants (`SHEET_URL`, `CACHE_NAME`)

### CSS Patterns

#### 1. CSS Custom Properties (Variables)
```css
:root {
  /* MSW Carpet Theme - ACTIVE */
  --neon-pink: #ff1493;
  --neon-blue: #00bfff;
  --neon-lime: #bfff00;
  --neon-purple: #9b30ff;
  --neon-orange: #ff6f00;
  --neon-yellow: #ffd700;

  --bg: #0d0d0d;
  --panel: rgba(26, 26, 26, .68);
  --stroke: rgba(255,255,255,.12);
}
```

#### 2. Color-Coded Filter Groups
Each filter category has a unique neon color:
- **Environment**: Blue (`--neon-blue`) - Best surface/discipline
- **Size**: Lime (`--neon-lime`) - Wheel diameter
- **Durometer**: Pink (`--neon-pink`) - Hardness rating
- **Material**: Purple (`--neon-purple`) - Construction material

#### 3. Component Styling
```css
/* Button pattern - pill-shaped with 3D effect */
.chip {
  padding: 7px 11px;
  border-radius: 999px;
  border: 1px solid rgba(0,0,0,0.18);
  box-shadow: 0 2px 0 rgba(0,0,0,0.12);
  transition: transform 0.08s ease;
}

.chip:active {
  transform: translateY(1px);
  box-shadow: 0 1px 0 rgba(0,0,0,0.12);
}
```

#### 4. Responsive Breakpoint
```css
@media (max-width: 780px) {
  /* Mobile: single column layout */
  main { grid-template-columns: 1fr !important; }

  /* Larger touch targets */
  .chip { padding: 10px 14px; font-size: 0.95rem; }
}
```

### Data Structures

#### Inventory Object
**Note**: Each object represents ONE physical set from ONE lender.
```javascript
{
  id: "W001",                    // Unique identifier (primary key)
  name: "Radar Energy 57",       // Display name
  brand: "Radar",                // Manufacturer
  size: "57mm",                  // Diameter
  material: "urethane",          // Construction material
  duroRange: "78A",              // Hardness rating
  bestFor: ["rhythm", "jam"],    // Array of environments
  status: "available",           // available / checked out / returned
  lenderId: "V123"               // Member ID of lender
}
```

#### Review Submission Payload
```javascript
{
  phone_number: "555-1234",           // For member verification (not displayed)
  display_name: "Jess",               // Public name
  wheel_id: "W001",                   // From inventory
  wheel_name: "Radar Energy 57",      // From inventory
  experience_level: "intermediate",   // beginner|intermediate|advanced
  hours_on_wheels: 5,                 // Numeric
  rating: 4,                          // 1-5 stars
  review_text: "Great wheels!",       // Freeform text
  environment: "rhythm",              // Where they skated
  timestamp: "2025-01-23T10:30:00"   // ISO 8601
}
```

---

## Common Development Tasks

### Task 1: Adding a New Filter Option

**Example**: Add "66mm" to the size filter

1. **Locate the filter section** in `index.html`:
   ```javascript
   // Search for: data-group="size"
   ```

2. **Add the new chip**:
   ```html
   <div class="chip" data-group="size" data-value="66mm">
     <span class="chip-dot" style="background: var(--neon-lime);"></span>
     66mm
   </div>
   ```

3. **Update the inventory filtering logic** (if needed):
   ```javascript
   // The filter automatically works - no code changes needed
   // It matches inventory[].size against the data-value
   ```

4. **Test**:
   - Click the new chip
   - Verify it filters correctly
   - Check that only one size can be selected at a time

### Task 2: Updating Service Worker Cache

**When to do this**: After making significant changes to `index.html` or adding new assets

1. **Edit `service-worker.js`**:
   ```javascript
   // Increment the version number
   const CACHE_NAME = "wheel-library-v1.0.3"; // was v1.0.2
   ```

2. **Add new assets to cache** (if applicable):
   ```javascript
   const ASSETS = [
     "./",
     "./index.html",
     "./manifest.json",
     "./apple-touch-icon.png",
     "./new-asset.png"  // Add new files here
   ];
   ```

3. **Test cache invalidation**:
   - Open DevTools > Application > Service Workers
   - Click "Update" or "Unregister"
   - Reload the page
   - Verify new service worker is active

### Task 3: Modifying the Review Form

**Example**: Add a new field "Would you recommend?"

1. **Add HTML input** in the modal form:
   ```html
   <div class="form-row">
     <label for="recommend">Would you recommend these wheels?</label>
     <select id="recommend" required>
       <option value="">Select...</option>
       <option value="yes">Yes</option>
       <option value="no">No</option>
       <option value="maybe">Maybe</option>
     </select>
   </div>
   ```

2. **Update form submission handler**:
   ```javascript
   reviewForm.onsubmit = async function(e) {
     e.preventDefault();

     const formData = {
       // ... existing fields ...
       recommend: document.getElementById('recommend').value
     };

     // Submit to Apps Script
   }
   ```

3. **Update Google Apps Script** (external):
   - Add column to "Reviews" sheet
   - Update `doPost()` function to handle new field

4. **Test end-to-end**:
   - Fill out form
   - Submit
   - Verify data appears in Google Sheet

### Task 4: Adjusting Neon Theme Colors

**Example**: Change environment filter color from blue to cyan

1. **Update CSS variable**:
   ```css
   :root {
     --neon-blue: #00ffff; /* was #00bfff */
   }
   ```

2. **Check affected elements**:
   ```css
   /* Environment chips */
   .group[data-group="environment"] .chip {
     border-color: var(--neon-blue);
   }

   /* Background gradients */
   radial-gradient(circle at 30% 30%, var(--neon-blue) 0%, transparent 70%)
   ```

3. **Test visual consistency**:
   - Verify all environment chips have new color
   - Check background gradient looks good
   - Test in both light and dark backgrounds

### Task 5: Fixing Read Errors (Large File)

**When reading `index.html` fails with "file too large" error**:

```javascript
// DON'T: Read entire file
Read({ file_path: "/home/user/SFF_Wheel_Library/index.html" })

// DO: Read in chunks
Read({
  file_path: "/home/user/SFF_Wheel_Library/index.html",
  offset: 1,      // Start at line 1
  limit: 500      // Read 500 lines
})

// Or use Grep to find specific sections
Grep({
  pattern: "function updateMatches",
  path: "/home/user/SFF_Wheel_Library/index.html",
  output_mode: "content",
  "-A": 50  // Show 50 lines after match
})
```

---

## Integration Points

### Google Sheets Integration

**Spreadsheet**: SFF_Wheel_Library (ID: `2PACX-1vTX7hy9M2WFiK5F_idUtMvnvfDZnz6-PdqeLP660gPQJI50eBQygHbWdhd3pvYF4H307QqK-0nIFero`)

**Sheet Structure**:

**Inventory Sheet (gid=0)**:
**Data Model**: Each row represents ONE physical set of wheels from ONE lender. If multiple members lend the same wheel type (e.g., "Radar Energy 57"), they appear as separate rows with unique wheel_ids.

| Column | Type | Example | Notes |
|--------|------|---------|-------|
| wheel_id | String | W001 | Unique identifier (primary key), auto-generated |
| wheel_name | String | Radar Energy 57 | Display name |
| brand | String | Radar | Manufacturer |
| wheel_size | String | 57mm | Diameter with unit |
| wheel_material | String | urethane | Material type |
| durometer_category | String | soft (88A-92A) | Hardness range |
| best_for | String | rhythm, jam | Comma-separated |
| status | String | available | available / checked out / returned |
| lender_id | String | V123 | Member ID of the lender |

**Reviews Sheet (gid=1)**:
| Column | Type | Example | Notes |
|--------|------|---------|-------|
| phone_number | String | 555-1234 | For verification only |
| display_name | String | Jess | Public name |
| wheel_id | String | W001 | Links to inventory |
| wheel_name | String | Radar Energy 57 | Denormalized for display |
| experience_level | String | intermediate | Skater skill level |
| hours_on_wheels | Number | 5 | Test duration |
| rating | Number | 4 | 1-5 stars |
| review_text | Text | Great! | Freeform comments |
| environment | String | rhythm | Where tested |
| timestamp | DateTime | 2025-01-23 10:30 | Auto-generated |

**Publishing Settings**:
- Published to web as CSV (File > Share > Publish to web)
- gid=0 (Inventory) is public read-only
- Updates reflect immediately (no caching on Google's side)

### Google Apps Script Backend

**Script Functions**:

1. **doPost(e)** - Handle review submissions
   ```javascript
   // Receives POST with JSON body
   // Validates required fields
   // Appends to "Reviews" sheet
   // Returns success/error JSON
   ```

2. **doGet(e)** - Retrieve reviews (future feature)
   ```javascript
   // Returns reviews for a specific wheel_id
   // Or returns all reviews
   // Used for displaying reviews in app
   ```

3. **onEdit(e)** - Auto-generate wheel IDs
   ```javascript
   // Triggers when sheet is edited
   // Auto-generates W001, W002, etc.
   // Manages durometer categories
   ```

**Deployment**:
- Deployed as web app with public access
- Version: Latest (auto-updates)
- Execute as: Me
- Who has access: Anyone with a Google account

#### Backend Implementation (Updated)

**✅ UPDATED**: An updated Google Apps Script backend has been provided in this repository.

**Location**: `/home/user/SFF_Wheel_Library/apps-script-backend.js`

**Deployment Guide**: See `APPS_SCRIPT_DEPLOYMENT.md` for step-by-step instructions.

**Features**:
1. ✅ Member verification against the Members sheet (security feature)
2. ✅ System accounts bypass (MAINTENANCE, LIBRARY, ADMIN skip phone verification)
3. ✅ Auto-generated wheel IDs with 3-digit format (W001, W002, W003)
4. ✅ Dynamic column mapping (resilient to column reordering)
5. ✅ Phone number normalization (handles various formats)
6. ✅ Bearing fields support (bearings_included, bearing_size, bearing_material)
7. ✅ Privacy protection (excludes phone numbers from public review data)
8. ✅ Proper JSON responses with success/error messages
9. ✅ Error handling with try-catch blocks
10. ✅ Removed num_sets field (no longer used)
11. ✅ Sheet name consistency ("Inventory" in both doPost and onEdit)

**Required Sheets**:
1. **Inventory** - Stores wheel data
2. **Reviews** - Stores review submissions
3. **Members** - Validates member phone numbers (NEW - REQUIRED)

**System Accounts** (Special Handling):
- **MAINTENANCE** - Used when wheels are checked out for inspection/cleaning after returns
- **LIBRARY** - Reserved for library operations
- **ADMIN** - Administrative actions
- These accounts bypass phone verification and do NOT need entries in the Members sheet
- Use case: When members return wheels, they're checked out to MAINTENANCE for inspection before returning to available status

**Testing Checklist**:
- [ ] Submit form with valid member phone → should succeed
- [ ] Submit form with invalid phone → should fail with error message
- [ ] Submit with display_name "MAINTENANCE" (no phone) → should succeed
- [ ] Check wheel ID increments correctly (W001, W002, W003...)
- [ ] Verify all fields appear in correct columns in Inventory sheet
- [ ] Test bearing fields (with and without bearings)
- [ ] Confirm status is set to "available" for new wheels
- [ ] Test doGet() returns reviews without phone numbers
- [ ] Test dynamic column mapping by reordering columns

---

## Deployment & Release

### GitHub Pages Deployment

**Repository**: `https://github.com/PeachPaulison/SFF_Wheel_Library`
**Live URL**: `https://peachpaulison.github.io/SFF_Wheel_Library`

**Deployment Process**:
1. Changes pushed to `main` branch
2. GitHub Actions automatically deploys to Pages
3. Site updates within 1-2 minutes
4. No build step required (static files)

**Branch Strategy**:
- `main` - Production (deployed to Pages)
- `claude/*` - Feature branches for development

### Pre-Deployment Checklist

Before merging to `main`:

- [ ] **Remove Eruda debugging console**
  ```javascript
  // DELETE these lines from index.html:
  <script src="https://cdn.jsdelivr.net/npm/eruda"></script>
  <script>eruda.init();</script>
  ```

- [ ] **Increment service worker version**
  ```javascript
  // In service-worker.js
  const CACHE_NAME = "wheel-library-v1.0.X"; // Bump version
  ```

- [ ] **Test on mobile devices**
  - iOS Safari: PWA install, offline mode, review form
  - Android Chrome: PWA install, offline mode, review form

- [ ] **Verify data connections**
  - Google Sheets loads correctly
  - Review submission works
  - "Live Data" indicator shows green

- [ ] **Check responsive design**
  - Test at 320px (small mobile)
  - Test at 768px (tablet)
  - Test at 1024px+ (desktop)

- [ ] **Validate PWA manifest**
  - Use Chrome DevTools > Application > Manifest
  - Verify icons load
  - Check theme colors

### Post-Deployment Tasks

After merging to `main`:

1. **Test live site**:
   ```bash
   # Visit production URL
   open https://peachpaulison.github.io/SFF_Wheel_Library
   ```

2. **Verify service worker updates**:
   - Open DevTools > Application > Service Workers
   - Should see new version number
   - Old caches should be deleted

3. **Notify users** (if major changes):
   - Post in SFF Wheel Warehouse community
   - Recommend users delete and reinstall PWA
   - Explain what's new

### Rollback Procedure

If deployment breaks:

```bash
# 1. Identify last working commit
git log --oneline

# 2. Revert to that commit
git revert <commit-hash>

# 3. Push to main
git push origin main

# 4. Verify site is restored
```

---

## Testing Considerations

### Manual Testing

**PWA Installation**:
```
iOS (Safari):
1. Visit site in Safari
2. Tap Share button
3. Tap "Add to Home Screen"
4. Open app from home screen
5. Verify standalone mode (no browser UI)

Android (Chrome):
1. Visit site in Chrome
2. Tap menu (⋮)
3. Tap "Add to Home Screen"
4. Open app from home screen
5. Verify standalone mode
```

**Offline Functionality**:
```
1. Load site while online
2. Open DevTools > Network tab
3. Check "Offline" checkbox
4. Reload page
5. Verify app still loads (from cache)
6. Verify "OFFLINE" indicator appears
```

**Filter Combinations**:
```
Test matrix (example):
- Environment: rhythm | Size: 57mm → Should show X wheels
- Environment: derby | Duro: hard → Should show Y wheels
- All filters selected → Should show narrow results
- No filters selected → Should show all wheels
```

**Review Form**:
```
1. Click floating review button
2. Fill out all fields
3. Submit form
4. Check Google Sheet for new row
5. Verify phone number is stored but not displayed
```

### Debugging Tools

**Eruda Console** (Mobile):
- Tap floating button in bottom-right
- Access Console, Network, Storage tabs
- View error messages and logs
- Check localStorage, sessionStorage

**Chrome DevTools** (Desktop):
```
Application Tab:
- Service Workers: Status, update, unregister
- Storage: LocalStorage, Cookies, Cache Storage
- Manifest: Verify PWA configuration

Network Tab:
- Monitor Google Sheets fetch
- Check Apps Script POST requests
- Simulate offline mode
- Throttle connection speed

Console Tab:
- View app logs (with emoji indicators)
- Test functions directly
- Debug state changes
```

### Common Issues & Solutions

**Issue**: PWA won't install on iOS
```
Solution:
- Ensure HTTPS (required by Safari)
- Verify manifest.json is valid
- Check apple-touch-icon.png exists
- Must use Safari (not Chrome/Firefox)
```

**Issue**: Service worker not updating
```
Solution:
- Increment CACHE_NAME version in service-worker.js
- Hard reload: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- DevTools > Application > Service Workers > Unregister
- Clear site data and reload
```

**Issue**: Google Sheets data not loading
```
Solution:
- Check SHEET_URL in console
- Verify sheet is published (File > Share > Publish to web)
- Check network tab for CORS errors
- Ensure sheet has correct column headers
```

**Issue**: Review form submission fails
```
Solution:
- Verify REVIEW_SCRIPT_URL is correct
- Check Apps Script is deployed as web app
- Set permissions to "Anyone" in Apps Script
- Check payload format matches script expectations
```

**Issue**: Filters not working
```
Solution:
- Check data-group and data-value attributes
- Verify inventory data has matching fields
- Console.log the selections object
- Check case sensitivity (lowercase everywhere)
```

---

## Important Notes for AI Assistants

### Critical File Handling

**⚠️ ALWAYS use offset/limit when reading index.html**:
```javascript
// File is 507.9 KB - too large to read at once
Read({
  file_path: "/home/user/SFF_Wheel_Library/index.html",
  offset: 1,
  limit: 500  // Adjust as needed
})

// Or use Grep to find specific sections
Grep({
  pattern: "updateMatches",
  path: "/home/user/SFF_Wheel_Library/index.html",
  output_mode: "content",
  "-A": 30
})
```

### Editing Best Practices

**1. Read before editing**:
```javascript
// ALWAYS read the section you're editing first
Read({ file_path: "...", offset: X, limit: Y })

// Then edit with exact string match
Edit({
  file_path: "...",
  old_string: "exact text from file",  // Must match exactly
  new_string: "replacement text"
})
```

**2. Preserve indentation**:
- HTML/CSS/JS in `index.html` uses 2-space indentation
- Match existing style exactly
- Don't change unrelated whitespace

**3. Test after every change**:
- Make small, incremental changes
- Test after each change
- Don't make multiple unrelated changes at once

### Git Best Practices

**1. Descriptive commit messages**:
```bash
# Good
git commit -m "Add 66mm option to size filter

- Added new chip to size filter group
- Updated styling for consistency
- Tested filter logic with new option

https://claude.ai/code/session_XXX"

# Bad
git commit -m "Update index.html"
```

**2. Stage specific files**:
```bash
# Good: Stage only files you changed
git add index.html
git add service-worker.js

# Bad: Stage everything (might include temp files, secrets)
git add .
git add -A
```

**3. Push with retry logic**:
```bash
# If push fails due to network, retry with backoff
git push -u origin <branch> || sleep 2 && git push -u origin <branch>
```

### Understanding User Context

**Target Audience**: Roller skating community members
- May not be technical
- Using mobile devices primarily
- Want simple, intuitive interface
- Value visual design and aesthetics

**Community Context**: SFF Wheel Warehouse
- Active WhatsApp group
- Supportive, enthusiastic community
- Tolerant of beta bugs (but communicate clearly)
- Willing to provide feedback

**Design Philosophy**: Retro roller rink aesthetic
- 70s/80s nostalgia
- Neon colors (MSW carpet theme)
- Playful, friendly tone
- Mobile-first design

### Code Style Preferences

**JavaScript**:
- Vanilla JS, no frameworks
- Async/await over Promises
- Template literals for HTML building
- Arrow functions for callbacks
- Descriptive variable names

**CSS**:
- CSS custom properties (variables)
- Flexbox and Grid for layout
- Mobile-first responsive design
- Smooth transitions and animations
- Neon glow effects for theme

**HTML**:
- Semantic elements where possible
- Data attributes for state
- Minimal classes (use CSS variables)
- Progressive enhancement

### What NOT to Do

**❌ Don't add build tools**:
- No webpack, Vite, or bundlers
- No TypeScript compilation
- No CSS preprocessors (Sass/Less)
- Keep it simple and static

**❌ Don't add heavy dependencies**:
- No React, Vue, Angular
- No jQuery
- No Lodash/Underscore
- Keep bundle size minimal

**❌ Don't over-engineer**:
- No complex state management
- No routing library needed
- No unnecessary abstractions
- KISS principle (Keep It Simple, Stupid)

**❌ Don't remove Eruda yet**:
- It's temporary, but owner wants it during beta
- Will be removed before official launch
- Useful for debugging on mobile

**❌ Don't commit sensitive data**:
- No API keys in code (use Apps Script)
- No personal phone numbers
- No real borrower data (mockup only)

### When to Ask for Clarification

Ask the user if:
- They want to change the color scheme significantly
- They want to add a new external dependency
- They want to restructure the code architecture
- They want to modify Google Sheets structure
- They want to change the URL/deployment location
- They're unsure about PWA install issues (may be device-specific)

### Performance Considerations

**PWA Performance**:
- Service worker uses network-first strategy (always try to fetch fresh)
- Cache static assets on install
- Exclude external APIs from cache (Google Sheets, Apps Script)
- Cache images but not external scripts

**Data Loading**:
- Inventory loads on page load (async)
- Show loading indicator during fetch
- Graceful fallback to offline mode
- Don't block UI rendering

**Image Optimization**:
- Icons are already optimized
- Banner is large (1.8 MB) - consider optimization if issues arise
- Use lazy loading for future image features

---

## Future Development Roadmap

Based on README.md goals:

### Planned Features
1. **Real borrowing system** (currently mockup)
   - Persist checkouts across sessions
   - Track due dates and returns
   - Send reminders

2. **Wheel review system** (in development)
   - Display reviews on wheel cards
   - Sort/filter by rating
   - Photo uploads

3. **User accounts** (future)
   - Login/authentication
   - Personal favorites
   - Borrowing history

4. **Wheel comparisons** (future)
   - Side-by-side comparison view
   - Highlight differences
   - Export comparison

5. **Enhanced inventory management** (future)
   - Admin interface
   - Bulk import/export
   - Inventory alerts

### Technical Debt to Address
- [ ] Split index.html into separate files (HTML, CSS, JS)
- [ ] Add automated testing (unit, integration)
- [ ] Implement proper error tracking (Sentry?)
- [ ] Optimize bundle size (code splitting?)
- [ ] Add CI/CD pipeline (linting, tests)
- [ ] Improve accessibility (ARIA labels, keyboard nav)
- [ ] Add analytics (privacy-respecting)

---

## Quick Reference

### File Locations
```
Main app:             /home/user/SFF_Wheel_Library/index.html
Service worker:       /home/user/SFF_Wheel_Library/service-worker.js
PWA manifest:         /home/user/SFF_Wheel_Library/manifest.json
User documentation:   /home/user/SFF_Wheel_Library/README.md
AI guide:             /home/user/SFF_Wheel_Library/CLAUDE.md
Apps Script backend:  /home/user/SFF_Wheel_Library/apps-script-backend.js
Apps Script deploy:   /home/user/SFF_Wheel_Library/APPS_SCRIPT_DEPLOYMENT.md
```

### Key URLs
```
Production:         https://peachpaulison.github.io/SFF_Wheel_Library
GitHub Repo:        https://github.com/PeachPaulison/SFF_Wheel_Library
Google Sheets CSV:  https://docs.google.com/spreadsheets/d/e/2PACX-1vTX7hy9M2WFiK5F_idUtMvnvfDZnz6-PdqeLP660gPQJI50eBQygHbWdhd3pvYF4H307QqK-0nIFero/pub?gid=0&single=true&output=csv
Apps Script:        https://script.google.com/macros/s/AKfycbxi6hK6R9e1Q9F0z93q2aBTroefytf3Sofc0if1A0FJPc76H18aZYAnYawq51MyrjDQ/exec
```

### Common Commands
```bash
# Check status
git status

# Stage and commit
git add index.html
git commit -m "Description"

# Push to branch
git push -u origin claude/branch-name-ZwJ7m

# Create PR
gh pr create --title "Title" --body "Body"

# Test locally
python3 -m http.server 8000

# View logs
git log --oneline -10
```

### Filter Groups
```
Environment (blue):   rhythm, jam, artistic, derby, parks, street, trail, indoor
Size (lime):          57mm, 59mm, 62mm, 65mm+
Durometer (pink):     soft (88A-92A), mid (93A-96A), hard (97A-103A)
Material (purple):    urethane, vanathane, fiberglass, wood, clay, other
```

### CSS Variables
```css
--neon-pink: #ff1493;
--neon-blue: #00bfff;
--neon-lime: #bfff00;
--neon-purple: #9b30ff;
--neon-orange: #ff6f00;
--neon-yellow: #ffd700;
```

---

## Support & Resources

### Community
- **WhatsApp Group**: SFF WhatsApp group
- **Creator**: @PeachPaulison (GitHub)
- **Feedback**: WhatsApp group (users should NOT use GitHub issues)

### Technical Resources
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Google Apps Script](https://developers.google.com/apps-script)
- [Google Sheets API](https://developers.google.com/sheets/api)

---

**Last Updated**: 2026-01-29
**Version**: 1.2
**Claude Session**: session_015pArBe6Yyeb3pdyvePzfBb
