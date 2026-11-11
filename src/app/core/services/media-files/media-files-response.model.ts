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

/**
 * API response wrapper for media files list.
 */
export interface MediaFilesResponse {
    /** Media file content array */
    data: MediaFileContent[];

    /** Pagination metadata */
    meta: {
        /** Maximum number of results requested */
        limit: number;

        /** Number of results skipped */
        offset: number;

        /** Number of results returned in this response */
        count: number;
    };
}

/**
 * API response wrapper for dashboard analytics.
 */
export interface DashboardAnalyticsResponse {
    /** Aggregated dashboard data. */
    data: DashboardAnalytics;
}

/**
 * API response wrapper for a single media file.
 */
export interface MediaFileResponse {
    /** Media file detail content, including aggregated play metrics */
    data: MediaFileDetailContent;
}

/**
 * API response wrapper for play records.
 */
export interface PlayRecordsResponse {
    /** Play record content array */
    data: PlayRecordContent[];

    /** Pagination metadata */
    meta: {
        /** Maximum number of results requested */
        limit: number;

        /** Number of results skipped */
        offset: number;

        /** Number of results returned in this response */
        count: number;

        /** Plays matching the request's range in all, beyond this page (single-ad play records only) */
        total?: number;
    };
}

/**
 * API response wrapper for ad ranking data.
 */
export interface AdRankingResponse {
    /** Ads ranked by play-record count, descending */
    data: DashboardTopAd[];

    /** Response metadata */
    meta: {
        /** Number of ads returned */
        count: number;
    };
}

/**
 * API response wrapper for venue ranking data.
 */
export interface VenueRankingResponse {
    /** Venues ranked by play-record count, descending */
    data: HostRankingEntry[];

    /** Response metadata */
    meta: {
        /** Number of venues returned */
        count: number;
    };
}

/**
 * API response wrapper for state ranking data.
 */
export interface StateRankingResponse {
    data: {
        /** States ranked by play-record count, descending */
        states: StateRankingEntry[];

        /** Per-venue breakdown each state was rolled up from - powers the "Total Ads" drill-down modal */
        venues: HostRankingEntry[];
    };

    /** Response metadata */
    meta: {
        /** Number of states returned */
        count: number;
    };
}

/**
 * API response wrapper for category ranking data.
 */
export interface CategoryRankingResponse {
    data: {
        /** Categories ranked by play-record count, descending */
        categories: CategoryRankingEntry[];

        /** Per-venue breakdown each category was rolled up from - powers the drill-down modals */
        venues: HostRankingEntry[];
    };

    /** Response metadata */
    meta: {
        /** Number of categories returned */
        count: number;
    };
}

/**
 * API response wrapper for a single venue's profile.
 */
export interface VenueProfileResponse {
    data: VenueProfile;
}

/**
 * API response wrapper for the Venue Profile page's daily chart's device breakdown.
 */
export interface DailyDeviceAdsSummaryResponse {
    /** One entry per day with activity, ascending by date */
    data: DailyDeviceAdsEntry[];
}

/**
 * API response wrapper for the Map View daily bar chart.
 */
export interface DailyAdsSummaryResponse {
    /** One entry per day with activity, ascending by date */
    data: DailyAdsSummaryEntry[];

    /** Response metadata */
    meta: {
        /** Number of days returned */
        count: number;
    };
}

/**
 * API response wrapper for programmatic ads stats.
 */
export interface ProgrammaticAdsStatsResponse {
    /** Total/bucket counts */
    data: ProgrammaticAdsStats;
}

/**
 * API response wrapper for locations data.
 */
export interface LocationsResponse {
    /** Location data array */
    data: LocationData[];

    /** Response metadata */
    meta: {
        /** Number of locations returned */
        count: number;
    };
}
