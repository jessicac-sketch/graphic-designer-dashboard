/**
 * Formats a video's length for display.
 *
 * @param seconds - Length in seconds
 * @returns {string} "m:ss", or "h:mm:ss" from an hour up
 *
 * @example
 * formatMediaDuration(32.4); // "0:32"
 * formatMediaDuration(3725); // "1:02:05"
 */
export function formatMediaDuration(seconds: number): string {
    const total = Math.max(0, Math.round(seconds));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const rest = String(total % 60).padStart(2, '0');
    return hours > 0
        ? `${hours}:${String(minutes).padStart(2, '0')}:${rest}`
        : `${minutes}:${rest}`;
}
