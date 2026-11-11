import type { ProgrammaticAdsColumnFilters } from './programmatic-ads-column-filters.types.js';

/**
 * Backend sort keys supported by get_programmatic_ads_page - one per
 * sortable column in the dashboard's raw Programmatic Ads table.
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
 * Options for fetching media files.
 */
export interface GetAllOptions {
    /** Maximum number of results to return */
    limit?: number;

    /** Number of results to skip */
    offset?: number;

    /** Filter by creative source */
    source?: string;

    /** Search by creative name or creative ID */
    search?: string;

    /** Order (Ads Gallery): newest added, all-time play count, or duration (default newest) */
    sort?: MediaFileSort;

    /** Sort direction (default desc) */
    direction?: 'asc' | 'desc';

    /** Only this creative type */
    creativeType?: 'video' | 'image';
}

/**
 * Orders the Ads Gallery can list media files in.
 */
export type MediaFileSort = 'newest' | 'plays' | 'duration';

/**
 * Options for fetching play records.
 */
export interface GetPlayRecordsOptions {
    /** Maximum number of results to return */
    limit?: number;

    /** Number of results to skip */
    offset?: number;

    /** Only plays fetched on/after this calendar date ("YYYY-MM-DD" or resolved ISO instant) */
    startDate?: string;

    /** Only plays fetched on/before this calendar date ("YYYY-MM-DD" or resolved ISO instant) */
    endDate?: string;
}

/**
 * Options for fetching a paginated, filterable, sortable page of programmatic_ads rows.
 */
export interface GetProgrammaticAdsListOptions {
    /** Maximum number of results to return */
    limit?: number;

    /** Number of results to skip */
    offset?: number;

    /** Filter to a proof-of-play duration bucket, or a stat-card filter */
    bucket?: 'green' | 'yellow' | 'red' | 'gray' | 'successful' | 'overdue' | 'recent';

    /** Column to sort by */
    sortBy?: ProgrammaticAdsSortBy;

    /** Sort direction */
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
