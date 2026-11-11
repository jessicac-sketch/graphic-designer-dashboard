/**
 * Per-column substring filters for the raw Programmatic Ads table, applied
 * server-side across the full table (driven by ntv-table's built-in column
 * filter UI, not the free-text search box).
 */
export interface ProgrammaticAdsColumnFilters {
    /** Filter by creative ID (case-insensitive substring match) */
    creativeId?: string;

    /** Filter by creative source (case-insensitive substring match) */
    creativeSource?: string;

    /** Filter by venue ID (case-insensitive substring match) */
    venueId?: string;

    /** Filter by device ID (case-insensitive substring match) */
    deviceId?: string;

    /** Filter by tracking ID (case-insensitive substring match against metadata.trackerId) */
    trackerId?: string;
}
