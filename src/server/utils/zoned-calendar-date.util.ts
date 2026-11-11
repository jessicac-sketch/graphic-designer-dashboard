/**
 * Timezone-aware calendar date helpers for the "Eastern Time / UTC" display
 * mode (see resolve-date-zone.middleware.ts). Node has full ICU/Intl
 * support, so the same technique works here as in the browser.
 */

/**
 * Computes an IANA timezone's UTC offset at a given instant, in the same
 * sign convention as `Date.prototype.getTimezoneOffset()` (positive for
 * zones west of UTC, e.g. +240 for US Eastern Daylight Time).
 *
 * @param ianaTimeZone - IANA timezone identifier, e.g. "America/New_York"
 * @param at - The instant to resolve the offset for
 * @returns Offset in minutes, or 0 if it couldn't be resolved (including "UTC" itself)
 */
function zonedUtcOffsetMinutes(ianaTimeZone: string, at: Date): number {
    try {
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone: ianaTimeZone,
            timeZoneName: 'shortOffset',
        }).formatToParts(at);
        const raw = parts.find((part) => part.type === 'timeZoneName')?.value ?? '';
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
 * "YYYY-MM-DD" calendar date, in a given IANA timezone - e.g. midnight
 * Oct 14 2026 in "America/New_York" (EDT, UTC-4) is
 * "2026-10-14T04:00:00.000Z". "UTC" itself returns the naive
 * `${calendarDate}T00:00:00.000Z`, identical to this app's pre-existing
 * behavior.
 *
 * @remarks
 * Resolves via two passes (an initial guess, then re-resolving the offset at
 * that guess) so a date that happens to fall exactly on a daylight-saving
 * transition still resolves correctly.
 *
 * @param calendarDate - "YYYY-MM-DD"
 * @param ianaTimeZone - IANA timezone identifier, or "UTC"
 * @returns ISO instant string for local midnight of that date in that timezone
 */
export function zonedMidnightToUtcIso(calendarDate: string, ianaTimeZone: string): string {
    if (ianaTimeZone === 'UTC') {
        return `${calendarDate}T00:00:00.000Z`;
    }

    const [year, month, day] = calendarDate.split('-').map(Number);
    const naiveUtcGuess = Date.UTC(year, month - 1, day, 0, 0, 0);

    const firstPassOffsetMinutes = zonedUtcOffsetMinutes(ianaTimeZone, new Date(naiveUtcGuess));
    const refinedInstant = naiveUtcGuess + firstPassOffsetMinutes * 60_000;

    const secondPassOffsetMinutes = zonedUtcOffsetMinutes(ianaTimeZone, new Date(refinedInstant));
    const finalInstant = naiveUtcGuess + secondPassOffsetMinutes * 60_000;

    return new Date(finalInstant).toISOString();
}

/**
 * Passes through an already-resolved ISO instant unchanged, or appends UTC
 * midnight to a bare "YYYY-MM-DD".
 *
 * @remarks
 * `resolveDateZone` (Express middleware, runs before every controller
 * method) already rewrites a bare calendar date into the correct instant for
 * the request's "Eastern Time / UTC" display mode - so in practice this
 * always receives an already-resolved full instant (passed through
 * unchanged). The bare-date branch stays as a fallback for any caller that
 * bypasses that middleware.
 *
 * @param calendarDate - "YYYY-MM-DD", an already-resolved ISO instant, or undefined
 * @returns UTC-midnight ISO instant, or undefined if no date was given
 */
export function toUtcInstant(calendarDate: string | undefined): string | undefined {
    if (!calendarDate) {
        return undefined;
    }
    return calendarDate.includes('T') ? calendarDate : `${calendarDate}T00:00:00.000Z`;
}

/**
 * Reads an ISO timestamp's own calendar date (as "YYYY-MM-DD"), as it falls
 * in a given IANA timezone - e.g. "2026-10-15T02:00:00.000Z" is still Oct 14
 * in America/New_York (EDT, UTC-4).
 *
 * @remarks
 * Used for day-bucketing charts (the Dashboard's daily timeline, Map
 * View/Venue Profile's Daily Ads Summary, the Analytics page's charts) -
 * unlike `zonedMidnightToUtcIso` (which only matters for the query
 * boundary), this is needed for EVERY row, not just the two ends of a
 * range, since each row needs to land in the bucket for its own local day.
 *
 * @param isoTimestamp - UTC ISO timestamp
 * @param ianaTimeZone - IANA timezone identifier, or "UTC"
 * @returns That instant's calendar date in the given timezone, as "YYYY-MM-DD"
 */
export function zonedDayKey(isoTimestamp: string, ianaTimeZone: string): string {
    if (ianaTimeZone === 'UTC') {
        return isoTimestamp.slice(0, 10);
    }

    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: ianaTimeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(new Date(isoTimestamp));

    const year = parts.find((part) => part.type === 'year')?.value ?? '0000';
    const month = parts.find((part) => part.type === 'month')?.value ?? '01';
    const day = parts.find((part) => part.type === 'day')?.value ?? '01';
    return `${year}-${month}-${day}`;
}

/**
 * Reads an ISO timestamp's own hour-of-day ("00" through "23"), as it falls
 * in a given IANA timezone.
 *
 * @remarks
 * Used for hour-bucketing charts (the Dashboard's single-day hourly
 * timeline, Venue Profile's hour-of-day chart) - see zonedDayKey()'s remarks.
 *
 * @param isoTimestamp - UTC ISO timestamp
 * @param ianaTimeZone - IANA timezone identifier, or "UTC"
 * @returns Two-digit hour string
 */
export function zonedHourKey(isoTimestamp: string, ianaTimeZone: string): string {
    if (ianaTimeZone === 'UTC') {
        return isoTimestamp.slice(11, 13);
    }

    const hour = new Intl.DateTimeFormat('en-US', {
        timeZone: ianaTimeZone,
        hour: '2-digit',
        hourCycle: 'h23',
    }).format(new Date(isoTimestamp));

    return hour.padStart(2, '0');
}

/** Timezones the "Eastern Time / UTC" toggle may send - anything else falls back to UTC. */
const ALLOWED_TIME_ZONES = new Set(['UTC', 'America/New_York']);

/**
 * Validates an incoming `timeZone` query param against the small allowlist
 * this app actually supports, so an unexpected value can't be used to probe
 * the server's `Intl` implementation with arbitrary input.
 *
 * @param timeZone - Raw query param value
 * @returns The timezone if allowed, otherwise "UTC"
 */
export function resolveAllowedTimeZone(timeZone: unknown): string {
    return typeof timeZone === 'string' && ALLOWED_TIME_ZONES.has(timeZone) ? timeZone : 'UTC';
}
