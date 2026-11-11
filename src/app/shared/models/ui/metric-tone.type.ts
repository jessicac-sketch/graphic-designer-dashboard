/**
 * Color emphasis for a metric value.
 *
 * - `default`: neutral
 * - `brand`: NTV360 orange highlight
 * - `good` / `warn` / `crit`: status colors (always paired with a label)
 */
export type MetricTone = 'default' | 'brand' | 'good' | 'warn' | 'crit';
