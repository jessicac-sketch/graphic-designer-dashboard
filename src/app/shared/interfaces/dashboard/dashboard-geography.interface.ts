/** Local Imports */
import type { CategoryRankingEntry, StateRankingEntry } from '@core/models';
import type { DashboardVenue } from './dashboard-venue.interface';

/**
 * The venues, states and categories that received playables in one date range, from
 * GET /api/media-files/dashboard/geography. Needs the Hosts API, so it can be the slow call.
 */
export interface DashboardGeography {
    /** Playables received - the denominator for every share */
    received: number;

    /** Playables with no venue - counted in `received`, in no venue, state or category */
    withoutVenue: number;

    /** Distinct US states that received at least one playable (excludes "Unknown") */
    uniqueStates: number;

    /** Distinct venue categories that received at least one playable (excludes "Unknown") */
    uniqueCategories: number;

    /** States, by received count, descending ("Unknown" groups venues with no known state) */
    states: StateRankingEntry[];

    /** Categories, by received count, descending ("Unknown" groups venues with no known category) */
    categories: CategoryRankingEntry[];

    /** Venues, by received count, descending */
    venues: DashboardVenue[];
}
