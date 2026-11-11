/**
 * One venue's slice of a single ad's received playables (Dashboard → Ads → state → venues).
 */
export interface DashboardAdVenueShare {
    /** Venue identifier (matches HostRankingEntry.venueId) */
    venueId: string;

    /** Playables of this ad received at this venue */
    received: number;
}
