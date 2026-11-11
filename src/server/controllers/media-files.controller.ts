/** Third Party Imports */
import type { Request, Response } from 'express';

import { buildAdRankingExportColumns } from '../constants/ad-ranking-export.columns.js';
import { CATEGORY_RANKING_EXPORT_COLUMNS } from '../constants/category-ranking-export.columns.js';
import { buildProgrammaticAdsExportColumns } from '../constants/programmatic-ads-export.columns.js';
import { STATE_RANKING_EXPORT_COLUMNS } from '../constants/state-ranking-export.columns.js';
import { VENUE_RANKING_EXPORT_COLUMNS } from '../constants/venue-ranking-export.columns.js';
import type {
    GetProgrammaticAdsListOptions,
    MediaFileSort,
    ProgrammaticAdsSortBy,
} from '../types/media-files-options.types.js';
import type { PlayRecordContent } from '../types/play-record-content.types.js';

/** Local Imports */
import { locationsService } from '../services/locations.service.js';
import { mediaFilesService } from '../services/media-files.service.js';
import { spreadsheetExportService } from '../services/spreadsheet-export.service.js';
import { resolveAllowedTimeZone } from '../utils/zoned-calendar-date.util.js';

/**
 * Controller for media files endpoints.
 * Handles HTTP requests and delegates business logic to the service layer.
 *
 * @remarks
 * Controllers should only handle request/response logic, not business logic.
 */
export class MediaFilesController {
    /**
     * Orders GET /api/media-files accepts in `sort`
     * @type {readonly MediaFileSort[]}
     */
    private static readonly GALLERY_SORTS: readonly MediaFileSort[] = [
        'newest',
        'plays',
        'duration',
    ];

    /**
     * Handles GET /api/media-files/type-counts
     * Counts media files, all and per creative type (Ads Gallery's type filter).
     *
     * @param req - Express request (query: optional search)
     * @param res - Express response
     * @returns Promise<void>
     */
    async getTypeCounts(req: Request, res: Response): Promise<void> {
        try {
            const search = req.query['search'] as string | undefined;
            const counts = await mediaFilesService.getTypeCounts(search);
            res.json({ data: counts });
        } catch (error) {
            console.error('[Media Files Controller] Failed to count media files:', error);
            res.status(500).json({
                error: 'fetch_failed',
                errorDescription: 'Failed to count media files',
            });
        }
    }

    /**
     * Handles GET /api/media-files
     * Fetches all media files with optional filtering and pagination. Query: limit, offset,
     * source, search, sort (newest | plays | duration), direction (asc | desc), type
     * (video | image).
     *
     * @param req - Express request
     * @param res - Express response
     * @returns Promise<void>
     */
    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const limit = parseInt((req.query['limit'] as string) || '100', 10);
            const offset = parseInt((req.query['offset'] as string) || '0', 10);
            const source = req.query['source'] as string | undefined;
            const search = req.query['search'] as string | undefined;
            const sort = req.query['sort'] as string | undefined;
            const direction = req.query['direction'] as string | undefined;
            const type = req.query['type'] as string | undefined;

            if (sort && !MediaFilesController.GALLERY_SORTS.includes(sort as MediaFileSort)) {
                res.status(400).json({
                    error: 'invalid_request',
                    errorDescription: `sort must be one of: ${MediaFilesController.GALLERY_SORTS.join(', ')}`,
                });
                return;
            }
            if (direction && direction !== 'asc' && direction !== 'desc') {
                res.status(400).json({
                    error: 'invalid_request',
                    errorDescription: 'direction must be asc or desc',
                });
                return;
            }
            if (type && type !== 'video' && type !== 'image') {
                res.status(400).json({
                    error: 'invalid_request',
                    errorDescription: 'type must be video or image',
                });
                return;
            }

            const contents = await mediaFilesService.getAll({
                limit,
                offset,
                source,
                search,
                sort: sort as MediaFileSort | undefined,
                direction: direction as 'asc' | 'desc' | undefined,
                creativeType: type as 'video' | 'image' | undefined,
            });

            res.json({
                data: contents,
                meta: {
                    limit,
                    offset,
                    count: contents.length,
                },
            });
        } catch (error) {
            console.error('[Media Files Controller] Failed to fetch media files:', error);
            res.status(500).json({
                error: 'fetch_failed',
                errorDescription: 'Failed to fetch media files',
            });
        }
    }

    /**
     * Handles GET /api/media-files/analytics
     * Fetches aggregate dashboard metrics from media files and play records. Play-record
     * counts follow the optional range; without one they are all time.
     *
     * @param req - HTTP request (query: optional startDate, endDate as "YYYY-MM-DD")
     * @param res - HTTP response
     * @returns Promise<void>
     */
    async getAnalytics(req: Request, res: Response): Promise<void> {
        try {
            const startDate = req.query['startDate'] as string | undefined;
            const endDate = req.query['endDate'] as string | undefined;
            const timeZone = resolveAllowedTimeZone(req.query['timeZone']);
            const analytics = await mediaFilesService.getDashboardAnalytics({
                startDate,
                endDate,
                timeZone,
            });
            res.json({ data: analytics });
        } catch (error) {
            console.error('[Media Files Controller] Failed to fetch dashboard analytics:', error);
            res.status(500).json({
                error: 'fetch_failed',
                errorDescription: 'Failed to fetch dashboard analytics',
            });
        }
    }

    /**
     * Handles GET /api/media-files/ad-ranking
     * Fetches ads ranked by play-record count, optionally scoped to a date range.
     *
     * @param req - Express request
     * @param res - Express response
     * @returns Promise<void>
     */
    async getAdRanking(req: Request, res: Response): Promise<void> {
        try {
            const startDate = req.query['startDate'] as string | undefined;
            const endDate = req.query['endDate'] as string | undefined;

            const data = await mediaFilesService.getAdRanking({ startDate, endDate });

            res.json({
                data,
                meta: {
                    count: data.length,
                },
            });
        } catch (error) {
            console.error('[Media Files Controller] Failed to fetch ad ranking:', error);
            res.status(500).json({
                error: 'fetch_failed',
                errorDescription: 'Failed to fetch ad ranking',
            });
        }
    }

    /**
     * Handles POST /api/media-files/ads-by-venues
     * Ranks ads by play count, descending, restricted to plays at a given
     * set of venues - powers the State Ranking table's "Unique Ads Played"
     * drill-down modal. POST (not GET) since the venue ID list can be long
     * enough to exceed a practical query-string length.
     *
     * @param req - Express request
     * @param res - Express response
     * @returns Promise<void>
     */
    async getAdsByVenues(req: Request, res: Response): Promise<void> {
        try {
            const venueIds = req.body?.venueIds as string[] | undefined;
            const startDate = req.body?.startDate as string | undefined;
            const endDate = req.body?.endDate as string | undefined;

            if (!Array.isArray(venueIds) || venueIds.length === 0) {
                res.status(400).json({
                    error: 'invalid_request',
                    errorDescription: 'venueIds must be a non-empty array',
                });
                return;
            }

            const data = await mediaFilesService.getAdsByVenues(venueIds, { startDate, endDate });

            res.json({
                data,
                meta: {
                    count: data.length,
                },
            });
        } catch (error) {
            console.error('[Media Files Controller] Failed to fetch ads by venues:', error);
            res.status(500).json({
                error: 'fetch_failed',
                errorDescription: 'Failed to fetch ads by venues',
            });
        }
    }

    /**
     * Handles GET /api/media-files/venue-ranking
     * Fetches venues ranked by play-record count, optionally scoped to a date
     * range, enriched with host details from the hosts service.
     *
     * @param req - Express request
     * @param res - Express response
     * @returns Promise<void>
     */
    async getVenueRanking(req: Request, res: Response): Promise<void> {
        try {
            const startDate = req.query['startDate'] as string | undefined;
            const endDate = req.query['endDate'] as string | undefined;

            const data = await mediaFilesService.getVenueRanking({ startDate, endDate });

            res.json({
                data,
                meta: {
                    count: data.length,
                },
            });
        } catch (error) {
            console.error('[Media Files Controller] Failed to fetch venue ranking:', error);
            res.status(500).json({
                error: 'fetch_failed',
                errorDescription: 'Failed to fetch venue ranking',
            });
        }
    }

    /**
     * Handles GET /api/media-files/state-ranking
     * Fetches US states ranked by play-record count, optionally scoped to a
     * date range - a many-venues-to-one-state rollup of the same data
     * getVenueRanking builds, plus the per-venue breakdown used to power the
     * State Ranking table's "Total Ads" drill-down modal.
     *
     * @param req - Express request
     * @param res - Express response
     * @returns Promise<void>
     */
    async getStateRanking(req: Request, res: Response): Promise<void> {
        try {
            const startDate = req.query['startDate'] as string | undefined;
            const endDate = req.query['endDate'] as string | undefined;

            const { states, venues } = await mediaFilesService.getStateRanking({
                startDate,
                endDate,
            });

            res.json({
                data: { states, venues },
                meta: {
                    count: states.length,
                },
            });
        } catch (error) {
            console.error('[Media Files Controller] Failed to fetch state ranking:', error);
            res.status(500).json({
                error: 'fetch_failed',
                errorDescription: 'Failed to fetch state ranking',
            });
        }
    }

    /**
     * Fetches venue categories ranked by play-record count, optionally
     * scoped to a date range - a many-venues-to-one-category rollup, plus
     * the per-venue breakdown used to power the Category Ranking table's
     * drill-down modals. Mirrors getStateRanking() exactly.
     *
     * @param req - Express request
     * @param res - Express response
     * @returns Promise<void>
     */
    async getCategoryRanking(req: Request, res: Response): Promise<void> {
        try {
            const startDate = req.query['startDate'] as string | undefined;
            const endDate = req.query['endDate'] as string | undefined;

            const { categories, venues } = await mediaFilesService.getCategoryRanking({
                startDate,
                endDate,
            });

            res.json({
                data: { categories, venues },
                meta: {
                    count: categories.length,
                },
            });
        } catch (error) {
            console.error('[Media Files Controller] Failed to fetch category ranking:', error);
            res.status(500).json({
                error: 'fetch_failed',
                errorDescription: 'Failed to fetch category ranking',
            });
        }
    }

    /**
     * Fetches a single venue's full profile (hosts service details plus
     * range-scoped ad stats), for the standalone Venue Profile page.
     *
     * @param req - Express request
     * @param res - Express response
     * @returns Promise<void>
     */
    async getVenueProfile(req: Request, res: Response): Promise<void> {
        try {
            const venueId = req.params['venueId'] as string;
            const startDate = req.query['startDate'] as string | undefined;
            const endDate = req.query['endDate'] as string | undefined;

            const profile = await mediaFilesService.getVenueProfile(venueId, {
                startDate,
                endDate,
            });

            if (!profile) {
                res.status(404).json({
                    error: 'not_found',
                    errorDescription: `Venue "${venueId}" was not found`,
                });
                return;
            }

            res.json({ data: profile });
        } catch (error) {
            console.error('[Media Files Controller] Failed to fetch venue profile:', error);
            res.status(500).json({
                error: 'fetch_failed',
                errorDescription: 'Failed to fetch venue profile',
            });
        }
    }

    /**
     * Fetches per-day, per-device ad counts for a single venue - powers the
     * Venue Profile page's daily chart's device breakdown.
     *
     * @param req - Express request
     * @param res - Express response
     * @returns Promise<void>
     */
    async getDailyDeviceAdsSummary(req: Request, res: Response): Promise<void> {
        try {
            const venueId = req.params['venueId'] as string;
            const startDate = req.query['startDate'] as string | undefined;
            const endDate = req.query['endDate'] as string | undefined;
            const timeZone = resolveAllowedTimeZone(req.query['timeZone']);

            const days = await mediaFilesService.getDailyDeviceAdsSummary(venueId, {
                startDate,
                endDate,
                timeZone,
            });

            res.json({ data: days });
        } catch (error) {
            console.error(
                '[Media Files Controller] Failed to fetch daily device ads summary:',
                error,
            );
            res.status(500).json({
                error: 'fetch_failed',
                errorDescription: 'Failed to fetch daily device ads summary',
            });
        }
    }

    /**
     * Fetches per-hour, per-device ad counts for a single venue on a single
     * calendar date - powers the Venue Profile page's daily chart's
     * hour-of-day breakdown, shown instead of the day-by-day view whenever
     * the picked range is exactly one day.
     *
     * @param req - Express request
     * @param res - Express response
     * @returns Promise<void>
     */
    async getHourlyDeviceAdsSummary(req: Request, res: Response): Promise<void> {
        try {
            const venueId = req.params['venueId'] as string;
            const date = req.query['date'] as string | undefined;

            if (!date) {
                res.status(400).json({
                    error: 'invalid_request',
                    errorDescription: 'date is required',
                });
                return;
            }

            const timeZone = resolveAllowedTimeZone(req.query['timeZone']);
            const hours = await mediaFilesService.getHourlyDeviceAdsSummary(
                venueId,
                date,
                timeZone,
            );

            res.json({ data: hours });
        } catch (error) {
            console.error(
                '[Media Files Controller] Failed to fetch hourly device ads summary:',
                error,
            );
            res.status(500).json({
                error: 'fetch_failed',
                errorDescription: 'Failed to fetch hourly device ads summary',
            });
        }
    }

    /**
     * Handles GET /api/media-files/daily-ads-summary
     * Fetches per-day totals (total ads, unique venues) for the Map View bar
     * chart, optionally scoped to a date range (defaults to the last 30 days).
     *
     * @param req - Express request
     * @param res - Express response
     * @returns Promise<void>
     */
    async getDailyAdsSummary(req: Request, res: Response): Promise<void> {
        try {
            const startDate = req.query['startDate'] as string | undefined;
            const endDate = req.query['endDate'] as string | undefined;
            const timeZone = resolveAllowedTimeZone(req.query['timeZone']);

            const data = await mediaFilesService.getDailyAdsSummary({
                startDate,
                endDate,
                timeZone,
            });

            res.json({
                data,
                meta: {
                    count: data.length,
                },
            });
        } catch (error) {
            console.error('[Media Files Controller] Failed to fetch daily ads summary:', error);
            res.status(500).json({
                error: 'fetch_failed',
                errorDescription: 'Failed to fetch daily ads summary',
            });
        }
    }

    /**
     * Widest range the Dashboard calls accept, in days - they scan every row in the range
     * @type {number}
     */
    private static readonly MAX_DASHBOARD_RANGE_DAYS = 31;

    /**
     * Handles GET /api/media-files/dashboard/overview
     * Headline totals, proof-of-play buckets and the received timeline for one date
     * range. Needs only the range's rows, so it is the fast Dashboard call.
     *
     * @param req - Express request (query: startDate, endDate as "YYYY-MM-DD", both required, at most 31 days apart)
     * @param res - Express response
     * @returns Promise<void>
     */
    async getDashboardOverview(req: Request, res: Response): Promise<void> {
        const timeZone = resolveAllowedTimeZone(req.query['timeZone']);
        await this.respondWithDashboardSection(
            req,
            res,
            'overview',
            (startDate, endDate) =>
                mediaFilesService.getDashboardOverview(startDate, endDate, timeZone),
            true,
        );
    }

    /**
     * Handles GET /api/media-files/dashboard/geography
     * The venues, states and categories that received playables in one date range.
     * Needs the hosts service, so it is the Dashboard call that can be slow - and it fails
     * (rather than reporting every venue as "Unknown") when the hosts service does.
     *
     * @param req - Express request (query: startDate, endDate as "YYYY-MM-DD", both required, at most 31 days apart)
     * @param res - Express response
     * @returns Promise<void>
     */
    async getDashboardGeography(req: Request, res: Response): Promise<void> {
        await this.respondWithDashboardSection(
            req,
            res,
            'geography',
            (startDate, endDate) => mediaFilesService.getDashboardGeography(startDate, endDate),
            true,
        );
    }

    /**
     * Handles GET /api/media-files/dashboard/ads
     * Every distinct creative received in one date range, with the venues that
     * received it. Needs the media files (titles, thumbnails), not the hosts service.
     *
     * @param req - Express request (query: startDate, endDate as "YYYY-MM-DD", both required, at most 31 days apart)
     * @param res - Express response
     * @returns Promise<void>
     */
    async getDashboardAds(req: Request, res: Response): Promise<void> {
        await this.respondWithDashboardSection(req, res, 'ads', (startDate, endDate) =>
            mediaFilesService.getDashboardAds(startDate!, endDate!),
        );
    }

    /**
     * Handles POST /api/media-files/dashboard/ads/by-venues
     * Every distinct creative received in one date range (optional - all time if both
     * omitted), with the venues that received it, restricted to venueIds when given -
     * powers Map View's Ads breakdown card, scoped to a clicked state's venues. POST
     * (not GET) since the venue ID list can be long enough to exceed a practical
     * query-string length - same rationale as getAdsByVenues.
     *
     * @param req - Express request
     * @param res - Express response
     * @returns Promise<void>
     */
    async getDashboardAdsByVenues(req: Request, res: Response): Promise<void> {
        try {
            const venueIds = req.body?.venueIds as string[] | undefined;
            const startDate = req.body?.startDate as string | undefined;
            const endDate = req.body?.endDate as string | undefined;

            const data = await mediaFilesService.getDashboardAds(startDate, endDate, venueIds);

            res.json({ data });
        } catch (error) {
            console.error(
                '[Media Files Controller] Failed to fetch dashboard ads by venues:',
                error,
            );
            res.status(500).json({
                error: 'fetch_failed',
                errorDescription: 'Failed to fetch dashboard ads by venues',
            });
        }
    }

    /**
     * Shared body of the three Dashboard handlers: validates the range, loads the
     * section and logs how long it took (and how many rows it covered), so the slow part
     * of a slow Dashboard load shows up in the BFF log.
     *
     * @param req - Express request
     * @param res - Express response
     * @param section - Which Dashboard call this is, for the log and error text
     * @param load - Loads the section's data for the validated range (both dates undefined for all time)
     * @param allowAllTime - Accept a request with no dates as all time (overview and geography, for the top bar's totals); otherwise both dates are required
     * @returns Promise<void>
     */
    private async respondWithDashboardSection<T extends { received: number }>(
        req: Request,
        res: Response,
        section: 'overview' | 'geography' | 'ads',
        load: (startDate: string | undefined, endDate: string | undefined) => Promise<T>,
        allowAllTime = false,
    ): Promise<void> {
        const startDate = req.query['startDate'] as string | undefined;
        const endDate = req.query['endDate'] as string | undefined;
        // No dates at all = all time, where the section allows it (the top bar's totals)
        const isAllTime = allowAllTime && !startDate && !endDate;

        const rangeError = isAllTime ? null : this.validateDashboardDateRange(startDate, endDate);
        if (rangeError || (!isAllTime && (!startDate || !endDate))) {
            res.status(400).json({
                error: 'invalid_request',
                errorDescription: rangeError ?? 'startDate and endDate are required',
            });
            return;
        }

        const startedAt = Date.now();
        try {
            const data = await load(startDate, endDate);
            console.log(
                `[Dashboard] ${section} ${Date.now() - startedAt}ms rows=${data.received} range=${isAllTime ? 'all-time' : `${startDate}..${endDate}`}`,
            );

            res.json({ data });
        } catch (error) {
            console.error(
                `[Media Files Controller] Failed to fetch dashboard ${section} after ${Date.now() - startedAt}ms:`,
                error,
            );
            res.status(500).json({
                error: 'fetch_failed',
                errorDescription: `Failed to fetch dashboard ${section}`,
            });
        }
    }

    /**
     * Validates the Dashboard's date range: both dates required as real "YYYY-MM-DD"
     * calendar dates (or an already-resolved ISO instant - see `resolveDateZone`), start
     * on or before end, and at most MAX_DASHBOARD_RANGE_DAYS days - each call scans every
     * row in the range, so an unbounded range is refused here, not just in the UI.
     *
     * @param startDate - "YYYY-MM-DD", or an already-resolved ISO instant, start of the requested range, if any
     * @param endDate - "YYYY-MM-DD", or an already-resolved ISO instant, end of the requested range, if any
     * @returns Error message if the range is invalid, or null if it's valid
     */
    private validateDashboardDateRange(startDate?: string, endDate?: string): string | null {
        if (!startDate || !endDate) {
            return 'startDate and endDate are required, as YYYY-MM-DD.';
        }

        const toUtcMs = (calendarDate: string): number => {
            // resolveDateZone (runs before this, on every /api/media-files route) rewrites
            // a bare "YYYY-MM-DD" into the UTC instant of that date's zoned midnight (e.g.
            // "...T04:00:00.000Z" in Eastern mode) - that instant is what reaches here, not
            // the original bare date, so this must accept both shapes.
            if (calendarDate.includes('T')) {
                const parsed = new Date(calendarDate);
                return Number.isNaN(parsed.getTime()) ? Number.NaN : parsed.getTime();
            }

            const parsed = new Date(`${calendarDate}T00:00:00.000Z`);
            // Round-trips back to the same text only for real dates ("2026-13-45" and
            // "2026-02-30" parse to NaN or roll over)
            return /^\d{4}-\d{2}-\d{2}$/.test(calendarDate) &&
                !Number.isNaN(parsed.getTime()) &&
                parsed.toISOString().slice(0, 10) === calendarDate
                ? parsed.getTime()
                : Number.NaN;
        };

        const startMs = toUtcMs(startDate);
        const endMs = toUtcMs(endDate);
        if (Number.isNaN(startMs) || Number.isNaN(endMs)) {
            return 'startDate and endDate must be real calendar dates, as YYYY-MM-DD.';
        }
        if (startMs > endMs) {
            return 'startDate must be on or before endDate.';
        }

        const spanDays = Math.round((endMs - startMs) / (24 * 60 * 60 * 1000)) + 1;
        if (spanDays > MediaFilesController.MAX_DASHBOARD_RANGE_DAYS) {
            return `Date range is too wide - the dashboard supports up to ${MediaFilesController.MAX_DASHBOARD_RANGE_DAYS} days.`;
        }

        return null;
    }

    /**
     * Handles POST /api/media-files/daily-ads-summary-by-venues
     * Same as getDailyAdsSummary, restricted to a given set of venues -
     * powers the Map View bar chart once a state is selected. POST (not
     * GET) since the venue ID list can be long enough to exceed a practical
     * query-string length - same rationale as getAdsByVenues.
     *
     * @param req - Express request
     * @param res - Express response
     * @returns Promise<void>
     */
    async getDailyAdsSummaryByVenues(req: Request, res: Response): Promise<void> {
        try {
            const venueIds = req.body?.venueIds as string[] | undefined;
            const startDate = req.body?.startDate as string | undefined;
            const endDate = req.body?.endDate as string | undefined;
            const timeZone = resolveAllowedTimeZone(req.query['timeZone']);

            if (!Array.isArray(venueIds) || venueIds.length === 0) {
                res.status(400).json({
                    error: 'invalid_request',
                    errorDescription: 'venueIds must be a non-empty array',
                });
                return;
            }

            const data = await mediaFilesService.getDailyAdsSummary({
                startDate,
                endDate,
                venueIds,
                timeZone,
            });

            res.json({
                data,
                meta: {
                    count: data.length,
                },
            });
        } catch (error) {
            console.error(
                '[Media Files Controller] Failed to fetch daily ads summary by venues:',
                error,
            );
            res.status(500).json({
                error: 'fetch_failed',
                errorDescription: 'Failed to fetch daily ads summary by venues',
            });
        }
    }

    /**
     * Handles GET /api/media-files/programmatic-ads
     * Fetches a page of raw programmatic_ads rows.
     *
     * @param req - Express request
     * @param res - Express response
     * @returns Promise<void>
     */
    async getProgrammaticAdsList(req: Request, res: Response): Promise<void> {
        try {
            const limit = parseInt((req.query['limit'] as string) || '100', 10);
            const offset = parseInt((req.query['offset'] as string) || '0', 10);

            const { data, count } = await mediaFilesService.getProgrammaticAdsList({
                limit,
                offset,
                ...this.parseProgrammaticAdsFilters(req),
            });

            res.json({
                data,
                meta: {
                    limit,
                    offset,
                    count,
                },
            });
        } catch (error) {
            console.error('[Media Files Controller] Failed to fetch programmatic ads:', error);
            res.status(500).json({
                error: 'fetch_failed',
                errorDescription: 'Failed to fetch programmatic ads',
            });
        }
    }

    /**
     * Handles GET /api/media-files/programmatic-ads/stats
     * Gets total/green/yellow/red proof-of-play duration counts, optionally
     * scoped to a date range.
     *
     * @param req - Express request
     * @param res - Express response
     * @returns Promise<void>
     */
    async getProgrammaticAdsStats(req: Request, res: Response): Promise<void> {
        try {
            const startDate = req.query['startDate'] as string | undefined;
            const endDate = req.query['endDate'] as string | undefined;
            const venueIdsRaw = req.query['venueIds'] as string | undefined;
            const venueIds = venueIdsRaw ? (JSON.parse(venueIdsRaw) as string[]) : undefined;

            const data = await mediaFilesService.getProgrammaticAdsStats({
                startDate,
                endDate,
                venueIds,
            });

            res.json({ data });
        } catch (error) {
            console.error(
                '[Media Files Controller] Failed to fetch programmatic ads stats:',
                error,
            );
            res.status(500).json({
                error: 'fetch_failed',
                errorDescription: 'Failed to fetch programmatic ads stats',
            });
        }
    }

    /**
     * Parses the Programmatic Ads filter query params shared by the list,
     * export, and export/xlsx endpoints, so an export always matches
     * whatever's currently filtered in the table.
     *
     * @param req - Express request
     * @returns Parsed filter options
     */
    private parseProgrammaticAdsFilters(
        req: Request,
    ): Omit<GetProgrammaticAdsListOptions, 'limit' | 'offset'> {
        const bucket = req.query['bucket'] as
            'green' | 'yellow' | 'red' | 'gray' | 'successful' | 'overdue' | 'recent' | undefined;
        const sortBy = req.query['sortBy'] as ProgrammaticAdsSortBy | undefined;
        const sortDir = req.query['sortDir'] as 'asc' | 'desc' | undefined;
        const search = req.query['search'] as string | undefined;
        const columnFiltersRaw = req.query['columnFilters'] as string | undefined;
        const columnFilters = columnFiltersRaw ? JSON.parse(columnFiltersRaw) : undefined;
        const startDate = req.query['startDate'] as string | undefined;
        const endDate = req.query['endDate'] as string | undefined;
        const venueIdsRaw = req.query['venueIds'] as string | undefined;
        const venueIds = venueIdsRaw ? (JSON.parse(venueIdsRaw) as string[]) : undefined;

        return { bucket, sortBy, sortDir, search, columnFilters, startDate, endDate, venueIds };
    }

    /**
     * Widest date range allowed for export (about a month) - see validateExportDateRange.
     */
    private static readonly MAX_EXPORT_RANGE_DAYS = 31;

    /**
     * Requires a bounded date range for export requests - an unscoped or
     * overly wide export can pull an unbounded number of rows, which is slow
     * for both the server (paginating the whole matching set) and the
     * requester. Enforced here too, not just in the UI, since this endpoint
     * is reachable directly.
     *
     * @param startDate - "YYYY-MM-DD" start of the requested range, if any
     * @param endDate - "YYYY-MM-DD" end of the requested range, if any
     * @returns Error message if the range is missing/too wide, or null if it's valid
     */
    private validateExportDateRange(startDate?: string, endDate?: string): string | null {
        if (!startDate || !endDate) {
            return `A date range is required to export - select up to ${MediaFilesController.MAX_EXPORT_RANGE_DAYS} days.`;
        }

        const spanDays =
            Math.round(
                (new Date(endDate).getTime() - new Date(startDate).getTime()) /
                    (24 * 60 * 60 * 1000),
            ) + 1;

        if (spanDays > MediaFilesController.MAX_EXPORT_RANGE_DAYS) {
            return `Date range is too wide - export supports up to ${MediaFilesController.MAX_EXPORT_RANGE_DAYS} days.`;
        }

        return null;
    }

    /**
     * Handles GET /api/media-files/programmatic-ads/export
     * Fetches every programmatic_ads row matching the current filters, with
     * resolved creative media fields.
     *
     * @param req - Express request
     * @param res - Express response
     * @returns Promise<void>
     */
    async getProgrammaticAdsExport(req: Request, res: Response): Promise<void> {
        try {
            const filters = this.parseProgrammaticAdsFilters(req);
            const validationError = this.validateExportDateRange(
                filters.startDate,
                filters.endDate,
            );
            if (validationError) {
                res.status(400).json({
                    error: 'invalid_date_range',
                    errorDescription: validationError,
                });
                return;
            }

            const data = await mediaFilesService.getProgrammaticAdsExport(filters);
            res.json({
                data,
                meta: {
                    count: data.length,
                },
            });
        } catch (error) {
            console.error('[Media Files Controller] Failed to export programmatic ads:', error);
            res.status(500).json({
                error: 'fetch_failed',
                errorDescription: 'Failed to export programmatic ads',
            });
        }
    }

    /**
     * Handles GET /api/media-files/programmatic-ads/export/xlsx
     * Fetches every enriched programmatic_ads row matching the current
     * filters, as a styled XLSX workbook.
     *
     * @param req - Express request
     * @param res - Express response
     * @returns Promise<void>
     */
    async getProgrammaticAdsExportXlsx(req: Request, res: Response): Promise<void> {
        try {
            const filters = this.parseProgrammaticAdsFilters(req);
            const validationError = this.validateExportDateRange(
                filters.startDate,
                filters.endDate,
            );
            if (validationError) {
                res.status(400).json({
                    error: 'invalid_date_range',
                    errorDescription: validationError,
                });
                return;
            }

            const records = await mediaFilesService.getProgrammaticAdsExport(filters);
            const timeZone = resolveAllowedTimeZone(req.query['timeZone']);
            const workbook = await spreadsheetExportService.createWorkbook({
                title: 'Received Playables Export',
                sheetName: 'Received Playables',
                columns: buildProgrammaticAdsExportColumns(timeZone),
                rows: records,
                hyperlinkColumnKey: ['mediaUrl', 'popScreenshot'],
            });

            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            );
            res.setHeader(
                'Content-Disposition',
                'attachment; filename="received-playables-export.xlsx"',
            );
            res.send(workbook);
        } catch (error) {
            console.error('[Media Files Controller] Failed to create XLSX export:', error);
            res.status(500).json({
                error: 'export_failed',
                errorDescription: 'Failed to create XLSX export',
            });
        }
    }

    /**
     * Handles GET /api/media-files/venue-ranking/export/xlsx
     * Fetches venues ranked by play-record count within a required, bounded
     * date range, as a styled XLSX workbook.
     *
     * @param req - Express request
     * @param res - Express response
     * @returns Promise<void>
     */
    async getVenueRankingExportXlsx(req: Request, res: Response): Promise<void> {
        try {
            const startDate = req.query['startDate'] as string | undefined;
            const endDate = req.query['endDate'] as string | undefined;

            const validationError = this.validateExportDateRange(startDate, endDate);
            if (validationError) {
                res.status(400).json({
                    error: 'invalid_date_range',
                    errorDescription: validationError,
                });
                return;
            }

            const venues = await mediaFilesService.getVenueRanking({ startDate, endDate });
            const workbook = await spreadsheetExportService.createWorkbook({
                title: 'Venue Ranking Export',
                sheetName: 'Venue Ranking',
                columns: VENUE_RANKING_EXPORT_COLUMNS,
                rows: venues,
                hyperlinkColumnKey: 'screenshotUrl',
            });

            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            );
            res.setHeader(
                'Content-Disposition',
                'attachment; filename="venue-ranking-export.xlsx"',
            );
            res.send(workbook);
        } catch (error) {
            console.error(
                '[Media Files Controller] Failed to create Venue Ranking XLSX export:',
                error,
            );
            res.status(500).json({
                error: 'export_failed',
                errorDescription: 'Failed to create Venue Ranking XLSX export',
            });
        }
    }

    /**
     * Handles GET /api/media-files/state-ranking/export/xlsx
     * Fetches states ranked by play-record count within a required, bounded
     * date range, as a styled XLSX workbook.
     *
     * @param req - Express request
     * @param res - Express response
     * @returns Promise<void>
     */
    async getStateRankingExportXlsx(req: Request, res: Response): Promise<void> {
        try {
            const startDate = req.query['startDate'] as string | undefined;
            const endDate = req.query['endDate'] as string | undefined;

            const validationError = this.validateExportDateRange(startDate, endDate);
            if (validationError) {
                res.status(400).json({
                    error: 'invalid_date_range',
                    errorDescription: validationError,
                });
                return;
            }

            const { states } = await mediaFilesService.getStateRanking({ startDate, endDate });
            const workbook = await spreadsheetExportService.createWorkbook({
                title: 'State Ranking Export',
                sheetName: 'State Ranking',
                columns: STATE_RANKING_EXPORT_COLUMNS,
                rows: states,
            });

            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            );
            res.setHeader(
                'Content-Disposition',
                'attachment; filename="state-ranking-export.xlsx"',
            );
            res.send(workbook);
        } catch (error) {
            console.error(
                '[Media Files Controller] Failed to create State Ranking XLSX export:',
                error,
            );
            res.status(500).json({
                error: 'export_failed',
                errorDescription: 'Failed to create State Ranking XLSX export',
            });
        }
    }

    /**
     * Handles GET /api/media-files/category-ranking/export/xlsx
     * Fetches venue categories ranked by play-record count within a required, bounded
     * date range, as a styled XLSX workbook.
     *
     * @param req - Express request
     * @param res - Express response
     * @returns Promise<void>
     */
    async getCategoryRankingExportXlsx(req: Request, res: Response): Promise<void> {
        try {
            const startDate = req.query['startDate'] as string | undefined;
            const endDate = req.query['endDate'] as string | undefined;

            const validationError = this.validateExportDateRange(startDate, endDate);
            if (validationError) {
                res.status(400).json({
                    error: 'invalid_date_range',
                    errorDescription: validationError,
                });
                return;
            }

            const { categories } = await mediaFilesService.getCategoryRanking({
                startDate,
                endDate,
            });
            const workbook = await spreadsheetExportService.createWorkbook({
                title: 'Category Ranking Export',
                sheetName: 'Category Ranking',
                columns: CATEGORY_RANKING_EXPORT_COLUMNS,
                rows: categories,
            });

            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            );
            res.setHeader(
                'Content-Disposition',
                'attachment; filename="category-ranking-export.xlsx"',
            );
            res.send(workbook);
        } catch (error) {
            console.error(
                '[Media Files Controller] Failed to create Category Ranking XLSX export:',
                error,
            );
            res.status(500).json({
                error: 'export_failed',
                errorDescription: 'Failed to create Category Ranking XLSX export',
            });
        }
    }

    /**
     * Handles GET /api/media-files/state-ranking/:state/venues/export/xlsx
     * Fetches a single state's venues (from the State Ranking table's own
     * per-venue breakdown), optionally scoped to a date range, as a styled
     * XLSX workbook - powers the venue breakdown modal's export. No
     * bounded-range requirement, unlike the raw Programmatic Ads/Venue
     * Ranking exports - already scoped to one state.
     *
     * @param req - Express request
     * @param res - Express response
     * @returns Promise<void>
     */
    async getStateVenuesExportXlsx(req: Request, res: Response): Promise<void> {
        try {
            const state = req.params['state'] as string;
            const startDate = req.query['startDate'] as string | undefined;
            const endDate = req.query['endDate'] as string | undefined;

            // No bounded-range requirement here, unlike the raw Programmatic
            // Ads/Venue Ranking exports - this is always scoped to one
            // state's own venues (the same data the State Ranking table
            // already shows unscoped, with no required range), never an
            // unbounded whole-table scan.
            const venues = await mediaFilesService.getStateVenues(state, { startDate, endDate });
            const workbook = await spreadsheetExportService.createWorkbook({
                title: `${state} Venues Export`,
                sheetName: 'Venues',
                columns: VENUE_RANKING_EXPORT_COLUMNS,
                rows: venues,
                hyperlinkColumnKey: 'screenshotUrl',
            });

            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            );
            res.setHeader(
                'Content-Disposition',
                `attachment; filename="${state.toLowerCase()}-venues-export.xlsx"`,
            );
            res.send(workbook);
        } catch (error) {
            console.error(
                '[Media Files Controller] Failed to create State Venues XLSX export:',
                error,
            );
            res.status(500).json({
                error: 'export_failed',
                errorDescription: 'Failed to create State Venues XLSX export',
            });
        }
    }

    /**
     * Handles GET /api/media-files/ad-ranking/export/xlsx
     * Fetches ads ranked by play-record count within a required, bounded
     * date range, as a styled XLSX workbook.
     *
     * @param req - Express request
     * @param res - Express response
     * @returns Promise<void>
     */
    async getAdRankingExportXlsx(req: Request, res: Response): Promise<void> {
        try {
            const startDate = req.query['startDate'] as string | undefined;
            const endDate = req.query['endDate'] as string | undefined;

            const validationError = this.validateExportDateRange(startDate, endDate);
            if (validationError) {
                res.status(400).json({
                    error: 'invalid_date_range',
                    errorDescription: validationError,
                });
                return;
            }

            const ads = await mediaFilesService.getAdRanking({ startDate, endDate });
            const timeZone = resolveAllowedTimeZone(req.query['timeZone']);
            const workbook = await spreadsheetExportService.createWorkbook({
                title: 'Ad Ranking Export',
                sheetName: 'Ad Ranking',
                columns: buildAdRankingExportColumns(timeZone),
                rows: ads,
                hyperlinkColumnKey: 'creativeUrl',
            });

            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            );
            res.setHeader('Content-Disposition', 'attachment; filename="ad-ranking-export.xlsx"');
            res.send(workbook);
        } catch (error) {
            console.error(
                '[Media Files Controller] Failed to create Ad Ranking XLSX export:',
                error,
            );
            res.status(500).json({
                error: 'export_failed',
                errorDescription: 'Failed to create Ad Ranking XLSX export',
            });
        }
    }

    /**
     * Handles GET /api/media-files/:id
     * Fetches a single media file by ID with aggregated play metrics.
     *
     * @param req - Express request
     * @param res - Express response
     * @returns Promise<void>
     */
    async getById(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params['id'] as string;

            const content = await mediaFilesService.getById(id);

            if (!content) {
                res.status(404).json({
                    error: 'not_found',
                    errorDescription: `Media file with ID ${id} not found`,
                });
                return;
            }

            res.json({
                data: content,
            });
        } catch (error) {
            console.error(
                `[Media Files Controller] Failed to fetch media file ${req.params['id']}:`,
                error,
            );
            res.status(500).json({
                error: 'fetch_failed',
                errorDescription: 'Failed to fetch media file',
            });
        }
    }

    /**
     * Handles GET /api/media-files/:id/play-records
     * Fetches a page of play records for a media file's creative, optionally scoped to a
     * date range; meta.total is the number of plays in that range (the page is capped).
     *
     * @param req - Express request (query: limit, offset, optional startDate, endDate)
     * @param res - Express response
     * @returns Promise<void>
     */
    async getPlayRecords(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params['id'] as string;
            const limit = parseInt((req.query['limit'] as string) || '100', 10);
            const offset = parseInt((req.query['offset'] as string) || '0', 10);
            const startDate = req.query['startDate'] as string | undefined;
            const endDate = req.query['endDate'] as string | undefined;

            // First, resolve the media file to get its creative identity
            const mediaFile = await mediaFilesService.getById(id);

            if (!mediaFile) {
                res.status(404).json({
                    error: 'not_found',
                    errorDescription: `Media file with ID ${id} not found`,
                });
                return;
            }

            const { records, total } = await mediaFilesService.getPlayRecords(
                mediaFile.creativeId,
                mediaFile.creativeSource,
                { limit, offset, startDate, endDate },
            );

            res.json({
                data: records,
                meta: {
                    limit,
                    offset,
                    count: records.length,
                    total,
                },
            });
        } catch (error) {
            console.error(
                `[Media Files Controller] Failed to fetch play records for ${req.params['id']}:`,
                error,
            );
            res.status(500).json({
                error: 'fetch_failed',
                errorDescription: 'Failed to fetch play records',
            });
        }
    }

    /**
     * Handles GET /api/media-files/:id/play-records/export
     * Every play record of a media file's creative in a required, bounded date range, as
     * JSON - the source of the CSV export.
     *
     * @param req - Express request (query: startDate, endDate, both required)
     * @param res - Express response
     * @returns Promise<void>
     */
    async getPlayRecordsExport(req: Request, res: Response): Promise<void> {
        try {
            const records = await this.loadPlayRecordsExport(req, res);
            if (!records) {
                return;
            }

            res.json({ data: records, meta: { count: records.length } });
        } catch (error) {
            console.error(
                `[Media Files Controller] Failed to export play records for ${req.params['id']}:`,
                error,
            );
            res.status(500).json({
                error: 'export_failed',
                errorDescription: 'Failed to export play records',
            });
        }
    }

    /**
     * Handles GET /api/media-files/:id/play-records/export/xlsx
     * Every play record of a media file's creative in a required, bounded date range, as a
     * styled XLSX workbook (same columns as the Received Playables export).
     *
     * @param req - Express request (query: startDate, endDate, both required)
     * @param res - Express response
     * @returns Promise<void>
     */
    async getPlayRecordsExportXlsx(req: Request, res: Response): Promise<void> {
        try {
            const records = await this.loadPlayRecordsExport(req, res);
            if (!records) {
                return;
            }

            const timeZone = resolveAllowedTimeZone(req.query['timeZone']);
            const workbook = await spreadsheetExportService.createWorkbook({
                title: 'Play Records Export',
                sheetName: 'Play Records',
                columns: buildProgrammaticAdsExportColumns(timeZone),
                rows: records,
                hyperlinkColumnKey: ['mediaUrl', 'popScreenshot'],
            });

            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            );
            res.setHeader('Content-Disposition', 'attachment; filename="play-records-export.xlsx"');
            res.send(workbook);
        } catch (error) {
            console.error(
                `[Media Files Controller] Failed to create play records XLSX export for ${req.params['id']}:`,
                error,
            );
            res.status(500).json({
                error: 'export_failed',
                errorDescription: 'Failed to create play records XLSX export',
            });
        }
    }

    /**
     * Shared start of both play-records exports: validates the range, resolves the media
     * file and loads every play record in the range. Responds itself (400 / 404) and
     * returns null when the request can't be served.
     *
     * @param req - Express request (query: startDate, endDate)
     * @param res - Express response
     * @returns Promise resolving to the play records, or null after an error response
     */
    private async loadPlayRecordsExport(
        req: Request,
        res: Response,
    ): Promise<PlayRecordContent[] | null> {
        const id = req.params['id'] as string;
        const startDate = req.query['startDate'] as string | undefined;
        const endDate = req.query['endDate'] as string | undefined;

        const validationError = this.validateExportDateRange(startDate, endDate);
        if (validationError) {
            res.status(400).json({
                error: 'invalid_date_range',
                errorDescription: validationError,
            });
            return null;
        }

        const mediaFile = await mediaFilesService.getById(id);
        if (!mediaFile) {
            res.status(404).json({
                error: 'not_found',
                errorDescription: `Media file with ID ${id} not found`,
            });
            return null;
        }

        return mediaFilesService.getPlayRecordsExport(
            mediaFile.creativeId,
            mediaFile.creativeSource,
            { startDate, endDate },
        );
    }

    /**
     * Handles GET /api/media-files/:id/venue-slots
     * One ad's plays at one venue grouped by playlist slot (slot playlist content ID +
     * position), ascending by position - Ad Analytics' "Plays at <venue>" grid.
     *
     * @param req - Express request (query: venueId, required; optional startDate, endDate)
     * @param res - Express response
     * @returns Promise<void>
     */
    async getVenueSlots(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params['id'] as string;
            const venueId = (req.query['venueId'] as string | undefined)?.trim();
            const startDate = req.query['startDate'] as string | undefined;
            const endDate = req.query['endDate'] as string | undefined;

            if (!venueId) {
                res.status(400).json({
                    error: 'invalid_request',
                    errorDescription: 'venueId is required',
                });
                return;
            }

            // First, resolve the media file to get its creative identity
            const mediaFile = await mediaFilesService.getById(id);

            if (!mediaFile) {
                res.status(404).json({
                    error: 'not_found',
                    errorDescription: `Media file with ID ${id} not found`,
                });
                return;
            }

            const slots = await mediaFilesService.getAdVenueSlots(
                mediaFile.creativeId,
                mediaFile.creativeSource,
                venueId,
                { startDate, endDate },
            );

            res.json({
                data: slots,
                meta: {
                    count: slots.length,
                    plays: slots.reduce((sum, slot) => sum + slot.plays, 0),
                },
            });
        } catch (error) {
            console.error(
                `[Media Files Controller] Failed to fetch venue slots for ${req.params['id']}:`,
                error,
            );
            res.status(500).json({
                error: 'fetch_failed',
                errorDescription: 'Failed to fetch venue slots',
            });
        }
    }

    /**
     * Handles GET /api/media-files/:id/locations
     * Fetches location data (venues) where this media file's creative has been played.
     *
     * @param req - Express request
     * @param res - Express response
     * @returns Promise<void>
     */
    async getLocations(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params['id'] as string;
            const startDate = req.query['startDate'] as string | undefined;
            const endDate = req.query['endDate'] as string | undefined;

            // First, resolve the media file to get its creative identity
            const mediaFile = await mediaFilesService.getById(id);

            if (!mediaFile) {
                res.status(404).json({
                    error: 'not_found',
                    errorDescription: `Media file with ID ${id} not found`,
                });
                return;
            }

            const locations = await locationsService.getLocationsByCreative(
                mediaFile.creativeId,
                mediaFile.creativeSource,
                mediaFile.duration || 0,
                { startDate, endDate },
            );

            res.json({
                data: locations,
                meta: {
                    count: locations.length,
                },
            });
        } catch (error) {
            console.error(
                `[Media Files Controller] Failed to fetch locations for ${req.params['id']}:`,
                error,
            );
            res.status(500).json({
                error: 'fetch_failed',
                errorDescription: 'Failed to fetch locations',
            });
        }
    }
}

/**
 * Singleton instance of the media files controller.
 */
export const mediaFilesController = new MediaFilesController();
