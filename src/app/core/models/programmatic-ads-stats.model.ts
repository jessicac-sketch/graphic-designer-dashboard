/**
 * Total/bucket counts for programmatic_ads rows, optionally scoped to a
 * date range. Powers Ranking Data's mini stat row above the Programmatic
 * Ads table's date-range picker.
 */
export interface ProgrammaticAdsStats {
    /** Total number of matching rows */
    total: number;

    /** Rows with a POP duration of 1-5 minutes */
    green: number;

    /** Rows with a POP duration of 6-10 minutes */
    yellow: number;

    /** Rows with a POP duration over 10 minutes */
    red: number;
}
