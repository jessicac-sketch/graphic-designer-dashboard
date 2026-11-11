# Starting a new tool from this template

This repo is the NTV360 programmatic-ads dashboard turned into a starter template. **Every
page is kept and working**, but the BFF no longer talks to any database or external API: it
serves a generated dummy dataset. Clone it, run `npm install && npm start`, sign in with the
demo account (**`demo@example.com` / `demo1234`**, see `docs/AUTHENTICATION.md`), and you
have a full dashboard to adapt.

The intended workflow for the next developer: **keep the pages you can reuse, reshape the
ones that are close, delete the rest, then point the data layer at your real backend.**

---

## What you get

### Pages (`src/app/features/`) - all running on dummy data

| Page            | Route               | Good starting point for...                                         |
| --------------- | ------------------- | ------------------------------------------------------------------ |
| `dashboard`     | `/dashboard`        | KPI tiles, timeline charts, breakdown cards with drill-down lists  |
| `ranking-data`  | `/ranking-data`     | `ntv-table` with server-side paging, sort, column filters, exports |
| `ads-gallery`   | `/programmatic-ads` | Card grid with a sticky filter/sort sidebar and search             |
| `ad-analytics`  | `/ad/:id`           | Detail page: route param → single-entity load, tabs, export        |
| `venue-profile` | `/venue/:venueId`   | Second detail-page example, with device/hour charts                |
| `map-view`      | `/map-view`         | US choropleth (`us-states-map`) + drill-down                       |
| `analytics`     | `/analytics`        | ApexCharts example (not linked in the sidebar)                     |
| `settings`      | `/settings`         | Empty settings skeleton (not linked in the sidebar)                |
| `login`         | `/login`            | Sign-in form against the BFF                                       |

### Shell (keep as is)

- **Theme:** `src/styles/` (`_theme.scss` tokens, typography, pantry dark fixes,
  sharp corners), `tailwind.config.js`. See `docs/STANDARDS.md`.
- **Layout:** `src/app/layout/` - sidebar (collapsible, Eastern/UTC toggle), top bar with
  range totals, user menu, public layout.
- **Shared components:** `src/app/shared/components/` - `page-header`, `summary-card`,
  `metric`, `share-list`, `dialog`, `drill-down-modal`, `export-button`, `range-controls`,
  `range-menu`, `range-notice`, `sort-control`, `filter-list`, `search-field`,
  `copy-button`, `section-error`, `daily-ads-bar-chart`, `daily-line-chart`,
  `us-states-map`, `brand`.
- **Auth:** BFF-brokered sign-in with an httpOnly signed cookie, `authGuard` /
  `guestGuard`, auth interceptor. Demo account only - see `docs/AUTHENTICATION.md`.
- **BFF:** Express in `src/server` (routes → controllers → services, see
  `docs/BFF-ARCHITECTURE.md`), security headers, origin check, date-zone middleware,
  XLSX export builder, generic `/api` proxy (`http-client.service.ts`, `API_BASE_URL`).

---

## Renaming the tool

- `src/app/shared/models/app/app-name.constant.ts` (`APP_NAME`, used in tab titles) and
  `app-caption.constant.ts` (`APP_CAPTION`, under the wordmark).
- `package.json` `name`, and the project name in `angular.json` - the build lands in
  `dist/<project name>/`, so update `scripts/build-server.mjs`, the `serve` scripts and
  the dist paths in `src/server/main.ts` with it.
- `src/index.html` `<title>`, `public/site.webmanifest`, favicons in `public/`
  (same filenames, so `index.html` needs no changes).
- `src/server/services/spreadsheet-export.service.ts` - `workbook.creator`.
- The wordmark comes from `@ntv360/component-pantry` (`NTV360_LOGO_SVG`, parsed in
  `brand.component.ts`); rebranding it means changing that component, not an asset.

## Removing a page you don't need

1. Delete `src/app/features/<page>/` and its route in
   `src/app/layout/authenticated/authenticated.routes.ts` (plus its export in
   `src/app/features/index.ts`, if it has one).
2. Remove its entry from `src/app/shared/models/navigation/main-nav.constant.ts`.
3. Run `npm run build` - the compiler lists whatever still imports it. Page-only models
   and interfaces (`shared/models/<page>/`, `shared/interfaces/<page>/`) can go once
   nothing references them.
4. If no page uses an endpoint any more, remove it from
   `src/server/routes/media-files.routes.ts`, the controller and the service.

Library notes: `echarts` / `topojson-client` / `us-atlas` are used by `us-states-map` and
the chart components; `apexcharts` / `ng-apexcharts` only by `analytics`; `exceljs` by the
XLSX exports.

## Connecting a real backend

The whole BFF reads data through **two services**. Keep their method signatures and
replace the bodies; nothing above them (media-files service, controllers, routes, the
Angular app) needs to change:

| File                                        | Replaces                | Called for                                         |
| ------------------------------------------- | ----------------------- | -------------------------------------------------- |
| `src/server/services/data-store.service.ts` | the database            | creatives, play records, paging, stats, exports    |
| `src/server/services/hosts.service.ts`      | the venue directory API | venue name, address, state, category, hours, slots |

Each method's JSDoc states the filtering and sort order the UI relies on (e.g. nulls
last, end date inclusive of its whole day). The row shapes are in
`src/server/types/database.types.ts` and `hosts.types.ts`.

Then:

- Delete `src/server/mock-data/` and `public/mock-media/` once nothing uses them.
- Add your backend's variables to `.env.example` and
  `src/server/config/environment.config.ts` (use `requireEnv` for required ones).
- If the browser loads media from a CDN, add it to `img-src` / `media-src` in
  `src/server/middleware/security.middleware.ts`.
- If your domain is different (not ads/venues), it's usually simpler to add a new
  resource (`routes/<resource>.routes.ts` → controller → service, mounted in `main.ts`
  behind `requireAuth, resolveDateZone`) and rebuild the pages you kept against it, then
  delete `media-files.*` when the last page stops using it.

## The dummy dataset

`src/server/mock-data/mock-dataset.ts` builds, once per process and from a fixed seed:

- **32 venues** (`VEN-0001`...) in real US cities with made-up names and contacts, three
  business-hours patterns, 1-3 devices and 4-12 playlist slots each
  (`mock-venue-seeds.constant.ts`).
- **36 creatives** (`CR-1001`...): 12 placeholder images (`public/mock-media/`) under each
  of three sources.
- **~34k play records** over the last 45 days, ending at server start, only during each
  venue's open hours, with a realistic spread of proof-of-play delays (mostly 1-5 min,
  some 6-10, a few over 10, a few never sent).

Change `SEED`, `HISTORY_DAYS` or `PLAYS_PER_VENUE_DAY` there for a different volume. All
creatives are images (there is no sample video), so the gallery's Video filter is empty.
