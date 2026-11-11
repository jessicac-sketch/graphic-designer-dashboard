/**
 * The Dashboard's selected date range, as UTC calendar dates.
 */
export interface DashboardRange {
    /** First calendar date, "YYYY-MM-DD" */
    start: string;

    /** Last calendar date, "YYYY-MM-DD" */
    end: string;
}
