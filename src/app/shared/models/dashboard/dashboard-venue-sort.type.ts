/**
 * Order of the Dashboard's Venue breakdown (its Venues list).
 *
 * - `received`: most received first (default)
 * - `ads`: the most unique ads received first, then most received
 * - `slots`: the most configured player slots first, then most received
 */
export type DashboardVenueSort = 'received' | 'ads' | 'slots';
