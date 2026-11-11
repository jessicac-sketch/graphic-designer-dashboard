/**
 * One bar of a Dashboard bar list: a label, its value, and its length.
 */
export interface DashboardBar {
    /** What the bar is */
    label: string;

    /** Its value */
    value: number;

    /** Length, as a percentage of the longest bar (0-100) */
    percent: number;
}
