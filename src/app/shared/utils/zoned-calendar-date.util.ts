/**
 * Timezone-aware calendar date helpers, used by TimeDisplayService and
 * DashboardRangeService to let "today"/"yesterday"/a picked day mean the
 * right calendar date in a given IANA timezone (not always UTC) - e.g. in
 * Eastern Time mode, "yesterday" is the previous Eastern calendar day, not
 * the previous UTC one, and a picked day's query boundary is that day's
 * Eastern midnight, not UTC midnight.
 */

/**
 * Computes an IANA timezone's UTC offset at a given instant, in the same
 * sign convention as `Date.prototype.getTimezoneOffset()` (positive for
 * zones west of UTC, e.g. +300 for US Eastern Daylight Time).
 *
 * @param ianaTimeZone - IANA timezone identifier, e.g. "America/New_York"
 * @param at - The instant to resolve the offset for
 * @returns Offset in minutes, or 0 if it couldn't be resolved
 */
export function zonedUtcOffsetMinutes(ianaTimeZone: string, at: Date): number {
    try {
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone: ianaTimeZone,
            timeZoneName: 'shortOffset',
        }).formatToParts(at);
        const raw = parts.find((part) => part.type === 'timeZoneName')?.value ?? '';
        // e.g. "GMT-5" -> GMT offset is -5h, so the JS-style (UTC - local) offset is +5h (300min).
        const match = /GMT([+-]\d+)(?::(\d+))?/.exec(raw);
        if (!match) {
            return 0;
        }
        const hours = parseInt(match[1], 10);
        const minutes = match[2] ? parseInt(match[2], 10) : 0;
        return -(hours * 60 + Math.sign(hours || 1) * minutes);
    } catch {
        return 0;
    }
}

/**
 * Resolves the UTC-instant equivalent of local midnight, for a given
 * calendar date, in a given IANA timezone - e.g. midnight Oct 14 2026 in
 * "America/New_York" (EDT, UTC-4) is "2026-10-14T04:00:00.000Z".
 *
 * @remarks
 * Resolves via two passes (an initial guess, then re-resolving the offset at
 * that guess) so a date that happens to fall exactly on a daylight-saving
 * transition still resolves correctly.
 *
 * @param year - Full year, e.g. 2026
 * @param month - Month, 1-12 (not zero-based)
 * @param day - Day of month, 1-31
 * @param ianaTimeZone - IANA timezone identifier
 * @returns ISO instant string for local midnight of that date in that timezone
 */
export function zonedMidnightToUtcIso(
    year: number,
    month: number,
    day: number,
    ianaTimeZone: string,
): string {
    const naiveUtcGuess = Date.UTC(year, month - 1, day, 0, 0, 0);

    const firstPassOffsetMinutes = zonedUtcOffsetMinutes(ianaTimeZone, new Date(naiveUtcGuess));
    const refinedInstant = naiveUtcGuess + firstPassOffsetMinutes * 60_000;

    const secondPassOffsetMinutes = zonedUtcOffsetMinutes(ianaTimeZone, new Date(refinedInstant));
    const finalInstant = naiveUtcGuess + secondPassOffsetMinutes * 60_000;

    return new Date(finalInstant).toISOString();
}

/**
 * Reads an instant's own calendar date (year/month/day) as it falls in a
 * given IANA timezone - e.g. "2026-10-15T02:00:00.000Z" is still Oct 14 in
 * America/New_York (EDT, UTC-4).
 *
 * @param at - The instant to read
 * @param ianaTimeZone - IANA timezone identifier
 * @returns That instant's calendar date in the given timezone, as "YYYY-MM-DD"
 */
export function zonedCalendarDate(at: Date, ianaTimeZone: string): string {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: ianaTimeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(at);

    const year = parts.find((part) => part.type === 'year')?.value ?? '0000';
    const month = parts.find((part) => part.type === 'month')?.value ?? '01';
    const day = parts.find((part) => part.type === 'day')?.value ?? '01';
    return `${year}-${month}-${day}`;
}

/**
 * Adds a number of days to a "YYYY-MM-DD" calendar date, independent of any
 * timezone (pure calendar arithmetic - there's no instant/offset involved).
 *
 * @param calendarDate - "YYYY-MM-DD"
 * @param days - Number of days to add (negative to subtract)
 * @returns The resulting "YYYY-MM-DD"
 */
export function addCalendarDays(calendarDate: string, days: number): string {
    const [year, month, day] = calendarDate.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
}
