/** Units of a file size, from bytes up. */
const UNITS = ['B', 'KB', 'MB', 'GB'] as const;

/**
 * Formats a file size for display, in 1024-based units.
 *
 * @param bytes - Size in bytes
 * @returns {string} E.g. "1.7 MB", "820 KB", "512 B"
 *
 * @example
 * formatFileSize(1_782_579); // "1.7 MB"
 */
export function formatFileSize(bytes: number): string {
    let value = bytes;
    let unit = 0;
    while (value >= 1024 && unit < UNITS.length - 1) {
        value /= 1024;
        unit++;
    }
    const digits = unit === 0 || value >= 100 ? 0 : 1;
    return `${value.toFixed(digits)} ${UNITS[unit]}`;
}
