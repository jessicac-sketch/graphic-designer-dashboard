/**
 * A venue that received playables in the Dashboard's range, with just the fields the
 * Dashboard reads.
 */
export interface DashboardVenue {
    /** Venue identifier */
    venueId: string;

    /** Host/venue name, or null if the venue isn't in the Hosts API */
    hostName: string | null;

    /** City, or null if the venue isn't in the Hosts API */
    city: string | null;

    /** State, or null if the venue isn't in the Hosts API */
    state: string | null;

    /** Venue category, or null if the venue isn't in the Hosts API */
    category: string | null;

    /** Playables received at this venue in the range */
    totalAds: number;

    /** Media player slots configured at this venue, or null if the venue isn't in the Hosts API */
    slotCount: number | null;
}
