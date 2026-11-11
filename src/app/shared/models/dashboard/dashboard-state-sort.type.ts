/**
 * Order of the Dashboard's States list.
 *
 * - `received`: most received first (default)
 * - `ads`: the most unique ads received first, then most received
 * - `venues`: the most receiving venues first, then most received
 */
export type DashboardStateSort = 'received' | 'ads' | 'venues';
