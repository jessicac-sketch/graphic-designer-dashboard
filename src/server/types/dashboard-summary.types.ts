/** Local Imports */
import type {
    CategoryRankingEntry,
    DailyAdsSummaryEntry,
    StateRankingEntry,
} from './hosts.types.js';
import type { ProgrammaticAdsStatsContent } from './programmatic-ads-stats.types.js';

/**
 * The Dashboard is served as three independent calls (overview, geography, ads) so each
 * card renders as soon as its own data is ready. Every response carries `received` (all
 * playables in the range), so each section can compute its shares without waiting for
 * another call.
 */

/**
 * One venue's slice of a single ad's received playables.
 */
export interface DashboardAdVenueShare {
    /** Venue identifier (matches DashboardVenue.venueId) */
    venueId: string;

    /** Playables of this ad received at this venue */
    received: number;
}

/**
 * One distinct creative (creative_id + creative_source) received in the range. Unlike
 * DashboardTopAd, creatives with no matching programmatic_media_files row are still
 * included (with null media fields), so the shares add up to the total received. Where
 * it was received by state is derived client-side from `venues` + the geography call.
 */
export interface DashboardAdShare {
    /** Vendor creative identifier */
    creativeId: string;

    /** Raw creative_source value (e.g. "Vistar") */
    source: string;

    /** Media-file UUID for the ad detail route, or null if the creative has no media file */
    contentId: string | null;

    /** Display title (the media file's title, falling back to the creative ID) */
    title: string;

    /** Media asset URL for the thumbnail, or null if the creative has no media file */
    mediaUrl: string | null;

    /** Creative type, or null if the creative has no media file */
    creativeType: 'video' | 'image' | null;

    /** Number of playables received for this creative */
    received: number;

    /** Number of distinct venues that received it */
    venueCount: number;

    /** Playables of this creative with no venue_id (counted in `received`, in no venue) */
    withoutVenue: number;

    /** Where it was received, by venue, by received count, descending (rows with no venue are left out) */
    venues: DashboardAdVenueShare[];
}

/**
 * A venue that received playables in the range, with just the fields the Dashboard
 * reads (a slimmed HostRankingEntry - no schedules, screenshot or expected requests).
 */
export interface DashboardVenue {
    /** Venue identifier (matches Host.vistarVenueId) */
    venueId: string;

    /** Host/venue name, or null if the venue wasn't found in the hosts service */
    hostName: string | null;

    /** City, or null if the venue wasn't found in the hosts service */
    city: string | null;

    /** State, or null if the venue wasn't found in the hosts service */
    state: string | null;

    /** Venue category, or null if the venue wasn't found in the hosts service */
    category: string | null;

    /** Playables received at this venue in the range */
    totalAds: number;

    /** Media player slots configured at this venue, or null if the venue wasn't found in the hosts service */
    slotCount: number | null;
}

/**
 * Dashboard overview: headline totals, proof-of-play buckets and the received timeline.
 * Needs only the range's rows (no hosts service, no media files), so it is the fast call.
 */
export interface DashboardOverview {
    /** First calendar date of the range, "YYYY-MM-DD" (UTC) */
    startDate: string;

    /** Last calendar date of the range, "YYYY-MM-DD" (UTC) */
    endDate: string;

    /** Timeline buckets: `hour` for a single-day range, `day` otherwise */
    granularity: 'hour' | 'day';

    /** Number of programmatic_ads rows (playables) received */
    received: number;

    /** Number of distinct creatives (creative_id + creative_source) received */
    uniqueAds: number;

    /** Number of distinct venues that received at least one playable */
    uniqueVenues: number;

    /** Number of distinct devices (device_id) that received at least one playable - a venue can have several */
    uniqueDevices: number;

    /** Playables with no venue_id - counted in `received` but in no venue or state */
    withoutVenue: number;

    /**
     * Proof-of-play duration buckets for the range (green 1-5 min, yellow 6-10, red over
     * 10) - the same query as Ranking Data's mini stats, so the two always match. Rows
     * in no bucket have no proof-of-play duration yet.
     */
    pop: ProgrammaticAdsStatsContent;

    /**
     * Received playables per bucket, zero-filled: 24 "HH:00" (UTC) entries for a
     * single day, or one "YYYY-MM-DD" entry per day of the range
     */
    timeline: DailyAdsSummaryEntry[];
}

/**
 * Dashboard geography: the venues, states and categories that received playables. Needs
 * the hosts service (state / category / name live there), so it can be the slow call.
 */
export interface DashboardGeography {
    /** Number of programmatic_ads rows (playables) received - the denominator for shares */
    received: number;

    /** Playables with no venue_id - counted in `received` but in no venue, state or category */
    withoutVenue: number;

    /** Number of distinct US states that received at least one playable (excludes "Unknown") */
    uniqueStates: number;

    /** Number of distinct venue categories that received at least one playable (excludes "Unknown") */
    uniqueCategories: number;

    /** States, by received count, descending ("Unknown" groups venues with no hosts service state) */
    states: StateRankingEntry[];

    /** Venue categories, by received count, descending ("Unknown" groups venues with no hosts service category) */
    categories: CategoryRankingEntry[];

    /** Venues, by received count, descending */
    venues: DashboardVenue[];
}

/**
 * Dashboard ads: every distinct creative received, with the venues that received it.
 * Needs the range's rows and the media files (titles, thumbnails), not the hosts service.
 */
export interface DashboardAds {
    /** Number of programmatic_ads rows (playables) received - the denominator for shares */
    received: number;

    /** Distinct creatives, by received count, descending */
    ads: DashboardAdShare[];
}
