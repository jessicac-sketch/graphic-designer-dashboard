/** Local Imports */
import { getMockDataset } from '../mock-data/mock-dataset.js';
import type {
    MediaFile,
    MediaFileWithMetrics,
    MediaFileWithPlayCount,
    ProgrammaticAd,
    ProgrammaticAdPage,
    ProgrammaticAdsStats,
    ProgrammaticAdSummary,
    VenueStat,
} from '../types/database.types.js';
import type { ProgrammaticAdsSortBy } from '../types/media-files-options.types.js';
import type { ProgrammaticAdsColumnFilters } from '../types/programmatic-ads-column-filters.types.js';

/** Date-range options shared by most queries. */
interface DateRange {
    /** Only rows fetched on/after this UTC ISO instant */
    startDate?: string;

    /** Only rows fetched before the end of this UTC-midnight ISO instant's day */
    endDate?: string;
}

/**
 * The BFF's data source: every query the services need, answered from the in-memory
 * dummy dataset in `src/server/mock-data`.
 *
 * @remarks
 * This is the one seam to replace when a project gets a real backend. Keep the method
 * signatures and swap each body for a database query or API call (Supabase, Postgres,
 * a REST API...); nothing above this layer needs to change. The behaviour of each method
 * (filters, sort order, nulls last) mirrors what the UI expects from a real database.
 */
export class DataStoreService {
    /** Play records per creative ("id|source"), newest first. */
    private adsByCreative: Map<string, ProgrammaticAd[]> | null = null;

    /** Play records per venue, newest first. */
    private adsByVenue: Map<string, ProgrammaticAd[]> | null = null;

    /**
     * Groups play records by a key, keeping the dataset's newest-first order.
     *
     * @param keyOf - Key for a row, or null to skip it
     * @returns The groups
     */
    private groupAds(keyOf: (ad: ProgrammaticAd) => string | null): Map<string, ProgrammaticAd[]> {
        const groups = new Map<string, ProgrammaticAd[]>();
        for (const ad of getMockDataset().ads) {
            const key = keyOf(ad);
            if (key === null) {
                continue;
            }
            const group = groups.get(key);
            if (group) {
                group.push(ad);
            } else {
                groups.set(key, [ad]);
            }
        }
        return groups;
    }

    /**
     * Play records of one creative.
     *
     * @param creativeId - Creative identifier
     * @param creativeSource - Creative source
     * @returns Its play records, newest first
     */
    private creativeAds(creativeId: string, creativeSource: string): ProgrammaticAd[] {
        this.adsByCreative ??= this.groupAds((ad) => `${ad.creative_id}|${ad.creative_source}`);
        return this.adsByCreative.get(`${creativeId}|${creativeSource}`) ?? [];
    }

    /**
     * Play records of one venue.
     *
     * @param venueId - Venue identifier
     * @returns Its play records, newest first
     */
    private venueAds(venueId: string): ProgrammaticAd[] {
        this.adsByVenue ??= this.groupAds((ad) => ad.venue_id);
        return this.adsByVenue.get(venueId) ?? [];
    }

    /**
     * Keeps the rows whose fetched_at falls in the range (end date's whole day included).
     *
     * @param rows - Rows to filter
     * @param range - Date range
     * @returns The rows in range
     */
    private inRange<T extends { fetched_at: string }>(rows: T[], range?: DateRange): T[] {
        if (!range?.startDate && !range?.endDate) {
            return rows;
        }
        const start = range.startDate ? new Date(range.startDate).getTime() : -Infinity;
        let end = Infinity;
        if (range.endDate) {
            const endOfDay = new Date(range.endDate);
            endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);
            end = endOfDay.getTime();
        }
        return rows.filter((row) => {
            const time = new Date(row.fetched_at).getTime();
            return time >= start && time < end;
        });
    }

    /**
     * Compares two nullable values, nulls last regardless of direction.
     *
     * @param a - Left value
     * @param b - Right value
     * @param ascending - Sort direction
     * @returns Negative, zero or positive, as for Array.sort
     */
    private compare(
        a: string | number | boolean | null | undefined,
        b: string | number | boolean | null | undefined,
        ascending: boolean,
    ): number {
        const aNull = a === null || a === undefined;
        const bNull = b === null || b === undefined;
        if (aNull || bNull) {
            return aNull === bNull ? 0 : aNull ? 1 : -1;
        }
        const order = a < b ? -1 : a > b ? 1 : 0;
        return ascending ? order : -order;
    }

    /**
     * Case-insensitive substring match.
     *
     * @param value - Value to search in
     * @param search - Text to look for
     * @returns Whether value contains search
     */
    private matches(value: string | null | undefined, search: string): boolean {
        return (value ?? '').toLowerCase().includes(search.toLowerCase());
    }

    /**
     * Minutes from fetch to proof of play, or null when it can't be computed.
     *
     * @param ad - Play record
     * @returns The proof-of-play duration in minutes
     */
    private popDurationMinutes(ad: ProgrammaticAd): number | null {
        if (!ad.proof_of_play_sent) {
            return null;
        }
        const minutes =
            (new Date(ad.proof_of_play_sent).getTime() - new Date(ad.fetched_at).getTime()) /
            60_000;
        return minutes >= 0 ? minutes : null;
    }

    /**
     * Orders play records the way the play-record lists show them: played (newest first,
     * nulls last), then fetched_at, then id.
     *
     * @param rows - Rows to sort (not mutated)
     * @returns The sorted rows
     */
    private sortByPlayed(rows: ProgrammaticAd[]): ProgrammaticAd[] {
        return [...rows].sort(
            (a, b) =>
                this.compare(a.played, b.played, false) ||
                this.compare(a.fetched_at, b.fetched_at, false) ||
                this.compare(a.id, b.id, true),
        );
    }

    /**
     * Fetches a single media file by ID with its play metrics.
     *
     * @param mediaFileId - Media file ID
     * @returns The media file with metrics, or null if not found
     */
    async getMediaFileWithMetrics(mediaFileId: string): Promise<MediaFileWithMetrics | null> {
        const file = getMockDataset().mediaFiles.find((f) => f.id === mediaFileId);
        if (!file) {
            return null;
        }
        const ads = this.creativeAds(file.creative_id, file.creative_source);
        const lastPlayed = ads.reduce<string | null>(
            (latest, ad) => (ad.played && (!latest || ad.played > latest) ? ad.played : latest),
            null,
        );
        return {
            ...file,
            play_count: ads.length,
            total_duration_played: ads.length * (file.duration ?? 0),
            last_played: lastPlayed,
        };
    }

    /**
     * Fetches a page of play records for a creative, newest first, with the range's total.
     *
     * @param creativeId - Creative identifier
     * @param creativeSource - Creative source
     * @param options - Page and date range
     * @returns The page of play records and the range's total
     */
    async getPlayRecordsByCreative(
        creativeId: string,
        creativeSource: string,
        options?: { limit?: number; offset?: number } & DateRange,
    ): Promise<{ rows: ProgrammaticAd[]; total: number }> {
        const { limit = 100, offset = 0 } = options || {};
        const rows = this.sortByPlayed(
            this.inRange(this.creativeAds(creativeId, creativeSource), options),
        );
        return { rows: rows.slice(offset, offset + limit), total: rows.length };
    }

    /**
     * Fetches every play record of a creative in a date range, newest first (exports).
     *
     * @param creativeId - Creative identifier
     * @param creativeSource - Creative source
     * @param options - Date range
     * @returns Every matching play record
     */
    async getAllPlayRecordsByCreative(
        creativeId: string,
        creativeSource: string,
        options?: DateRange,
    ): Promise<ProgrammaticAd[]> {
        return this.sortByPlayed(
            this.inRange(this.creativeAds(creativeId, creativeSource), options),
        );
    }

    /**
     * Per-venue play count and latest play of a creative, most plays first.
     *
     * @param creativeId - Creative identifier
     * @param creativeSource - Creative source
     * @param options - Date range
     * @returns The venue stats
     */
    async getVenueStatsByCreative(
        creativeId: string,
        creativeSource: string,
        options?: DateRange,
    ): Promise<VenueStat[]> {
        const stats = new Map<string, VenueStat>();
        for (const ad of this.inRange(this.creativeAds(creativeId, creativeSource), options)) {
            if (!ad.venue_id) {
                continue;
            }
            const stat = stats.get(ad.venue_id) ?? {
                venue_id: ad.venue_id,
                play_count: 0,
                latest_play: null,
            };
            stat.play_count++;
            if (ad.played && (!stat.latest_play || ad.played > stat.latest_play)) {
                stat.latest_play = ad.played;
            }
            stats.set(ad.venue_id, stat);
        }
        return [...stats.values()].sort((a, b) => b.play_count - a.play_count);
    }

    /**
     * Fetches a page of media files, filtered and sorted.
     *
     * @param options - Page, filters and sort
     * @returns The media files
     */
    async getMediaFiles(options?: {
        limit?: number;
        offset?: number;
        source?: string;
        search?: string;
        orderBy?: 'created_at' | 'duration';
        ascending?: boolean;
        creativeType?: 'video' | 'image';
    }): Promise<MediaFile[]> {
        const {
            limit = 100,
            offset = 0,
            source,
            search,
            orderBy = 'created_at',
            ascending = false,
            creativeType,
        } = options || {};

        return getMockDataset()
            .mediaFiles.filter(
                (f) =>
                    (!source || f.creative_source === source) &&
                    (!creativeType || f.creative_type === creativeType) &&
                    (!search ||
                        this.matches(f.creative_name, search) ||
                        this.matches(f.creative_id, search)),
            )
            .sort(
                (a, b) =>
                    this.compare(a[orderBy], b[orderBy], ascending) ||
                    this.compare(a.created_at, b.created_at, false) ||
                    this.compare(a.id, b.id, true),
            )
            .slice(offset, offset + limit);
    }

    /**
     * Fetches every media file.
     *
     * @returns All media files
     */
    async getAllMediaFiles(): Promise<MediaFile[]> {
        return [...getMockDataset().mediaFiles];
    }

    /**
     * Every play of one ad at one venue, with just the columns needed to group by slot.
     *
     * @param creativeId - Creative identifier
     * @param creativeSource - Creative source
     * @param venueId - Venue to scope to
     * @param options - Date range
     * @returns Every matching play (slot, played / fetched time, screenshot)
     */
    async getSlotRowsByCreativeVenue(
        creativeId: string,
        creativeSource: string,
        venueId: string,
        options?: DateRange,
    ): Promise<
        {
            id: string;
            slot_playlist_content_id: string | null;
            slot_playlist_content_position: string | null;
            played: string | null;
            fetched_at: string;
            pop_screenshot: string | null;
        }[]
    > {
        return this.inRange(this.creativeAds(creativeId, creativeSource), options)
            .filter((ad) => ad.venue_id === venueId)
            .map(
                ({
                    id,
                    slot_playlist_content_id,
                    slot_playlist_content_position,
                    played,
                    fetched_at,
                    pop_screenshot,
                }) => ({
                    id,
                    slot_playlist_content_id,
                    slot_playlist_content_position,
                    played,
                    fetched_at,
                    pop_screenshot,
                }),
            );
    }

    /**
     * Fetches a page of media files ordered by all-time play count.
     *
     * @param options - Page, direction and filters
     * @returns The page, each row with its play_count
     */
    async getMediaFilesByPlays(options: {
        limit: number;
        offset: number;
        ascending?: boolean;
        creativeType?: 'video' | 'image';
        search?: string;
    }): Promise<MediaFileWithPlayCount[]> {
        const { search, creativeType, ascending = false } = options;
        return getMockDataset()
            .mediaFiles.filter(
                (f) =>
                    (!creativeType || f.creative_type === creativeType) &&
                    (!search ||
                        this.matches(f.creative_name, search) ||
                        this.matches(f.creative_id, search)),
            )
            .map((f) => ({
                ...f,
                play_count: this.creativeAds(f.creative_id, f.creative_source).length,
            }))
            .sort(
                (a, b) =>
                    this.compare(a.play_count, b.play_count, ascending) ||
                    this.compare(a.created_at, b.created_at, false) ||
                    this.compare(a.id, b.id, true),
            )
            .slice(options.offset, options.offset + options.limit);
    }

    /**
     * Counts media files, all and per creative type.
     *
     * @param search - Match creative name or creative ID, as the list does
     * @returns The counts
     */
    async countMediaFilesByType(
        search?: string,
    ): Promise<{ all: number; video: number; image: number }> {
        const files = getMockDataset().mediaFiles.filter(
            (f) =>
                !search ||
                this.matches(f.creative_name, search) ||
                this.matches(f.creative_id, search),
        );
        return {
            all: files.length,
            video: files.filter((f) => f.creative_type === 'video').length,
            image: files.filter((f) => f.creative_type === 'image').length,
        };
    }

    /**
     * Fetches the media files matching any of the given creative IDs.
     *
     * @param creativeIds - Creative IDs to look up
     * @returns Matching media files
     */
    async getMediaFilesByCreativeIds(creativeIds: string[]): Promise<MediaFile[]> {
        const ids = new Set(creativeIds);
        return getMockDataset().mediaFiles.filter((f) => ids.has(f.creative_id));
    }

    /**
     * Fetches the play records used to build dashboard aggregates.
     *
     * @param options - Date range
     * @returns All matching play records, newest first
     */
    async getProgrammaticAds(options?: DateRange): Promise<ProgrammaticAdSummary[]> {
        return this.inRange(getMockDataset().ads, options);
    }

    /**
     * Distinct device IDs that played ads at a venue.
     *
     * @param venueId - Venue to scope to
     * @param options - Date range
     * @returns Distinct device IDs
     */
    async getDistinctDeviceIds(venueId: string, options?: DateRange): Promise<string[]> {
        const ids = this.inRange(this.venueAds(venueId), options)
            .map((ad) => ad.device_id)
            .filter((id): id is string => Boolean(id));
        return [...new Set(ids)];
    }

    /**
     * Raw (device_id, fetched_at) pairs for a venue - the Venue Profile's device chart.
     *
     * @param venueId - Venue to scope to
     * @param options - Date range
     * @returns Every matching pair
     */
    async getDeviceDailyRecords(
        venueId: string,
        options?: DateRange,
    ): Promise<{ device_id: string | null; fetched_at: string }[]> {
        return this.inRange(this.venueAds(venueId), options).map(({ device_id, fetched_at }) => ({
            device_id,
            fetched_at,
        }));
    }

    /**
     * Fetches a page of play records with a computed proof-of-play duration, filtered by
     * bucket, search, column filters, date range and venues, and sorted.
     *
     * @param options - Page, filters and sort
     * @returns The page and the total matching row count
     */
    async getProgrammaticAdsPaginated(
        options?: {
            limit?: number;
            offset?: number;
            bucket?: string;
            sortBy?: ProgrammaticAdsSortBy;
            sortDir?: 'asc' | 'desc';
            search?: string;
            columnFilters?: ProgrammaticAdsColumnFilters;
            venueIds?: string[];
        } & DateRange,
    ): Promise<{ data: ProgrammaticAdPage[]; count: number }> {
        const {
            limit = 100,
            offset = 0,
            bucket,
            sortBy = 'fetched_at',
            sortDir = 'desc',
            search,
            columnFilters,
            venueIds,
        } = options || {};
        const now = Date.now();
        const venues = venueIds?.length ? new Set(venueIds) : null;
        const filters = columnFilters ?? {};

        const inBucket = (ad: ProgrammaticAd, minutes: number | null): boolean => {
            const rounded = minutes === null ? null : Math.round(minutes);
            const recent = now - new Date(ad.fetched_at).getTime() <= 5 * 60_000;
            switch (bucket) {
                case 'green':
                    return rounded !== null && rounded >= 1 && rounded <= 5;
                case 'yellow':
                    return rounded !== null && rounded >= 6 && rounded <= 10;
                case 'red':
                    return rounded !== null && rounded > 10;
                case 'gray':
                    return minutes === null;
                case 'successful':
                    return ad.played !== null && ad.proof_of_play_sent !== null;
                case 'overdue':
                    return ad.proof_of_play_sent === null && !recent;
                case 'recent':
                    return ad.proof_of_play_sent === null && recent;
                default:
                    return true;
            }
        };

        const rows = this.inRange(getMockDataset().ads, options)
            .map((ad) => ({ ad, minutes: this.popDurationMinutes(ad) }))
            .filter(
                ({ ad, minutes }) =>
                    inBucket(ad, minutes) &&
                    (!venues || (ad.venue_id !== null && venues.has(ad.venue_id))) &&
                    (!search ||
                        this.matches(ad.creative_id, search) ||
                        this.matches(ad.venue_id, search) ||
                        this.matches(ad.device_id, search)) &&
                    (!filters.creativeId || this.matches(ad.creative_id, filters.creativeId)) &&
                    (!filters.creativeSource ||
                        this.matches(ad.creative_source, filters.creativeSource)) &&
                    (!filters.venueId || this.matches(ad.venue_id, filters.venueId)) &&
                    (!filters.deviceId || this.matches(ad.device_id, filters.deviceId)) &&
                    (!filters.trackerId ||
                        this.matches(String(ad.metadata?.['trackerId'] ?? ''), filters.trackerId)),
            );

        const ascending = sortDir === 'asc';
        rows.sort((a, b) => {
            switch (sortBy) {
                case 'pop_duration':
                    return this.compare(a.minutes, b.minutes, ascending);
                case 'proof_of_play_sent':
                case 'date_served':
                case 'creative_id':
                case 'creative_source':
                case 'venue_id':
                case 'device_id':
                case 'served':
                    return this.compare(a.ad[sortBy], b.ad[sortBy], ascending);
                default:
                    return this.compare(a.ad.fetched_at, b.ad.fetched_at, ascending);
            }
        });

        const data = rows.slice(offset, offset + limit).map(({ ad, minutes }) => ({
            ...ad,
            pop_duration_minutes: minutes,
            total_count: rows.length,
        }));
        return { data, count: rows.length };
    }

    /**
     * Total and green/yellow/red proof-of-play duration counts.
     *
     * @param options - Date range and venues
     * @returns The counts
     */
    async getProgrammaticAdsStats(
        options?: DateRange & { venueIds?: string[] },
    ): Promise<ProgrammaticAdsStats> {
        const venues = options?.venueIds?.length ? new Set(options.venueIds) : null;
        const stats: ProgrammaticAdsStats = {
            total_count: 0,
            green_count: 0,
            yellow_count: 0,
            red_count: 0,
        };
        for (const ad of this.inRange(getMockDataset().ads, options)) {
            if (venues && (ad.venue_id === null || !venues.has(ad.venue_id))) {
                continue;
            }
            stats.total_count++;
            const minutes = this.popDurationMinutes(ad);
            const rounded = minutes === null ? null : Math.round(minutes);
            if (rounded === null || rounded < 1) {
                continue;
            }
            if (rounded <= 5) {
                stats.green_count++;
            } else if (rounded <= 10) {
                stats.yellow_count++;
            } else {
                stats.red_count++;
            }
        }
        return stats;
    }
}

/**
 * Singleton instance of the data store.
 */
export const dataStore = new DataStoreService();
