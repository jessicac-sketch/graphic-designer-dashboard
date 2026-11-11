/** Third Party Imports */
import express, { type Router } from 'express';

/** Local Imports */
import { mediaFilesController } from '../controllers/media-files.controller.js';

/**
 * Router for media files endpoints.
 * Delegates request handling to the controller layer.
 *
 * @remarks
 * Routes should only define endpoints and bind them to controller methods.
 * All business logic should be in services, and HTTP handling in controllers.
 */
const router: Router = express.Router();

/**
 * GET /api/media-files/analytics
 * Fetches aggregate metrics for the dashboard and analytics page.
 *
 * @query startDate - Count play records from this calendar date, "YYYY-MM-DD" (optional; all time if omitted)
 * @query endDate - Count play records up to this calendar date, "YYYY-MM-DD" (optional)
 */
router.get('/analytics', (req, res) => mediaFilesController.getAnalytics(req, res));

/**
 * GET /api/media-files/ad-ranking
 * Fetches ads ranked by play-record count, optionally scoped to a date range.
 *
 * @query startDate - Only include rows fetched on/after this calendar date, as "YYYY-MM-DD" (optional)
 * @query endDate - Only include rows fetched on/before this calendar date, as "YYYY-MM-DD" (optional)
 */
router.get('/ad-ranking', (req, res) => mediaFilesController.getAdRanking(req, res));

/**
 * GET /api/media-files/ad-ranking/export/xlsx
 * Fetches ads ranked by play-record count (optionally scoped to a date
 * range) as a styled XLSX workbook.
 *
 * @query startDate - Only include rows fetched on/after this calendar date, as "YYYY-MM-DD" (optional)
 * @query endDate - Only include rows fetched on/before this calendar date, as "YYYY-MM-DD" (optional)
 */
router.get('/ad-ranking/export/xlsx', (req, res) =>
    mediaFilesController.getAdRankingExportXlsx(req, res),
);

/**
 * GET /api/media-files/venue-ranking
 * Fetches venues ranked by play-record count, optionally scoped to a date
 * range, enriched with host details from the hosts service.
 *
 * @query startDate - Only include rows fetched on/after this ISO timestamp (optional)
 * @query endDate - Only include rows fetched on/before this ISO timestamp (optional)
 */
router.get('/venue-ranking', (req, res) => mediaFilesController.getVenueRanking(req, res));

/**
 * GET /api/media-files/state-ranking
 * Fetches US states ranked by play-record count, optionally scoped to a
 * date range - a many-venues-to-one-state rollup, plus the per-venue
 * breakdown used by the State Ranking table's "Total Ads" drill-down modal.
 *
 * @query startDate - Only include rows fetched on/after this calendar date, as "YYYY-MM-DD" (optional)
 * @query endDate - Only include rows fetched on/before this calendar date, as "YYYY-MM-DD" (optional)
 */
router.get('/state-ranking', (req, res) => mediaFilesController.getStateRanking(req, res));

/**
 * GET /api/media-files/state-ranking/:state/venues/export/xlsx
 * Fetches a single state's venues, optionally scoped to a date range, as a
 * styled XLSX workbook - powers the State Ranking table's venue breakdown
 * modal export. No bounded-range requirement, unlike the raw Programmatic
 * Ads/Venue Ranking exports - already scoped to one state.
 *
 * @param state - Two-letter state code, or "Unknown"
 * @query startDate - Only include rows fetched on/after this calendar date, as "YYYY-MM-DD" (optional)
 * @query endDate - Only include rows fetched on/before this calendar date, as "YYYY-MM-DD" (optional)
 */
router.get('/state-ranking/:state/venues/export/xlsx', (req, res) =>
    mediaFilesController.getStateVenuesExportXlsx(req, res),
);

/**
 * GET /api/media-files/category-ranking
 * Fetches venue categories ranked by play-record count, optionally scoped to
 * a date range - a many-venues-to-one-category rollup, plus the per-venue
 * breakdown used by the Category Ranking table's drill-down modals.
 *
 * @query startDate - Only include rows fetched on/after this calendar date, as "YYYY-MM-DD" (optional)
 * @query endDate - Only include rows fetched on/before this calendar date, as "YYYY-MM-DD" (optional)
 */
router.get('/category-ranking', (req, res) => mediaFilesController.getCategoryRanking(req, res));

/**
 * GET /api/media-files/venue-profile/:venueId
 * Fetches a single venue's full profile - hosts service details (address,
 * contact, coordinates, timezone) plus range-scoped ad stats - for the
 * standalone Venue Profile page.
 *
 * @param venueId - Venue identifier (matches Host.vistarVenueId)
 * @query startDate - Only include rows fetched on/after this calendar date, as "YYYY-MM-DD" (optional)
 * @query endDate - Only include rows fetched on/before this calendar date, as "YYYY-MM-DD" (optional)
 */
router.get('/venue-profile/:venueId', (req, res) => mediaFilesController.getVenueProfile(req, res));

/**
 * GET /api/media-files/venue-profile/:venueId/daily-devices
 * Fetches per-day, per-device ad counts for a single venue - powers the
 * Venue Profile page's daily chart's device breakdown.
 *
 * @param venueId - Venue identifier (matches Host.vistarVenueId)
 * @query startDate - Only include rows fetched on/after this calendar date, as "YYYY-MM-DD" (optional, defaults to 29 days before endDate)
 * @query endDate - Only include rows fetched on/before this calendar date, as "YYYY-MM-DD" (optional, defaults to today)
 */
router.get('/venue-profile/:venueId/daily-devices', (req, res) =>
    mediaFilesController.getDailyDeviceAdsSummary(req, res),
);

/**
 * GET /api/media-files/venue-profile/:venueId/hourly-devices
 * Fetches per-hour, per-device ad counts for a single venue on a single
 * calendar date - powers the Venue Profile page's daily chart's hour-of-day
 * breakdown, shown instead of the day-by-day view whenever the picked
 * range is exactly one day.
 *
 * @param venueId - Venue identifier (matches Host.vistarVenueId)
 * @query date - The single calendar date to break down by hour, as "YYYY-MM-DD" (required)
 */
router.get('/venue-profile/:venueId/hourly-devices', (req, res) =>
    mediaFilesController.getHourlyDeviceAdsSummary(req, res),
);

/**
 * GET /api/media-files/daily-ads-summary
 * Fetches per-day totals (total ads, unique venues) for the Map View bar
 * chart - defaults to the last month if no range is given.
 *
 * @query startDate - Only include rows fetched on/after this calendar date, as "YYYY-MM-DD" (optional)
 * @query endDate - Only include rows fetched on/before this calendar date, as "YYYY-MM-DD" (optional)
 */
router.get('/daily-ads-summary', (req, res) => mediaFilesController.getDailyAdsSummary(req, res));

/**
 * GET /api/media-files/dashboard/overview
 * The Dashboard's headline totals (received, unique ads / venues / devices), the
 * proof-of-play buckets and the received timeline (per hour for a single day, per day
 * otherwise). Needs only the range's rows, so it is the fast one of the three Dashboard
 * calls (overview, geography, ads), which the page fires in parallel.
 *
 * @query startDate - First calendar date, as "YYYY-MM-DD" (omit both dates for all time)
 * @query endDate - Last calendar date, as "YYYY-MM-DD" (at most 31 days after startDate; omit both for all time)
 */
router.get('/dashboard/overview', (req, res) =>
    mediaFilesController.getDashboardOverview(req, res),
);

/**
 * GET /api/media-files/dashboard/geography
 * The venues, states and categories that received playables in the range. Needs the
 * hosts service, and fails (instead of reporting every venue as "Unknown") when it does.
 *
 * @query startDate - First calendar date, as "YYYY-MM-DD" (omit both dates for all time)
 * @query endDate - Last calendar date, as "YYYY-MM-DD" (at most 31 days after startDate; omit both for all time)
 */
router.get('/dashboard/geography', (req, res) =>
    mediaFilesController.getDashboardGeography(req, res),
);

/**
 * GET /api/media-files/dashboard/ads
 * Every distinct creative received in the range, with the venues that received it.
 * Needs the media files (titles, thumbnails), not the hosts service.
 *
 * @query startDate - First calendar date, as "YYYY-MM-DD" (required)
 * @query endDate - Last calendar date, as "YYYY-MM-DD" (required, at most 31 days after startDate)
 */
router.get('/dashboard/ads', (req, res) => mediaFilesController.getDashboardAds(req, res));

/**
 * POST /api/media-files/dashboard/ads/by-venues
 * Same as GET /dashboard/ads, restricted to a given set of venues (and with no
 * required date range) - powers Map View's Ads breakdown card, scoped to a
 * clicked state's venues.
 *
 * @body venueIds - Venue IDs to restrict to - omit/empty for every venue
 * @body startDate - Only include rows fetched on/after this calendar date, as "YYYY-MM-DD" (optional)
 * @body endDate - Only include rows fetched on/before this calendar date, as "YYYY-MM-DD" (optional)
 */
router.post('/dashboard/ads/by-venues', (req, res) =>
    mediaFilesController.getDashboardAdsByVenues(req, res),
);

/**
 * POST /api/media-files/daily-ads-summary-by-venues
 * Same as GET /daily-ads-summary, restricted to a given set of venues -
 * powers the Map View bar chart once a state is selected.
 *
 * @body venueIds - Venue IDs to restrict to (required, non-empty)
 * @body startDate - Only include rows fetched on/after this calendar date, as "YYYY-MM-DD" (optional)
 * @body endDate - Only include rows fetched on/before this calendar date, as "YYYY-MM-DD" (optional)
 */
router.post('/daily-ads-summary-by-venues', (req, res) =>
    mediaFilesController.getDailyAdsSummaryByVenues(req, res),
);

/**
 * POST /api/media-files/ads-by-venues
 * Ranks ads by play count, descending, restricted to plays at a given set
 * of venues - powers the State Ranking table's "Unique Ads Played"
 * drill-down modal.
 *
 * @body venueIds - Venue IDs to restrict to (required, non-empty)
 * @body startDate - Only include rows fetched on/after this calendar date, as "YYYY-MM-DD" (optional)
 * @body endDate - Only include rows fetched on/before this calendar date, as "YYYY-MM-DD" (optional)
 */
router.post('/ads-by-venues', (req, res) => mediaFilesController.getAdsByVenues(req, res));

/**
 * GET /api/media-files/venue-ranking/export/xlsx
 * Fetches venues ranked by play-record count (optionally scoped to a date
 * range) as a styled XLSX workbook.
 *
 * @query startDate - Only include rows fetched on/after this calendar date, as "YYYY-MM-DD" (optional)
 * @query endDate - Only include rows fetched on/before this calendar date, as "YYYY-MM-DD" (optional)
 */
router.get('/venue-ranking/export/xlsx', (req, res) =>
    mediaFilesController.getVenueRankingExportXlsx(req, res),
);

/**
 * GET /api/media-files/state-ranking/export/xlsx
 * Fetches states ranked by play-record count within a date range as a styled XLSX
 * workbook.
 *
 * @query startDate - First calendar date, "YYYY-MM-DD" (required, at most 31 days before endDate)
 * @query endDate - Last calendar date, "YYYY-MM-DD" (required)
 */
router.get('/state-ranking/export/xlsx', (req, res) =>
    mediaFilesController.getStateRankingExportXlsx(req, res),
);

/**
 * GET /api/media-files/category-ranking/export/xlsx
 * Fetches venue categories ranked by play-record count within a date range as a styled
 * XLSX workbook.
 *
 * @query startDate - First calendar date, "YYYY-MM-DD" (required, at most 31 days before endDate)
 * @query endDate - Last calendar date, "YYYY-MM-DD" (required)
 */
router.get('/category-ranking/export/xlsx', (req, res) =>
    mediaFilesController.getCategoryRankingExportXlsx(req, res),
);

/**
 * GET /api/media-files/programmatic-ads/export/xlsx
 * Fetches every enriched programmatic_ads row as a styled XLSX workbook.
 */
router.get('/programmatic-ads/export/xlsx', (req, res) =>
    mediaFilesController.getProgrammaticAdsExportXlsx(req, res),
);

/**
 * GET /api/media-files/programmatic-ads/export
 * Fetches every raw programmatic_ads row with resolved creative media fields.
 */
router.get('/programmatic-ads/export', (req, res) =>
    mediaFilesController.getProgrammaticAdsExport(req, res),
);

/**
 * GET /api/media-files/programmatic-ads/stats
 * Gets total/green/yellow/red proof-of-play duration counts, optionally
 * scoped to a date range and/or an exact venue.
 *
 * @query startDate - Only include rows fetched on/after this calendar date, as "YYYY-MM-DD" (optional)
 * @query endDate - Only include rows fetched on/before this calendar date, as "YYYY-MM-DD" (optional)
 * @query venueId - Only include rows for this exact venue ID (optional)
 */
router.get('/programmatic-ads/stats', (req, res) =>
    mediaFilesController.getProgrammaticAdsStats(req, res),
);

/**
 * GET /api/media-files/programmatic-ads
 * Fetches a page of raw programmatic_ads rows, optionally filtered/sorted/
 * bucketed, and optionally scoped to one exact venue (powers the Venue
 * Ranking table's "Total Ads" detail modal, reusing this same endpoint).
 *
 * @query limit - Maximum number of results (default: 100)
 * @query offset - Number of results to skip (default: 0)
 * @query venueId - Exact venue_id match, scoping the whole page/sort/filter/bucket to one venue (optional)
 */
router.get('/programmatic-ads', (req, res) =>
    mediaFilesController.getProgrammaticAdsList(req, res),
);

/**
 * GET /api/media-files
 * Fetches all media files with optional filtering and pagination.
 *
 * @query limit - Maximum number of results (default: 100)
 * @query offset - Number of results to skip (default: 0)
 * @query source - Filter by creative source (optional)
 * @query search - Search by creative name or ID (optional)
 * @query sort - newest (default) | plays (all-time play count) | duration
 * @query direction - desc (default) | asc
 * @query type - video | image (optional)
 */
router.get('/', (req, res) => mediaFilesController.getAll(req, res));

/**
 * GET /api/media-files/type-counts
 * Counts media files, all and per creative type (Ads Gallery's type filter).
 *
 * @query search - Search by creative name or ID (optional)
 */
router.get('/type-counts', (req, res) => mediaFilesController.getTypeCounts(req, res));

/**
 * GET /api/media-files/:id
 * Fetches a single media file by ID with aggregated play metrics.
 *
 * @param id - UUID of the media file
 */
router.get('/:id', (req, res) => mediaFilesController.getById(req, res));

/**
 * GET /api/media-files/:id/play-records
 * Fetches all play records for a media file's creative.
 *
 * @param id - UUID of the media file
 * @query limit - Maximum number of results (default: 100)
 * @query offset - Number of results to skip (default: 0)
 * @query startDate - Only plays fetched on/after this calendar date (optional)
 * @query endDate - Only plays fetched on/before this calendar date (optional)
 */
router.get('/:id/play-records', (req, res) => mediaFilesController.getPlayRecords(req, res));

/**
 * GET /api/media-files/:id/play-records/export
 * Every play record of a media file's creative in a bounded date range, as JSON (CSV source).
 *
 * @param id - UUID of the media file
 * @query startDate - First day, "YYYY-MM-DD" (required, at most 31 days to endDate)
 * @query endDate - Last day, "YYYY-MM-DD" (required)
 */
router.get('/:id/play-records/export', (req, res) =>
    mediaFilesController.getPlayRecordsExport(req, res),
);

/**
 * GET /api/media-files/:id/play-records/export/xlsx
 * The same play records as a styled XLSX workbook.
 *
 * @param id - UUID of the media file
 * @query startDate - First day, "YYYY-MM-DD" (required, at most 31 days to endDate)
 * @query endDate - Last day, "YYYY-MM-DD" (required)
 */
router.get('/:id/play-records/export/xlsx', (req, res) =>
    mediaFilesController.getPlayRecordsExportXlsx(req, res),
);

/**
 * GET /api/media-files/:id/venue-slots
 * One ad's plays at one venue grouped by playlist slot (slot playlist content ID +
 * position), ascending by position, with each slot's play count, last play time and
 * newest screenshot.
 *
 * @param id - UUID of the media file
 * @query venueId - The venue (required)
 */
router.get('/:id/venue-slots', (req, res) => mediaFilesController.getVenueSlots(req, res));

/**
 * GET /api/media-files/:id/locations
 * Fetches location data (venues) where this media file's creative has been
 * played, optionally scoped to a date range.
 *
 * @param id - UUID of the media file
 * @query startDate - Only include rows fetched on/after this calendar date, as "YYYY-MM-DD" (optional)
 * @query endDate - Only include rows fetched on/before this calendar date, as "YYYY-MM-DD" (optional)
 */
router.get('/:id/locations', (req, res) => mediaFilesController.getLocations(req, res));

export default router;
