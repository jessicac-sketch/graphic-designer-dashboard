# Project History

A phase-by-phase record of the work on this project: what was done, the decisions behind it, and where things stand.
Release-level changes live in [`CHANGELOG.md`](../CHANGELOG.md); this file is the working log.

**How to update:** add a phase when work on a new area starts, keep its status current, and close it with a short summary when it is done. Newest phase at the bottom.

| Phase | Title                                                   | Status       |
| ----- | ------------------------------------------------------- | ------------ |
| 1     | Angular SSR removal (BFF stays)                         | ✅ Done      |
| 2     | NTV360 theme unification (gbp skin + UI standards)      | ✅ Done      |
| 3     | Code structure to gbp standards (shared/, split pages)  | ⏳ Planned   |
| 4     | New Dashboard (received playables)                      | ✅ Done      |
| 5     | Dashboard split into independent API calls              | 🟡 In review |
| 21    | Boilerplate: dummy data instead of Supabase / Hosts API | 🟡 In review |

---

## Starting point

Before this log started, the app was released up to **v1.3.0** (2026-09-20, see `CHANGELOG.md`), followed on `main` by the following (not yet in the changelog):

- Map View (US choropleth + state drill-down)
- Supabase Auth login through the BFF
- Category Ranking tab, Venue Profile page and global nav overlay
- State Ranking venue-modal export
- Per-ad slot tracking / per-venue slot count

The last commit on `main` before Phase 1 is `26e0484` (2026-09-29).

---

## Phase 1 — Angular SSR removal (BFF stays)

**Status:** ✅ Done (merged: PR #16 SSR removal, PR #17 dependency audit) · **Date:** 2026-10-09 – 2026-10-11 · **Branch:** `remove-ssr-keep-bff`, `chore/dependency-audit-fixes`

**Goal:** Turn the app into a client-side SPA with a standalone Express BFF and no server-side rendering. This prepares the codebase for the larger changes that follow. The setup mirrors `gbp-management-tool-ui` (its Phase 1).

**Why:** SSR kept breaking browser-only libraries:

- `ntv-table` and `ntv-skeleton` crashed on the server.
- `ntv-date-picker` needed `Option`/`getComputedStyle` polyfills.
- ECharts / ApexCharts could only run in the browser.

As a result, almost every page had `isBrowser` gates and "skip loading on the server" early returns. SSR gave no real benefit for an internal, login-only dashboard.

**Done:**

- **Removed Angular SSR:**
    - Packages: `@angular/ssr`, `@angular/platform-server`.
    - Files: `src/main.server.ts`, `app.config.server.ts`, `app.routes.server.ts`, `ssr-cookie-forward.interceptor.ts`.
    - Providers: `provideClientHydration()`.
    - `angular.json`: the `server` / `outputMode` / `ssr.entry` options.
    - Env config: `ALLOWED_HOSTS`, which existed only for Angular's SSR host validation.
- **Removed the `isBrowser` / `isPlatformBrowser` checks** in Dashboard, Ad Analytics, Ads Gallery, Analytics, Map View, Venue Profile, `us-states-map` and `daily-ads-bar-chart`. Templates no longer wrap tables, skeletons or charts in `@if (isBrowser)`, and comments that cited SSR were updated.
- **New standalone BFF entry `src/server/main.ts`** (moved from `src/server.ts`, history kept). It provides:
    - The same security headers, auth/media-files routes and generic `/api` proxy as before.
    - In production, it serves `dist/.../browser` with an `index.html` fallback for client-side routes.
- **Build:** `npm run build` = `ng build` (SPA), then `tsc -p tsconfig.server.json` (BFF type-check), then `scripts/build-server.mjs` (esbuild bundle). The output is `dist/programmatic-reports/{browser,server/server.mjs}`.
- **Dev:** `npm start` runs the Angular dev server (`:4200`) and the BFF (`:4000`, `tsx watch`) together through `concurrently`, with `/api` proxied via `proxy.conf.json`.
- **Scripts:**
    - Added: `start:ui`, `start:bff`, `build:ui`, `build:bff`, `serve`, `serve:dev`.
    - Removed: `start:dev`, `start:ssr`, `start:ssr:dev`.
    - New dev dependencies: `concurrently`, `tsx`, `esbuild`.
- **Docs updated:** `README.md`, `WARP.md`, `AUTHENTICATION.md`, `BFF-ARCHITECTURE.md`, `SECURITY-HEADERS.md`, `.env.README.md`. `.claude/launch.json` also changed (`programmatic-reports-ssr` became `programmatic-reports-built`).
- **Dependency audit (2026-10-11):** fixed everything that didn't need a breaking change. `npm audit` went from 18 (on the committed lockfile) to 12; a fresh unlocked install showed 14.
    - Added an npm `overrides` entry so `exceljs` uses `uuid@^11.1.1` instead of its vulnerable `uuid@8.3.2` (GHSA-w5hq-g745-h8pq). `exceljs` only calls `uuid.v4()`; XLSX generation was smoke-tested.
    - Patch/minor updates within the existing `package.json` ranges: the Angular framework 21.2.23 → 21.2.25, `@angular/build`/`cli` → 21.2.26, `piscina` (critical), `http-cache-semantics`, `source-map-js` and `@modelcontextprotocol/sdk`. `@ntv360/component-pantry` also moved 0.7.11 → 0.7.12.
    - No `npm audit fix --force` and no major upgrades. The remaining 12 have no upstream fix (see Known quirks).

**Decisions:**

- BFF only, no SSR. The browser talks only to `/api/*` on the BFF, and the session stays in httpOnly cookies.
- `@supabase/ssr` stays. It is the BFF's cookie-based Supabase Auth client, not Angular SSR.
- The generic `/api` catch-all proxy (`http-client.service.ts`, `API_BASE_URL`) is kept for now. Removing it is separate cleanup.
- No `trust proxy` on Express, the same as before. Angular's `trustProxyHeaders` only ever applied to SSR rendering.
- `MediaFilesService`'s request timeout is kept, since it still stops hung requests from leaving the UI loading forever.

**Verified:** `npm run build` succeeds (SPA + BFF type-check + bundle).

**Deploy (Render):**

- Build command: `npm ci --include=dev && npm run build`. `--include=dev` is required: with `NODE_ENV=production` set, npm skips dev dependencies and the build fails with `ng: not found`.
- Start command: `npm run serve` (was `npm run start:ssr`).

**Summary:** Merged to `main` (`68e937b`). The CHANGELOG entry is left for the next release.

---

## Phase 2 — NTV360 theme unification (gbp skin + UI standards)

**Status:** ✅ Done (merged: PR #18) · **Date:** 2026-10-11 · **Branch:** `feat/refactor-and-improve-ui-theme`

**Goal:** Give Programmatic Reports the same UI as `gbp-management-tool-ui`, the reference for unifying the theme of every NTV360 tool, and adopt its UI coding standards. This covers both the skin and how the UI is built.

**Done:**

- **Theme foundation (copied from gbp):**
    - `src/styles/`: `_theme.scss` (navy surfaces, orange brand, status and text tokens), `_pantry-dark-fixes.scss`, `_sharp-corners.scss`, `_typography.scss` (DM Sans everywhere), `_scrollbars.scss`.
    - `tailwind.config.js`: `surface-*`, `field-*`, `status-*`, `brand-*`, `content-*` tokens and DM Sans / DM Mono.
    - `index.html`: `<html class="dark">`, `color-scheme: dark`, DM Sans + DM Mono, and gbp's Font Awesome kit (Sharp Regular).
    - `styles.scss` rebuilt on the partials. The global `.page` and Dashboard ad-preview styles are retokenized.
- **App shell (gbp's):**
    - `layout/authenticated/{sidebar,topbar,user-menu}`: brand logo with an "Adexchange Performance" caption (the product name shown in the sidebar and its footer), a "Menu" label, nav items with an orange active edge, and the app version in the footer.
    - Topbar with the user menu (initials avatar, email, Log out).
    - Off-canvas nav drawer on small screens (`ntv-offcanvas`).
    - The "Please wait" navigation overlay is kept and restyled.
    - The old `shared/components/sidebar` and its PNG logo are gone.
- **Login:** gbp's page: centered outlined card, large brand, reactive form with field validation, error toast, and the gradient primary button.
- **Shared building blocks (copied from gbp, one item per file):**
    - Components: `app-brand`, `app-page-header`, `app-metric`, `app-summary-card`, `app-dialog`.
    - Pipe: `initials`.
    - Models: `MAIN_NAV_ITEMS`, `APP_VERSION` (from `package.json`; `resolveJsonModule` on), `BrandSize`, `MetricTone`/`MetricLayout`/`DialogActionTone`, `CHART_COLORS`/`CHART_FONT`.
    - Interface: `NavItem`.
    - New here: `CARD_CONFIG`, the flat outlined `ntv-card` look that replaces the per-page "elevated / shadow md / rounded lg" configs.
- **Every page reskinned:**
    - `<app-page-header>` (eyebrow, title, subtitle) on Dashboard, Ads Gallery, Ad Analytics, Map View, Venue Profile, Analytics and Settings.
    - All page SCSS on theme tokens: no hex or Tailwind palette colors left in `features/` or `layout/`.
    - Dashboard stat cards keep their filter behavior with `app-metric`'s look: outlined, colored left edge, mono label. Their POP bucket badges are outlined in the status colors, and the active filter gets a brand edge and tint.
    - Pills are outlined brand chips (selected state, ads total, venue category, chart total).
    - The export button, copy button and drill-down modal header are restyled.
    - Every icon is Sharp Regular (was duotone light/solid).
- **Pantry dark fixes for components gbp doesn't use** (new section in `_pantry-dark-fixes.scss`):
    - `ntv-table` beyond gbp's container fix: the body and header paint from the pantry's `--body-bg-color` (white) and `--header-bg-color` variables, so rows stayed light. They're now pointed at the raised surface, along with cell text, sort buttons, column filters, the empty state, the column settings panel and the loading overlay.
    - `ntv-table` header filter icon (an inline SVG with a hard-coded navy `#091635` stroke, now `currentColor`) and the `ntv-column-filter` filter/sort popup (title, inputs and select, focus state, Clear button).
    - `ntv-skeleton`: navy placeholders.
    - `ntv-date-range-picker` / `ntv-date-picker`: dark trigger and calendar; brand orange replaces the pantry's red for today, selection and hover; the range uses `brand-soft`.
- **Charts:**
    - `CHART_COLORS` extended with `primary`, `surfaceBase`, `surfaceRaised`, `hover`, `mask`, a sequential `scale` and a categorical `series` palette.
    - US map: navy "ocean", raised-navy empty states, a navy-to-teal choropleth, orange selection only (hover is neutral), and dark tooltip and labels.
    - Daily ads chart: brand Total series, device lines from the series palette, dark axes, legend, tooltip and loading mask.
    - ApexCharts (Analytics, Ad Analytics): `theme.mode = 'dark'`, transparent background, DM Sans, theme grid and brand series.
    - POP bucket colors (`pop-duration.util.ts`) now follow the status tokens.
- **Docs:**
    - `docs/STANDARDS.md` rewritten from gbp's: one thing per file, startup-path imports, the UI component and theme rules, `ChangeDetectionStrategy.Eager`, and commit rules corrected to what commitlint accepts.
    - Added `START_HERE.md` (briefing for AI assistants) and `docs/COMPONENT_PANTRY_SKILL.md` (from gbp).

- **Dashboard renamed to Ranking Data (2026-10-11):** the existing Dashboard becomes **Ranking Data**, making room for a new Dashboard focused on recent data (Phase 4).
    - The feature moved to `features/ranking-data/` (`RankingDataComponent`, `app-ranking-data`).
    - Route `/ranking-data`, which `/` redirects to. `/dashboard` temporarily redirects there so existing links keep working.
    - Sidebar item "Ranking Data" (`ranking-star` icon); page header "Rankings · Ranking Data".
    - BEM blocks and test ids renamed (`ranking-data__*`, `ranking-data-*`), and the "Back" fallbacks in Ad Analytics / Venue Profile go to `/ranking-data`.
    - The shared ad preview modal styles became a neutral global `.ad-preview` block (used by Ad Analytics). Venue Profile's copied mini-stat classes became `venue-profile__mini-stat*`.
    - The first tab, "Programmatic Ads", is now **"Received Playables"**, and so are its exports: the CSV/XLSX file names (`received-playables-<date>`) and the XLSX title and sheet name. The API routes stay `/programmatic-ads`.
    - Kept on purpose: the API/data names (`DashboardAnalytics`, `getDashboardAnalytics`, `/dashboard-analytics`), since they name the backend endpoint, and the tables' `storageKey`s (`dashboard-*`), since renaming them would reset everyone's saved column settings.

**Decisions:**

- **gbp is the reference.** Its theme partials and shared components are copied verbatim where possible, so changes can flow between the tools. App-specific additions are kept in their own clearly marked places (the second section of `_pantry-dark-fixes.scss`, extra `CHART_COLORS` keys).
- **Skin first, structure second:**
    - Moving `core/models` and `core/services` into `shared/{interfaces,models,services}` and splitting the 3,000-line Dashboard is Phase 3, in its own PR, so this diff stays reviewable.
    - New code in this phase already follows gbp's file layout.
    - Routing (gbp lazy-loads its layouts) is also left for Phase 3.
- **Small adaptations to gbp's pieces:**
    - The user menu has no Settings item, because Settings here is still a hidden "coming soon" page.
    - The user menu shows the email's local part, because users have no display name.
- **Font Awesome:** switched to gbp's kit (Sharp Regular), so icons match across tools.
- **Sharp corners, strictly (2026-10-11):**
    - `_sharp-corners.scss` gained `#app-sharp-corners` in its `:not()`, which gives the global rule ID-level specificity. gbp's plain `*` rule lost to component-pantry radii forced with `!important` on more specific selectors: date picker selected days, round skeletons, and the table's column-settings button. Worth upstreaming to gbp.
    - Chart shapes CSS can't reach now match gbp: ApexCharts bars use `borderRadius: 0`, with square markers and legend markers; ECharts uses square legend icons and line symbols.
    - The leftover `border-radius` declarations in page styles are removed.
- **Copy:** the Dashboard subtitle changed from "Welcome to the Programmatic Reports Dashboard" (redundant under the new eyebrow) to a one-line description.

**Verified:** `npm run build` succeeds.

**Pending:**

- **Visual check by the user.** Signed-in pages can't be opened by the agent. Check:
    - Login, the sidebar and topbar (and the mobile drawer).
    - Ranking Data (was Dashboard): stat cards and their active state, tabs, tables, date-range pickers and calendar, drill-down modals, the ad preview modal, exports.
    - Ads Gallery, Ad Analytics, Map View (map colors, selection, panels) and Venue Profile (chart).
- Confirm gbp's Font Awesome kit loads on this app's domains (Font Awesome kits can be restricted by domain). If icons are missing, add the domains to the kit or switch back to this app's kit.
- gbp's global `ntv-table` rules also apply here: cells size to their content (no 100px minimum), and tables scroll inside after about 15 rows. Check that the wide Dashboard tables still read well.

## Phase 3 — Code structure to gbp standards (planned)

**Status:** ⏳ Planned · **Branch:** _(new, after Phase 2 merges)_

**Goal:** Bring the existing code in line with `docs/STANDARDS.md` §4:

- Move `core/models` and `core/services` (and the interfaces and types declared inside components and utils) into `shared/{interfaces,models,services}`, one item per file.
- Use `ChangeDetectionStrategy.Eager` and full JSDoc everywhere.
- Move inline component templates and styles into files (export button, copy button, drill-down modal).
- Split Ranking Data (≈3,000 lines of TS, 1,500 of HTML) into tab components under `features/ranking-data/components/`.
- Lazy-load the layouts and every page, like gbp.

## Phase 4 — New Dashboard (received playables)

**Status:** ✅ Done (merged: PR #19; the data layer was reworked in Phase 5) · **Date:** 2026-10-11 · **Branch:** `feat/dashboard-page`

**Goal (client feedback):** show _uniqueness_ in what was received:

- which unique ads, states and venues received playables;
- received per hour, in a chart;
- each unique item's share of the total received (e.g. ad 1 = 3.2% of 5,000 received);
- default to **yesterday**, the most recent complete day.

**Done:**

- **BFF: `GET /api/media-files/dashboard-summary?startDate&endDate`** (both required, `YYYY-MM-DD`, at most 31 days; 400 otherwise). It returns:
    - totals: received, unique ads / venues / states, and how many were received without a venue;
    - the timeline: 24 zero-filled UTC hours for one day, or one zero-filled entry per day for a range;
    - the ad, state and venue breakdowns.
    - It uses **one** fetch of the range's rows and one Hosts API lookup. Calling the three ranking endpoints separately would fetch the same rows three times.
    - Venues and states reuse `buildHostRanking()` / `buildStateRanking()`, so they match Ranking Data exactly.
    - Ads use a new `buildAdShares()`. Unlike `buildTopAds()`, it keeps creatives that have no media file, so the shares add up to the total. Verified with fake records: the hourly sum, ad sum and zero-filling all hold.
- **Dashboard page** at `/dashboard` (the landing page, first in the sidebar, lazy-loaded because of echarts). The temporary `/dashboard` → `/ranking-data` redirect is gone.
    - Header: the active range ("Yesterday · Oct 10, 2026"), a "Yesterday" button to return to the default, and the date-range picker. Wider picks are clamped to 31 days with a notice; clearing the picker returns to yesterday.
    - `app-metric` tiles: Received (brand), Unique ads, Unique venues, Unique states.
    - "Received per hour (UTC)" chart (per day for a range), reusing `DailyAdsBarChartComponent` with a new optional `totalLabel` input ("Received"; it defaults to "Total Ads", so Map View and Venue Profile are unchanged).
    - **Ads / States / Venues** cards (`app-summary-card` with "View all" to Ranking Data / Map View). Each row shows rank, thumbnail (ads), name and caption, **% of total received**, the count and a bar. The top 10 show, with "Show all" scrolling inside the card. Ads link to Ad Analytics, venues to Venue Profile. A footnote shows how many were received with no venue (counted in the total but in no state or venue).
    - Loading: skeletons on first load. Later range changes dim the previous numbers, and a newer pick cancels an older request (`switchMap`). There's an error with Retry.
- **Follow-ups from the first review (2026-10-11):**
    - Venue rows show the **venue ID** under the name ("VV-102938 · Newberg, OR").
    - **Unique categories** added end to end: `uniqueCategories` and `categories` in the summary (reusing `buildCategoryRanking()`, so they match Ranking Data's Category Ranking), a "Unique categories" metric tile, and a Categories list.
    - **70/30 row:** the received chart (70%) with the Categories list (30%) on its right, showing the **top 5**. Ads, States and Venues stay three across below.
    - **Mini breakdowns:** Ads, States and Categories show the top 5 (`DASHBOARD_TOP_LIMIT`); Venues shows the top 10 (`DASHBOARD_LIST_LIMIT`).
    - **Ads card split in two:** the top 5 ads, then below a rule **"States for <ad>"**, the picked ad's top 5 states as a share of _that ad's_ received. The top ad is picked by default; clicking or pressing Enter on another row switches it, and clicking the name still opens Ad Analytics.
        - Each ad in the summary now carries `states` (`DashboardAdStateShare[]`), computed in the same pass from the venue→state map. Rows with no venue count as "No venue", so an ad's states add up to 100%.
        - `app-share-list` gained an optional `selectable` mode (`selectedId` / `selectItem`), with the selected row on a brand edge and tint.
    - **Layout v2:**
        - Top row 45 / 27.5 / 27.5: received chart, then Venues and Categories splitting the rest. On medium screens the chart spans the row and the two lists sit side by side below it.
        - Below, stacked full width: States, then Ads. Each card is split in half (stacked on smaller screens): the top 5 on the left, and the picked row's breakdown on the right.
            - **States, in three columns (40 / 30 / 30), mirroring Ads:** top states → **"Ads in <state>"** (selectable; caption "source · N venues") → **"Venues for <ad>"**: the venues in the picked state that _received_ the picked ad, each as a share of the ad's total received. The venue rows come from the same `adVenueItemsInState()` helper the Ads card uses. Header hint: "Pick a state to see its ads, then an ad to see its venues." Ad shares in a state are of that state's received and add up to 100% (both use the same venue→state map).
            - **Ads, in three columns (40 / 30 / 30):**
                - Top ads → **"States for <ad>"** (selectable) → **"Venues in <state>"**: the venues that _received_ the picked ad (by `fetched_at`) in the picked state. Each is shown as a share of **the ad's total received** (e.g. "venue 1 in Texas received 50% of this ad").
                - Each ad in the summary carries `venues` (`DashboardAdVenueShare[]`, from the same pass). A "played only" filter was tried and dropped: the user wants received, and on finished days played ≈ received anyway (Oct 9: 5,360 of 5,361).
                - Long ad titles (UUID file names) are shortened in the middle (`truncateMiddle(title, 10, 8)`, keeping the extension), with the full name on hover (`ShareItem.fullName`).
            - **Instructions in the card header:** a one-sentence `hint`, centered in `app-summary-card`'s header (new optional input; hidden on small screens). Ads: "Pick an ad to see its states, then a state to see its venues." States: "Pick a state to see its ads." These replace the hint lines under the lists.
            - `app-share-list` also gained `showShares` (hide the % / count / bar for a plain list).
        - Every list now shows the top 5 (`DASHBOARD_TOP_LIMIT`); `DASHBOARD_LIST_LIMIT` is removed.
    - The login page's brand caption is now **"Adexchange Performance"**, matching the sidebar. The chart's series stays **"Received"** (with Unique Venues alongside); "Received Playables" was tried but got cut off as the Y-axis title.
    - **Metric row:**
        - **Received** carries the proof-of-play duration buckets on its right: green 1-5 min / yellow 6-10 / red over 10. They come from the same DB query as Ranking Data's mini stats (`getProgrammaticAdsStats`, run in parallel inside the summary as `pop`), so they match. No "No POP" bucket (dropped at the user's request).
        - The Received column is `fit-content(40%)`, with room reserved for 5-digit days (`xl:min-w-[27rem]`, and each POP count at least "99,999" wide) so it doesn't jump as numbers grow; the other four tiles split the rest. The buckets wrap under the value when the tile is narrow, so long numbers never overflow.
        - **Unique venues / devices**, e.g. "407 / 420": a venue can have several devices. `totals.uniqueDevices` counts distinct `device_id`; the device count and the "devices" part of the label are in the accent color (the count also smaller).
        - `app-metric` gained (additively) an optional `[metric-aside]` slot (`hasAside`), optional `secondaryValue` / `secondaryLabel`, and thousands separators on the value.
    - **Ads sort** (`app-sort-control`, copied from gbp, in the Ads card header): Received (default) / States (most states first) / Venues (most venues first); ties go by received. Rank numbers and the default pick follow the sort, and the highlighted row is always the ad being broken down (`selectedAdRowId`). Ad captions show "source · N venues · N states" (known states only, like the Unique states tile).
    - **States card: sort and 30 / 40 / 30.** It has the same sort control as Ads: Received / Ads (most unique ads) / Venues, ties by received; the default pick follows the sort. Its columns are 30 / 40 / 30 (the middle column has ad thumbnails); Ads stays 40 / 30 / 30.
    - **Column headings:** the first column of each card is headed like the breakdowns ("All unique ads received", "All states received"), so all three columns line up under a heading.
    - **Sort direction:** both sorts go both ways. Clicking the active option reverses it (an arrow shows the direction: down = most first, up = fewest first); picking another option starts at most first. Ties go by received in the same direction. `app-sort-control` gained optional `direction` / `directionChange` (without them it behaves exactly like gbp's), plus a `SortDirection` type.
    - **"Show all" scrolls in place:** `app-share-list` measures its collapsed height and keeps it when expanded, so the extra rows scroll inside the card instead of making it taller.
- **New shared pieces (gbp layout):**
    - `app-share-list`: the share-of-total sibling of gbp's `ranked-list`.
    - Interfaces: `ShareItem`, `DashboardSummary` / `DashboardTotals` / `DashboardAdShare` / `DashboardRange`.
    - Models: `DASHBOARD_MAX_RANGE_DAYS`, `DASHBOARD_TOP_LIMIT`, `DashboardTimelineGranularity`.
    - Service: `DashboardSummaryService`, the first service under `shared/services/`.

**Decisions:**

- **"Yesterday" is the previous UTC day.** Every range in the app uses UTC calendar days, and a UTC day is complete once it's over everywhere. A local "yesterday" in the Philippines (UTC+8) would still be in progress until 8 AM.
- **Percentages are against all received** (the client's definition), including received rows with no venue. That's why venue and state shares can add up to slightly under 100%; the footnote says by how much.
- **"Unknown" stays visible, and the counts agree.** Venues the Hosts API doesn't know (Oct 9: 2 venues, 18 received) have no state or category. They stay in the States and Categories lists as "Unknown state" / "Unknown category" (users should see them). The tiles read "Unique states / unknown: 36 / 1" and "Unique categories / unknown: 177 / 1", so the list's "Show all 37" is visibly 36 + 1. The "/ unknown" part only appears when there is an unknown bucket. The "1" is clickable and opens **"Venues with no known state / category"** (`app-dialog`), so the tech team can fix them in the Hosts API. It lists venue ID (with copy), name ("Not in Hosts API" when missing), city, state, category and received, and has a **"Copy venue IDs"** action (one per line). Oct 9: `nc-698ace1fa3c5` (17) and `nc-167436a19cc0` (1), both missing from the Hosts API. `app-metric` gained optional `secondaryClickable` / `secondaryActionLabel` / `secondaryClick`.
- **Numbers audit (Oct 9, read-only against production):** unique ads 171 = list; unique venues 407 = list; received 5,361 = sum of ads = sum of venues = sum of states = sum of categories = timeline sum = POP total. Every ad's state slices and venue slices add up to its received, and every state's ad slices add up to the state's received. The only mismatch found was the Unknown bucket above, now resolved. Re-run this audit (`numbers-audit` script in the session scratchpad; easy to recreate) after any change to the summary.

**Pending:**

- Visual check by the user: the default load (yesterday), picking a single day and a range, "Show all", the Ads/States/Venues links, and the chart.
- Decide whether the breakdowns need export (not requested yet).

## Phase 5 — Dashboard split into independent API calls

**Status:** 🟡 In review (built and type-checked; not yet timed in the browser) · **Date:** 2026-10-11 · **Branch:** `feat/dashboard-split-api`

**Goal:** the Dashboard waited for one slow request before showing anything. Make each card render as soon as its own data is ready.

**Why:** Phase 4's single `GET /dashboard-summary` was a chain on the server: media files + the range's rows + POP stats in parallel, then the Hosts API (it needs the venue IDs from the rows), then aggregation. Everything on the page read one `summary()` signal, so Received, POP and the hourly chart (which need only the rows) waited for the Hosts API and the media-files fetch (which only supply names, states and thumbnails).

**Done:**

- **Three calls replace `dashboard-summary`** (same `startDate` / `endDate`, both required, at most 31 days; the old route is gone):
    - `GET /api/media-files/dashboard/overview`: received, unique ads / venues / devices, without-venue, POP buckets, timeline. Needs only the rows.
    - `GET /api/media-files/dashboard/geography`: venues (slim: ID, name, city, state, category, received), states, categories and the unique-states/categories counts. Needs the Hosts API.
    - `GET /api/media-files/dashboard/ads`: every distinct ad with its venues and a `withoutVenue` count. Needs media files, not the Hosts API.
    - Each response carries `received`, so every section computes its shares without waiting for another.
- **An ad's state split is derived in the browser** from its venues + the geography call's venue → state map (venues missing from the Hosts API are "Unknown", rows with no venue are "No venue"), so the ads call no longer depends on the Hosts API. Checked equal to the old server computation on fixture data.
- **Range rows cache** (`range-records-cache.service.ts`): the three calls share one scan. It caches the in-flight promise, 5 min TTL, 4 ranges at most, and a failed fetch is dropped.
- **Hosts lookup cache** in `HostsApiService.searchByVenueIds`: found hosts for 5 min, **misses are never cached**. Short on purpose: the Unknown-venues dialog promises "fix it in the Hosts API and it's counted on the next load". Every page that calls it benefits.
- **Media files by creative ID** (batches of 50, in parallel) instead of `getMediaFiles({ limit: 10000 })`: avoids the `select *` of up to 10k rows and the risk that Supabase's default 1,000-row cap silently dropped titles/thumbnails.
- **Geography is strict about the Hosts API:** if it fails the call fails (the cards show Retry) instead of quietly turning every venue into "Unknown". Other pages keep the old fallback. `buildHostRanking` takes `{ strictHosts, withExtras }`; the Dashboard skips schedules / expected requests / screenshots it never read.
- **Per-card loading and errors:** `DashboardComponent` holds three sections (`overview`, `geography`, `adsSection`), each with data / loading / error / reload, loaded in parallel and cancelled by a newer range (`switchMap`). Each card has its own skeleton and its own Retry (`app-section-error`, new shared component). A failed section clears, so numbers from another range are no longer shown under the new range's label (a Phase 4 bug). The Ads "States" sort and the "N states" caption are 0 until geography lands.
- **Smaller fixes:** the range validation now rejects impossible dates like `2026-13-45` (400, not 500) and has its own `MAX_DASHBOARD_RANGE_DAYS`; `venuesById` is built once instead of per ad; client timeout 180 s → 60 s.
- **Timing logs:** each call logs `[Dashboard] <section> <ms>ms rows=<n> range=...`, so the BFF log shows which part is actually slow.

**Verified:** `npm run build` succeeds; a throwaway fixture script (not committed) checked sum(ads) = sum(venues) + without-venue = sum(states) = sum(categories) = timeline sum = received, slim venues, derived ad states = the old server-side ones, and that a Hosts failure rejects.

**Pending:**

- **User check in the browser:** three parallel `dashboard/*` calls; Received / POP / chart appear first, then states, venues, categories and ads; a failed call shows Retry on its own cards only. Read the BFF timings to see whether the row scan, the Hosts API or the media files dominate.
- If the scan itself is the bottleneck, the next step is SQL aggregation (GROUP BY hour / creative / venue) in Supabase (needs the table schema first, see `WARP.md`). Compression middleware and the Phase 3 component split are also still open.

**Also in this phase**

- **Dashboard range limit:** the picker and the BFF (`MAX_DASHBOARD_RANGE_DAYS`) now allow at most 7 days (was 31); wider picks are clamped to the last 7. The clamp notice is a dismissible (×) warning box, content-width, tinted with the warning color.
- **Same-range guard:** re-picking the current Dashboard range (or "Yesterday" while already on it) no longer reloads - `setRange()` skips an unchanged range.
- **All-time scans share the row cache** too (the range cache accepts open-ended ranges). Map View's all-time load fires three calls at once, and three concurrent full scans made the replica reject two of them (`fetch_failed` on state/ad ranking).
- **Version:** 1.3.0 → 1.4.0.
- **Expected Reqs rate:** `AD_REQUESTS_PER_MINUTE` in `expected-requests.util.ts` went from 2 to 10 (players request 10/min), so an 8 h venue is 4,800, not 960. It is per venue (not multiplied by device count) and an upper bound.
- **Map View:** the ads table and daily chart no longer wait for the state ranking when nothing is selected - all three calls start together; a new range or state cancels stale in-flight requests. Server side, `getRangeRecords()` routes every bounded-range scan (state / venue / category ranking, ad ranking, ads-by-venues, daily summary) through the shared range cache, and ad ranking / ads-by-venues fetch media files by creative ID instead of a 10k-row `select *`. Side effect: Ranking Data numbers for a bounded range can be up to 5 min old.

---

## Phase 6 — Ad Analytics: where the ad was received

**Status:** 🟡 In review (v1.5.0) · **Date:** 2026-10-11 · **Branch:** `feat/ad-detail-breakdown` (from `feat/dashboard-split-api`)

- **Removed** the 8-week sparkline (Apex area chart) from the single-ad page (`/ad-analytics/:id`); it showed little. The page no longer imports `ng-apexcharts` or builds chart options.
- **Added a "Where it was received" card** (same `app-summary-card` + `app-share-list` look as the Dashboard): a States list (play count, % of the ad's plays, "N venues") and a Venues list for the picked state (all venues until one is picked), each venue linking to its profile with "City, ST". Plays with no venue are noted under States. Shares are taken against the sum of the per-venue play counts.
- **Data:** reuses `GET /api/media-files/:id/locations` (venue stats for the creative + Hosts API) instead of the 100-row-limited play-records call, so the shares are over all plays. `LocationsService` now keeps venues the Hosts API doesn't know (state `Unknown`, named by venue ID) instead of dropping them, so the numbers add up. Own skeleton and Retry (`app-section-error`).
- Lists show the top 5 rows; "Show all" scrolls inside the card (as on the Dashboard). Venue rows show the venue ID under the name.
- Play Records tab, search and POP-duration filter are unchanged.

---

## Phase 7 — Ads Gallery: sort and filter sidebar

**Status:** 🟡 In review (v1.5.0) · **Date:** 2026-10-11 · **Branch:** `feat/ad-detail-breakdown` (with Phase 6)

- **Sidebar** left of the gallery (gbp Businesses layout: 300px, sticky): search (debounced, now wired - the old header search did nothing), `app-sort-control` with Plays / Newest / Duration and asc/desc, and a "Type" `app-filter-list` (All ads / Videos / Images with counts). `filter-list` + `FilterOption` are copied verbatim from gbp-management-tool-ui. Any change reloads from page 1; Load More keeps the query; stale responses are dropped (switchMap). Cards show all-time plays when sorted by plays. One column fewer per breakpoint to fit the sidebar.
- **BFF:** `GET /api/media-files` takes `sort` (newest | plays | duration), `direction`, `type` (400 on bad values); new `GET /api/media-files/type-counts?search`. Newest / Duration are plain ordered queries (no-duration last; created_at, id as tie-breakers). Plays calls the RPC below.
- **SQL (applied in Supabase 2026-10-11; Plays sort confirmed working):** `migrations/add_programmatic_ads_creative_index.sql` (B-tree on `(creative_id, creative_source)`, `CONCURRENTLY`, run alone) then `migrations/get_media_files_by_plays.sql` (all-time play count per media file, paged, filter by type/search). Without the function the Plays sort returns an error, so apply both on any new environment.
- **Known cost:** the RPC counts the whole `programmatic_ads` table on every Plays page. If it is slow even with the index, the next step is a periodically refreshed materialized view of counts per creative.

---

## Phase 8 — Ranking Data: loading fixes

**Status:** ✅ Done (merged: PR #22, v1.5.1) · **Date:** 2026-10-11 · **Branch:** `fix/ranking-data-loading` (from `main` after PRs #20 and #21)

The six page-load calls already ran in parallel in the browser; the waiting was on the server.

- **Stat cards (`getDashboardAnalytics`)** no longer run their own uncached all-time scan next to the four rankings' shared one (two concurrent full scans is what failed Map View); they use `getRangeRecords()` too.
- **All media files, not 1,000:** the stat cards read `getMediaFiles({ limit: 10000 })`, which Supabase silently caps at 1,000 rows. New `supabaseClient.getAllMediaFiles()` counts, then fetches 1,000-row pages concurrently.
- **Hosts lookups shared while in flight:** venue / state / category rankings asked the Hosts API for the same venues at the same moment (the 5-min cache only helps after a lookup lands). `HostsApiService` now keeps a per-venue in-flight promise; concurrent callers join it. Failures aren't remembered. Checked with a stubbed API: 3 concurrent lookups → 2 API calls.
- **Stale responses:** each table (and the stat cards) keeps its in-flight request; a reload cancels the previous one, and leaving the page cancels all.
- **Ads Gallery checked, no change needed:** its list and type-count calls are independent and touch neither the row cache nor the Hosts API. Watch the Plays sort (the RPC recounts `programmatic_ads` per request; next step would be a materialized view) and consider `preload="metadata"` on gallery videos.
- **Not changed:** every table still defaults to all-time, so a cold first load still scans the whole table. Defaulting to a bounded range is a product call.

---

## Phase 9 — Per-page browser tab titles

**Status:** ✅ Done (merged: PR #23) · **Date:** 2026-10-11 · **Branch:** `feat/page-titles`

- Every route has a `title` ("Dashboard · NTV360 AdExchange", "Sign in · NTV360 AdExchange", …), so the browser tab changes on navigation - gbp-management-tool-ui's pattern (Angular's built-in route titles, no custom `TitleStrategy`). Names match the sidebar; detail pages are "Ad Analytics" and "Venue Profile". The suffix matches `index.html`'s `<title>`.
- **Venue Profile thumbnails (on `main` directly):** the play-records table's creative and proof-of-play screenshot thumbnails now use Ranking Data's box - a fixed 80×45 `block` with `max-width: none`, so both columns match - and a missing screenshot shows a "--" box of the same size instead of bare text.

---

## Phase 10 — List and title polish (on `main` directly)

**Status:** ✅ Done (v1.5.2) · **Date:** 2026-10-11 · **Branch:** `main`

- **Share list rows all the same size:** every `app-share-list` row is now the same padded box (`px-3 py-2.5`, no gap between rows), selectable or not; only the selected row gets the brand tint and edge. Read-only lists (e.g. "Venues in Texas") used to have no padding and a gap instead, so they looked smaller than the selectable ones. Applies to the Dashboard's Ads and States cards and the Ad Analytics breakdown.
- **Column titles:** the dynamic name in a column title ("States for <ad>", "Venues in <state>", "Ads in <state>") now uses the title's own size and font, bold, in the brand color (case kept), instead of a larger white sans name. Dashboard (`__split-name`) and Ad Analytics (`__breakdown-name`).
- Also on `main` since Phase 9 merged (PR #23): the Venue Profile thumbnail fix (`2ce147d`, see Phase 9).

---

## Phase 11 — One 12px gap between cards on every page (on `main` directly)

**Status:** ✅ Done (v1.5.3) · **Date:** 2026-10-11 · **Branch:** `main`

The Dashboard's stat-tile gap (12px, `gap-3` / `0.75rem`) is now the spacing between every card on every page.

- **Global:** `.page` (styles.scss) `gap-6` → `gap-3`: header, filters and cards on every page.
- **Dashboard:** page stack, overview row and breakdowns stack `gap-6` → `gap-3` (stat tiles were already `gap-3`).
- **Ranking Data:** stat cards `gap-4` → `gap-3`. **Map View:** map column / panel and map / chart 24px → 12px. **Venue Profile:** profile / chart 24px → 12px, extra 24px bottom margin removed. **Ad Analytics:** after the ad card and the breakdown card 24px → 12px. **Analytics:** chart grid gap and top margin, Top 5 top margin and card spacing → 12px.
- **Ads Gallery:** sidebar / gallery 24px → 12px; inside the gallery 12px between ad cards at every width (was 16px from 1920px) and 12px padding around them (was 24px).
- Spacing inside cards (padding, column gaps) unchanged.

---

## Phase 12 — Collapsible sidebar, fold button in the top bar (on `main` directly)

**Status:** ✅ Done (v1.5.3) · **Date:** 2026-10-11 · **Branch:** `main`

The sidebar can fold to an icon-only rail, and the fold button lives on the left of the top bar instead of at the bottom of the sidebar.

- **Rail:** from 992px the sidebar is full width and can be folded to a 64px icon rail (labels become tooltips, the square NTV360 mark replaces the wordmark and caption; the choice is remembered per browser in `localStorage`). Below 992px it is always the rail, and the button opens the full navigation as a slide-in drawer instead of squeezing the page.
- **Button:** `app-topbar` has it (`toggleLabel` / `expanded` inputs, `sidebarToggle` output), and `AuthenticatedLayoutComponent` wires it to the fold logic and sets its tooltip ("Collapse navigation" / "Expand navigation" / "Open navigation menu") and `aria-expanded`. The sidebar itself is just brand, nav and footer (its `showToggle` / `collapseToggle` plumbing is gone).
- **Icon:** a custom inline SVG (square panel with a sidebar section) rather than Font Awesome's hamburger, which looked wrong in the sharp style. The section is filled with the brand accent while the menu is open and empty when folded.

---

## Phase 13 — Font sizes in rem (on `main` directly)

**Status:** ✅ Done · **Date:** 2026-10-11 · **Branch:** `main`

Pixel font sizes don't follow the user's browser / OS text-size setting, which matters for accessibility and for phones set to larger text. Tailwind's `text-xs` / `text-sm` / ... were already rem; the hand-written ones were not.

- **Tokens** in `tailwind.config.js` (`theme.extend.fontSize`, font size only, no line height): `text-label` = `0.6875rem` (11px, the uppercase mono labels) and `text-micro` = `0.625rem` (10px, tags and badges).
- **33 pixel sizes replaced in 16 files:** 19 × `text-[11px]` → `text-label`, 12 × `text-[10px]` → `text-micro`, 2 × `text-[13px]` → `text-[0.8125rem]`. Identical at the default 16px root, so nothing changes visually; it only scales with the user's setting now. Verified in the build output (19 / 12 rem rules, no px left from our code).
- **Left alone on purpose:** ApexCharts / ECharts `fontSize` options (drawn inside the chart), fixed widths such as `w-[35px]` (not text), and the px utilities the component-pantry's own CSS needs (Tailwind scans that package, so `.text-[10px]` rules still exist in the bundle; nothing of ours uses them).
- **Rule** added to `docs/STANDARDS.md` (§4.3 Theme & fonts): font sizes in rem, via Tailwind sizes or the two tokens.
- **Not done (not asked):** responsive text via `clamp()` or breakpoint sizes. If phone labels turn out too small, bump `label` / `micro` at a breakpoint in one place.

---

## Phase 14 — Dashboard layouts follow the content width (on `main` directly)

**Status:** 🟡 Built, awaiting the user's check on a tablet · **Date:** 2026-10-11 · **Branch:** `main`

**Problem:** the Dashboard cards were cramped on tablets. Every layout switch used a _window_ breakpoint (`lg:` 1024px, `xl:` 1280px), but the cards live in the content area, which is the window minus the sidebar (256px, full width from 992px) and 48px of padding. A 1024px tablet in landscape has only ~720px of content, yet `lg:` already put the Ads and States cards in three ~230px columns and the tiles in five; at 1280px the overview row got three columns in ~975px.

**Fix:** the layouts are keyed to the width the page content actually has, with CSS container queries (`.dashboard { container: dashboard / inline-size }`; thresholds in rem of _content_ width):

- **Tiles:** under 48rem, 2 columns (Received spans both); 48-72rem, Received spans the row with the four uniques in one row below it; from 72rem, Received beside the four tiles (as before).
- **Overview (chart / venues / categories):** under 40rem stacked; 40-60rem the chart spans the row with venues and categories side by side below; from 60rem, 45 / 27.5 / 27.5.
- **Ads and States cards:** the three columns (40/30/30 and 30/40/30) only from 60rem; narrower, the three stack at full width with a rule between (the left border becomes a top border). The two-column "halves" variant switches at 48rem.
- **Card header (`app-summary-card`):** wraps instead of squeezing (title, sort control and "View all" move to separate lines), and the centered hint is shown only when the card itself is 56rem+ wide (it is its own container), so it's never squeezed to a sliver.
- **Result by window width** (full sidebar from 992px, ~48px padding): a 768px tablet portrait (icon rail) gets 4-column tiles and stacked cards; a 1024px landscape tablet (~720px content) gets 4-column tiles and stacked cards; a 1280px laptop (~975px) gets 4-column tiles and the 3-column overview and cards; 1440px+ gets the full layout.
- **Rule for new layouts:** inside the authenticated shell, don't use `lg:` / `xl:` for card grids; use `@container` on the page's own container, since the window width overstates the room.

**Verified:** `npm run build` passes and the compiled CSS contains the scoped `@container dashboard (...)` rules (40 / 48 / 60 / 72rem), with no `lg:` / `xl:` left in the Dashboard styles. Not yet viewed on a real tablet or at those widths.

---

## Phase 15 — Map View ad thumbnails in 16:9 (on `main` directly)

**Status:** ✅ Done · **Date:** 2026-10-12 · **Branch:** `main`

The thumbnails in Map View's "Unique Ads Received" table (images and video first frames) were 48×48 squares. They're now **80×45 (16:9)**, the same size as Ranking Data's creative thumbnails, cropped to fill (`object-fit: cover`), with a placeholder fill while loading. The Thumbnail column (130px) already had room, so its width is unchanged.

---

## Phase 16 — Date range pickers ignore a repeated pick (on `main` directly)

**Status:** ✅ Done · **Date:** 2026-10-12 · **Branch:** `main`

The Dashboard already ignored a re-picked range (no reload for the same days). Every other date-range picker now does too, so an accidental click on the same day or range doesn't call the API.

- **Shared helper (removed in Phase 17, replaced by the shared range service):** `isSameDateRange(a, b)` (`shared/utils/date-range.util.ts`) compares the _calendar days_ of both ends (local date parts, how the pickers' dates are read everywhere), so the same days picked again count as the same range even when the picker hands back a new object or a different time of day. `null` is the all-time range, equal only to `null`.
- **Ranking Data (5 pickers: Received Playables, Ad, Venue, State, Category):** each range stream is now `debounceTime(400) → startWith(null) → distinctUntilChanged(isSameDateRange) → skip(1)`. It compares against the range currently loaded (all time to begin with), so a repeated pick, or clearing when already cleared, is dropped, but A → B → A still reloads (a real change back).
- **Map View and Venue Profile:** `onRangeChange` / `onRangeCleared` return early when the range wouldn't change. (Map View compares the range _after_ its 30-day clamp.)
- **Dashboard:** unchanged (its own `setRange` check).
- **Tested** with the real helper through the same operator chain (debounce shortened): first pick, same day twice, same day as a new object at another time of day, A→B, A→B→A, clear when already all-time, pick then clear, clear twice, and a rapid repeat: all as expected.
- **Trade-off:** re-picking the same range no longer works as a "retry" after a failed load. Where a retry is needed, use that page's Retry button.

---

## Phase 17 — One date range across pages, top-bar totals, Dashboard breakdowns (on `main` directly)

**Status:** ✅ Built (v1.6.0) · **Date:** 2026-10-12 · **Branch:** `main`

**Shared date range**

- **`DashboardRangeService`** (root) holds the range as UTC calendar days, starting at **Yesterday**. Dashboard, Ranking Data, Map View and Venue Profile all read and set it, so a range picked on one page carries to the others. Re-setting the same range is ignored (this replaced Phase 16's `isSameDateRange`, now deleted).
- **Presets** (`DASHBOARD_RANGE_PRESETS`): Yesterday, Today, Last 7 / 14 days, Last 3 weeks (21 days), This month (to today), Last month (whole calendar month) — all UTC, "last N" ending yesterday. Plus **All time** (`applyAllTime()`, exposed as `pageRange` = null) on Ranking Data, Map View and Venue Profile only; the Dashboard calls `leaveAllTime()` when it opens. A picked range that matches no preset shows as read-only "Custom".
- **Limit 31 days** everywhere (Dashboard client + `MAX_DASHBOARD_RANGE_DAYS`, Map View; exports already 31) so a full "Last month" fits. Wider picks are clamped with a dismissible warning.
- **Shared UI:** `app-range-menu` (popover button: preset name + dates, `compact`, `allowAllTime`, optional `source` range), `app-range-controls` (menu + date picker, `disabled`, `allowAllTime`), `app-range-notice` (the clamp warning). Helpers in `shared/utils/utc-calendar-date.util.ts` (incl. `toLocalDateRange` for pages that read ranges with local date parts) and `load-dashboard-section.util.ts`.

**Pages**

- **Ranking Data:** the five per-tab pickers are gone; one range control in the page header drives every tab **and the stat cards** (`GET /analytics` now takes optional `startDate` / `endDate`; media-file counts stay all time). The mini Total/green/yellow/red strip is removed (the cards cover it). Export buttons moved to the right end of the tabs row (tabs shrink to make room; under 768px the button drops below), and **State and Category Ranking got exports** (XLSX via new `GET /state-ranking/export/xlsx` and `/category-ranking/export/xlsx`, CSV client-side). Exports are disabled during All time (31-day limit).
- **Map View / Venue Profile:** range controls in the header (with All time); their own pickers and Map View's own clamp are gone. Map View's "Nationwide Ads Received Total" chip sits before the range menu, same 40px height. `app-page-header` gained an optional `[page-header-meta]` slot under the description (currently unused).
- **Dashboard:**
    - Tiles in the order Received, Unique venues / devices, Unique states, Unique categories, Unique ads. Tiles are clickable (`app-metric` `clickable` / `activate`, with a lower-right arrow) and smooth-scroll to their breakdown (`DashboardJumpTarget`: timeline, Venues, States, Categories, Ads).
    - Overview row: Received timeline 45% / Venues 55%. The Venues card is a breakdown: all venues | the picked venue's ads (share of that venue's received). The small Categories card is gone.
    - New **Categories breakdown** card (sortable): categories | the picked category's states | its venues there, equal thirds.
    - Range shown as the shared range menu; uses `app-range-controls` and `app-range-notice`.

- **Follow-up (after `dade33a`):** the Categories card got a 4th column (the picked venue's ads, shared `adItemsForVenue()` with the Venues card), widths 25 / 23 / 23 / 29 from 72rem of content (stacked below), a "· N states" caption and a States sort. Categories now come before States everywhere (tiles, top bar, cards). Sort buttons in the same order on every card: Received, Venues, Ads, States.

**Top-bar totals (`app-topbar-stats`)**

- Range menu, a loading spinner, then Received, Venues, States, Categories, Unique ads — compact, hidden on phones.
- **`showOnlyOnDashboard = true`:** shown only on the Dashboard, and only once its tiles have scrolled away (tile visibility is computed from the scroll container's position, not IntersectionObserver). Set to false to show it on every page again; elsewhere it then has its own range (Yesterday, own `DashboardRangeService` / `DashboardTotalsService` instances via `providers`), which pages don't change.
- **On the Dashboard** it uses the Dashboard's range and totals (synced with the header controls, no duplicate requests), and each number (dotted underline) jumps to its breakdown. No All time in the top-bar menu.
- Page ↔ top-bar wiring is in `DashboardViewStateService` (dashboard open, tiles in view, jump requests); totals in `DashboardTotalsService` (overview + geography for a range).

**Server**

- Overview and geography accept no dates as **all time** (log `range=all-time`); currently unused by the client (the top bar's All time was removed again). Ads still requires a range.

**Verified:** `npm run build` (pre-commit) passes; preset date maths checked in Node (incl. "last month" across a year boundary). **Not verified in a browser** (the agent's browser pane wasn't signed in): the scroll-based top-bar visibility, the sync between the top-bar and header menus, the new exports and the layouts.

---

## Phase 18 — "Eastern Time / UTC" display toggle (on `main` directly)

**Status:** ✅ Done (v1.7.0) · **Date:** 2026-10-15 · **Branch:** `main`

**Goal:** A global toggle (sidebar footer) that switches every displayed date/time, and the calendar-day boundaries they're queried against, between UTC and US Eastern - not just a label change.

**Added**

- **`TimeDisplayService`** (`shared/services/time-display`): a `'eastern' | 'utc'` signal persisted to `localStorage`, `zoneId()` ("America/New_York" or "UTC"), and `formatTimestamp()` (used by every raw timestamp column - Ranking Data's 3 tables, Venue Profile, Ad Analytics - showing the resolved zone abbreviation, e.g. "EDT"/"EST"/"UTC"). Toggle UI lives in the sidebar footer, above the version line.
- **`timeZoneInterceptor`** appends `timeZone=America/New_York` or `=UTC` to every `/api/*` request (as a URL param via `setParams`, so it's present even on POST bodies).
- **`resolveDateZone`** (Express middleware, `/api/media-files/*`): rewrites a bare `startDate`/`endDate` ("YYYY-MM-DD", query or body) into the UTC instant of that date's zoned midnight, before any controller runs - the single integration point for the query-boundary shift, so the ~20 date-range endpoints needed no changes themselves.
- **Reactive reload:** Dashboard/Ranking Data/Map View/Venue Profile now key their reloads on `timeDisplayMode` as well as the picked range - a quick range like "Yesterday" can carry the same calendar-date label in both zones for most of the day, so keying on the range alone silently skipped the refetch when the label happened to match.
- **Page subtitles** ("Days are…") are `computed()` off the active zone instead of a fixed "UTC".
- **Chart bucketing** (`zonedDayKey`/`zonedHourKey`, `shared/utils/zoned-calendar-date.util.ts` client + server): the per-day/per-hour chart buckets (Dashboard's received timeline, Map View/Venue Profile's daily/hourly charts) were still 100% UTC via raw ISO-string slicing even after the query boundary shifted - toggling changed which rows were in range but not which bucket each fell into. `MediaFilesService.toDayKey`/`toHourKey` and the 6 methods that call them (`getDashboardAnalytics`, `getDashboardOverview`/`buildReceivedTimeline`, `getDailyAdsSummary`, `getDailyDeviceAdsSummary`, `getHourlyDeviceAdsSummary`) now take the resolved `timeZone`.
- **Exports follow the zone too:** `formatExportDateTime` (both `src/server/utils/export-format.util.ts` and its client mirror) now formats with the request's/page's zone and the real abbreviation instead of a hardcoded "UTC" suffix. The column lists that use it (`programmatic-ads-export.columns.ts`, `ad-ranking-export.columns.ts` server-side; `ranking-data.constants.ts`'s CSV columns client-side) became `build...Columns(timeZone)` factories instead of static arrays, so an exported file's timestamps read the same as the screen they were exported from.

**Fixed along the way**

- **`req.query` mutation was silently discarded.** Express 5 made `req.query` a getter that re-parses the query string on every access instead of returning a cached, mutable object - `resolveDateZone`'s `req.query.startDate = ...` therefore never reached any controller, so the Eastern/UTC toggle never actually shifted a single query boundary (confirmed: Eastern mode still returned the exact UTC-day total). Found by direct DB comparison (Eastern's real total vs. what the UI showed matched UTC, not Eastern) and confirmed with an isolated Express 5 test. Fixed by replacing `req.query` wholesale via `Object.defineProperty` instead of mutating it in place.
- **`validateDashboardDateRange`'s regex** only accepted a bare `YYYY-MM-DD` - once the `req.query` fix above made the middleware's rewrite actually land, every Dashboard request would have 400'd on its own already-resolved ISO instant. Now accepts both.
- **Business-hours math silently broke the same way.** `calculateExpectedRequests`/`getBusinessHoursSchedule`/weekday resolution require a bare calendar date (documented in `expected-requests.util.ts`); once the `req.query` fix made a resolved instant reach them, their `calendarDate.split('-')` parsing would have mangled on the `T...Z` suffix and silently zeroed out "Expected Requests" everywhere. Added `MediaFilesService.toCalendarDate()` (slices the instant back to its date prefix - always exact, since a zoned midnight never rolls onto a different calendar date) at all 6 call sites that build a `{start, end}` range for these functions (venue/state/category ranking, venue profile, dashboard geography).
- **Dashboard's hourly chart title was hardcoded `"Received per hour (UTC)"`** regardless of the active zone; now names whichever zone the buckets actually fall in.
- Unrelated polish noticed in passing: `metric.component.scss`'s `--with-aside` label misalignment (`items-center` → `items-start`), "Adexchange" → "Ad Exchange" in the sidebar/login captions, redundant "Unique" prefix dropped from Dashboard tile labels.

**Verified:** `tsc --noEmit` and full `npm run build` (client + server) pass clean after every change in this phase, including the three cascading fixes above. The `req.query` persistence bug and its fix were confirmed with isolated Express 5 tests (mutate-then-read across middleware); the zone-shift query boundary was confirmed against the live DB (Eastern vs. UTC row totals for the same calendar date differ exactly as expected). **Not verified in a browser** (no dev server run this phase, per house rule) - worth a manual pass over the toggle, the Dashboard chart, and both export formats before calling this fully done.

---

---

## Phase 19 — Dashboard & Map View breakdown switchers (on `main` directly)

**Status:** ✅ Done (v1.8.0) · **Date:** 2026-10-15 · **Branch:** `main`

**Goal:** Replace each page's single fixed drill-down with a switcher between a few, so exploring Categories vs. States vs. Ads (Dashboard) or Category vs. Venue vs. Ads (Map View) doesn't mean scrolling past cards you don't want.

**Dashboard**

- New `app-sort-control`-based switcher (`card-action` slot, where "View all" used to sit - now removed) between **Categories / States / Ads**, defaulting to **States**. `DashboardBreakdownView` type and `DASHBOARD_BREAKDOWN_VIEW_OPTIONS` live in `shared/models/dashboard`.
- `SortControlComponent` gained a configurable `icon` input (default `arrow-down-wide-short`) so the same generic segmented control serves as both a literal sort control and a breakdown switcher (`arrow-right-arrow-left` here).
- `DASHBOARD_TOP_LIMIT` raised 5 → 10; a separate `DASHBOARD_VENUES_TOP_LIMIT` (5) keeps the Venues card's own two lists shorter, since it's one level deeper than the others.

**Map View**

- Mirrors the Dashboard's switcher, but Map View is already state-focused (the map itself is the state breakdown), so the options are **Category / Venue / Ads** instead - no "States" tab, and each card's title now names the selected state (e.g. "Categories in CA").
- **Before a state is picked:** a dedicated, switcher-free "Nationwide States Breakdown" card - **States → Ads → Venues**. Picking a row here is local-only (a new `selectedNationwideStateId`/`selectedNationwideAdId` pair, not `onStateClicked()`) so exploring it never highlights the map or triggers a fetch; the only way to actually select a state is clicking the map.
- **Once a state is picked** (via the map), the switcher appears: **Category → Venues → Ads**, **Venue → Ads**, **Ads → Categories → Venues**. The new Venue tab (`venueShareItems`/`selectedVenue`/`selectedVenueAdItems`) shares an `adsAtVenue()` helper with the Categories tab's own innermost level instead of duplicating the ad-lookup.
- Every breakdown is still computed client-side from data already loaded for the map and the existing ad-shares call (`stateRanking()`, `stateRankingVenues()`, `adSharesInState()`) - no new endpoints.

**Verified:** `tsc --noEmit` and full `npm run build` (client + server) pass clean. **Not verified in a browser** (no dev server run this phase, per house rule).

---

## Phase 20 — Ad Analytics: a venue's playlist slots, date ranges and export (on `main` directly)

**Status:** ✅ Done (v1.9.0) · **Date:** 2026-10-17 / 18 · **Branch:** `main`

**Goal:** in the single-ad page's "Where it was received" card, clicking a venue shows how that ad played in the venue's playlist slots (slot playlist content ID + slot position), with the screenshot.

**What the column shows**

- **Third column "Plays at <venue>"**, next to States and Venues. Venue rows are selectable (the venue _name_ still links to its profile; clicking the rest of the row selects it). Picking a state clears the venue selection.
- **A grid of slot cards** (`app-slot-grid`, page-local in `features/ad-analytics/components/`), one per slot = playlist content ID + position, **ascending by slot position** (numeric; plays that reported no slot form one "No slot data" card, last). Each card: the newest screenshot, which runs the **full height of the card, flush with its left, top and bottom edges** (no padding around it; letterboxed on black), with the text, padded, to its right, **Slot <position>** and its **play count**, the playlist content ID **shortened in the middle** (`bfa008a6...56a0b`, full ID on hover), and its share of the venue's plays plus when it last played (Eastern/UTC per the toggle). The cards sum to the venue's plays of the ad (checked: 25 groups summing to 858 = the locations total).
- **Default selection:** the first venue of the Venues list (the one with the most plays) is picked as soon as the locations load, and picking a state picks that state's first venue, so its slots are always showing (same "top item selected by default" as the Dashboard). The Venues list highlights it.
- **Layout** follows the card's own width (container queries on the summary card, like Phase 14): stacked below 40rem; States | Venues with the slots below from 40rem; from 64rem all three in a row, **States and Venues equal (22.5% each) / Plays the rest (55%)**. The grid scrolls inside the card for a venue with many slots. No footer line and no "Show all": the cards are the breakdown.
- The card header hint reads "Pick a state to see its venues, then a venue to see its playlist slots."

**Server**

- `GET /api/media-files/:id/venue-slots?venueId=` (venueId required, 400 otherwise): `{ data: AdVenueSlot[], meta: { count, plays } }`. Grouping can't use a page of plays (a venue can have thousands of plays of one ad: 2,932 for Valle's Restaurant), so the BFF reads _all_ of the venue's plays of the ad - a count first, then pages of 1,000 ordered by id, six at a time (the replica rejects HEAD, and Supabase caps a response at 1,000 rows) - and groups them in Node (`getAdVenueSlots`), keeping each group's newest play time and newest screenshot. No SQL or migration. 2,932 plays took ~1.7 s.
- **Checked against production (read-only):** the Waco ad's top venue (2,932 plays over three pages): slot plays sum to the total. An ad/venue with slot data: 25 groups summing to 858 plays, ascending, with the same playlist content appearing at more than one position (so the key is content ID _and_ position).

**Date range, 15-row table and export (same phase)**

- **Same range picker and presets as the Dashboard.** `app-range-controls` (All time allowed) and `app-range-notice` in the page header, reading the shared `DashboardRangeService` (Yesterday by default). The page reloads on a range change _or_ an Eastern/UTC toggle (like Venue Profile), cancelling the requests still running. The range reaches `/locations`, `/venue-slots` and `/play-records` as `startDate`/`endDate`, filtered on `fetched_at` (the same column the Dashboard's ranges use); the BFF's date-zone middleware turns the days into instants as everywhere else.
- **Empty range falls back to the latest day.** The first time the page loads and the range (Yesterday by default) holds none of the ad's plays, the shared range moves to the day the ad last played (in the viewing zone) and the range notice says so. Once per visit - after that an empty range the user picks stays empty. The range is shared, so the other pages follow it too. The States/Venues empty texts say "in this date range" when a range is picked.
- **Totals follow the range.** `/play-records` now returns `meta.total` (a `count: exact` on the same query), so "Plays in Range" shows in the ad card whenever a range is picked ("Play Count" stays all time), and the "N plays had no venue" note is that total minus the venue sum (it was the all-time count, wrong once a range applies). Play records were also missing a final `id` sort, so equal timestamps could repeat/skip across pages; added.
- **States and Venues are equal width** (22.5% each, Plays 55%). The Venues list shows **10** before "Show all" (States stays 5).
- **Play Records shows 15 rows by default** (header + 15 x ~75px rows - the rows are taller than other tables' because of the 50px screenshot - then it scrolls inside). A note under the table says "Showing the latest 100 of N plays in this range. Export has them all." when the 100-row load is a part of the range.
- **Export button** (`app-export-button`, CSV + Styled Excel) at the right end of the tabs row, like Ranking Data. Same rules as the other exports: needs a range, at most 31 days, disabled with a tooltip for All time / too wide / loading / no plays. New endpoints `GET /api/media-files/:id/play-records/export` (JSON, for the CSV built in the browser) and `.../export/xlsx`; both validate the range server-side, read _every_ play in it (count, then pages of 1,000 six at a time) and use the Received Playables columns - creative, screenshot, IDs, fetched / proof sent, POP duration, served, date served - plus **Slot Playlist Content ID and Slot Position**. Times are in the zone the page is viewing. Files: `play-records-<date>.csv|xlsx`.
- **Checked (read-only, production data):** for one ad on one day the range total, the venue breakdown sum and the export row count were all 2,211 (the ad's all-time total is 16,879), and the POP duration and media URL are filled in the export rows.
- **Not checked in a browser:** the range picker on this page, the table height and the downloads.

- **Slot stat (both pages):** **"12 / 1"** (`app-slot-stat`) at the right end of the slot column's title = slots with a playlist content ID / slots with none recorded; and the slot grid no longer scrolls inside itself (it grew a 32rem cap in the ad page's narrow column; it now grows with its cards, like the lists beside it).

**Dashboard: Venue breakdown (same phase)**

- A fourth switch item, **Venue**, on the Dashboard's breakdown switcher (top right of the full-width drill-down card, next to Category / States / Ads): **Venues -> Ads in the venue -> Playlist slots**. A venue can have many ads, so the slots are per ad _and_ venue: pick a venue, pick one of its ads (both default to the top one), and the third column lists that ad's plays at that venue by playlist slot.
- Widths **30 / 30 / 40** (were 25 / 25 / 50; the venue captions - ID, city, unique ads - were cut off). The third column is the ad page's slot grid (`app-slot-grid`: screenshot flush on the left, "Slot N", plays, shortened content ID, share and last played), reused as is, ascending by slot position, plays with no slot data last. It uses the ad page's `GET /api/media-files/:id/venue-slots` with the Dashboard's range, reloads on range / Eastern-UTC changes and Retry, and only loads while the Venue view is showing. An ad with no media file says its slots can't be looked up.
- **Sorter** (`card-tools`, like Categories / States / Ads - it was missing here at first): **Received** (default), **Ads** (distinct ads the venue received, counted client-side from the ads call) and **Slots** (the venue's configured player slots from the Hosts API - `slotCount`, now sent on `DashboardVenue`; venues the Hosts API doesn't know sort last). Click the active option to reverse; ties by received. The first venue of the chosen order is the default selection. Each venue row's caption is "venue ID · City, ST" and its figure (under the percentage) is **"496 all / 11 uniq / 12 slot"** - received, unique ads (once the ads call has loaded) and configured slots, always all shown whichever sort is active. New optional `ShareItem.figure` replaces the "<value> <unit>" text.
- **Search in every breakdown view** (`app-search-field`, a shared 40px `ntv-input` like Ads Gallery's, before the sorter in the card's tools): Category searches the category name; States the state name or code ("Texas" or "TX"); Ads the file name or creative ID; Venue the venue ID or name. It filters that view's first list (and so which item is selected by default and what the next columns show); each view keeps its own text. The text is reported after a 400 ms pause in typing (the Venue view loads the first match's slots, so a request per letter would be wasteful). When nothing matches the empty text says so. `summary-card`'s tools slot got a 12px gap for the two controls.
- **Switch order** is now States, Category, Venue, Ads (States stays the default).
- **The Venues card beside the timeline is gone** - the Venue view of the switcher replaces it (the top bar's / stat tile's "Venues" jump now switches to that view). In its place, **"Unique ads per hour / per day"**: a one-line chart (new `app-daily-line-chart`, soft area under the line) of the **distinct ads received** that **follows the range exactly like the timeline beside it** - hourly for a single day (Yesterday by default), per day for a week or any range (labels thinned past eight points) - so it reuses the overview call's timeline and makes no request of its own; those entries gained `uniqueAds` (distinct creative ID + source per bucket; `/daily-ads-summary` carries it too). (It first was a fixed 7-day window of received + unique venues, then of unique ads; the range-following version replaced both.) The card header shows **"200 / 1,200"** at the right: the unique ads of the active range (`ov.uniqueAds`) over the unique ads of all time (the media-file count - one row per creative ID + source - from `type-counts`, loaded once). The timeline and this chart share the row **50 / 50**. The old card's selection state, `DASHBOARD_VENUES_TOP_LIMIT` and its styles were removed.
- Not checked in a browser.

**Notes**

- **Slot data is recent.** 885 of the 1,000 newest rows have a slot ID and position, but older plays don't (the Waco ad's last plays are from Oct 10), so such a venue shows one "No slot data" card with all its plays. That is the data, not a bug.
- **Shared code:** `formatShare()` (`shared/utils/format-share.util.ts`) is now the one place share percentages are formatted; `app-share-list` calls it. New: `AdVenueSlot` and `AdSlotTile` interfaces (`shared/interfaces/ad-analytics`).
- **History of this phase:** the first version listed the venue's plays as `app-share-list` rows (screenshot, played time, content ID, slot position, 50 per page with "Load more", a "Showing N of M" footer). It was replaced by the slot grid at the user's request; the optional `venueId` filter it added to `/play-records` and `ShareItem.figure` were removed again. A first custom-layout attempt had been rejected as not uniform with the Dashboard (see the memory note): new lists should reuse `app-share-list`, and the grid here is the one deliberate exception, asked for by the user.
- **Not changed:** the Play Records table and the proof-of-play modal.

## Phase 21 — Boilerplate: dummy data instead of Supabase / Hosts API

**Status:** 🟡 In review · **Date:** 2026-10-19 · **Branch:** `chore/strip-to-boilerplate`

**Goal:** turn the repo into a starter template for future NTV360 internal tools - keep every page working, but with no database, external API or credentials.

**Done**

- **Data layer swapped for a seeded dummy dataset** (`src/server/mock-data/`): 32 fictional venues in real US cities, 36 creatives (12 placeholder SVGs in `public/mock-media/` x 3 sources) and ~34k play records over the last 45 days, ending at server start, during each venue's open hours.
- `supabase-client.service.ts` → **`data-store.service.ts`** and `hosts-api.service.ts` → **`hosts.service.ts`**, same method signatures, answering in memory. The SQL RPCs (`get_programmatic_ads_page`, `_stats`, `get_media_files_by_plays`, `get_ad_by_id_with_metrics`, `get_venue_ids_by_creative`) are emulated there (filters, buckets, sort order, nulls last). Nothing above them changed - every endpoint and page is the same.
- **Auth:** Supabase Auth replaced by one demo account (`DEMO_EMAIL` / `DEMO_PASSWORD`) and a signed httpOnly cookie (`session.service.ts`, `SESSION_SECRET`, required in production). Same endpoints and response shapes, so the Angular side is untouched.
- Removed: `@supabase/*` packages, the Supabase / Hosts API env vars, `migrations/`, `docs/DB_SCHEMA.md`, `docs/PLAY_METRICS_IMPLEMENTATION.md`, `contents-sample.json` (real production rows). CSP no longer allows Supabase / vendor CDNs.
- Renamed to `internal-tool-boilerplate` (package, Angular project, dist paths); `APP_NAME` / `APP_CAPTION` constants drive tab titles and the wordmark caption.
- Docs: `REUSE-AS-TEMPLATE.md` rewritten (keep / reshape / delete pages, the two data seams), `AUTHENTICATION.md`, `START_HERE.md`, `README.md`, CSP and BFF docs updated.

**Decisions**

- **The seam is the lowest layer.** Mocking at the data-store level (not the controller) keeps all the aggregation code real, so the pages behave as they did on production data and a new backend only replaces two files.
- **Placeholder images are files, not data URIs** - `NgOptimizedImage` (`ngSrc`, used by the gallery) rejects data URIs.
- **A first attempt** (earlier on this branch) deleted every page and the BFF data layer instead; it was reverted because the pages are the useful part of the template.

**Pending**

- Not checked in a browser (the user runs the app). Checked: `npm run build` passes, and every BFF service method was called against the dummy data from a script (dashboard overview / geography / ads, all rankings, programmatic ads list with buckets and stats, ad detail, play records, venue slots, venue profile, daily summary).
- All creatives are images; the gallery's Video filter is empty.

---

**Where things stand (Phase 21)**

- `main` has Phases 1, 2 and 4-20 (v1.9.0); Phases 10-20 were committed to `main` directly. Phase 3 is still planned. Phase 21 (boilerplate) is on `chore/strip-to-boilerplate`.
- The app is a client-side Angular 21 SPA (zoneless, signals) with an Express BFF in `src/server` (Routes → Controllers → Services). Since Phase 21 it serves a seeded dummy dataset (`src/server/mock-data`) through `data-store.service.ts` and `hosts.service.ts` - the two files to replace for a real backend.

**How to work in this repo**

- Start with `START_HERE.md`. Then read `docs/STANDARDS.md` (theme tokens, BEM + `@apply`, one thing per file, JSDoc, shared components, commitlint), `docs/COMPONENT_PANTRY_SKILL.md`, `docs/BFF-ARCHITECTURE.md` and `docs/REUSE-AS-TEMPLATE.md`.
- **SQL:** once a project has a real database, ask for the table schema before writing SQL. Keep migrations in `migrations/` with a rollback where relevant.
- **Run:** `npm start` (UI :4200 + BFF :4000). **Check:** `npm run build`. The user runs and tests the app themselves; agents don't start the dev server unless asked.
- **Commits:** Conventional Commits with only `feat` / `feature` / `fix` / `chore` (commitlint rejects `refactor`, `docs`, …), sentence-case subject, body lines under 100 chars.
- **Workflow:** new work on a new branch from an up-to-date `main`; record each phase here.

**Known quirks / hiccups so far**

- `@ntv360/component-pantry` assumes a browser (`window`, `Option`, `getComputedStyle`, `ResizeObserver`), which was a major reason for dropping SSR. `ntv-table`'s `showMore()` also emits `tableStateChange` (see `1bd500d`).
- `supabase-js` GET-mode RPCs serialize `null`/`undefined` args as the string `"null"`. Omit them instead, and avoid `HEAD` count queries on the read replica (see CHANGELOG 1.3.0).
- `SUPABASE_URL` must be the primary project URL (Auth isn't served on the replica).
- npm's install-scripts policy blocks `esbuild`'s postinstall. The build still works without it.
- **`npm audit` reports 12 vulnerabilities that can't be fixed yet.** All come from `braces` (high, every version affected) and `postcss-selector-parser` < 7.1.6 (moderate), through Tailwind 3 and Karma.
    - They only run at build/test time on our own config and styles. Nothing from them ships in `server.mjs` or the browser bundle.
    - Blocked on component-pantry's Tailwind 3 requirement and on Karma having no fixed release.
    - Never run `npm audit fix --force`: it downgrades `exceljs` to 3.4.0.
- **Tailwind opacity modifiers don't work on theme tokens** (`bg-surface-base/80` fails to compile): the tokens are CSS variables. Use `color-mix(in srgb, var(--app-…) 80%, transparent)`.
- **ECharts axis options are a union type:** spreading a `YAXisComponentOption` into another fails to type-check. Build the whole axis in a helper (see `DailyAdsBarChartComponent.valueAxis()`).
- **component-pantry date pickers and `ntv-skeleton` ship no dark styles.** Their fixes live in the app-specific section of `_pantry-dark-fixes.scss`; selectors come from the pantry bundle's own CSS (`fesm2022/ntv360-component-pantry.mjs`).
- **A global `* { border-radius: 0 !important }` isn't enough on its own:** pantry rules like `.date__picker--month-view … .day--isSelected[data-…]{border-radius:9999px!important}` outrank it. The id-in-`:not()` trick in `_sharp-corners.scss` fixes that without listing every case. Canvas/SVG chart shapes need the chart options instead (`borderRadius: 0`, `shape: 'square'`, `icon: 'rect'`).
- **Invisible elements still cause horizontal scroll.** gbp's `app-metric` hid its hint tooltip with `invisible opacity-0`, which still takes up layout. On the rightmost Dashboard tile it stuck out past the content area and made the page scroll sideways. It's now hidden with `display: none` until hover/focus (worth upstreaming to gbp). Other pages never showed this because `.page` has `overflow-x: hidden`; the Dashboard's root doesn't. Also avoid negative margins on list rows (`-mx-*`): they overflow, and a list with `overflow-y: auto` then scrolls sideways too.
- **A component input named `title` leaks a tooltip.** With `<app-summary-card title="Ads">`, Angular sets the input _and_ keeps `title="Ads"` on the host element, so the browser shows "Ads" anywhere you hover in the card. `SummaryCardComponent` now binds `host: { '[attr.title]': 'null' }` (worth upstreaming to gbp, which has the same input).
- **Express 5's `req.query` is not mutable the way `req.body` is.** It's a getter that re-parses the query string from `req.url` on every access instead of returning a cached object, so `req.query.someField = ...` in one middleware is silently discarded by the time a later middleware or the route handler reads `req.query` again - no error, just the original value. This broke `resolveDateZone` entirely until found (see Phase 18): the Eastern/UTC toggle never actually shifted a query boundary, it just looked like it did. Fix: replace the whole object via `Object.defineProperty(req, 'query', { value: {...req.query, ...}, writable: true, configurable: true })`, never a nested assignment. `req.body` has no such problem (body-parsing middleware sets it as a plain property).
