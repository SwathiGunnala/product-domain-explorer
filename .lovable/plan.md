
The Compare feature already exists end-to-end (`src/pages/ComparePage.tsx`, header link, homepage CTA, route, URL hash sharing, unique/shared badging across 6 dimensions). What's missing from the user's framing is the **"pick one lens"** idea — right now we dump all 6 sections at once, which is a lot to scan. Let's add a lens selector so PMs can focus on one dimension at a time, while keeping "All lenses" as the default for power users.

## What we'll build

A **Lens selector** on `/compare` that filters which comparison section(s) render. This makes the tool feel sharper and more deliberate — exactly the "pick one lens" framing.

### 1. Lens tabs (pill bar above the grid)
Seven options, single-select:
- **All lenses** (default)
- **Users**
- **Jobs to be Done**
- **Process**
- **Architecture**
- **Opportunities**
- **Products**

Each pill shows the section icon + label. Active pill uses primary color; inactive is muted. Persists to URL hash alongside the slugs (e.g. `#wealth-management,retail,mortgage|lens=jobs`) so a shared link preserves both selection AND lens.

### 2. Focused-lens layout
When a single lens is picked (not "All"):
- Hide the other 5 sections
- Render the chosen section larger: bigger card, more breathing room, taller item rows, sub-text not truncated
- Add a small lens-summary header strip: "Comparing **Jobs to be Done** across 3 industries — 4 unique, 2 shared"

### 3. Empty-lens guard
If a lens is selected but a domain hasn't loaded data yet for that key, show the existing skeleton. If data is loaded but the array is empty, show the existing "No data" state.

### 4. Minor polish (while we're in there)
- Add a **Copy link** button next to Reset so PMs can share the exact lens+selection
- Add a small **count chip** on each lens pill showing how many items that domain has (e.g. "Users 5") — only when domains are loaded, helps PMs pick the densest lens

## Files to change

- `src/pages/ComparePage.tsx` — add `lens` state, URL hash format `slugs|lens=key`, lens pill bar, conditional section rendering, larger focused layout, copy-link button, item-count chips on pills

No new files, no new routes, no edge function changes, no schema changes.

## Technical notes

- URL hash parser: split on `|`, first part = comma slugs, optional `lens=...` token
- Lens pill bar: horizontal scroll on mobile, wraps on desktop
- "Focused" mode just passes a `focused` boolean to `CompareSection` to bump padding, font sizes, and remove `line-clamp-2` on sub-text
- Keep the existing unique/shared detection logic — it already works per-section
