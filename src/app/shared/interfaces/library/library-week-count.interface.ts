/**
 * Assets added in one week.
 */
export interface LibraryWeekCount {
    /** The week's Monday, as YYYY-MM-DD (UTC) */
    weekStart: string;

    /** Assets added that week */
    count: number;
}
