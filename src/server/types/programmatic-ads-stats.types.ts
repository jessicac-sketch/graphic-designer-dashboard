/**
 * Total/bucket counts for programmatic_ads rows, optionally scoped to a
 * date range - the camelCase API-facing shape, mapped from the RPC's raw
 * snake_case ProgrammaticAdsStats row.
 */
export interface ProgrammaticAdsStatsContent {
    /** Total number of matching rows */
    total: number;

    /** Rows with a POP duration of 1-5 minutes */
    green: number;

    /** Rows with a POP duration of 6-10 minutes */
    yellow: number;

    /** Rows with a POP duration over 10 minutes */
    red: number;
}
