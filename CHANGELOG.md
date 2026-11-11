# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.7.0] - 2026-10-15

### Added

- **"Eastern Time / UTC" display toggle** (sidebar footer): switches every displayed date/time and the calendar-day boundaries they're queried against between UTC and US Eastern, app-wide - not just a label change. Covers the Dashboard's received timeline and stat tiles, Ranking Data's tables, Map View, Venue Profile, and both CSV and XLSX exports, whose timestamp columns now read in the same zone the export was taken in.

### Fixed

- The toggle's query-boundary shift silently never took effect: Express 5 makes `req.query` a getter that re-parses the query string on every access rather than returning a cached, mutable object, so the BFF middleware's `req.query.startDate = ...` rewrite was discarded before any controller read it - every request kept querying UTC boundaries regardless of the selected zone. Found by comparing the UI's totals against a direct database query for the same calendar date in each zone. Fixed by replacing `req.query` wholesale instead of mutating it in place; this also surfaced (and fixed) two call sites that would have broken once the rewrite actually started working - the Dashboard's date-range validation, and the business-hours/expected-requests math that requires a bare calendar date rather than a resolved instant.
- The Dashboard's hourly received-timeline chart was still bucketed by raw UTC hour regardless of the toggle, and its title was hardcoded "(UTC)".

## [1.3.0] - 2026-09-20

### Added

- **Date-range filtering, mini stats, and export on every Dashboard table** (Programmatic Ads, Ad Ranking, Venue Ranking): each table now has its own date-range picker, a total/green/yellow/red stat row scoped to that range and clickable as bucket filters, and a matching CSV/XLSX export capped at 31 days to bound server load. Export columns are formatted to match what's on screen (dates, Yes/No booleans, computed POP Duration) instead of dumping raw fields.
- **State Ranking tab**, grouping venues by state/region on top of the existing Venue Ranking view.
- **Drill-down modals**: click "Total Ads" on Venue Ranking or "Play Count" on Ad Ranking to see the underlying play records/locations, with the same stats, sort, and filters as the main table.
- **Tracking ID column**, sourced from `programmatic_ads.metadata.trackerId`.
- Venue Ranking and Ad Ranking can now scope to multiple venues at once (previously one at a time).
- Shared `<app-export-button>` component and a generic export service, replacing per-table duplicated export UI and CSV-building logic.

### Fixed

- Column filtering and sorting on Ad Ranking and Venue Ranking, which were previously decorative (had no effect on the table).
- Column filtering on Programmatic Ads, which silently dropped filters/search due to a GET-mode RPC bug: `supabase-js` serializes `null`/`undefined` argument values into the query string as the literal text `"null"` rather than omitting them, which broke the database function's `IS NULL` default checks and zeroed out results. The same bug also broke `count: 'exact', head: true` queries used by Venue/Ad Ranking - a rejected `HEAD` request carries no response body by HTTP spec, so the failure reason was silently swallowed. All affected calls now use GET explicitly (required after moving reads to a read replica, which rejects POST) while omitting null/undefined args, and no longer rely on `HEAD`.
- Substring filters on the raw ads table were doing full table scans; added trigram/B-tree indexes so they can use an index instead.
- Ad Ranking, Venue Ranking, and Dashboard Analytics fetched the full table sequentially 1000 rows at a time; now fetched in parallel with only the columns each view needs.

## [1.2.0] - 2026-09-02

### Added

- **Business Hours** and **Expected Reqs** columns on the Dashboard's Venue Ranking table, derived from each venue's business hours (via the Hosts API):
    - **Business Hours** shows the schedule for the selected date (or right now, if no date range is picked), labeled with its resolved weekday, plus a hover tooltip listing the full week. Shows a fixed message instead when a multi-day range is picked, since a single cell can't represent more than one calendar day.
    - **Expected Reqs** estimates ad request volume over the selected range from open hours × a fixed requests-per-minute rate, correctly handling overnight shifts (e.g. "11:00 AM - 2:00 AM").

### Fixed

- Venue Ranking's date-range filtering now resolves weekdays and query windows from the exact calendar date picked (`"YYYY-MM-DD"`), instead of a UTC instant derived from the browser's local midnight. The previous approach could shift the effective day by the browser's UTC offset - e.g. a "Sep 1" pick from a browser in the Philippines (UTC+8) would query/report on `Aug 31 16:00 UTC - Sep 1 16:00 UTC` instead of `Sep 1 UTC`, and could resolve the wrong weekday entirely for a venue in a different timezone.
