/**
 * One week's column of the Dashboard's uploads chart.
 */
export interface DashboardWeekColumn {
    /** The week's Monday (YYYY-MM-DD) */
    weekStart: string;

    /** Uploads that week */
    count: number;

    /** Column height, as a percentage of the chart's top */
    percent: number;

    /** Axis label, or '' to leave the slot blank */
    axisLabel: string;

    /** Whether it's the current week */
    isCurrent: boolean;
}
