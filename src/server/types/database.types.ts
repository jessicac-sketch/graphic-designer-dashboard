/**
 * Data store row types - the shape of each table the BFF reads.
 * The dummy dataset (src/server/mock-data) is built in these shapes.
 */

/**
 * Database row type for programmatic_ads table.
 *
 *
 * @remarks
 * This table is a play/serving event log. Creative asset details (URL, name,
 * type, duration) live on programmatic_media_files and are linked here via
 * the (creative_id, creative_source) foreign key.
 *
 * @interface ProgrammaticAd
 */
export interface ProgrammaticAd {
    /** UUID primary key */
    id: string;

    /** Creative identifier (FK to programmatic_media_files) */
    creative_id: string;

    /** Creative group identifier */
    creative_group_id: string;

    /** Source of the creative (FK to programmatic_media_files) */
    creative_source: string;

    /** Foreign key to programmatic configuration */
    programmatic_id: string;

    /** API URL for the programmatic service */
    api_url: string;

    /** Vendor identification key */
    vendor_key: string;

    /** Venue identifier where ad was played */
    venue_id: string | null;

    /** Device identifier where ad was played */
    device_id: string | null;

    /** Timestamp when ad was fetched */
    fetched_at: string;

    /** Whether the ad has been served */
    served: boolean;

    /** Timestamp when the ad was served */
    date_served: string | null;

    /** Proof of play data */
    proof_of_play_data: string | null;

    /** Timestamp when ad was played */
    played: string | null;

    /** Timestamp when proof of play was sent */
    proof_of_play_sent: string | null;

    /** Proof-of-play screenshot URL */
    pop_screenshot: string | null;

    /** Additional vendor-specific metadata */
    metadata: Record<string, unknown> | null;

    /** Whether this row has been saved to OpenSearch */
    opensearch_saved: boolean | null;

    /** Playlist-ui-side identifier for which slot this ad played from, as reported by the player on proof-of-play. Null if the player didn't send it. */
    slot_playlist_content_id: string | null;

    /** Sequence/order number of the slot within the playlist, as reported by the player on proof-of-play. Null if the player didn't send it. */
    slot_playlist_content_position: string | null;
}

/**
 * The subset of ProgrammaticAd fields actually read by dashboard analytics,
 * Ad Ranking, and Venue Ranking (see MediaFilesService.getDashboardAnalytics/
 * buildTopAds/buildHostRanking) - used to select only these columns from
 * `programmatic_ads` instead of `select('*')`, since this table is often
 * fetched in full (unbounded date range) and the omitted columns
 * (metadata, proof_of_play_data, id, etc.) are the largest/least-used ones.
 */
export type ProgrammaticAdSummary = Pick<
    ProgrammaticAd,
    | 'creative_id'
    | 'creative_source'
    | 'venue_id'
    | 'device_id'
    | 'fetched_at'
    | 'served'
    | 'date_served'
    | 'played'
    | 'proof_of_play_sent'
    | 'pop_screenshot'
    | 'opensearch_saved'
>;

/**
 * Insert type for programmatic_ads (excludes auto-generated fields).
 */
export type ProgrammaticAdInsert = Omit<ProgrammaticAd, 'id' | 'fetched_at'> &
    Partial<Pick<ProgrammaticAd, 'id' | 'fetched_at'>>;

/**
 * Update type for programmatic_ads (all fields optional).
 */
export type ProgrammaticAdUpdate = Partial<Omit<ProgrammaticAd, 'id'>>;

/**
 * Aggregated play metrics for a creative, computed from programmatic_ads.
 */
export interface AdMetrics {
    /** Total number of play events for this creative */
    play_count: number;

    /** Most recent played timestamp, or null if never played */
    last_played: string | null;
}

/**
 * Per-venue play stats for a creative, returned by get_venue_ids_by_creative.
 */
export interface VenueStat {
    /** Venue identifier */
    venue_id: string;

    /** Number of plays recorded at this venue */
    play_count: number;

    /** Most recent played timestamp at this venue */
    latest_play: string | null;
}

/**
 * ProgrammaticAd row combined with a computed proof-of-play duration and the
 * total matching row count, as returned by the get_programmatic_ads_page RPC.
 */
export interface ProgrammaticAdPage extends ProgrammaticAd {
    /** Computed: minutes between fetched_at and proof_of_play_sent, or null if not computable */
    pop_duration_minutes: number | null;

    /** Total number of rows matching the query (before limit/offset) */
    total_count: number;
}

/**
 * Total/bucket counts for programmatic_ads rows, as returned by the
 * get_programmatic_ads_stats RPC.
 */
export interface ProgrammaticAdsStats {
    /** Total number of matching rows */
    total_count: number;

    /** Rows with a POP duration of 1-5 minutes */
    green_count: number;

    /** Rows with a POP duration of 6-10 minutes */
    yellow_count: number;

    /** Rows with a POP duration over 10 minutes */
    red_count: number;
}

/**
 * Database row type for programmatic_media_files table.
 *
 *
 * @interface MediaFile
 */
export interface MediaFile {
    /** UUID primary key */
    id: string;

    /** Creative identifier from the vendor */
    creative_id: string;

    /** Source vendor of the creative (Vistar, Place Exchange, etc.) */
    creative_source: string;

    /** Original vendor-hosted URL of the creative asset */
    original_url: string;

    /** Type of creative */
    creative_type: 'video' | 'image';

    /** Creative name/title */
    creative_name: string | null;

    /** Duration in seconds (for video creatives) */
    duration: number | null;

    /** Internal handle for the uploaded/converted media */
    handle: string | null;

    /** S3-hosted URL of the converted media asset */
    s3_url: string | null;

    /** Whether the media has finished conversion */
    converted: boolean;

    /** External conversion job identifier */
    conversion_id: string | null;

    /** Media width in pixels */
    width: number | null;

    /** Media height in pixels */
    height: number | null;

    /** MIME type of the media asset */
    mime_type: string | null;

    /** Processing status of the media file */
    status: 'pending' | 'uploading' | 'processing' | 'ready' | 'failed';

    /** Timestamp when the row was created */
    created_at: string;

    /** Timestamp when the row was last updated */
    updated_at: string;

    /** Timestamp when the media file was last processed */
    last_processed_at: string | null;
}

/**
 * MediaFile row with its all-time play count, as returned by the
 * get_media_files_by_plays RPC function (Ads Gallery's "Plays" sort).
 */
export interface MediaFileWithPlayCount extends MediaFile {
    /** All-time number of programmatic_ads rows for this creative (id + source) */
    play_count: number;
}

/**
 * MediaFile row combined with aggregated play metrics from programmatic_ads,
 * as returned by the get_ad_by_id_with_metrics RPC function.
 */
export interface MediaFileWithMetrics extends MediaFile {
    /** Computed: Total number of play events for this creative */
    play_count: number;

    /** Computed: play_count * duration */
    total_duration_played: number;

    /** Computed: Most recent played timestamp, or null if never played */
    last_played: string | null;
}
