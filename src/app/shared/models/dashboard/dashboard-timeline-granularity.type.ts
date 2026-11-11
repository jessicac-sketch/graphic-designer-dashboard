/**
 * Size of the Dashboard timeline's buckets.
 *
 * - `hour`: a single-day range, 24 UTC hours
 * - `day`: a multi-day range, one bucket per day
 */
export type DashboardTimelineGranularity = 'hour' | 'day';
