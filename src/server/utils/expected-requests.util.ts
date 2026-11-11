/** Local Imports */
import type { BusinessHoursDay, BusinessHoursPeriod, Host } from '../types/hosts.types.js';
import {
    addCalendarDays,
    findDayEntry,
    resolveNowWeekday,
    weekdayForCalendarDate,
} from './business-hours.util.js';

/**
 * Steady-state ad-request rate of one player (10 per minute: one every 6 seconds),
 * used to estimate expected request volume from a venue's open hours - e.g. 8 open
 * hours = 480 minutes = 4,800 requests. An upper bound: a player pauses while it holds
 * enough unplayed ads, and the rate can be overridden per device. Adjust here if the
 * real cadence changes.
 */
const AD_REQUESTS_PER_MINUTE = 10;

/**
 * Parses a human-readable 12-hour time string (e.g. "9:00 AM", "12:30 PM")
 * into minutes since midnight. Returns null if the string doesn't match.
 *
 * @param time - Time string to parse
 * @returns Minutes since midnight, or null if unparseable
 */
function parseTimeStringToMinutes(time: string | undefined): number | null {
    const match = time?.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) {
        return null;
    }

    const [, hourStr, minuteStr, meridiem] = match;
    let hour = parseInt(hourStr, 10) % 12;
    if (meridiem.toUpperCase() === 'PM') {
        hour += 12;
    }

    return hour * 60 + parseInt(minuteStr, 10);
}

/**
 * Resolves a period's open (or close) time to minutes since midnight. Prefers
 * the structured `*HourData` field, since the real hosts service doesn't always
 * populate it, falling back to parsing the human-readable string.
 *
 * @param structured - The structured hour/minute breakdown, if present
 * @param label - The human-readable fallback string (e.g. "9:00 AM")
 * @returns Minutes since midnight, or null if neither source is usable
 */
function resolveMinutes(
    structured: BusinessHoursPeriod['openingHourData'] | undefined,
    label: string | undefined,
): number | null {
    if (structured) {
        return structured.hour * 60 + structured.minute;
    }

    return parseTimeStringToMinutes(label);
}

/**
 * Sums the open minutes across all periods of a single business-hours day.
 * A day with `status: false`, no periods, or unparseable period times
 * contributes 0 for that period.
 *
 * @param day - Business-hours entry for one day of the week
 * @returns Total open minutes for that day
 */
function openMinutesForDay(day: BusinessHoursDay | undefined): number {
    if (!day?.status || !day.periods) {
        return 0;
    }

    return day.periods.reduce((total, period) => {
        const openMinutes = resolveMinutes(period.openingHourData, period.open);
        let closeMinutes = resolveMinutes(period.closingHourData, period.close);

        if (openMinutes === null || closeMinutes === null) {
            return total;
        }

        // An overnight shift (e.g. "11:00 AM - 2:00 AM") closes on the
        // following calendar day, so its close time comes out numerically
        // smaller than its open time - push it past midnight instead of
        // treating it as an invalid/empty window.
        if (closeMinutes < openMinutes) {
            closeMinutes += 24 * 60;
        }

        return total + (closeMinutes - openMinutes);
    }, 0);
}

/**
 * Estimates expected ad requests for a venue over a picked calendar-date
 * range (or right now, if none is given), based on its business hours and a
 * fixed requests-per-minute rate. Each calendar day in the range is matched
 * to its own weekday's open hours, so closed days contribute 0.
 *
 * Range dates are plain "YYYY-MM-DD" - not instants - specifically so a
 * picked date's weekday resolves the same way regardless of the browser's or
 * venue's timezone. Resolving weekday by reformatting a UTC instant into the
 * venue's timezone can land on the wrong calendar day entirely when the two
 * timezones differ enough (e.g. a browser in the Philippines and a venue in
 * the US can disagree by a full day about the same instant).
 *
 * @param host - Host record with business hours and timezone; undefined if the venue wasn't found in the hosts service
 * @param range - Calendar-date range to estimate over ("YYYY-MM-DD" start/end, inclusive), or omit/null for just right now
 * @returns Estimated number of ad requests
 *
 * @example
 * ```typescript
 * const expected = calculateExpectedRequests(host, { start: '2026-08-31', end: '2026-08-31' });
 * ```
 */
export function calculateExpectedRequests(
    host: Host | undefined,
    range?: { start: string; end: string } | null,
): number {
    if (!host?.businessHours?.length || !host.timeZone) {
        return 0;
    }

    if (!range) {
        const dayEntry = findDayEntry(host.businessHours, resolveNowWeekday(host.timeZone));
        return openMinutesForDay(dayEntry) * AD_REQUESTS_PER_MINUTE;
    }

    let totalOpenMinutes = 0;
    let cursor = range.start;
    while (cursor <= range.end) {
        const dayEntry = findDayEntry(host.businessHours, weekdayForCalendarDate(cursor));
        totalOpenMinutes += openMinutesForDay(dayEntry);
        cursor = addCalendarDays(cursor, 1);
    }

    return totalOpenMinutes * AD_REQUESTS_PER_MINUTE;
}
