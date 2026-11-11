/**
 * Proof-of-play duration severity bucket.
 */
export type PopDurationBucket = 'green' | 'yellow' | 'red' | 'gray';

/**
 * Legend entry describing a proof-of-play duration bucket.
 */
export interface PopDurationLegendEntry {
    bucket: PopDurationBucket;
    label: string;
    range: string;
    rgb: string;
}

/**
 * Legend/filter definitions for proof-of-play duration buckets, ordered by severity.
 * rgb values are shared between the legend swatch and the row highlight color (which
 * applies its own alpha, hence triplets). They match the status tokens in
 * src/styles/_theme.scss (good / warn / crit, and content-muted for gray) - keep the two
 * in step.
 */
export const POP_DURATION_LEGEND: PopDurationLegendEntry[] = [
    { bucket: 'green', label: 'Green', range: '1-5 min', rgb: '74, 222, 128' },
    { bucket: 'yellow', label: 'Yellow', range: '6-10 min', rgb: '241, 127, 40' },
    { bucket: 'red', label: 'Red', range: 'Over 10 min', rgb: '248, 113, 113' },
    { bucket: 'gray', label: 'Gray', range: 'No proof of play data', rgb: '125, 140, 148' },
];

/**
 * Buckets a proof-of-play duration into a color severity level.
 *
 * Green: 1-5 minutes, Yellow: 6-10 minutes, Red: over 10 minutes,
 * Gray: no proof-of-play data (duration not computable).
 *
 * Rounds to the nearest minute first, matching formatPopDuration's display
 * value - otherwise a row showing "1m" (rounded from e.g. 0.6 raw minutes)
 * could fail the raw >= 1 check and render with no color at all.
 *
 * @param minutes - Duration in minutes, or null if not computable
 * @returns The matching bucket, or null if none applies
 */
export function bucketFromMinutes(minutes: number | null | undefined): PopDurationBucket | null {
    if (minutes === null || minutes === undefined) {
        return 'gray';
    }

    const rounded = Math.round(minutes);

    if (rounded >= 1 && rounded <= 5) {
        return 'green';
    }
    if (rounded > 5 && rounded <= 10) {
        return 'yellow';
    }
    if (rounded > 10) {
        return 'red';
    }

    return null;
}

/**
 * Formats a proof-of-play duration for display.
 *
 * @param minutes - Duration in minutes, or null/undefined if not computable
 * @returns Formatted duration (e.g. "3m", "1h 5m"), or "--" if not computable
 */
export function formatPopDuration(minutes: number | null | undefined): string {
    if (minutes === null || minutes === undefined) {
        return '--';
    }

    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);

    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

/**
 * Gets a proof-of-play duration's bucket color as an "r, g, b" string,
 * for use with a --pop-row-color CSS variable. Returns null if no bucket applies.
 *
 * @param minutes - Duration in minutes, or null/undefined if not computable
 * @returns "r, g, b" string, or null if no bucket applies
 */
export function popDurationRowColor(minutes: number | null | undefined): string | null {
    const bucket = bucketFromMinutes(minutes);

    return bucket
        ? (POP_DURATION_LEGEND.find((entry) => entry.bucket === bucket)?.rgb ?? null)
        : null;
}
