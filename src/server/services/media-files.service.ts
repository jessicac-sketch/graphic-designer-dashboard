/** Local Imports */
import type { AdVenueSlot } from '../types/ad-venue-slot.types.js';
import type {
    DashboardAnalytics,
    DashboardCountPoint,
    DashboardTopAd,
} from '../types/dashboard-analytics.types.js';
import type {
    DashboardAds,
    DashboardAdShare,
    DashboardGeography,
    DashboardOverview,
    DashboardVenue,
} from '../types/dashboard-summary.types.js';
import type {
    MediaFile,
    ProgrammaticAdPage,
    ProgrammaticAdSummary,
} from '../types/database.types.js';
import type {
    CategoryRankingEntry,
    DailyAdsSummaryEntry,
    DailyDeviceAdsEntry,
    Host,
    HostRankingEntry,
    StateRankingEntry,
    VenueProfile,
} from '../types/hosts.types.js';
import type {
    MediaFileContent,
    MediaFileDetailContent,
} from '../types/media-file-content.types.js';
import type {
    GetAllOptions,
    GetPlayRecordsOptions,
    GetProgrammaticAdsListOptions,
} from '../types/media-files-options.types.js';
import type { PlayRecordContent } from '../types/play-record-content.types.js';
import type { ProgrammaticAdsStatsContent } from '../types/programmatic-ads-stats.types.js';
import {
    getBusinessHoursSchedule,
    getWeeklySchedule,
    MULTI_DAY_RANGE_MESSAGE,
} from '../utils/business-hours.util.js';
import { calculateExpectedRequests } from '../utils/expected-requests.util.js';
import { toUtcInstant, zonedDayKey, zonedHourKey } from '../utils/zoned-calendar-date.util.js';
import { dataStore } from './data-store.service.js';
import { hostsService } from './hosts.service.js';
import { mediaFileMapper } from './media-file-mapper.service.js';
import { playRecordMapper } from './play-record-mapper.service.js';
import { rangeRecordsCache } from './range-records-cache.service.js';

/**
 * Service for media files business logic.
 * Handles data fetching and transformation for the programmatic_media_files table.
 *
 * @remarks
 * Services contain business logic and orchestrate data operations.
 * They should not handle HTTP concerns (request/response).
 */
export class MediaFilesService {
    /**
     * Converts a "YYYY-MM-DD" calendar date into a UTC-midnight ISO instant.
     * Calendar dates, not instants, are accepted from callers deliberately -
     * building the query window from a browser-local-midnight ISO instant
     * instead shifts the whole 24h window by the browser's UTC offset (e.g. a
     * "Sep 1" pick from a UTC+8 browser would query Aug 31 16:00 UTC - Sep 1
     * 16:00 UTC, not Sep 1 UTC).
     *
     * @remarks
     * `resolveDateZone` (Express middleware, runs before every controller
     * method) already rewrites a bare calendar date into the correct instant
     * for the request's "Eastern Time / UTC" display mode before this is
     * ever called - so in practice this always receives an already-resolved
     * full instant (passed through unchanged). The bare-date branch stays as
     * a fallback for any caller that bypasses that middleware.
     *
     * @param calendarDate - "YYYY-MM-DD", an already-resolved ISO instant, or undefined
     * @returns UTC-midnight ISO instant, or undefined if no date was given
     */
    private toUtcMidnight(calendarDate: string | undefined): string | undefined {
        return toUtcInstant(calendarDate);
    }

    /**
     * Gets the programmatic_ads rows for an optional calendar-date range. It goes through the shared range cache, so the calls a page fires at once (Map View's
     * state ranking, ads and daily chart) scan the table once, not once each - an all-time
     * scan is dozens of parallel page requests, and several at once can overwhelm the replica. Callers must not mutate the
     * returned array - it is shared.
     *
     * @param startDate - First calendar date as "YYYY-MM-DD", or undefined
     * @param endDate - Last calendar date as "YYYY-MM-DD", or undefined
     * @returns Promise resolving to the rows in the range
     * @throws Error if the underlying query fails
     */
    private getRangeRecords(
        startDate: string | undefined,
        endDate: string | undefined,
    ): Promise<ProgrammaticAdSummary[]> {
        return rangeRecordsCache.getRecords(startDate, endDate);
    }

    /**
     * Fetches all media files with optional filtering.
     *
     * @param options - Query options
     * @returns Promise resolving to array of media file content
     * @throws Error if the operation fails
     */
    async getAll(options: GetAllOptions): Promise<MediaFileContent[]> {
        const {
            limit = 100,
            offset = 0,
            source,
            search,
            sort = 'newest',
            direction = 'desc',
            creativeType,
        } = options;
        const ascending = direction === 'asc';

        // Play counts live in programmatic_ads, so that order is counted in Postgres (RPC)
        if (sort === 'plays') {
            const rows = await dataStore.getMediaFilesByPlays({
                limit,
                offset,
                ascending,
                creativeType,
                search,
            });
            return rows.map((row) => ({
                ...mediaFileMapper.toContent(row),
                playCount: Number(row.play_count),
            }));
        }

        const dbFiles = await dataStore.getMediaFiles({
            limit,
            offset,
            source,
            search,
            orderBy: sort === 'duration' ? 'duration' : 'created_at',
            ascending,
            creativeType,
        });

        return mediaFileMapper.toContentList(dbFiles);
    }

    /**
     * Counts media files, all and per creative type, for the Ads Gallery's type filter.
     *
     * @param search - Match creative name or creative ID, as the gallery list does
     * @returns Promise resolving to the counts
     * @throws Error if a count query fails
     */
    async getTypeCounts(search?: string): Promise<{ all: number; video: number; image: number }> {
        return dataStore.countMediaFilesByType(search);
    }

    /**
     * Builds the aggregate metrics used by the dashboard and analytics page.
     *
     * @param options - Query options
     * @param options.startDate - Only count play records fetched on/after this calendar date, as "YYYY-MM-DD" (all time if omitted)
     * @param options.endDate - Only count play records fetched on/before this calendar date, as "YYYY-MM-DD" (all time if omitted)
     * @param options.timeZone - IANA timezone identifier (or "UTC") the by-day buckets below are grouped in
     * @returns Promise resolving to dashboard analytics data
     * @throws Error if either source query fails
     */
    async getDashboardAnalytics(options?: {
        startDate?: string;
        endDate?: string;
        timeZone?: string;
    }): Promise<DashboardAnalytics> {
        const timeZone = options?.timeZone ?? 'UTC';
        // Rows through the shared range cache: Ranking Data loads this alongside its four
        // rankings for the same range, so they share one scan. Play-record counts follow
        // the range (all time without one); media-file counts are always all time.
        const [mediaFiles, playRecords] = await Promise.all([
            dataStore.getAllMediaFiles(),
            this.getRangeRecords(options?.startDate, options?.endDate),
        ]);
        const topAds = this.buildTopAds(mediaFiles, playRecords).slice(0, 5);

        const now = Date.now();
        const fiveMinutesMs = 5 * 60 * 1000;

        return {
            totalContents: mediaFiles.length,
            newContentsThisWeek: mediaFiles.filter(
                (file) =>
                    new Date(file.created_at).getTime() >= Date.now() - 7 * 24 * 60 * 60 * 1000,
            ).length,
            totalPlayRecords: playRecords.length,
            servedPlayRecords: playRecords.filter((record) => record.served).length,
            playedRecords: playRecords.filter((record) => Boolean(record.played)).length,
            screenshotRecords: playRecords.filter((record) => Boolean(record.pop_screenshot))
                .length,
            proofSentRecords: playRecords.filter((record) => Boolean(record.proof_of_play_sent))
                .length,
            openSearchSavedRecords: playRecords.filter((record) => record.opensearch_saved === true)
                .length,
            successfulPopCount: playRecords.filter(
                (record) => Boolean(record.played) && Boolean(record.proof_of_play_sent),
            ).length,
            pendingOverdueCount: playRecords.filter(
                (record) =>
                    !record.proof_of_play_sent &&
                    now - new Date(record.fetched_at).getTime() > fiveMinutesMs,
            ).length,
            pendingRecentCount: playRecords.filter(
                (record) =>
                    !record.proof_of_play_sent &&
                    now - new Date(record.fetched_at).getTime() <= fiveMinutesMs,
            ).length,
            greenCount: playRecords.filter(
                (record) => this.getPopDurationBucket(record) === 'green',
            ).length,
            yellowCount: playRecords.filter(
                (record) => this.getPopDurationBucket(record) === 'yellow',
            ).length,
            redCount: playRecords.filter((record) => this.getPopDurationBucket(record) === 'red')
                .length,
            uniqueVenues: new Set(playRecords.map((record) => record.venue_id).filter(Boolean))
                .size,
            uniqueDevices: new Set(playRecords.map((record) => record.device_id).filter(Boolean))
                .size,
            mediaBySource: this.countBy(mediaFiles, (file) => file.creative_source),
            playsBySource: this.countBy(playRecords, (record) => record.creative_source),
            mediaCreatedByDay: this.countBy(mediaFiles, (file) =>
                this.toDayKey(file.created_at, timeZone),
            ),
            servedByDay: this.countBy(playRecords, (record) =>
                this.toDayKey(record.date_served, timeZone),
            ),
            playedByDay: this.countBy(playRecords, (record) =>
                this.toDayKey(record.played, timeZone),
            ),
            proofSentByDay: this.countBy(playRecords, (record) =>
                this.toDayKey(record.proof_of_play_sent, timeZone),
            ),
            topVenues: this.countBy(playRecords, (record) => record.venue_id)
                .sort((left, right) => right.value - left.value)
                .slice(0, 10),
            topAds,
        };
    }

    /**
     * Ranks media files by play-record count within an optional date range,
     * for the Ad Ranking tab. Decoupled from getDashboardAnalytics() so
     * changing the date range only re-runs this query, not the whole
     * dashboard.
     *
     * @param options - Query options
     * @param options.startDate - Only include rows fetched on/after this calendar date, as "YYYY-MM-DD"
     * @param options.endDate - Only include rows fetched on/before this calendar date, as "YYYY-MM-DD"
     * @returns Promise resolving to ads ranked by play count, descending
     * @throws Error if the operation fails
     */
    async getAdRanking(options?: {
        startDate?: string;
        endDate?: string;
    }): Promise<DashboardTopAd[]> {
        const playRecords = await this.getRangeRecords(options?.startDate, options?.endDate);
        const mediaFiles = await this.getMediaFilesForCreatives([
            ...new Set(playRecords.map((record) => record.creative_id)),
        ]);

        return this.buildTopAds(mediaFiles, playRecords);
    }

    /**
     * Ranks ads by play count, descending, restricted to plays at a given
     * set of venues - powers the State Ranking table's "Unique Ads Played"
     * drill-down modal (the venue IDs are the ones already resolved to the
     * clicked state, from getStateRanking's own venues list - no second
     * hosts service round trip needed).
     *
     * @param venueIds - Only include plays at these venues
     * @param options - Query options
     * @param options.startDate - Only include rows fetched on/after this calendar date, as "YYYY-MM-DD"
     * @param options.endDate - Only include rows fetched on/before this calendar date, as "YYYY-MM-DD"
     * @returns Promise resolving to ads ranked by play count, descending
     * @throws Error if the operation fails
     */
    async getAdsByVenues(
        venueIds: string[],
        options?: { startDate?: string; endDate?: string },
    ): Promise<DashboardTopAd[]> {
        const playRecords = await this.getRangeRecords(options?.startDate, options?.endDate);
        const mediaFiles = await this.getMediaFilesForCreatives([
            ...new Set(playRecords.map((record) => record.creative_id)),
        ]);

        const venueIdSet = new Set(venueIds);
        const filteredRecords = playRecords.filter(
            (record) => record.venue_id && venueIdSet.has(record.venue_id),
        );

        // Most-recently-played first, not buildTopAds()'s default
        // (play-count) ranking - this list backs a "what's been playing
        // here" venue drill-down, where the latest activity matters more
        // than which creative has racked up the most plays historically.
        const latestFetchedAtByCreative = new Map<string, string>();
        for (const record of filteredRecords) {
            if (!record.fetched_at) {
                continue;
            }
            const key = `${record.creative_id}:${record.creative_source}`;
            const current = latestFetchedAtByCreative.get(key);
            if (!current || record.fetched_at > current) {
                latestFetchedAtByCreative.set(key, record.fetched_at);
            }
        }

        return this.buildTopAds(mediaFiles, filteredRecords).sort((left, right) => {
            const leftLatest =
                latestFetchedAtByCreative.get(`${left.creativeId}:${left.source}`) ?? '';
            const rightLatest =
                latestFetchedAtByCreative.get(`${right.creativeId}:${right.source}`) ?? '';
            return rightLatest.localeCompare(leftLatest);
        });
    }

    /**
     * Joins media files with their play records and ranks them by play
     * count, descending - shared by getDashboardAnalytics() (unfiltered, for
     * the Analytics page's top-5 widget) and getAdRanking() (date-scoped,
     * for the Ad Ranking tab).
     *
     * @param mediaFiles - Media files to rank
     * @param playRecords - Play records to count plays from, already scoped to whatever date range applies
     * @returns Ads ranked by play count, descending
     */
    private buildTopAds(
        mediaFiles: MediaFile[],
        playRecords: ProgrammaticAdSummary[],
    ): DashboardTopAd[] {
        const filesByCreative = new Map(
            mediaFiles.map((file) => [`${file.creative_id}:${file.creative_source}`, file]),
        );
        const recordsByCreative = new Map<string, ProgrammaticAdSummary[]>();

        for (const record of playRecords) {
            const key = `${record.creative_id}:${record.creative_source}`;
            const records = recordsByCreative.get(key) || [];
            records.push(record);
            recordsByCreative.set(key, records);
        }

        return [...recordsByCreative.entries()]
            .map(([key, records]) => {
                const file = filesByCreative.get(key);
                if (!file) {
                    return null;
                }

                const content = mediaFileMapper.toContent(file);
                const venueCount = new Set(records.map((record) => record.venue_id).filter(Boolean))
                    .size;

                return {
                    contentId: file.id,
                    creativeId: file.creative_id,
                    title: content.title,
                    thumbnail: content.mediaUrl || '',
                    creativeUrl: content.mediaUrl || '',
                    originalUrl: file.original_url,
                    creativeType: content.creativeType,
                    source: file.creative_source,
                    venueCount,
                    location: `${venueCount} venue${venueCount === 1 ? '' : 's'}`,
                    plays: records.length,
                    duration: file.duration || 0,
                    fetchedDate: file.created_at,
                    weeklyPlays: this.getWeeklyCounts(records),
                } satisfies DashboardTopAd;
            })
            .filter((ad): ad is DashboardTopAd => ad !== null)
            .sort((left, right) => right.plays - left.plays);
    }

    /**
     * Fetches a single media file by ID with aggregated play metrics.
     *
     * @param id - UUID of the media file
     * @returns Promise resolving to media file detail content, or null if not found
     * @throws Error if the operation fails
     */
    async getById(id: string): Promise<MediaFileDetailContent | null> {
        const dbFile = await dataStore.getMediaFileWithMetrics(id);

        if (!dbFile) {
            return null;
        }

        return mediaFileMapper.toDetailContent(dbFile);
    }

    /**
     * Groups one ad's plays at one venue by playlist slot (slot playlist content ID + slot
     * position), for Ad Analytics' "Plays at <venue>" grid: how many plays each slot got,
     * when it last played, and its newest screenshot. Plays that didn't report a slot
     * (older ones) form one group with null slot fields, so the plays always add up to
     * the venue's total for the ad.
     *
     * @param creativeId - Creative identifier
     * @param creativeSource - Creative source
     * @param venueId - Venue to scope to
     * @param options - Query options
     * @param options.startDate - Only plays fetched on/after this calendar date - omit for all time
     * @param options.endDate - Only plays fetched on/before this calendar date - omit for all time
     * @returns Promise resolving to the slots, ascending by slot position (no-slot group last)
     * @throws Error if the underlying query fails
     */
    async getAdVenueSlots(
        creativeId: string,
        creativeSource: string,
        venueId: string,
        options?: { startDate?: string; endDate?: string },
    ): Promise<AdVenueSlot[]> {
        const rows = await dataStore.getSlotRowsByCreativeVenue(
            creativeId,
            creativeSource,
            venueId,
            {
                startDate: this.toUtcMidnight(options?.startDate),
                endDate: this.toUtcMidnight(options?.endDate),
            },
        );

        const groups = new Map<string, AdVenueSlot & { latestMs: number; screenshotMs: number }>();
        for (const row of rows) {
            const contentId = row.slot_playlist_content_id;
            const position = row.slot_playlist_content_position;
            const key = `${contentId ?? ''}|${position ?? ''}`;
            const when = row.played ?? row.fetched_at;
            const ms = Date.parse(when);
            const timeMs = Number.isNaN(ms) ? 0 : ms;

            const group = groups.get(key) ?? {
                slotPlaylistContentId: contentId,
                slotPosition: position,
                plays: 0,
                latestPlayed: null,
                latestScreenshot: null,
                latestMs: -1,
                screenshotMs: -1,
            };

            group.plays += 1;
            if (timeMs > group.latestMs) {
                group.latestMs = timeMs;
                group.latestPlayed = when;
            }
            if (row.pop_screenshot && timeMs > group.screenshotMs) {
                group.screenshotMs = timeMs;
                group.latestScreenshot = row.pop_screenshot;
            }
            groups.set(key, group);
        }

        return [...groups.values()]
            .map(({ latestMs: _latestMs, screenshotMs: _screenshotMs, ...slot }) => slot)
            .sort((left, right) => this.compareSlots(left, right));
    }

    /**
     * Orders slots ascending by position (numerically when it is a number), then by
     * playlist content ID; slots with no position (or none reported) go last.
     *
     * @param left - One slot
     * @param right - The other slot
     * @returns Negative, zero or positive, for Array.sort
     */
    private compareSlots(left: AdVenueSlot, right: AdVenueSlot): number {
        const leftPosition = left.slotPosition === null ? NaN : Number(left.slotPosition);
        const rightPosition = right.slotPosition === null ? NaN : Number(right.slotPosition);
        const leftHas = !Number.isNaN(leftPosition);
        const rightHas = !Number.isNaN(rightPosition);

        if (leftHas !== rightHas) {
            return leftHas ? -1 : 1;
        }
        if (leftHas && leftPosition !== rightPosition) {
            return leftPosition - rightPosition;
        }
        return (left.slotPlaylistContentId ?? '').localeCompare(right.slotPlaylistContentId ?? '');
    }

    /**
     * Fetches a page of play records for a specific media file's creative, with the total
     * number of plays in the range.
     *
     * @param creativeId - The creative_id to query
     * @param creativeSource - The creative_source to query
     * @param options - Query options (page, and an optional date range)
     * @returns Promise resolving to the page of play records and the range's total
     * @throws Error if the operation fails
     */
    async getPlayRecords(
        creativeId: string,
        creativeSource: string,
        options?: GetPlayRecordsOptions,
    ): Promise<{ records: PlayRecordContent[]; total: number }> {
        const { limit = 100, offset = 0, startDate, endDate } = options || {};

        const { rows, total } = await dataStore.getPlayRecordsByCreative(
            creativeId,
            creativeSource,
            {
                limit,
                offset,
                startDate: this.toUtcMidnight(startDate),
                endDate: this.toUtcMidnight(endDate),
            },
        );

        return { records: playRecordMapper.toContentList(rows), total };
    }

    /**
     * Fetches every play record of a media file's creative in a date range for export,
     * each with its proof-of-play duration (minutes from fetched to proof sent) and the
     * creative's media URL.
     *
     * @param creativeId - The creative_id to query
     * @param creativeSource - The creative_source to query
     * @param options - Query options
     * @param options.startDate - Only plays fetched on/after this calendar date
     * @param options.endDate - Only plays fetched on/before this calendar date
     * @returns Promise resolving to every play record in the range
     * @throws Error if the operation fails
     */
    async getPlayRecordsExport(
        creativeId: string,
        creativeSource: string,
        options?: { startDate?: string; endDate?: string },
    ): Promise<PlayRecordContent[]> {
        const rows = await dataStore.getAllPlayRecordsByCreative(creativeId, creativeSource, {
            startDate: this.toUtcMidnight(options?.startDate),
            endDate: this.toUtcMidnight(options?.endDate),
        });

        const records = playRecordMapper.toContentList(rows).map((record) => {
            const diffMs =
                record.proofOfPlaySent && record.fetchedAt
                    ? Date.parse(record.proofOfPlaySent) - Date.parse(record.fetchedAt)
                    : Number.NaN;

            return {
                ...record,
                popDurationMinutes:
                    Number.isFinite(diffMs) && diffMs >= 0 ? diffMs / (1000 * 60) : null,
            };
        });

        return this.attachMediaInfo(records);
    }

    /**
     * Fetches a page of programmatic_ads rows, optionally filtered by proof-of-play
     * duration bucket and sorted by duration. Filtering/sorting happens in the
     * database, across the full table. Passing venueIds scopes this same
     * paginated/sortable/bucket-filterable listing to a set of venues - powers
     * the Venue Ranking table's "Total Ads" modal (one venue) and the State
     * Ranking table's "Total Ads" modal (every venue in that state), so both
     * behave exactly like the raw Programmatic Ads table (same bucket stats,
     * sort, filters).
     *
     * @param options - Query options
     * @returns Promise resolving to the page of play records and the total matching row count
     * @throws Error if the operation fails
     */
    async getProgrammaticAdsList(
        options?: GetProgrammaticAdsListOptions,
    ): Promise<{ data: PlayRecordContent[]; count: number }> {
        const {
            limit = 100,
            offset = 0,
            bucket,
            sortBy,
            sortDir,
            search,
            columnFilters,
            startDate,
            endDate,
            venueIds,
        } = options || {};

        const { data, count } = await dataStore.getProgrammaticAdsPaginated({
            limit,
            offset,
            bucket,
            sortBy,
            sortDir,
            search,
            columnFilters,
            startDate: this.toUtcMidnight(startDate),
            endDate: this.toUtcMidnight(endDate),
            venueIds,
        });

        const records = playRecordMapper.toContentList(data);
        const enriched = await this.attachMediaInfo(records);

        return { data: enriched, count };
    }

    /**
     * Gets total/green/yellow/red proof-of-play duration counts for the raw
     * Programmatic Ads table, optionally scoped to a date range - powers the
     * mini stat row above that table's date-range picker.
     *
     * @param options - Query options
     * @param options.startDate - Only include rows fetched on/after this calendar date, as "YYYY-MM-DD"
     * @param options.endDate - Only include rows fetched on/before this calendar date, as "YYYY-MM-DD"
     * @returns Promise resolving to the total/bucket counts
     * @throws Error if the operation fails
     */
    async getProgrammaticAdsStats(options?: {
        startDate?: string;
        endDate?: string;
        venueIds?: string[];
    }): Promise<ProgrammaticAdsStatsContent> {
        const stats = await dataStore.getProgrammaticAdsStats({
            startDate: this.toUtcMidnight(options?.startDate),
            endDate: this.toUtcMidnight(options?.endDate),
            venueIds: options?.venueIds,
        });

        return {
            total: stats.total_count,
            green: stats.green_count,
            yellow: stats.yellow_count,
            red: stats.red_count,
        };
    }

    /**
     * Fetches every programmatic_ads row matching the given filters (not just
     * one page), with resolved creative media fields, for export. Mirrors
     * getProgrammaticAdsList's filtering, so an export always matches
     * whatever's currently shown in the Programmatic Ads table.
     *
     * @param options - Query options - same filters as getProgrammaticAdsList, minus limit/offset
     * @returns Promise resolving to every matching, exportable play record
     * @throws Error if the operation fails
     */
    async getProgrammaticAdsExport(
        options?: Omit<GetProgrammaticAdsListOptions, 'limit' | 'offset'>,
    ): Promise<PlayRecordContent[]> {
        const { bucket, sortBy, sortDir, search, columnFilters, startDate, endDate } =
            options || {};

        const pageSize = 1000;
        const allRows: ProgrammaticAdPage[] = [];
        let offset = 0;

        while (true) {
            const { data } = await dataStore.getProgrammaticAdsPaginated({
                limit: pageSize,
                offset,
                bucket,
                sortBy,
                sortDir,
                search,
                columnFilters,
                startDate: this.toUtcMidnight(startDate),
                endDate: this.toUtcMidnight(endDate),
            });

            allRows.push(...data);
            if (data.length < pageSize) {
                break;
            }
            offset += data.length;
        }

        const records = playRecordMapper.toContentList(allRows);
        return this.attachMediaInfo(records);
    }

    /**
     * Resolves and attaches creative thumbnail info (mediaUrl, creativeType)
     * onto a page of play records, by looking up their media files.
     *
     * @param records - Play records to enrich
     * @returns Promise resolving to the enriched play records
     */
    private async attachMediaInfo(records: PlayRecordContent[]): Promise<PlayRecordContent[]> {
        const creativeIds = [...new Set(records.map((record) => record.creativeId))];
        const mediaFiles = await dataStore.getMediaFilesByCreativeIds(creativeIds);
        const filesByCreative = new Map(
            mediaFiles.map((file) => [`${file.creative_id}:${file.creative_source}`, file]),
        );
        const filesByCreativeId = new Map(mediaFiles.map((file) => [file.creative_id, file]));

        return records.map((record) => {
            const file =
                filesByCreative.get(`${record.creativeId}:${record.creativeSource}`) ??
                filesByCreativeId.get(record.creativeId);

            return {
                ...record,
                mediaUrl: file?.s3_url ?? null,
                creativeType: file?.creative_type,
            };
        });
    }

    /**
     * Groups records by a selected string key.
     *
     * @param items - Records to group
     * @param selector - Returns the group key or null
     * @returns Sorted count points
     */
    private countBy<T>(items: T[], selector: (item: T) => string | null): DashboardCountPoint[] {
        const counts = new Map<string, number>();

        for (const item of items) {
            const key = selector(item);
            if (!key) {
                continue;
            }
            counts.set(key, (counts.get(key) || 0) + 1);
        }

        return [...counts.entries()]
            .map(([label, value]) => ({ label, value }))
            .sort((left, right) => left.label.localeCompare(right.label));
    }

    /**
     * Normalizes a timestamp to a day label in the given timezone - e.g. a
     * 3am UTC timestamp is still "yesterday" in America/New_York (EDT).
     *
     * @param timestamp - Timestamp to normalize
     * @param timeZone - IANA timezone identifier, or "UTC"
     * @returns ISO date label or null
     */
    private toDayKey(timestamp: string | null, timeZone: string): string | null {
        return timestamp ? zonedDayKey(timestamp, timeZone) : null;
    }

    /**
     * Normalizes a (possibly zone-resolved) date down to its bare "YYYY-MM-DD"
     * calendar-date prefix.
     *
     * @remarks
     * `resolveDateZone` (Express middleware) rewrites a bare "YYYY-MM-DD" into the
     * UTC instant of that date's zoned midnight (e.g. "...T04:00:00.000Z" in Eastern
     * mode) before this ever runs - business-hours/expected-requests math
     * (`calculateExpectedRequests`, `getBusinessHoursSchedule`) needs the picked
     * calendar date itself, never that instant (see expected-requests.util.ts's own
     * remarks on why), so this strips it back off. That's always exact, not an
     * approximation - "zoned midnight" never rolls onto a different calendar date,
     * so the first 10 characters are always the original picked date, in any zone.
     *
     * @param date - A bare "YYYY-MM-DD", an already-resolved ISO instant, or undefined
     * @returns The bare "YYYY-MM-DD", or undefined if no date was given
     */
    private toCalendarDate(date: string | undefined): string | undefined {
        return date?.slice(0, 10);
    }

    /**
     * Ranks venues ("hosts") by play-record count within an optional date
     * range, enriched with host details from the hosts service. Decoupled from
     * getDashboardAnalytics() so changing the date range only re-runs this
     * query (and its hosts service round trip) instead of reloading the whole
     * dashboard.
     *
     * @param options - Query options
     * @param options.startDate - Only include rows fetched on/after this calendar date, as "YYYY-MM-DD"
     * @param options.endDate - Only include rows fetched on/before this calendar date, as "YYYY-MM-DD"
     * @returns Promise resolving to venues ranked by play count, descending
     * @throws Error if the underlying query fails
     */
    async getVenueRanking(options?: {
        startDate?: string;
        endDate?: string;
    }): Promise<HostRankingEntry[]> {
        const playRecords = await this.getRangeRecords(options?.startDate, options?.endDate);

        const range =
            options?.startDate && options?.endDate
                ? {
                      start: this.toCalendarDate(options.startDate)!,
                      end: this.toCalendarDate(options.endDate)!,
                  }
                : null;

        return this.buildHostRanking(playRecords, range);
    }

    /**
     * Ranks venues by play-record count and enriches each with host details
     * (business name, city, state, category, expected ad requests) from the
     * hosts service, joined on Host.vistarVenueId, plus the proof-of-play
     * screenshot of that venue's ad with the most recent proof_of_play_sent
     * timestamp. Venues not found in the hosts service still appear, with null
     * host fields, rather than being dropped. If the Hosts
     * API call itself fails, the whole dashboard shouldn't go down with it -
     * fall back to venue-only entries instead of throwing.
     *
     * @param playRecords - Full programmatic_ads row set
     * @param range - Calendar-date range the request was scoped to ("YYYY-MM-DD" start/end), or null for all-time (Business Hours/Expected Reqs are then estimated for right now)
     * @param options - Behavior switches
     * @param options.strictHosts - Throw if the hosts service call fails, instead of falling back to venue-only entries. The Dashboard's geography uses this: silently turning every venue into "Unknown" would be a wrong answer, not a degraded one
     * @param options.withExtras - Also compute each venue's latest screenshot, expected requests and schedules (default true). Callers that never read them (the Dashboard) skip that work
     * @returns Promise resolving to venues ranked by play count, descending
     * @throws Error only when `strictHosts` is set and the hosts service call fails
     */
    private async buildHostRanking(
        playRecords: ProgrammaticAdSummary[],
        range: { start: string; end: string } | null,
        options: { strictHosts?: boolean; withExtras?: boolean } = {},
    ): Promise<HostRankingEntry[]> {
        const { strictHosts = false, withExtras = true } = options;

        const venueCounts = this.countBy(playRecords, (record) => record.venue_id).sort(
            (left, right) => right.value - left.value,
        );

        const latestRecordByVenue = new Map<string, ProgrammaticAdSummary>();
        for (const record of withExtras ? playRecords : []) {
            if (!record.venue_id || !record.proof_of_play_sent) {
                continue;
            }

            const current = latestRecordByVenue.get(record.venue_id);
            if (
                !current ||
                new Date(record.proof_of_play_sent).getTime() >
                    new Date(current.proof_of_play_sent as string).getTime()
            ) {
                latestRecordByVenue.set(record.venue_id, record);
            }
        }

        let hosts: Host[] = [];
        try {
            hosts = await hostsService.searchByVenueIds(venueCounts.map((entry) => entry.label));
        } catch (error) {
            console.error('[Dashboard] Failed to fetch host details:', error);
            if (strictHosts) {
                throw error;
            }
        }

        const hostsByVenueId = new Map(hosts.map((host) => [host.vistarVenueId, host]));

        // A "Business Hours" cell can only represent one calendar day.
        const isMultiDayRange = !!range && range.start !== range.end;
        const scheduleDate = range?.start;

        return venueCounts.map((entry) => {
            const host = hostsByVenueId.get(entry.label);
            const latestRecord = latestRecordByVenue.get(entry.label);

            let expectedRequests = 0;
            let businessHoursSchedule: string | null = null;
            let weeklySchedule: { day: string; hours: string }[] = [];
            try {
                if (withExtras) {
                    expectedRequests = calculateExpectedRequests(host, range);
                    businessHoursSchedule = isMultiDayRange
                        ? MULTI_DAY_RANGE_MESSAGE
                        : getBusinessHoursSchedule(host, scheduleDate);
                    weeklySchedule = getWeeklySchedule(host);
                }
            } catch (error) {
                console.error(
                    `[Dashboard] Failed to compute business hours for venue ${entry.label}:`,
                    error,
                );
            }

            return {
                venueId: entry.label,
                screenshotUrl: latestRecord?.pop_screenshot ?? null,
                hostName: host?.name ?? null,
                city: host?.city ?? null,
                state: host?.state ?? null,
                category: host?.category ?? null,
                totalAds: entry.value,
                slotCount: host?.slotCount ?? null,
                businessHoursSchedule,
                weeklySchedule,
                expectedRequests,
            };
        });
    }

    /**
     * Ranks US states by play-record count within an optional date range,
     * rolling up every venue in that state (many venues to one state).
     * Reuses buildHostRanking()'s own per-venue output rather than a
     * separate query - one data store fetch, one hosts service round trip, shared
     * with getVenueRanking's own pipeline (just not the same *request*,
     * since this tab has its own independent date range).
     *
     * @param options - Query options
     * @param options.startDate - Only include rows fetched on/after this calendar date, as "YYYY-MM-DD"
     * @param options.endDate - Only include rows fetched on/before this calendar date, as "YYYY-MM-DD"
     * @returns Promise resolving to states ranked by play count, descending, plus the per-venue breakdown each state was built from
     * @throws Error if the underlying query fails
     */
    async getStateRanking(options?: {
        startDate?: string;
        endDate?: string;
    }): Promise<{ states: StateRankingEntry[]; venues: HostRankingEntry[] }> {
        const playRecords = await this.getRangeRecords(options?.startDate, options?.endDate);

        const range =
            options?.startDate && options?.endDate
                ? {
                      start: this.toCalendarDate(options.startDate)!,
                      end: this.toCalendarDate(options.endDate)!,
                  }
                : null;

        const venues = await this.buildHostRanking(playRecords, range);
        const states = this.buildStateRanking(venues, playRecords);

        return { states, venues };
    }

    /**
     * Venues rolled into a single state, within an optional date range -
     * the same per-venue breakdown getStateRanking() already returns,
     * filtered to one state. Powers the State Ranking table's venue
     * breakdown modal's XLSX export.
     *
     * @param state - Two-letter state code, or "Unknown"
     * @param options - Query options
     * @param options.startDate - Only include rows fetched on/after this calendar date, as "YYYY-MM-DD"
     * @param options.endDate - Only include rows fetched on/before this calendar date, as "YYYY-MM-DD"
     * @returns Promise resolving to that state's venues
     * @throws Error if the underlying query fails
     */
    async getStateVenues(
        state: string,
        options?: { startDate?: string; endDate?: string },
    ): Promise<HostRankingEntry[]> {
        const { venues } = await this.getStateRanking(options);
        return venues.filter((venue) => (venue.state ?? 'Unknown') === state);
    }

    /**
     * Ranks venue categories by play-record count within an optional date
     * range, rolling up every venue in that category (many venues to one
     * category) - same shape and same shared buildHostRanking() pipeline as
     * getStateRanking(), just keyed by category instead of state.
     *
     * @param options - Query options
     * @param options.startDate - Only include rows fetched on/after this calendar date, as "YYYY-MM-DD"
     * @param options.endDate - Only include rows fetched on/before this calendar date, as "YYYY-MM-DD"
     * @returns Promise resolving to categories ranked by play count, descending, plus the per-venue breakdown each category was built from
     * @throws Error if the underlying query fails
     */
    async getCategoryRanking(options?: {
        startDate?: string;
        endDate?: string;
    }): Promise<{ categories: CategoryRankingEntry[]; venues: HostRankingEntry[] }> {
        const playRecords = await this.getRangeRecords(options?.startDate, options?.endDate);

        const range =
            options?.startDate && options?.endDate
                ? {
                      start: this.toCalendarDate(options.startDate)!,
                      end: this.toCalendarDate(options.endDate)!,
                  }
                : null;

        const venues = await this.buildHostRanking(playRecords, range);
        const categories = this.buildCategoryRanking(venues, playRecords);

        return { categories, venues };
    }

    /**
     * Dashboard overview for one date range: headline totals, proof-of-play buckets and
     * the received timeline (per hour for a single day, per day otherwise).
     *
     * @remarks
     * Needs only the range's rows and the POP stats query - no hosts service and no media
     * files - so it is the fast call, and the Dashboard's top cards fill in from it
     * while the geography and ads calls are still running. The rows come from the shared
     * range cache, so the three Dashboard calls scan the table once between them.
     *
     * @param startDate - First calendar date, "YYYY-MM-DD" (UTC); omit both for all time
     * @param endDate - Last calendar date, "YYYY-MM-DD" (UTC); omit both for all time
     * @param timeZone - IANA timezone identifier (or "UTC") the received timeline is grouped in
     * @returns Promise resolving to the Dashboard overview for the range
     * @throws Error if the underlying query fails
     */
    async getDashboardOverview(
        startDate?: string,
        endDate?: string,
        timeZone: string = 'UTC',
    ): Promise<DashboardOverview> {
        const [playRecords, pop] = await Promise.all([
            rangeRecordsCache.getRecords(startDate, endDate),
            // Same DB-level query as Ranking Data's mini stats, so the POP numbers match
            this.getProgrammaticAdsStats({ startDate, endDate }),
        ]);
        const isAllTime = !startDate || !endDate;
        const granularity = !isAllTime && startDate === endDate ? 'hour' : 'day';

        const creatives = new Set<string>();
        const venues = new Set<string>();
        const devices = new Set<string>();
        let withoutVenue = 0;
        for (const record of playRecords) {
            creatives.add(`${record.creative_id}:${record.creative_source}`);
            if (record.venue_id) {
                venues.add(record.venue_id);
            } else {
                withoutVenue += 1;
            }
            if (record.device_id) {
                devices.add(record.device_id);
            }
        }

        return {
            // All time: no range to report, and no timeline (only the top bar's totals ask
            // for all time, and they don't chart it)
            startDate: startDate ?? '',
            endDate: endDate ?? '',
            granularity,
            received: playRecords.length,
            uniqueAds: creatives.size,
            uniqueVenues: venues.size,
            uniqueDevices: devices.size,
            withoutVenue,
            pop,
            timeline: isAllTime
                ? []
                : this.buildReceivedTimeline(
                      playRecords,
                      startDate,
                      endDate,
                      granularity,
                      timeZone,
                  ),
        };
    }

    /**
     * Dashboard geography for one date range: the venues, states and categories that
     * received playables.
     *
     * @remarks
     * Needs the hosts service (state, category and name live there), so this is the call
     * that can be slow. It fails outright if the hosts service does - falling back to
     * "Unknown" for every venue would show a wrong answer, not a degraded one. Venues,
     * states and categories reuse buildHostRanking(), buildStateRanking() and
     * buildCategoryRanking(), so their numbers match Ranking Data's tabs exactly.
     *
     * @param startDate - First calendar date, "YYYY-MM-DD" (UTC); omit both for all time
     * @param endDate - Last calendar date, "YYYY-MM-DD" (UTC); omit both for all time
     * @returns Promise resolving to the Dashboard geography for the range
     * @throws Error if the rows or the hosts service lookup fail
     */
    async getDashboardGeography(startDate?: string, endDate?: string): Promise<DashboardGeography> {
        const playRecords = await rangeRecordsCache.getRecords(startDate, endDate);
        const hostRanking = await this.buildHostRanking(
            playRecords,
            startDate && endDate
                ? {
                      start: this.toCalendarDate(startDate)!,
                      end: this.toCalendarDate(endDate)!,
                  }
                : null,
            { strictHosts: true, withExtras: false },
        );
        const states = this.buildStateRanking(hostRanking, playRecords);
        const categories = this.buildCategoryRanking(hostRanking, playRecords);

        return {
            received: playRecords.length,
            withoutVenue: playRecords.filter((record) => !record.venue_id).length,
            uniqueStates: states.filter((entry) => entry.state !== 'Unknown').length,
            uniqueCategories: categories.filter((entry) => entry.category !== 'Unknown').length,
            states,
            categories,
            venues: hostRanking.map((venue): DashboardVenue => ({
                venueId: venue.venueId,
                hostName: venue.hostName,
                city: venue.city,
                state: venue.state,
                category: venue.category,
                totalAds: venue.totalAds,
                slotCount: venue.slotCount,
            })),
        };
    }

    /**
     * Dashboard ads for one date range: every distinct creative received, with the venues
     * that received it.
     *
     * @remarks
     * Needs the range's rows and the media files (titles, thumbnails), but not the Hosts
     * API - where an ad was received by state is derived client-side from its venues and
     * the geography call. Media files are fetched only for the creatives actually in the
     * range, not the whole table.
     *
     * @param startDate - First calendar date, "YYYY-MM-DD" (UTC)
     * @param endDate - Last calendar date, "YYYY-MM-DD" (UTC)
     * @param startDate - First calendar date, "YYYY-MM-DD" (UTC); omit both for all time
     * @param endDate - Last calendar date, "YYYY-MM-DD" (UTC); omit both for all time
     * @param venueIds - Restrict to plays at these venues only - omit/empty for every venue
     *   (Map View's Ads breakdown card, scoped to a clicked state's venues)
     * @returns Promise resolving to the Dashboard ads for the range
     * @throws Error if the rows or the media-files lookup fail
     */
    async getDashboardAds(
        startDate?: string,
        endDate?: string,
        venueIds?: string[],
    ): Promise<DashboardAds> {
        const allPlayRecords = await rangeRecordsCache.getRecords(startDate, endDate);
        const venueIdSet = venueIds?.length ? new Set(venueIds) : null;
        const playRecords = venueIdSet
            ? allPlayRecords.filter((record) => record.venue_id && venueIdSet.has(record.venue_id))
            : allPlayRecords;

        const creativeIds = [...new Set(playRecords.map((record) => record.creative_id))];
        const mediaFiles = await this.getMediaFilesForCreatives(creativeIds);

        return {
            received: playRecords.length,
            ads: this.buildAdShares(mediaFiles, playRecords),
        };
    }

    /**
     * Fetches the media files for a set of creative IDs, in parallel batches - the IDs go
     * in the query string, so one request for hundreds of them could exceed the URL limit.
     *
     * @param creativeIds - Distinct vendor creative IDs
     * @returns Promise resolving to the matching media files (any source)
     * @throws Error if a batch's query fails
     */
    private async getMediaFilesForCreatives(creativeIds: string[]): Promise<MediaFile[]> {
        const batchSize = 50;
        const batches: string[][] = [];
        for (let offset = 0; offset < creativeIds.length; offset += batchSize) {
            batches.push(creativeIds.slice(offset, offset + batchSize));
        }

        const results = await Promise.all(
            batches.map((batch) => dataStore.getMediaFilesByCreativeIds(batch)),
        );
        return results.flat();
    }

    /**
     * Groups play records by creative (creative_id + creative_source) - every distinct
     * creative, joined to its media file when there is one - by received count,
     * descending, each with the venues it was received at. Unlike buildTopAds(),
     * creatives with no media file are kept, so the counts add up to the total received.
     *
     * @param mediaFiles - Media files, for titles / thumbnails / types
     * @param playRecords - Play records already scoped to the range
     * @returns One entry per distinct creative, by received count, descending
     */
    private buildAdShares(
        mediaFiles: MediaFile[],
        playRecords: ProgrammaticAdSummary[],
    ): DashboardAdShare[] {
        const filesByCreative = new Map(
            mediaFiles.map((file) => [`${file.creative_id}:${file.creative_source}`, file]),
        );
        const byCreative = new Map<
            string,
            {
                creativeId: string;
                source: string;
                received: number;
                withoutVenue: number;
                byVenue: Map<string, number>;
            }
        >();

        for (const record of playRecords) {
            const key = `${record.creative_id}:${record.creative_source}`;
            const entry = byCreative.get(key) ?? {
                creativeId: record.creative_id,
                source: record.creative_source,
                received: 0,
                withoutVenue: 0,
                byVenue: new Map<string, number>(),
            };
            entry.received += 1;
            if (record.venue_id) {
                entry.byVenue.set(record.venue_id, (entry.byVenue.get(record.venue_id) ?? 0) + 1);
            } else {
                entry.withoutVenue += 1;
            }
            byCreative.set(key, entry);
        }

        return [...byCreative.entries()]
            .map(([key, entry]): DashboardAdShare => {
                const file = filesByCreative.get(key);
                const content = file ? mediaFileMapper.toContent(file) : null;

                return {
                    creativeId: entry.creativeId,
                    source: entry.source,
                    contentId: file?.id ?? null,
                    title: content?.title || entry.creativeId,
                    mediaUrl: content?.mediaUrl || null,
                    creativeType: content?.creativeType ?? null,
                    received: entry.received,
                    venueCount: entry.byVenue.size,
                    withoutVenue: entry.withoutVenue,
                    venues: [...entry.byVenue.entries()]
                        .map(([venueId, received]) => ({ venueId, received }))
                        .sort((left, right) => right.received - left.received),
                };
            })
            .sort((left, right) => right.received - left.received);
    }

    /**
     * Counts received playables (and distinct venues) per timeline bucket, zero-filled
     * so the chart always spans the whole range: 24 "HH:00" (UTC) buckets for a single
     * day, or one "YYYY-MM-DD" bucket per day.
     *
     * @param playRecords - Play records already scoped to the range
     * @param startDate - First calendar date, "YYYY-MM-DD"
     * @param endDate - Last calendar date, "YYYY-MM-DD"
     * @param granularity - `hour` or `day`
     * @param timeZone - IANA timezone identifier (or "UTC") buckets are grouped in
     * @returns One entry per bucket, in order
     */
    private buildReceivedTimeline(
        playRecords: ProgrammaticAdSummary[],
        startDate: string,
        endDate: string,
        granularity: 'hour' | 'day',
        timeZone: string,
    ): DailyAdsSummaryEntry[] {
        const buckets = new Map<
            string,
            { totalAds: number; venues: Set<string>; ads: Set<string> }
        >();
        for (const record of playRecords) {
            const key =
                granularity === 'hour'
                    ? this.toHourKey(record.fetched_at, timeZone)
                    : this.toDayKey(record.fetched_at, timeZone);
            if (!key) {
                continue;
            }
            const bucket = buckets.get(key) ?? {
                totalAds: 0,
                venues: new Set<string>(),
                ads: new Set<string>(),
            };
            bucket.totalAds += 1;
            bucket.ads.add(`${record.creative_id}|${record.creative_source}`);
            if (record.venue_id) {
                bucket.venues.add(record.venue_id);
            }
            buckets.set(key, bucket);
        }

        const keys: { key: string; label: string }[] = [];
        if (granularity === 'hour') {
            for (let hour = 0; hour < 24; hour += 1) {
                const key = String(hour).padStart(2, '0');
                keys.push({ key, label: `${key}:00` });
            }
        } else {
            // subtractDays does pure "YYYY-MM-DD" arithmetic - startDate/endDate may
            // already be resolved ISO instants by now (resolveDateZone), so normalize
            // back to a bare calendar date first (see toCalendarDate's own remarks).
            const dayCursorEnd = this.toCalendarDate(endDate)!;
            for (
                let day = this.toCalendarDate(startDate)!;
                day <= dayCursorEnd;
                day = this.subtractDays(day, -1)
            ) {
                keys.push({ key: day, label: day });
            }
        }

        return keys.map(({ key, label }) => ({
            date: label,
            totalAds: buckets.get(key)?.totalAds ?? 0,
            uniqueVenues: buckets.get(key)?.venues.size ?? 0,
            uniqueAds: buckets.get(key)?.ads.size ?? 0,
        }));
    }

    /**
     * Fetches a single venue's full profile - hosts service details not
     * surfaced on HostRankingEntry (address, contact, coordinates,
     * timezone), plus the same range-scoped totalAds/expectedRequests/
     * businessHoursSchedule/weeklySchedule HostRankingEntry rows carry.
     * Doesn't reuse buildHostRanking() (which always scans every venue with
     * activity in a range) - instead calls the same underlying pieces
     * (hostsService.getByVenueId, calculateExpectedRequests,
     * getBusinessHoursSchedule, getWeeklySchedule) directly against one
     * Host, and gets totalAds from a venue-scoped getProgrammaticAdsStats
     * call (a real DB-level query, not an in-memory scan).
     *
     * @param venueId - Venue identifier (matches Host.vistarVenueId)
     * @param options - Query options
     * @param options.startDate - Only include rows fetched on/after this calendar date, as "YYYY-MM-DD"
     * @param options.endDate - Only include rows fetched on/before this calendar date, as "YYYY-MM-DD"
     * @returns Promise resolving to the venue's profile, or null if it wasn't found in the hosts service
     * @throws Error if the underlying query fails
     */
    async getVenueProfile(
        venueId: string,
        options?: { startDate?: string; endDate?: string },
    ): Promise<VenueProfile | null> {
        const host = await hostsService.getByVenueId(venueId);
        if (!host) {
            return null;
        }

        const range =
            options?.startDate && options?.endDate
                ? {
                      start: this.toCalendarDate(options.startDate)!,
                      end: this.toCalendarDate(options.endDate)!,
                  }
                : null;
        const isMultiDayRange = !!range && range.start !== range.end;
        const scheduleDate = range?.start;

        const stats = await this.getProgrammaticAdsStats({
            venueIds: [venueId],
            startDate: options?.startDate,
            endDate: options?.endDate,
        });

        const deviceIds = await dataStore.getDistinctDeviceIds(venueId, {
            startDate: this.toUtcMidnight(options?.startDate),
            endDate: this.toUtcMidnight(options?.endDate),
        });

        let expectedRequests = 0;
        let businessHoursSchedule: string | null = null;
        let weeklySchedule: { day: string; hours: string }[] = [];
        try {
            expectedRequests = calculateExpectedRequests(host, range);
            businessHoursSchedule = isMultiDayRange
                ? MULTI_DAY_RANGE_MESSAGE
                : getBusinessHoursSchedule(host, scheduleDate);
            weeklySchedule = getWeeklySchedule(host);
        } catch (error) {
            console.error(
                `[Media Files Service] Failed to compute business hours for venue ${venueId}:`,
                error,
            );
        }

        return {
            venueId,
            hostName: host.name,
            address: host.address,
            city: host.city,
            state: host.state,
            postalCode: host.postalCode,
            category: host.category,
            venueType: host.venueType,
            contactPerson: host.contactPerson,
            contactNumber: host.contactNumber,
            latitude: host.latitude,
            longitude: host.longitude,
            timeZone: host.timeZone,
            totalAds: stats.total,
            slotCount: host.slotCount,
            expectedRequests,
            businessHoursSchedule,
            weeklySchedule,
            deviceIds,
        };
    }

    /**
     * Per-day totals for the Map View bar chart: total programmatic_ads rows
     * fetched that day, and how many distinct venues received at least one.
     *
     * @param options - Query options
     * @param options.startDate - Only include rows fetched on/after this calendar date, as "YYYY-MM-DD". Defaults to 29 days before endDate.
     * @param options.endDate - Only include rows fetched on/before this calendar date, as "YYYY-MM-DD". Defaults to today (UTC).
     * @param options.venueIds - Only include rows at these venues (e.g. the Map View's selected state) - omit for all venues
     * @param options.timeZone - IANA timezone identifier (or "UTC") the by-day buckets are grouped in
     * @returns Promise resolving to one entry per day with activity, ascending by date
     * @throws Error if the underlying query fails
     */
    async getDailyAdsSummary(options?: {
        startDate?: string;
        endDate?: string;
        venueIds?: string[];
        timeZone?: string;
    }): Promise<DailyAdsSummaryEntry[]> {
        const timeZone = options?.timeZone ?? 'UTC';
        // Bounded by default (last month), not "all time" like most of this
        // service's other range-scoped methods - a per-day chart with no
        // range picked would otherwise try to render one bar per day since
        // this table's very first row, which could be years of bars. This
        // default only applies when the caller hasn't picked a date range
        // at all (the top-level picker itself still caps an explicit pick
        // at 2 weeks) - the two are independent, not required to match.
        const endDate = options?.endDate ?? this.toDayKey(new Date().toISOString(), timeZone)!;
        const startDate =
            options?.startDate ?? this.subtractDays(this.toCalendarDate(endDate)!, 29);

        const allPlayRecords = await this.getRangeRecords(startDate, endDate);

        const venueIdSet = options?.venueIds?.length ? new Set(options.venueIds) : null;
        const playRecords = venueIdSet
            ? allPlayRecords.filter((record) => record.venue_id && venueIdSet.has(record.venue_id))
            : allPlayRecords;

        const totalsByDay = new Map<
            string,
            { totalAds: number; venues: Set<string>; ads: Set<string> }
        >();
        for (const record of playRecords) {
            const day = this.toDayKey(record.fetched_at, timeZone);
            if (!day) {
                continue;
            }
            const entry = totalsByDay.get(day) ?? {
                totalAds: 0,
                venues: new Set<string>(),
                ads: new Set<string>(),
            };
            entry.totalAds += 1;
            entry.ads.add(`${record.creative_id}|${record.creative_source}`);
            if (record.venue_id) {
                entry.venues.add(record.venue_id);
            }
            totalsByDay.set(day, entry);
        }

        return [...totalsByDay.entries()]
            .map(([date, { totalAds, venues, ads }]) => ({
                date,
                totalAds,
                uniqueVenues: venues.size,
                uniqueAds: ads.size,
            }))
            .sort((left, right) => left.date.localeCompare(right.date));
    }

    /**
     * Per-day, per-device ad counts for a single venue - powers the Venue
     * Profile page's daily chart's device breakdown (one line per device).
     * Bounded to one venue's own volume, so this is a plain filtered select
     * + in-memory grouping, same as getDistinctDeviceIds, not a paginated
     * fetch of the whole table like getDailyAdsSummary uses.
     *
     * @param venueId - Venue to scope to
     * @param options - Query options
     * @param options.startDate - Only include rows fetched on/after this calendar date, as "YYYY-MM-DD". Defaults to 29 days before endDate.
     * @param options.endDate - Only include rows fetched on/before this calendar date, as "YYYY-MM-DD". Defaults to today (UTC).
     * @param options.timeZone - IANA timezone identifier (or "UTC") the by-day buckets are grouped in
     * @returns Promise resolving to one entry per day with activity, ascending by date
     * @throws Error if the underlying query fails
     */
    async getDailyDeviceAdsSummary(
        venueId: string,
        options?: { startDate?: string; endDate?: string; timeZone?: string },
    ): Promise<DailyDeviceAdsEntry[]> {
        const timeZone = options?.timeZone ?? 'UTC';
        const endDate = options?.endDate ?? this.toDayKey(new Date().toISOString(), timeZone)!;
        const startDate =
            options?.startDate ?? this.subtractDays(this.toCalendarDate(endDate)!, 29);

        const records = await dataStore.getDeviceDailyRecords(venueId, {
            startDate: this.toUtcMidnight(startDate),
            endDate: this.toUtcMidnight(endDate),
        });

        const byDay = new Map<string, Record<string, number>>();
        for (const record of records) {
            const day = this.toDayKey(record.fetched_at, timeZone);
            if (!day || !record.device_id) {
                continue;
            }

            const byDevice = byDay.get(day) ?? {};
            byDevice[record.device_id] = (byDevice[record.device_id] ?? 0) + 1;
            byDay.set(day, byDevice);
        }

        return [...byDay.entries()]
            .map(([date, byDevice]) => ({ date, byDevice }))
            .sort((left, right) => left.date.localeCompare(right.date));
    }

    /**
     * Per-hour, per-device ad counts for a single venue on a single
     * calendar date - powers the Venue Profile page's daily chart's
     * hour-of-day breakdown, shown instead of the day-by-day view whenever
     * the picked range is exactly one day. All 24 hours are returned
     * (zero-filled) so the chart's x-axis always spans a full day, even for
     * hours with no activity. Reuses DailyDeviceAdsEntry's shape - `date`
     * holds an "HH:00" hour label here instead of a calendar date.
     *
     * @param venueId - Venue to scope to
     * @param date - The single calendar date to break down by hour, as "YYYY-MM-DD"
     * @param timeZone - IANA timezone identifier (or "UTC") the hour buckets are grouped in
     * @returns Promise resolving to 24 entries, one per hour, ascending
     * @throws Error if the underlying query fails
     */
    async getHourlyDeviceAdsSummary(
        venueId: string,
        date: string,
        timeZone: string = 'UTC',
    ): Promise<DailyDeviceAdsEntry[]> {
        const records = await dataStore.getDeviceDailyRecords(venueId, {
            startDate: this.toUtcMidnight(date),
            endDate: this.toUtcMidnight(date),
        });

        const byHour = new Map<string, Record<string, number>>();
        for (const record of records) {
            const hour = this.toHourKey(record.fetched_at, timeZone);
            if (hour === null || !record.device_id) {
                continue;
            }

            const byDevice = byHour.get(hour) ?? {};
            byDevice[record.device_id] = (byDevice[record.device_id] ?? 0) + 1;
            byHour.set(hour, byDevice);
        }

        return Array.from({ length: 24 }, (_, hour) => {
            const hourKey = String(hour).padStart(2, '0');
            return { date: `${hourKey}:00`, byDevice: byHour.get(hourKey) ?? {} };
        });
    }

    /**
     * Extracts the hour-of-day ("00" through "23") from an ISO timestamp, in
     * the given timezone.
     *
     * @param timestamp - ISO timestamp, or null
     * @param timeZone - IANA timezone identifier, or "UTC"
     * @returns Two-digit hour string, or null if timestamp is null
     */
    private toHourKey(timestamp: string | null, timeZone: string): string | null {
        return timestamp ? zonedHourKey(timestamp, timeZone) : null;
    }

    /**
     * Subtracts a number of whole days from a "YYYY-MM-DD" calendar date.
     *
     * @remarks
     * Pure calendar-date arithmetic, deliberately timezone-independent - the
     * input/output are abstract day labels (e.g. for zero-filling a chart's
     * empty days), not real instants, so there's nothing to convert. The
     * `Date`/`toISOString()` round-trip here is just an implementation
     * detail for the day math, not a zone conversion (contrast with
     * toDayKey/toHourKey, which DO need the active zone - they read a real
     * row timestamp's own day/hour).
     *
     * @param calendarDate - Date as "YYYY-MM-DD"
     * @param days - Number of days to subtract
     * @returns Resulting date as "YYYY-MM-DD"
     */
    private subtractDays(calendarDate: string, days: number): string {
        const date = new Date(`${calendarDate}T00:00:00.000Z`);
        date.setUTCDate(date.getUTCDate() - days);
        return date.toISOString().slice(0, 10);
    }

    /**
     * Rolls up venue-level ranking rows into one row per state - many venues
     * to one state. Venues with no hosts service match (state: null) are grouped
     * under "Unknown" rather than dropped, so their ad counts aren't silently
     * lost from the total. Also counts distinct creatives (creative_id +
     * creative_source) played anywhere in each state, computed from the raw
     * play records rather than the already-aggregated venue rows, since
     * venue-level totals don't retain creative identity.
     *
     * @param venues - Venue-level ranking rows, already resolved against the hosts service
     * @param playRecords - The same raw play records venues was built from
     * @returns States ranked by total ad count, descending
     */
    private buildStateRanking(
        venues: HostRankingEntry[],
        playRecords: ProgrammaticAdSummary[],
    ): StateRankingEntry[] {
        const stateByVenueId = new Map(
            venues.map((venue) => [venue.venueId, venue.state ?? 'Unknown']),
        );

        const uniqueAdsByState = new Map<string, Set<string>>();
        for (const record of playRecords) {
            if (!record.venue_id) {
                continue;
            }

            const state = stateByVenueId.get(record.venue_id);
            if (!state) {
                continue;
            }

            let creatives = uniqueAdsByState.get(state);
            if (!creatives) {
                creatives = new Set();
                uniqueAdsByState.set(state, creatives);
            }
            creatives.add(`${record.creative_id}:${record.creative_source}`);
        }

        const byState = new Map<string, StateRankingEntry>();

        for (const venue of venues) {
            const state = venue.state ?? 'Unknown';
            const existing = byState.get(state);

            if (existing) {
                existing.venueCount += 1;
                existing.totalAds += venue.totalAds;
            } else {
                byState.set(state, {
                    state,
                    venueCount: 1,
                    totalAds: venue.totalAds,
                    uniqueAdsPlayed: uniqueAdsByState.get(state)?.size ?? 0,
                });
            }
        }

        return [...byState.values()].sort((left, right) => right.totalAds - left.totalAds);
    }

    /**
     * Rolls up venue-level ranking rows into one row per category - many
     * venues to one category. Venues with no hosts service match (category:
     * null) are grouped under "Unknown" rather than dropped, so their ad
     * counts aren't silently lost from the total. Also counts distinct
     * creatives (creative_id + creative_source) played anywhere in each
     * category, computed from the raw play records rather than the
     * already-aggregated venue rows, since venue-level totals don't retain
     * creative identity. Mirrors buildStateRanking() exactly, keyed by
     * category instead of state.
     *
     * @param venues - Venue-level ranking rows, already resolved against the hosts service
     * @param playRecords - The same raw play records venues was built from
     * @returns Categories ranked by total ad count, descending
     */
    private buildCategoryRanking(
        venues: HostRankingEntry[],
        playRecords: ProgrammaticAdSummary[],
    ): CategoryRankingEntry[] {
        const categoryByVenueId = new Map(
            venues.map((venue) => [venue.venueId, venue.category ?? 'Unknown']),
        );

        const uniqueAdsByCategory = new Map<string, Set<string>>();
        for (const record of playRecords) {
            if (!record.venue_id) {
                continue;
            }

            const category = categoryByVenueId.get(record.venue_id);
            if (!category) {
                continue;
            }

            let creatives = uniqueAdsByCategory.get(category);
            if (!creatives) {
                creatives = new Set();
                uniqueAdsByCategory.set(category, creatives);
            }
            creatives.add(`${record.creative_id}:${record.creative_source}`);
        }

        const byCategory = new Map<string, CategoryRankingEntry>();

        for (const venue of venues) {
            const category = venue.category ?? 'Unknown';
            const existing = byCategory.get(category);

            if (existing) {
                existing.venueCount += 1;
                existing.totalAds += venue.totalAds;
            } else {
                byCategory.set(category, {
                    category,
                    venueCount: 1,
                    totalAds: venue.totalAds,
                    uniqueAdsPlayed: uniqueAdsByCategory.get(category)?.size ?? 0,
                });
            }
        }

        return [...byCategory.values()].sort((left, right) => right.totalAds - left.totalAds);
    }

    /**
     * Buckets a play record's proof-of-play duration into a color severity level.
     * Mirrors bucketFromMinutes in src/app/shared/utils/pop-duration.util.ts and the
     * bucket logic in DataStoreService.getProgrammaticAdsPaginated - keep in sync.
     *
     * @param record - Play record to bucket
     * @returns 'green' | 'yellow' | 'red', or null if no bucket applies (incl. no data)
     */
    private getPopDurationBucket(record: ProgrammaticAdSummary): 'green' | 'yellow' | 'red' | null {
        if (!record.proof_of_play_sent || !record.fetched_at) {
            return null;
        }

        const minutes =
            (new Date(record.proof_of_play_sent).getTime() -
                new Date(record.fetched_at).getTime()) /
            60000;

        if (minutes < 0) {
            return null;
        }

        const rounded = Math.round(minutes);

        if (rounded >= 1 && rounded <= 5) {
            return 'green';
        }
        if (rounded > 5 && rounded <= 10) {
            return 'yellow';
        }
        if (rounded > 10) {
            return 'red';
        }

        return null;
    }

    /**
     * Builds four weekly play totals for a top ad.
     *
     * @param records - Play records for one creative identity
     * @returns Four weekly totals, oldest to newest
     */
    private getWeeklyCounts(records: ProgrammaticAdSummary[]): number[] {
        const timestamps = records
            .map((record) => record.date_served || record.fetched_at)
            .map((timestamp) => new Date(timestamp).getTime())
            .filter((timestamp) => Number.isFinite(timestamp));

        if (!timestamps.length) {
            return [0, 0, 0, 0];
        }

        const weekMs = 7 * 24 * 60 * 60 * 1000;
        // Anchor to now, not the latest timestamp - otherwise the most recent
        // bucket only ever counts records at-or-after the single latest one.
        const referenceEnd = Date.now();

        return [0, 1, 2, 3].map((weekIndex) => {
            const start = referenceEnd - (4 - weekIndex) * weekMs;
            const end = referenceEnd - (3 - weekIndex) * weekMs;
            return timestamps.filter((timestamp) => timestamp >= start && timestamp < end).length;
        });
    }
}

/**
 * Singleton instance of the media files service.
 */
export const mediaFilesService = new MediaFilesService();
