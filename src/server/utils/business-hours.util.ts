/** Local Imports */
import type { BusinessHoursDay, Host } from '../types/hosts.types.js';

const WEEKDAY_NAMES = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
];

/**
 * Resolves the weekday name for a calendar date, given as plain "YYYY-MM-DD"
 * components rather than a specific instant. The weekday of a calendar date
 * is a fixed fact independent of timezone - "August 31, 2026" is a Monday
 * everywhere in the world - so no timezone conversion happens here at all.
 * This is deliberately separate from resolving "today" (see `resolveNowWeekday`),
 * which genuinely does depend on timezone since it asks about a live instant.
 *
 * @param calendarDate - Date as "YYYY-MM-DD" (the exact day a user picked, not an instant)
 * @returns Full weekday name (e.g. "Monday")
 */
export function weekdayForCalendarDate(calendarDate: string): string {
    const [year, month, day] = calendarDate.split('-').map(Number);
    return WEEKDAY_NAMES[new Date(year, month - 1, day).getDay()];
}

/**
 * Resolves the weekday name for "right now", in a given IANA timezone.
 * Unlike `weekdayForCalendarDate`, this genuinely is timezone-dependent -
 * it's answering "what day is it, live, for this venue" - a venue in Guam
 * and one in Los Angeles can disagree about what day "now" is.
 *
 * @param timeZone - IANA timezone the venue operates in
 * @returns Full weekday name (e.g. "Monday"), matching Intl's long format
 */
export function resolveNowWeekday(timeZone: string): string {
    return new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'long' }).format(new Date());
}

/**
 * Steps a "YYYY-MM-DD" calendar date forward by a number of days, staying in
 * plain calendar-date arithmetic (no timezone or millisecond-offset math, so
 * this can't be thrown off by DST transitions).
 *
 * @param calendarDate - Date as "YYYY-MM-DD" to step from
 * @param days - Number of days to add
 * @returns The resulting date as "YYYY-MM-DD"
 */
export function addCalendarDays(calendarDate: string, days: number): string {
    const [year, month, day] = calendarDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + days);

    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/**
 * Finds the business-hours entry matching a given weekday name.
 *
 * @param businessHours - The venue's full business-hours week
 * @param weekday - Full weekday name to match (e.g. "Monday")
 * @returns The matching day entry, or undefined if not found
 */
export function findDayEntry(
    businessHours: BusinessHoursDay[],
    weekday: string,
): BusinessHoursDay | undefined {
    return businessHours.find((day) => day.day === weekday);
}

/**
 * Formats a single business-hours day as a display string, e.g.
 * "9:00 AM - 5:00 PM", "9:00 AM - 12:00 PM, 1:00 PM - 5:00 PM" for a
 * split shift, or "Closed" if the venue isn't open that day.
 *
 * @param day - Business-hours entry for one day of the week, or undefined if unknown
 * @returns Display string for that day's hours
 */
export function formatDaySchedule(day: BusinessHoursDay | undefined): string {
    if (!day?.status || !day.periods?.length) {
        return 'Closed';
    }

    // The hosts service represents an all-day-open period as open === close
    // (both literally "Open 24 hours"), not as a real open/close pair - show
    // it once instead of "Open 24 hours - Open 24 hours".
    return day.periods
        .map((period) =>
            period.open === period.close ? period.open : `${period.open} - ${period.close}`,
        )
        .join(', ');
}

/**
 * Shown in place of a schedule when the caller asked for a multi-day range -
 * a single "Business Hours" cell can only ever represent one calendar day.
 */
export const MULTI_DAY_RANGE_MESSAGE = 'Only available for a single-day range';

/**
 * Gets a venue's business hours for a specific calendar date the user
 * picked, or for "right now" if no date was picked. Labeled with the
 * resolved weekday, since venues span different timezones/dates.
 *
 * A picked date's weekday is resolved directly from its calendar components
 * (timezone-agnostic - "Aug 31" is the same weekday everywhere). Only the
 * no-date "right now" case involves the venue's timezone, since that's a
 * genuinely live, timezone-dependent question.
 *
 * @param host - Host record with business hours and timezone; undefined if the venue wasn't found in the hosts service
 * @param calendarDate - The exact date to get hours for, as "YYYY-MM-DD"; omit for right now
 * @returns Display string for that date's hours (e.g. "Monday: 9:00 AM - 5:00 PM"), or null if the venue's business hours aren't known
 *
 * @example
 * ```typescript
 * const schedule = getBusinessHoursSchedule(host, '2026-08-31'); // "Monday: 9:00 AM - 5:00 PM"
 * ```
 */
export function getBusinessHoursSchedule(
    host: Host | undefined,
    calendarDate?: string,
): string | null {
    if (!host?.businessHours?.length || !host.timeZone) {
        return null;
    }

    const weekday = calendarDate
        ? weekdayForCalendarDate(calendarDate)
        : resolveNowWeekday(host.timeZone);
    const hours = formatDaySchedule(findDayEntry(host.businessHours, weekday));
    return `${weekday}: ${hours}`;
}

/**
 * Gets a venue's full week of business hours, ordered Sunday through
 * Saturday, for display in a tooltip.
 *
 * @param host - Host record with business hours; undefined if the venue wasn't found in the hosts service
 * @returns Array of day/hours pairs, empty if the venue's business hours aren't known
 *
 * @example
 * ```typescript
 * const week = getWeeklySchedule(host);
 * // [{ day: 'Sunday', hours: 'Closed' }, { day: 'Monday', hours: '9:00 AM - 5:00 PM' }, ...]
 * ```
 */
export function getWeeklySchedule(host: Host | undefined): { day: string; hours: string }[] {
    if (!host?.businessHours?.length) {
        return [];
    }

    return [...host.businessHours]
        .sort((left, right) => left.id - right.id)
        .map((day) => ({ day: day.day, hours: formatDaySchedule(day) }));
}
