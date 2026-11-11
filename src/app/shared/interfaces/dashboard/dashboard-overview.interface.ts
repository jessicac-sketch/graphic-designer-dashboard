/** Local Imports */
import type { DailyAdsSummaryEntry, ProgrammaticAdsStats } from '@core/models';
import type { DashboardTimelineGranularity } from '@shared/models/dashboard';

/**
 * The Dashboard's headline totals, proof-of-play buckets and received timeline for one
 * date range, from GET /api/media-files/dashboard/overview. The fast call: it needs only
 * the range's rows.
 */
export interface DashboardOverview {
    /** First calendar date of the range, "YYYY-MM-DD" (UTC) */
    startDate: string;

    /** Last calendar date of the range, "YYYY-MM-DD" (UTC) */
    endDate: string;

    /** Timeline buckets: `hour` for a single-day range, `day` otherwise */
    granularity: DashboardTimelineGranularity;

    /** Playables received */
    received: number;

    /** Distinct creatives (creative ID + source) received */
    uniqueAds: number;

    /** Distinct venues that received at least one playable */
    uniqueVenues: number;

    /** Distinct devices that received at least one playable - a venue can have several */
    uniqueDevices: number;

    /** Playables with no venue - counted in `received`, in no venue */
    withoutVenue: number;

    /** Proof-of-play duration buckets (green 1-5 min, yellow 6-10, red over 10), same query as Ranking Data's mini stats */
    pop: ProgrammaticAdsStats;

    /** Received playables per bucket, zero-filled: 24 "HH:00" (UTC) entries for one day, or one "YYYY-MM-DD" per day */
    timeline: DailyAdsSummaryEntry[];
}
