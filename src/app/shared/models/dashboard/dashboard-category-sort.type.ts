/**
 * Order of the Dashboard's Categories breakdown.
 *
 * - `received`: most received first (default)
 * - `ads`: the most unique ads received first, then most received
 * - `venues`: the most receiving venues first, then most received
 * - `states`: in the most states first (states its venues are in), then most received
 */
export type DashboardCategorySort = 'received' | 'ads' | 'venues' | 'states';
