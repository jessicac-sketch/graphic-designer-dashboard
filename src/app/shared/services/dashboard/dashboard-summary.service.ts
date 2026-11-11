/** Angular Imports */
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

/** Third Party Imports */
import { Observable, map, timeout } from 'rxjs';

/** Local Imports */
import type {
    DashboardAds,
    DashboardGeography,
    DashboardOverview,
    DashboardRange,
} from '@shared/interfaces/dashboard';

/**
 * Loads the Dashboard's data from the BFF as three independent calls (overview,
 * geography, ads) so each card can render as soon as its own call returns, instead of
 * waiting for the slowest one.
 */
@Injectable({
    providedIn: 'root',
})
export class DashboardSummaryService {
    /**
     * HTTP client for BFF calls
     * @type {HttpClient}
     */
    private readonly http = inject(HttpClient);

    /**
     * Request timeout: each call scans the range's rows, but none should take a minute -
     * a stuck one shows its error and Retry instead of loading for minutes
     * @type {number}
     */
    private readonly requestTimeoutMs = 60000;

    /**
     * Fetches the headline totals, proof-of-play buckets and received timeline for a
     * range (the fast call: needs only the range's rows).
     *
     * @param range - UTC calendar dates, at most DASHBOARD_MAX_RANGE_DAYS apart, or null for all time
     * @returns {Observable<DashboardOverview>} The overview
     *
     * @example
     * this.dashboardSummaryService
     *     .getOverview({ start: '2026-10-10', end: '2026-10-10' })
     *     .subscribe((overview) => console.log(overview.received));
     */
    public getOverview(range: DashboardRange | null): Observable<DashboardOverview> {
        return this.fetchSection<DashboardOverview>('overview', range);
    }

    /**
     * Fetches the venues, states and categories that received playables in a range
     * (needs the Hosts API, so it can be the slow call).
     *
     * @param range - UTC calendar dates, at most DASHBOARD_MAX_RANGE_DAYS apart, or null for all time
     * @returns {Observable<DashboardGeography>} The geography
     */
    public getGeography(range: DashboardRange | null): Observable<DashboardGeography> {
        return this.fetchSection<DashboardGeography>('geography', range);
    }

    /**
     * Fetches every distinct creative received in a range, with the venues that
     * received it (needs the media files, not the Hosts API).
     *
     * @param range - UTC calendar dates, at most DASHBOARD_MAX_RANGE_DAYS apart
     * @returns {Observable<DashboardAds>} The ads
     */
    public getAds(range: DashboardRange): Observable<DashboardAds> {
        return this.fetchSection<DashboardAds>('ads', range);
    }

    /**
     * Fetches every distinct creative received in a range, with the venues that
     * received it, restricted to a given set of venues - powers Map View's Ads
     * breakdown card, scoped to a clicked state's venues. POST (not GET) since the
     * venue ID list can be long, and unlike getAds() both dates are optional (all
     * time if omitted) since Map View allows that.
     *
     * @param venueIds - Venue IDs to restrict to - empty for every venue (Map View's
     *   nationwide default, before any state is clicked)
     * @param options - Query options
     * @param options.startDate - "YYYY-MM-DD", or undefined for all-time
     * @param options.endDate - "YYYY-MM-DD", or undefined for all-time
     * @returns {Observable<DashboardAds>} The ads
     */
    public getAdsByVenues(
        venueIds: string[],
        options?: { startDate?: string; endDate?: string },
    ): Observable<DashboardAds> {
        return this.http
            .post<{ data: DashboardAds }>('/api/media-files/dashboard/ads/by-venues', {
                venueIds,
                startDate: options?.startDate,
                endDate: options?.endDate,
            })
            .pipe(timeout(this.requestTimeoutMs), map((response) => response.data));
    }

    /**
     * GETs one Dashboard section for a range and unwraps the `{ data }` envelope.
     *
     * @param section - `overview`, `geography` or `ads`
     * @param range - UTC calendar dates, or null for all time
     * @returns {Observable<T>} The section's data
     */
    private fetchSection<T>(
        section: 'overview' | 'geography' | 'ads',
        range: DashboardRange | null,
    ): Observable<T> {
        // No range = all time (overview and geography only - the top bar's totals)
        const params = range
            ? new HttpParams().set('startDate', range.start).set('endDate', range.end)
            : new HttpParams();

        return this.http.get<{ data: T }>(`/api/media-files/dashboard/${section}`, { params }).pipe(
            timeout(this.requestTimeoutMs),
            map((response) => response.data),
        );
    }
}
