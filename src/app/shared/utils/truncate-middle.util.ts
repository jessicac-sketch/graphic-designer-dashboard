/**
 * Truncates a long identifier (e.g. a device UUID) down to its first and
 * last few characters, joined with an ellipsis - keeps a string recognizable
 * at a glance without taking up the full width of a UUID, for places like
 * chart legends or chip lists where several of these sit side by side.
 *
 * @param value - String to truncate
 * @param headChars - Characters to keep from the start (default 5)
 * @param tailChars - Characters to keep from the end (default 5)
 * @returns The truncated string, or the original if it's already short enough
 *
 * @example
 * ```typescript
 * truncateMiddle('a1b2c3d4-e5f6-7890-abcd-ef1234567890'); // "a1b2c...567890"
 * ```
 */
export function truncateMiddle(value: string, headChars = 5, tailChars = 5): string {
    if (value.length <= headChars + tailChars + 3) {
        return value;
    }

    return `${value.slice(0, headChars)}...${value.slice(value.length - tailChars)}`;
}
