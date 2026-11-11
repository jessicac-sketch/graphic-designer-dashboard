/**
 * Escapes a value for a CSV cell, quoting and doubling any embedded quotes.
 *
 * @param value - Value to serialize
 * @returns Quoted CSV cell
 */
export function toCsvValue(value: unknown): string {
    if (value === null || value === undefined) {
        return '""';
    }

    const text = typeof value === 'object' ? JSON.stringify(value) : String(value);
    return `"${text.replaceAll('"', '""')}"`;
}

/**
 * Builds a UTF-8 CSV Blob (with a BOM, so Excel opens it without mangling
 * accented characters) from a header row and data rows of already-escaped
 * cell values.
 *
 * @param headers - Column header labels
 * @param rows - Data rows, each an array of already-escaped cell values (see toCsvValue)
 * @returns CSV file Blob
 *
 * @example
 * ```typescript
 * const headers = columns.map((c) => c.header);
 * const rows = records.map((r) => columns.map((c) => toCsvValue(r[c.key])));
 * const file = buildCsvBlob(headers, rows);
 * ```
 */
export function buildCsvBlob(headers: string[], rows: string[][]): Blob {
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\r\n');
    return new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
}

/**
 * Triggers a browser download of a file Blob.
 *
 * @param file - File blob to download
 * @param filename - Download filename
 * @returns void
 */
export function downloadFile(file: Blob, filename: string): void {
    const url = URL.createObjectURL(file);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
}

/**
 * Builds a date-stamped export filename, e.g. "venue-ranking-2026-09-01.csv".
 *
 * @param prefix - Filename prefix (e.g. "venue-ranking")
 * @param extension - File extension, without a leading dot
 * @returns Dated filename
 */
export function dateStampedFilename(prefix: string, extension: string): string {
    return `${prefix}-${new Date().toISOString().slice(0, 10)}.${extension}`;
}

/**
 * Formats an ISO timestamp the same way the dashboard tables display it
 * (TimeDisplayService.formatTimestamp()) - "MMM dd, yyyy, h:mm a" plus the
 * active zone's abbreviation (EDT/EST/UTC) - so a CSV export's dates read
 * identically to what's on screen under the zone the export was built in,
 * not always UTC.
 *
 * @remarks
 * Mirrors src/server/utils/export-format.util.ts's formatExportDateTime() -
 * duplicated rather than shared, since frontend/backend code isn't
 * cross-imported anywhere else in this project either. Kept a plain function
 * (not a TimeDisplayService method) so callers building export columns
 * outside an injection context can still use it, passing the zone explicitly.
 *
 * @param iso - ISO timestamp, or null/undefined if not set
 * @param timeZone - IANA timezone identifier, or "UTC" - defaults to "UTC"
 *   for any caller that doesn't thread the active zone through
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
    const zoneAbbreviation = zoneParts.find((part) => part.type === 'timeZoneName')?.value ?? timeZone;

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
