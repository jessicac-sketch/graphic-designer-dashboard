/**
 * One state's slice of a single ad's received playables (Dashboard → Ads → states).
 */
export interface DashboardAdStateShare {
    /**
     * Two-letter state code, "Unknown" (venue with no known state) or "No venue" (row
     * with no venue ID) - so an ad's slices always add up to its received count
     */
    state: string;

    /** Playables of this ad received in this state */
    received: number;
}
