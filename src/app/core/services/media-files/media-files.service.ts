/** Angular Imports */
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

/** Third Party Imports */
import type { Observable } from 'rxjs';
import { map, timeout } from 'rxjs/operators';

/** Local Imports */
import type {
    CategoryRankingEntry,
    DailyAdsSummaryEntry,
    DailyDeviceAdsEntry,
    DashboardAnalytics,
    DashboardTopAd,
    HostRankingEntry,
    LocationData,
    MediaFileContent,
    MediaFileDetailContent,
    PlayRecordContent,
    ProgrammaticAdsStats,
    StateRankingEntry,
    VenueProfile,
} from '@core';
import type { AdVenueSlot } from '@shared/interfaces/ad-analytics';
import type {
    AdRankingResponse,
    CategoryRankingResponse,
    DailyAdsSummaryResponse,
    DailyDeviceAdsSummaryResponse,
    DashboardAnalyticsResponse,
    LocationsResponse,
    MediaFileResponse,
    MediaFilesResponse,
    PlayRecordsResponse,
    ProgrammaticAdsStatsResponse,
    StateRankingResponse,
    VenueProfileResponse,
    VenueRankingResponse,
} from './media-files-response.model';

import type { ProgrammaticAdsColumnFilters } from './programmatic-ads-column-filters.model';

/**
 * Backend sort keys supported by the raw Programmatic Ads table - one per
 * sortable column (every column with `filter: true` in rawAdsColumns).
 */
export type ProgrammaticAdsSortBy =
    | 'fetched_at'
    | 'pop_duration'
    | 'proof_of_play_sent'
    | 'date_served'
    | 'creative_id'
    | 'creative_source'
    | 'venue_id'
    | 'device_id'
    | 'served';

/**
 * Filters shared by the Programmatic Ads list, export, and export/xlsx
 * endpoints - an export is always scoped to the same filters currently
 * shown in the table.
 */
export interface ProgrammaticAdsFilterOptions {
    /** Filter to a proof-of-play duration bucket, or a stat-card filter */
    bucket?: 'green' | 'yellow' | 'red' | 'gray' | 'successful' | 'overdue' | 'recent';

    /** Column to sort by (default: 'fetched_at') */
    sortBy?: ProgrammaticAdsSortBy;

    /** Sort direction (default: 'desc') */
    sortDir?: 'asc' | 'desc';

    /** Search by creative ID, venue ID, or device ID */
    search?: string;

    /** Per-column substring filters, ANDed with the search above */
    columnFilters?: ProgrammaticAdsColumnFilters;

    /** Only include rows fetched on/after this calendar date, as "YYYY-MM-DD" */
    startDate?: string;

    /** Only include rows fetched on/before this calendar date, as "YYYY-MM-DD" */
    endDate?: string;

    /** Exact venue_id match against any of these, scoping the whole page/sort/filter/bucket to a set of venues */
    venueIds?: string[];
}

/**
 * Service for fetching media files content from the BFF API.
 *
 * @remarks
 * All requests go through the BFF, which owns the data source (today the dummy
 * dataset in src/server/mock-data) and handles authentication and data mapping.
 */
@Injectable({
    providedIn: 'root',
})
export class MediaFilesService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = '/api/media-files';

    /**
     * Default request timeout. Without this, a request that hangs upstream
     * (e.g. a stalled backend connection) never errors and never completes -
     * it just leaves the UI loading forever instead of failing cleanly.
     */
    private readonly requestTimeoutMs = 180000;

    /** Longer timeout for full-table export requests, which can take a while. */
    private readonly exportTimeoutMs = 120000;

    /**
     * Fetches all media files with optional filtering.
     *
     * @param options - Query options
     * @param options.limit - Maximum number of results (default: 100)
     * @param options.offset - Number of results to skip (default: 0)
     * @param options.source - Filter by creative source
     * @param options.search - Search by creative name or ID
     * @returns Observable of media file content array
     *
     * @example
     * ```typescript
     * this.mediaFilesService.getAll({ limit: 50 }).subscribe(files => {
     *   console.log('Fetched media files:', files);
     * });
     * ```
     */
    getAll(options?: {
        limit?: number;
        offset?: number;
        source?: string;
        search?: string;
        sort?: 'newest' | 'plays' | 'duration';
        direction?: 'asc' | 'desc';
        type?: 'video' | 'image';
    }): Observable<MediaFileContent[]> {
        let params = new HttpParams();

        if (options?.limit) {
            params = params.set('limit', options.limit.toString());
        }
        if (options?.offset) {
            params = params.set('offset', options.offset.toString());
        }
        if (options?.source) {
            params = params.set('source', options.source);
        }
        if (options?.search) {
            params = params.set('search', options.search);
        }
        if (options?.sort) {
            params = params.set('sort', options.sort);
        }
        if (options?.direction) {
            params = params.set('direction', options.direction);
        }
        if (options?.type) {
            params = params.set('type', options.type);
        }

        return this.http.get<MediaFilesResponse>(this.apiUrl, { params }).pipe(
            timeout(this.requestTimeoutMs),
            map((response) => response.data),
        );
    }

    /**
     * Counts media files, all and per creative type - the Ads Gallery's type filter.
     *
     * @param search - Match creative name or creative ID, as the gallery list does
     * @returns Observable of the counts
     */
    getTypeCounts(search?: string): Observable<{ all: number; video: number; image: number }> {
        let params = new HttpParams();
        if (search) {
            params = params.set('search', search);
        }

        return this.http
            .get<{
                data: { all: number; video: number; image: number };
            }>(`${this.apiUrl}/type-counts`, { params })
            .pipe(
                timeout(this.requestTimeoutMs),
                map((response) => response.data),
            );
    }

    /**
     * Fetches aggregate data for the dashboard and analytics page. Play-record counts
     * follow the optional range (Ranking Data's stat cards); all time without one.
     *
     * @param options - Query options
     * @param options.startDate - First calendar date, "YYYY-MM-DD"
     * @param options.endDate - Last calendar date, "YYYY-MM-DD"
     * @returns Observable of dashboard analytics
     */
    getDashboardAnalytics(options?: {
        startDate?: string;
        endDate?: string;
    }): Observable<DashboardAnalytics> {
        let params = new HttpParams();
        if (options?.startDate) {
            params = params.set('startDate', options.startDate);
        }
        if (options?.endDate) {
            params = params.set('endDate', options.endDate);
        }

        return this.http
            .get<DashboardAnalyticsResponse>(`${this.apiUrl}/analytics`, { params })
            .pipe(
                timeout(this.requestTimeoutMs),
                map((response) => response.data),
            );
    }

    /**
     * Fetches ads ranked by play-record count, optionally scoped to a date
     * range. Independent of getDashboardAnalytics() so changing the range
     * only reloads this table.
     *
     * @param options - Query options
     * @param options.startDate - Only include rows fetched on/after this calendar date, as "YYYY-MM-DD"
     * @param options.endDate - Only include rows fetched on/before this calendar date, as "YYYY-MM-DD"
     * @returns Observable of ads ranked by play count, descending
     *
     * @example
     * ```typescript
     * this.mediaFilesService
     *   .getAdRanking({ startDate: '2026-09-01', endDate: '2026-09-01' })
     *   .subscribe(ads => console.log('Ad ranking:', ads));
     * ```
     */
    getAdRanking(options?: { startDate?: string; endDate?: string }): Observable<DashboardTopAd[]> {
        let params = new HttpParams();

        if (options?.startDate) {
            params = params.set('startDate', options.startDate);
        }
        if (options?.endDate) {
            params = params.set('endDate', options.endDate);
        }

        return this.http.get<AdRankingResponse>(`${this.apiUrl}/ad-ranking`, { params }).pipe(
            timeout(this.requestTimeoutMs),
            map((response) => response.data),
        );
    }

    /**
     * Ranks ads by play count, descending, restricted to plays at a given
     * set of venues - powers the State Ranking table's "Unique Ads Played"
     * drill-down modal.
     *
     * @param venueIds - Venue IDs to restrict to
     * @param options - Query options
     * @param options.startDate - Only include rows fetched on/after this calendar date, as "YYYY-MM-DD"
     * @param options.endDate - Only include rows fetched on/before this calendar date, as "YYYY-MM-DD"
     * @returns Observable of ads ranked by play count, descending
     *
     * @example
     * ```typescript
     * this.mediaFilesService
     *   .getAdsByVenues(['VV-102938', 'VV-102939'], { startDate: '2026-09-01' })
     *   .subscribe(ads => console.log('Ads played in these venues:', ads));
     * ```
     */
    getAdsByVenues(
        venueIds: string[],
        options?: { startDate?: string; endDate?: string },
    ): Observable<DashboardTopAd[]> {
        return this.http
            .post<AdRankingResponse>(`${this.apiUrl}/ads-by-venues`, {
                venueIds,
                startDate: options?.startDate,
                endDate: options?.endDate,
            })
            .pipe(
                timeout(this.requestTimeoutMs),
                map((response) => response.data),
            );
    }

    /**
     * Downloads ads ranked by play-record count (optionally scoped to a date
     * range) as a styled XLSX workbook.
     *
     * @param options - Query options
     * @param options.startDate - Only include rows fetched on/after this calendar date, as "YYYY-MM-DD"
     * @param options.endDate - Only include rows fetched on/before this calendar date, as "YYYY-MM-DD"
     * @returns Observable of the XLSX file blob
     */
    getAdRankingExportXlsx(options?: { startDate?: string; endDate?: string }): Observable<Blob> {
        let params = new HttpParams();

        if (options?.startDate) {
            params = params.set('startDate', options.startDate);
        }
        if (options?.endDate) {
            params = params.set('endDate', options.endDate);
        }

        return this.http
            .get(`${this.apiUrl}/ad-ranking/export/xlsx`, { params, responseType: 'blob' })
            .pipe(timeout(this.exportTimeoutMs));
    }

    /**
     * Fetches venues ranked by play-record count, optionally scoped to a date
     * range, enriched with host details. Independent of getDashboardAnalytics()
     * so changing the range only reloads this table.
     *
     * @param options - Query options
     * @param options.startDate - Only include rows fetched on/after this calendar date, as "YYYY-MM-DD" - deliberately a calendar date rather than an ISO instant, so the query window (and the Business Hours/Expected Reqs columns) don't shift depending on the browser's timezone offset
     * @param options.endDate - Only include rows fetched on/before this calendar date, as "YYYY-MM-DD"
     * @returns Observable of venues ranked by play count, descending
     *
     * @example
     * ```typescript
     * this.mediaFilesService
     *   .getVenueRanking({ startDate: '2026-09-01', endDate: '2026-09-01' })
     *   .subscribe(venues => console.log('Venue ranking:', venues));
     * ```
     */
    getVenueRanking(options?: {
        startDate?: string;
        endDate?: string;
    }): Observable<HostRankingEntry[]> {
        let params = new HttpParams();

        if (options?.startDate) {
            params = params.set('startDate', options.startDate);
        }
        if (options?.endDate) {
            params = params.set('endDate', options.endDate);
        }

        return this.http.get<VenueRankingResponse>(`${this.apiUrl}/venue-ranking`, { params }).pipe(
            timeout(this.requestTimeoutMs),
            map((response) => response.data),
        );
    }

    /**
     * Fetches US states ranked by play-record count, optionally scoped to a
     * date range - a many-venues-to-one-state rollup, plus the per-venue
     * breakdown each state was built from (for the "Total Ads" drill-down modal).
     *
     * @param options - Query options
     * @param options.startDate - Only include rows fetched on/after this calendar date, as "YYYY-MM-DD"
     * @param options.endDate - Only include rows fetched on/before this calendar date, as "YYYY-MM-DD"
     * @returns Observable of states ranked by play count, plus the per-venue breakdown
     *
     * @example
     * ```typescript
     * this.mediaFilesService
     *   .getStateRanking({ startDate: '2026-09-01', endDate: '2026-09-01' })
     *   .subscribe(({ states, venues }) => console.log('State ranking:', states, venues));
     * ```
     */
    getStateRanking(options?: {
        startDate?: string;
        endDate?: string;
    }): Observable<{ states: StateRankingEntry[]; venues: HostRankingEntry[] }> {
        let params = new HttpParams();

        if (options?.startDate) {
            params = params.set('startDate', options.startDate);
        }
        if (options?.endDate) {
            params = params.set('endDate', options.endDate);
        }

        return this.http.get<StateRankingResponse>(`${this.apiUrl}/state-ranking`, { params }).pipe(
            timeout(this.requestTimeoutMs),
            map((response) => response.data),
        );
    }

    /**
     * Fetches venue categories ranked by play-record count, optionally
     * scoped to a date range - a many-venues-to-one-category rollup, plus
     * the per-venue breakdown each category was built from. Mirrors
     * getStateRanking() exactly.
     *
     * @param options - Query options
     * @param options.startDate - Only include rows fetched on/after this calendar date, as "YYYY-MM-DD"
     * @param options.endDate - Only include rows fetched on/before this calendar date, as "YYYY-MM-DD"
     * @returns Observable of categories ranked by play count, plus the per-venue breakdown
     */
    getCategoryRanking(options?: {
        startDate?: string;
        endDate?: string;
    }): Observable<{ categories: CategoryRankingEntry[]; venues: HostRankingEntry[] }> {
        let params = new HttpParams();

        if (options?.startDate) {
            params = params.set('startDate', options.startDate);
        }
        if (options?.endDate) {
            params = params.set('endDate', options.endDate);
        }

        return this.http
            .get<CategoryRankingResponse>(`${this.apiUrl}/category-ranking`, { params })
            .pipe(
                timeout(this.requestTimeoutMs),
                map((response) => response.data),
            );
    }

    /**
     * Fetches a single venue's full profile (Hosts API details plus
     * range-scoped ad stats), for the standalone Venue Profile page.
     *
     * @param venueId - Venue identifier (matches Host.vistarVenueId)
     * @param options - Query options
     * @param options.startDate - Only include rows fetched on/after this calendar date, as "YYYY-MM-DD"
     * @param options.endDate - Only include rows fetched on/before this calendar date, as "YYYY-MM-DD"
     * @returns Observable of the venue's profile
     */
    getVenueProfile(
        venueId: string,
        options?: { startDate?: string; endDate?: string },
    ): Observable<VenueProfile> {
        let params = new HttpParams();

        if (options?.startDate) {
            params = params.set('startDate', options.startDate);
        }
        if (options?.endDate) {
            params = params.set('endDate', options.endDate);
        }

        return this.http
            .get<VenueProfileResponse>(`${this.apiUrl}/venue-profile/${venueId}`, { params })
            .pipe(
                timeout(this.requestTimeoutMs),
                map((response) => response.data),
            );
    }

    /**
     * Fetches per-day, per-device ad counts for a single venue, optionally
     * scoped to a date range - defaults to the last 30 days server-side if
     * no range is given. Powers the Venue Profile page's daily chart's
     * device breakdown.
     *
     * @param venueId - Venue identifier (matches Host.vistarVenueId)
     * @param options - Query options
     * @param options.startDate - Only include rows fetched on/after this calendar date, as "YYYY-MM-DD"
     * @param options.endDate - Only include rows fetched on/before this calendar date, as "YYYY-MM-DD"
     * @returns Observable of one entry per day with activity, ascending by date
     */
    getDailyDeviceAdsSummary(
        venueId: string,
        options?: { startDate?: string; endDate?: string },
    ): Observable<DailyDeviceAdsEntry[]> {
        let params = new HttpParams();

        if (options?.startDate) {
            params = params.set('startDate', options.startDate);
        }
        if (options?.endDate) {
            params = params.set('endDate', options.endDate);
        }

        return this.http
            .get<DailyDeviceAdsSummaryResponse>(
                `${this.apiUrl}/venue-profile/${venueId}/daily-devices`,
                { params },
            )
            .pipe(
                timeout(this.requestTimeoutMs),
                map((response) => response.data),
            );
    }

    /**
     * Fetches per-hour, per-device ad counts for a single venue on a single
     * calendar date - powers the Venue Profile page's daily chart's
     * hour-of-day breakdown, shown instead of the day-by-day view whenever
     * the picked range is exactly one day.
     *
     * @param venueId - Venue identifier (matches Host.vistarVenueId)
     * @param date - The single calendar date to break down by hour, as "YYYY-MM-DD"
     * @returns Observable of 24 entries, one per hour, ascending
     */
    getHourlyDeviceAdsSummary(venueId: string, date: string): Observable<DailyDeviceAdsEntry[]> {
        const params = new HttpParams().set('date', date);

        return this.http
            .get<DailyDeviceAdsSummaryResponse>(
                `${this.apiUrl}/venue-profile/${venueId}/hourly-devices`,
                { params },
            )
            .pipe(
                timeout(this.requestTimeoutMs),
                map((response) => response.data),
            );
    }

    /**
     * Fetches per-day totals (total ads, unique venues) for the Map View bar
     * chart, optionally scoped to a date range - defaults to the last 30
     * days server-side if no range is given.
     *
     * @param options - Query options
     * @param options.startDate - Only include rows fetched on/after this calendar date, as "YYYY-MM-DD"
     * @param options.endDate - Only include rows fetched on/before this calendar date, as "YYYY-MM-DD"
     * @returns Observable of one entry per day with activity, ascending by date
     *
     * @example
     * ```typescript
     * this.mediaFilesService
     *   .getDailyAdsSummary({ startDate: '2026-09-01', endDate: '2026-09-30' })
     *   .subscribe((days) => console.log('Daily summary:', days));
     * ```
     */
    getDailyAdsSummary(options?: {
        startDate?: string;
        endDate?: string;
    }): Observable<DailyAdsSummaryEntry[]> {
        let params = new HttpParams();

        if (options?.startDate) {
            params = params.set('startDate', options.startDate);
        }
        if (options?.endDate) {
            params = params.set('endDate', options.endDate);
        }

        return this.http
            .get<DailyAdsSummaryResponse>(`${this.apiUrl}/daily-ads-summary`, { params })
            .pipe(
                timeout(this.requestTimeoutMs),
                map((response) => response.data),
            );
    }

    /**
     * Fetches per-day totals (total ads, unique venues) restricted to a
     * given set of venues - powers the Map View bar chart once a state is
     * selected, mirroring getAdsByVenues's own venue-scoping.
     *
     * @param venueIds - Venue IDs to restrict to
     * @param options - Query options
     * @param options.startDate - Only include rows fetched on/after this calendar date, as "YYYY-MM-DD"
     * @param options.endDate - Only include rows fetched on/before this calendar date, as "YYYY-MM-DD"
     * @returns Observable of one entry per day with activity, ascending by date
     *
     * @example
     * ```typescript
     * this.mediaFilesService
     *   .getDailyAdsSummaryByVenues(['VV-102938', 'VV-102939'], { startDate: '2026-09-01' })
     *   .subscribe((days) => console.log('Daily summary for these venues:', days));
     * ```
     */
    getDailyAdsSummaryByVenues(
        venueIds: string[],
        options?: { startDate?: string; endDate?: string },
    ): Observable<DailyAdsSummaryEntry[]> {
        return this.http
            .post<DailyAdsSummaryResponse>(`${this.apiUrl}/daily-ads-summary-by-venues`, {
                venueIds,
                startDate: options?.startDate,
                endDate: options?.endDate,
            })
            .pipe(
                timeout(this.requestTimeoutMs),
                map((response) => response.data),
            );
    }

    /**
     * Downloads venues ranked by play-record count (optionally scoped to a
     * date range) as a styled XLSX workbook.
     *
     * @param options - Query options
     * @param options.startDate - Only include rows fetched on/after this calendar date, as "YYYY-MM-DD"
     * @param options.endDate - Only include rows fetched on/before this calendar date, as "YYYY-MM-DD"
     * @returns Observable of the XLSX file blob
     */
    getVenueRankingExportXlsx(options?: {
        startDate?: string;
        endDate?: string;
    }): Observable<Blob> {
        let params = new HttpParams();

        if (options?.startDate) {
            params = params.set('startDate', options.startDate);
        }
        if (options?.endDate) {
            params = params.set('endDate', options.endDate);
        }

        return this.http
            .get(`${this.apiUrl}/venue-ranking/export/xlsx`, { params, responseType: 'blob' })
            .pipe(timeout(this.exportTimeoutMs));
    }

    /**
     * Downloads states ranked by play-record count (optionally scoped to a
     * date range) as a styled XLSX workbook.
     *
     * @param options - Query options
     * @param options.startDate - Only include rows fetched on/after this calendar date, as "YYYY-MM-DD"
     * @param options.endDate - Only include rows fetched on/before this calendar date, as "YYYY-MM-DD"
     * @returns Observable of the XLSX file blob
     */
    getStateRankingExportXlsx(options?: {
        startDate?: string;
        endDate?: string;
    }): Observable<Blob> {
        let params = new HttpParams();

        if (options?.startDate) {
            params = params.set('startDate', options.startDate);
        }
        if (options?.endDate) {
            params = params.set('endDate', options.endDate);
        }

        return this.http
            .get(`${this.apiUrl}/state-ranking/export/xlsx`, { params, responseType: 'blob' })
            .pipe(timeout(this.exportTimeoutMs));
    }

    /**
     * Downloads venue categories ranked by play-record count (optionally scoped to a
     * date range) as a styled XLSX workbook.
     *
     * @param options - Query options
     * @param options.startDate - Only include rows fetched on/after this calendar date, as "YYYY-MM-DD"
     * @param options.endDate - Only include rows fetched on/before this calendar date, as "YYYY-MM-DD"
     * @returns Observable of the XLSX file blob
     */
    getCategoryRankingExportXlsx(options?: {
        startDate?: string;
        endDate?: string;
    }): Observable<Blob> {
        let params = new HttpParams();

        if (options?.startDate) {
            params = params.set('startDate', options.startDate);
        }
        if (options?.endDate) {
            params = params.set('endDate', options.endDate);
        }

        return this.http
            .get(`${this.apiUrl}/category-ranking/export/xlsx`, { params, responseType: 'blob' })
            .pipe(timeout(this.exportTimeoutMs));
    }

    /**
     * Downloads a single state's venues (from the State Ranking table's own
     * per-venue breakdown) within a date range, as a styled XLSX workbook -
     * powers the venue breakdown modal's export.
     *
     * @param state - Two-letter state code, or "Unknown"
     * @param options - Query options
     * @param options.startDate - Only include rows fetched on/after this calendar date, as "YYYY-MM-DD"
     * @param options.endDate - Only include rows fetched on/before this calendar date, as "YYYY-MM-DD"
     * @returns Observable of the XLSX file blob
     */
    getStateVenuesExportXlsx(
        state: string,
        options?: { startDate?: string; endDate?: string },
    ): Observable<Blob> {
        let params = new HttpParams();

        if (options?.startDate) {
            params = params.set('startDate', options.startDate);
        }
        if (options?.endDate) {
            params = params.set('endDate', options.endDate);
        }

        return this.http
            .get(`${this.apiUrl}/state-ranking/${encodeURIComponent(state)}/venues/export/xlsx`, {
                params,
                responseType: 'blob',
            })
            .pipe(timeout(this.exportTimeoutMs));
    }

    /**
     * Fetches a single media file by ID with aggregated play metrics.
     *
     * @param id - UUID of the media file
     * @returns Observable of media file detail content
     *
     * @example
     * ```typescript
     * this.mediaFilesService.getById('uuid-here').subscribe(file => {
     *   console.log('Fetched media file:', file);
     * });
     * ```
     */
    getById(id: string): Observable<MediaFileDetailContent> {
        return this.http.get<MediaFileResponse>(`${this.apiUrl}/${id}`).pipe(
            timeout(this.requestTimeoutMs),
            map((response) => response.data),
        );
    }

    /**
     * Fetches a page of play records for a media file's creative, optionally scoped to a
     * date range.
     *
     * @param id - UUID of the media file
     * @param options - Query options
     * @param options.limit - Maximum number of results (default: 100)
     * @param options.offset - Number of results to skip (default: 0)
     * @param options.startDate - First day, "YYYY-MM-DD" - omit for all time
     * @param options.endDate - Last day, "YYYY-MM-DD" - omit for all time
     * @returns Observable of the page of play records and the range's total play count
     *
     * @example
     * ```typescript
     * this.mediaFilesService.getPlayRecords('uuid-here').subscribe(({ records, total }) => {
     *   console.log('Play records:', records, 'of', total);
     * });
     * ```
     */
    getPlayRecords(
        id: string,
        options?: { limit?: number; offset?: number; startDate?: string; endDate?: string },
    ): Observable<{ records: PlayRecordContent[]; total: number }> {
        let params = new HttpParams();

        if (options?.limit) {
            params = params.set('limit', options.limit.toString());
        }
        if (options?.offset) {
            params = params.set('offset', options.offset.toString());
        }
        if (options?.startDate) {
            params = params.set('startDate', options.startDate);
        }
        if (options?.endDate) {
            params = params.set('endDate', options.endDate);
        }

        return this.http
            .get<PlayRecordsResponse>(`${this.apiUrl}/${id}/play-records`, { params })
            .pipe(
                timeout(this.requestTimeoutMs),
                map((response) => ({
                    records: response.data,
                    total: response.meta.total ?? response.data.length,
                })),
            );
    }

    /**
     * Fetches every play record of a media file's creative in a date range - the CSV
     * export's source.
     *
     * @param id - UUID of the media file
     * @param options - First and last day, "YYYY-MM-DD" (both required by the server, at most 31 days apart)
     * @returns Observable of every play record in the range
     */
    getPlayRecordsExport(
        id: string,
        options: { startDate: string; endDate: string },
    ): Observable<PlayRecordContent[]> {
        const params = new HttpParams()
            .set('startDate', options.startDate)
            .set('endDate', options.endDate);

        return this.http
            .get<PlayRecordsResponse>(`${this.apiUrl}/${id}/play-records/export`, { params })
            .pipe(
                timeout(this.exportTimeoutMs),
                map((response) => response.data),
            );
    }

    /**
     * Downloads every play record of a media file's creative in a date range as a styled
     * XLSX workbook.
     *
     * @param id - UUID of the media file
     * @param options - First and last day, "YYYY-MM-DD" (both required by the server, at most 31 days apart)
     * @returns Observable of the XLSX file blob
     */
    getPlayRecordsExportXlsx(
        id: string,
        options: { startDate: string; endDate: string },
    ): Observable<Blob> {
        const params = new HttpParams()
            .set('startDate', options.startDate)
            .set('endDate', options.endDate);

        return this.http
            .get(`${this.apiUrl}/${id}/play-records/export/xlsx`, {
                params,
                responseType: 'blob',
            })
            .pipe(timeout(this.exportTimeoutMs));
    }

    /**
     * Fetches a page of programmatic_ads rows, optionally filtered by proof-of-play
     * duration bucket and sorted by duration. Filtering/sorting happens in the
     * database, across the full table - not just whatever page is loaded client-side.
     *
     * @param options - Query options
     * @param options.limit - Maximum number of results (default: 100)
     * @param options.offset - Number of results to skip (default: 0)
     * @param options.bucket - Filter to a proof-of-play duration bucket
     * @param options.sortBy - Column to sort by (default: 'fetched_at')
     * @param options.sortDir - Sort direction (default: 'desc')
     * @param options.columnFilters - Per-column substring filters, ANDed with the search
     * @param options.startDate - Only include rows fetched on/after this calendar date, as "YYYY-MM-DD"
     * @param options.endDate - Only include rows fetched on/before this calendar date, as "YYYY-MM-DD"
     * @returns Observable of the page of play records and the total matching row count
     *
     * @example
     * ```typescript
     * this.mediaFilesService
     *   .getProgrammaticAdsList({ limit: 20, bucket: 'red', sortBy: 'pop_duration', sortDir: 'desc' })
     *   .subscribe(({ data, count }) => {
     *     console.log('Programmatic ads:', data, 'total:', count);
     *   });
     * ```
     */
    getProgrammaticAdsList(
        options?: ProgrammaticAdsFilterOptions & { limit?: number; offset?: number },
    ): Observable<{ data: PlayRecordContent[]; count: number }> {
        let params = this.buildProgrammaticAdsFilterParams(options);

        if (options?.limit) {
            params = params.set('limit', options.limit.toString());
        }
        if (options?.offset) {
            params = params.set('offset', options.offset.toString());
        }

        return this.http
            .get<PlayRecordsResponse>(`${this.apiUrl}/programmatic-ads`, { params })
            .pipe(
                timeout(this.requestTimeoutMs),
                map((response) => ({ data: response.data, count: response.meta.count })),
            );
    }

    /**
     * Builds the HttpParams shared by the Programmatic Ads list, export, and
     * export/xlsx endpoints, so an export can be scoped to the same filters
     * currently shown in the table.
     *
     * @param options - Filter options
     * @returns HttpParams with only the provided filters set
     */
    private buildProgrammaticAdsFilterParams(options?: ProgrammaticAdsFilterOptions): HttpParams {
        let params = new HttpParams();

        if (options?.bucket) {
            params = params.set('bucket', options.bucket);
        }
        if (options?.sortBy) {
            params = params.set('sortBy', options.sortBy);
        }
        if (options?.sortDir) {
            params = params.set('sortDir', options.sortDir);
        }
        if (options?.search) {
            params = params.set('search', options.search);
        }
        if (options?.columnFilters && Object.keys(options.columnFilters).length > 0) {
            params = params.set('columnFilters', JSON.stringify(options.columnFilters));
        }
        if (options?.startDate) {
            params = params.set('startDate', options.startDate);
        }
        if (options?.endDate) {
            params = params.set('endDate', options.endDate);
        }
        if (options?.venueIds && options.venueIds.length > 0) {
            params = params.set('venueIds', JSON.stringify(options.venueIds));
        }

        return params;
    }

    /**
     * Gets total/green/yellow/red proof-of-play duration counts for the raw
     * Programmatic Ads table, optionally scoped to a date range.
     *
     * @param options - Query options
     * @param options.startDate - Only include rows fetched on/after this calendar date, as "YYYY-MM-DD"
     * @param options.endDate - Only include rows fetched on/before this calendar date, as "YYYY-MM-DD"
     * @returns Observable of the total/bucket counts
     *
     * @example
     * ```typescript
     * this.mediaFilesService
     *   .getProgrammaticAdsStats({ startDate: '2026-09-01', endDate: '2026-09-01' })
     *   .subscribe(stats => console.log('Stats:', stats));
     * ```
     */
    getProgrammaticAdsStats(options?: {
        startDate?: string;
        endDate?: string;
        venueIds?: string[];
    }): Observable<ProgrammaticAdsStats> {
        let params = new HttpParams();

        if (options?.startDate) {
            params = params.set('startDate', options.startDate);
        }
        if (options?.endDate) {
            params = params.set('endDate', options.endDate);
        }
        if (options?.venueIds && options.venueIds.length > 0) {
            params = params.set('venueIds', JSON.stringify(options.venueIds));
        }

        return this.http
            .get<ProgrammaticAdsStatsResponse>(`${this.apiUrl}/programmatic-ads/stats`, { params })
            .pipe(
                timeout(this.requestTimeoutMs),
                map((response) => response.data),
            );
    }

    /**
     * Fetches every programmatic_ads row matching the given filters (not
     * just one page), with resolved creative media fields, for export.
     *
     * @param options - Filter options - same filters as getProgrammaticAdsList, so an export matches whatever's currently shown in the table
     * @returns Observable of every matching, exportable programmatic ad row
     */
    getProgrammaticAdsExport(
        options?: ProgrammaticAdsFilterOptions,
    ): Observable<PlayRecordContent[]> {
        const params = this.buildProgrammaticAdsFilterParams(options);

        return this.http
            .get<PlayRecordsResponse>(`${this.apiUrl}/programmatic-ads/export`, { params })
            .pipe(
                timeout(this.exportTimeoutMs),
                map((response) => response.data),
            );
    }

    /**
     * Downloads every enriched programmatic_ads row matching the given
     * filters as a styled XLSX workbook.
     *
     * @param options - Filter options - same filters as getProgrammaticAdsList, so an export matches whatever's currently shown in the table
     * @returns Observable of the XLSX file blob
     */
    getProgrammaticAdsExportXlsx(options?: ProgrammaticAdsFilterOptions): Observable<Blob> {
        const params = this.buildProgrammaticAdsFilterParams(options);

        return this.http
            .get(`${this.apiUrl}/programmatic-ads/export/xlsx`, {
                params,
                responseType: 'blob',
            })
            .pipe(timeout(this.exportTimeoutMs));
    }

    /**
     * Fetches one ad's plays at one venue grouped by playlist slot (slot playlist content
     * ID + position), ascending by position - Ad Analytics' "Plays at <venue>" grid.
     *
     * @param id - UUID of the media file
     * @param venueId - The venue
     * @param options - Optional range: first and last day, "YYYY-MM-DD" - omit for all time
     * @returns Observable of the venue's slots for this ad
     *
     * @example
     * ```typescript
     * this.mediaFilesService.getVenueSlots('uuid-here', 'nc-1234').subscribe(slots => ...);
     * ```
     */
    getVenueSlots(
        id: string,
        venueId: string,
        options?: { startDate?: string; endDate?: string },
    ): Observable<AdVenueSlot[]> {
        let params = new HttpParams().set('venueId', venueId);

        if (options?.startDate) {
            params = params.set('startDate', options.startDate);
        }
        if (options?.endDate) {
            params = params.set('endDate', options.endDate);
        }

        return this.http
            .get<{ data: AdVenueSlot[] }>(`${this.apiUrl}/${id}/venue-slots`, { params })
            .pipe(
                timeout(this.requestTimeoutMs),
                map((response) => response.data),
            );
    }

    /**
     * Fetches location data (venues) where a media file's creative has been played.
     * Combines venue statistics with host information from the Hosts API.
     *
     * @param id - UUID of the media file
     * @returns Observable of location data array
     *
     * @example
     * ```typescript
     * this.mediaFilesService.getLocations('uuid-here').subscribe(locations => {
     *   console.log('Locations:', locations);
     * });
     * ```
     */
    getLocations(
        id: string,
        options?: { startDate?: string; endDate?: string },
    ): Observable<LocationData[]> {
        let params = new HttpParams();

        if (options?.startDate) {
            params = params.set('startDate', options.startDate);
        }
        if (options?.endDate) {
            params = params.set('endDate', options.endDate);
        }

        return this.http.get<LocationsResponse>(`${this.apiUrl}/${id}/locations`, { params }).pipe(
            timeout(this.requestTimeoutMs),
            map((response) => response.data),
        );
    }
}
