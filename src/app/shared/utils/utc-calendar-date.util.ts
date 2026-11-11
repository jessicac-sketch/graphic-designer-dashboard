/** Local Imports */
import type { DashboardRange } from '@shared/interfaces/dashboard/dashboard-range.interface';

/**
 * Formats an instant as its UTC calendar date.
 *
 * @param date - Any instant
 * @returns {string} "YYYY-MM-DD" (UTC)
 *
 * @example
 * toUtcCalendarDate(new Date()); // "2026-10-12"
 */
export function toUtcCalendarDate(date: Date): string {
    return date.toISOString().slice(0, 10);
}

/**
 * Adds whole days to an instant, in UTC.
 *
 * @param date - Starting instant
 * @param days - Days to add (negative to subtract)
 * @returns {Date} The new instant
 */
export function addUtcDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setUTCDate(result.getUTCDate() + days);
    return result;
}

/**
 * Reads a date picked in a date picker as a calendar date, from its local date parts -
 * the day the user clicked, not shifted by their UTC offset.
 *
 * @param date - Date from the picker
 * @returns {string} "YYYY-MM-DD"
 */
export function pickedCalendarDate(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * Formats a "YYYY-MM-DD" calendar date for display.
 *
 * @param calendarDate - "YYYY-MM-DD"
 * @param withYear - Whether to include the year
 * @returns {string} e.g. "Oct 10, 2026"
 */
export function formatCalendarDate(calendarDate: string, withYear = true): string {
    return new Date(`${calendarDate}T00:00:00.000Z`).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        ...(withYear ? { year: 'numeric' } : {}),
        timeZone: 'UTC',
    });
}

/**
 * Formats a range of calendar dates for display.
 *
 * @param range - First and last day, "YYYY-MM-DD"
 * @returns {string} e.g. "Oct 10, 2026" or "Oct 1 – Oct 7, 2026"
 */
export function formatCalendarRange({ start, end }: DashboardRange): string {
    return start === end
        ? formatCalendarDate(start)
        : `${formatCalendarDate(start, false)} – ${formatCalendarDate(end)}`;
}

/**
 * Turns a range of "YYYY-MM-DD" calendar dates (the shared range's UTC days) into local
 * Dates on those same calendar days - the form pages that read their range with local
 * date parts (Ranking Data, Map View, Venue Profile) use, so the days they send to the
 * API are exactly the shared range's.
 *
 * @param range - First and last day, "YYYY-MM-DD"
 * @returns {{ start: Date; end: Date }} Local midnight of each day
 */
export function toLocalDateRange({ start, end }: DashboardRange): { start: Date; end: Date } {
    const toLocal = (calendarDate: string): Date => {
        const [year, month, day] = calendarDate.split('-').map(Number);
        return new Date(year, month - 1, day);
    };
    return { start: toLocal(start), end: toLocal(end) };
}
