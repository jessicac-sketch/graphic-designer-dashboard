/**
 * Entries in the range menu (UTC days). `custom` is any other range picked in the
 * date-range picker; `allTime` is every record (no range) - offered only on pages that
 * support it (Ranking Data, Map View, Venue Profile), not the Dashboard.
 *
 * - `yesterday`: the previous UTC day (default - always complete)
 * - `today`: the current UTC day, so far
 * - `last7` / `last14` / `last21`: the 7 / 14 / 21 full days ending yesterday
 * - `thisMonth`: the 1st of this month through today (today so far)
 * - `lastMonth`: the whole previous calendar month
 */
export type DashboardRangePreset =
    | 'yesterday'
    | 'today'
    | 'last7'
    | 'last14'
    | 'last21'
    | 'thisMonth'
    | 'lastMonth'
    | 'allTime'
    | 'custom';
