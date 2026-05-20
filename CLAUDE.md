# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project shape

Single-file static site: everything (markup, CSS, data, rendering, navigation) lives in `index.html`. There is no build step, no package manager, no test suite, no framework. Open `index.html` in a browser, or serve the directory (e.g. `python3 -m http.server`) to view it.

## Architecture

The page is a client-side, data-driven directory of adults-only / lifestyle / naturist resorts grouped by region.

Three logical layers, all inside `index.html`:

1. **Static shell (lines ~502–771)** — sidebar with hard-coded region buttons and per-region resort link lists, plus one `<section class="page" id="region-{slug}">` per region containing a hero, filter pills, search/sort controls, and an empty `<div id="resort-grid[-suffix]">` that JS fills in. There is also a single `<div id="detail-view">` that is reused for any resort's detail page.

2. **Data (lines ~777–~3045)** — two top-level constants:
   - `REGIONS` — keyed by region slug (`riviera-maya`, `punta-cana`, `nassau-bahamas`, `spain`).
   - `RESORTS` — flat array of resort objects. Each entry has `id`, `region` (must match a `REGIONS` key), `rank`, `tags` (drive the filter pills: `luxury`, `value`, `party`, `romance`, `privacy`, `beach`, `naturist`, `lifestyle`), `price_sort` (numeric, used for sorting), `ratings.overall` (used for sorting/cards), `sentiment.polarity` (used for sorting), plus `category_ratings`, `contact`, `description`, `highlights`, `considerations`, `reviews`, `hero`, `thumbnail`, `photos`.

3. **Render + nav (lines ~3047–end)** — `renderResortCard` and `renderDetailPage` produce HTML strings from a resort object. `showRegion`, `showResort`, `backToList`, `filterResorts`, `searchResorts`, `applyFiltersAndSearch`, `sortResorts`, `renderGrid` toggle the `.active` class on `.page` sections / `#detail-view` and re-render the appropriate grid. `DOMContentLoaded` seeds all four region grids on load.

### Region-suffix convention (important when adding a region)

Per-region DOM ids use ad-hoc suffixes that are hard-coded into ternaries in `showRegion`, `renderGrid`, `filterResorts`, `searchResorts`, `sortResorts`:

- `riviera-maya` → `resort-grid`, `resort-search` (no suffix)
- `punta-cana` → `resort-grid-pc`, `resort-search-pc`
- `nassau-bahamas` → `resort-grid-nb`, `resort-search-nb`
- `spain` → `resort-grid-es`, `resort-search-es`

Adding a new region requires: (a) an entry in `REGIONS`, (b) a sidebar `.region-btn` + `nav-{slug}` list, (c) a `<section id="region-{slug}">` with its own grid/search ids, (d) a new branch in every region→suffix ternary, (e) the slug added to the `['riviera-maya','punta-cana','nassau-bahamas','spain']` array inside `showRegion`, and (f) a `renderGrid(...)` call in the `DOMContentLoaded` initializer. The "+ Add Region" sidebar button is only an `alert`, not a real flow.

Adding a single resort is much cheaper: append an object to `RESORTS` and add one `<button class="resort-link" onclick="showResort('…')">` in the matching `nav-{slug}` block.

## Conventions

- All styling is in the `<style>` block at the top of `index.html` and themed via CSS variables on `:root` (`--gold`, `--teal`, `--bg`, etc.). Reuse these tokens instead of hard-coding colors.
- Detail pages and cards are built by string-concatenation in JS — there is no templating engine, so changes to the resort schema must be reflected in both `renderResortCard` and `renderDetailPage`.
- Sidebar resort links are matched back to active state by `textContent` comparison in `showResort`, so the visible label must equal the resort's `name` exactly.
