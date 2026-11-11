/**
 * A count grouped by a source or time bucket.
 */
export interface DashboardCountPoint {
    /** Group label or ISO date. */
    label: string;

    /** Number of records in the group. */
    value: number;
}

/**
 * Top-performing ad data for dashboard tables and charts.
 */
export interface DashboardTopAd {
    /** Media-file UUID used by the ad detail route. */
    contentId: string;

    /** Vendor creative identifier. */
    creativeId: string;

    /** Display title. */
    title: string;

    /** Media asset URL used as the thumbnail. */
    thumbnail: string;

    /** Media asset URL (converted/hosted copy - programmatic_media_files.s3_url). */
    creativeUrl: string;

    /** Vendor-hosted source URL - programmatic_media_files.original_url. */
    originalUrl: string;

    /** Creative type. */
    creativeType: 'video' | 'image';

    /** Raw creative_source value. */
    source: string;

    /** Number of venues with at least one record. */
    venueCount: number;

    /** Display value for the dashboard table. */
    location: string;

    /** Number of play records for the creative identity. */
    plays: number;

    /** Duration in seconds. */
    duration: number;

    /** Media-file creation timestamp. */
    fetchedDate: string;

    /** Four weekly play totals, oldest to newest. */
    weeklyPlays: number[];
}

/**
 * Aggregated data used by the dashboard and analytics page.
 */
export interface DashboardAnalytics {
    /** Number of media files. */
    totalContents: number;

    /** Number of media files created during the last seven days. */
    newContentsThisWeek: number;

    /** Number of play records. */
    totalPlayRecords: number;

    /** Number of records marked as served. */
    servedPlayRecords: number;

    /** Number of records with a played timestamp. */
    playedRecords: number;

    /** Number of records with proof-of-play screenshots. */
    screenshotRecords: number;

    /** Number of records with proof-of-play sent timestamps. */
    proofSentRecords: number;

    /** Number of records saved to OpenSearch. */
    openSearchSavedRecords: number;

    /** Number of records with both a played timestamp and a proof-of-play-sent timestamp. */
    successfulPopCount: number;

    /** Number of records fetched more than 5 minutes ago that still have no proof-of-play-sent timestamp. */
    pendingOverdueCount: number;

    /** Number of records fetched within the last 5 minutes that have no proof-of-play-sent timestamp yet. */
    pendingRecentCount: number;

    /** Number of records with a proof-of-play duration of 1-5 minutes (rounded). */
    greenCount: number;

    /** Number of records with a proof-of-play duration of 6-10 minutes (rounded). */
    yellowCount: number;

    /** Number of records with a proof-of-play duration over 10 minutes (rounded). */
    redCount: number;

    /** Number of unique venues. */
    uniqueVenues: number;

    /** Number of unique devices. */
    uniqueDevices: number;

    /** Media-file counts grouped by source. */
    mediaBySource: DashboardCountPoint[];

    /** Play-record counts grouped by source. */
    playsBySource: DashboardCountPoint[];

    /** Media-file counts grouped by creation date. */
    mediaCreatedByDay: DashboardCountPoint[];

    /** Served play-record counts grouped by dateServed. */
    servedByDay: DashboardCountPoint[];

    /** Played record counts grouped by played timestamp. */
    playedByDay: DashboardCountPoint[];

    /** Proof-of-play sent counts grouped by timestamp. */
    proofSentByDay: DashboardCountPoint[];

    /** Top venues by play-record count. */
    topVenues: DashboardCountPoint[];

    /** Top five ads by play-record count. */
    topAds: DashboardTopAd[];
}
