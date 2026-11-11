/**
 * Formats a count as a percentage of a total: one decimal, "<0.1%" for tiny non-zero
 * shares, "0%" when the count or the total is zero. The one place share percentages are
 * formatted, so every list and grid shows them the same way.
 *
 * @param value - The count
 * @param total - The total the count is a share of
 * @returns {string} The share, e.g. "12.5%"
 *
 * @example
 * formatShare(37, 858); // "4.3%"
 */
export function formatShare(value: number, total: number): string {
    if (total <= 0 || value <= 0) {
        return '0%';
    }

    const percent = (value / total) * 100;
    return percent < 0.1 ? '<0.1%' : `${percent.toFixed(1)}%`;
}
