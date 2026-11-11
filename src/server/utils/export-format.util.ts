/**
 * Formats an ISO timestamp the same way the dashboard tables display it
 * (TimeDisplayService.formatTimestamp() client-side) - "MMM dd, yyyy, h:mm a"
 * plus the active zone's abbreviation (EDT/EST/UTC) - so an exported file's
 * dates read identically to what's on screen under the zone the export was
 * requested in, not always UTC.
 *
 * @param iso - ISO timestamp, or null/undefined if not set
 * @param timeZone - IANA timezone identifier, or "UTC" - defaults to "UTC" for
 *   any caller that doesn't thread a resolved zone through (keeps prior behavior)
 * @returns Formatted date/time, or "--" if not set
 */
export function formatExportDateTime(
    iso: string | null | undefined,
    timeZone: string = 'UTC',
): string {
    if (!iso) {
        return '--';
    }

    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
        return '--';
    }

    const formatted = new Intl.DateTimeFormat('en-US', {
        timeZone,
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    }).format(date);

    const zoneParts = new Intl.DateTimeFormat('en-US', {
        timeZone,
        timeZoneName: 'short',
    }).formatToParts(date);
    const zoneAbbreviation =
        zoneParts.find((part) => part.type === 'timeZoneName')?.value ?? timeZone;

    return `${formatted} ${zoneAbbreviation}`;
}

/**
 * Formats a boolean the same way the dashboard tables display it ("Yes"/"No"),
 * instead of exporting a raw true/false value.
 *
 * @param value - Value to format
 * @returns "Yes" if truthy, "No" otherwise
 */
export function formatExportYesNo(value: unknown): string {
    return value ? 'Yes' : 'No';
}

/**
 * Formats a proof-of-play duration the same way the dashboard tables display
 * it (e.g. "3m", "1h 5m"), instead of exporting a raw minute count.
 *
 * @remarks
 * Mirrors src/app/shared/utils/pop-duration.util.ts's formatPopDuration() -
 * duplicated rather than shared, since frontend/backend code isn't
 * cross-imported anywhere else in this project either.
 *
 * @param minutes - Duration in minutes, or null/undefined if not computable
 * @returns Formatted duration, or "--" if not computable
 */
export function formatExportPopDuration(minutes: number | null | undefined): string {
    if (minutes === null || minutes === undefined) {
        return '--';
    }

    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);

    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}
