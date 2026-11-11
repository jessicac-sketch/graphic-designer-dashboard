/** Local Imports */
import type { DashboardAdShare } from './dashboard-ad-share.interface';
import type { DashboardAdStateShare } from './dashboard-ad-state-share.interface';

/**
 * A Dashboard ad with where it was received by state, derived client-side from the ad's
 * venues and the geography call's venue -> state map (so the ads call doesn't wait for
 * the Hosts API).
 */
export interface DashboardAdWithStates extends DashboardAdShare {
    /** Where it was received, by state, by received count, descending ("Unknown" / "No venue" included) */
    states: DashboardAdStateShare[];
}
