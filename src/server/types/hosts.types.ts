/**
 * Host/Venue related types from the hosts service.
 */

/**
 * A single open/close window within a business-hours day (e.g. a lunch-break
 * split shift means two periods for the same day).
 */
export interface BusinessHoursPeriod {
    /** Period identifier */
    id: string;

    /** ID of the parent day entry */
    dayId: number;

    /** Opening time, human-readable (e.g. "9:00 AM") */
    open: string;

    /** Closing time, human-readable (e.g. "5:00 PM") */
    close: string;

    /** Opening time as hour/minute/second, for computation */
    openingHourData: {
        hour: number;
        minute: number;
        second: number;
    };

    /** Closing time as hour/minute/second, for computation */
    closingHourData: {
        hour: number;
        minute: number;
        second: number;
    };
}

/**
 * Business hours for a single day of the week.
 */
export interface BusinessHoursDay {
    /** Day-of-week identifier (0 = Sunday, 1 = Monday, ...) */
    id: number;

    /** Short day label (e.g. "M", "Sn") */
    label: string;

    /** Full day name (e.g. "Monday"), matched against Intl's weekday output */
    day: string;

    /** Open/close windows for this day; empty when closed */
    periods: BusinessHoursPeriod[];

    /** Whether the venue is open at all on this day */
    status: boolean;
}

/**
 * Host information from the hosts API.
 */
export interface Host {
    /** Unique host identifier */
    hostId: string;

    /** Programmatic configuration identifier */
    programmaticId: string;

    /** Dealer identifier */
    dealerId: string;

    /** Venue/host name */
    name: string;

    /** Street address */
    address: string;

    /** Street name (optional) */
    street: string | null;

    /** City */
    city: string;

    /** Postal code */
    postalCode: string;

    /** Region (optional) */
    region: string | null;

    /** Two-letter US state code (e.g. "CA") */
    state: string;

    /** Country (optional) */
    country: string | null;

    /** Latitude coordinate */
    latitude: string;

    /** Longitude coordinate */
    longitude: string;

    /** Timezone identifier */
    timeZone: string;

    /** Venue type (optional) */
    venueType: string | null;

    /** Venue category */
    category: string;

    /** Vistar venue identifier, used to join with play stats */
    vistarVenueId: string;

    /** Contact person's name */
    contactPerson: string;

    /** Contact person's phone number */
    contactNumber: string;

    /** Host status */
    status: string;

    /** Per-day open/close windows, used to compute expected ad requests */
    businessHours: BusinessHoursDay[];

    /** Number of media player slots configured at this venue */
    slotCount: number;
}

/**
 * hosts service response structure.
 */
export interface HostsApiResponse {
    /** Whether the request succeeded */
    success: boolean;

    /** Human-readable response message */
    message: string;

    /** Array of matching hosts */
    data: Host[];

    /** Pagination metadata */
    pagination: {
        /** Current page number */
        page: number;

        /** Maximum number of results per page */
        limit: number;

        /** Total number of matching hosts */
        total: number;

        /** Total number of pages, or null if unknown */
        pages: number | null;
    };
}

/**
 * Combined location data (host info + play stats).
 */
export interface LocationData {
    /** Venue identifier */
    venueId: string;

    /** Venue/host name */
    name: string;

    /** Street address */
    address: string;

    /** City */
    city: string;

    /** Two-letter US state code (e.g. "CA") */
    state: string;

    /** Venue category */
    category: string;

    /** Number of plays recorded at this venue */
    playCount: number;

    /** Most recent played timestamp at this venue */
    latestPlay: string;

    /** Total duration played at this venue, in seconds */
    totalDuration: number;
}

/**
 * A venue ("host") ranked by play-record count, enriched with host details
 * from the hosts service where available.
 */
export interface HostRankingEntry {
    /** Venue identifier (matches Host.vistarVenueId) */
    venueId: string;

    /** Proof-of-play screenshot URL of this venue's most recently sent ad (by proof_of_play_sent), or null */
    screenshotUrl: string | null;

    /** Host/venue name, or null if the venue wasn't found in the hosts service */
    hostName: string | null;

    /** City, or null if the venue wasn't found in the hosts service */
    city: string | null;

    /** State, or null if the venue wasn't found in the hosts service */
    state: string | null;

    /** Venue category, or null if the venue wasn't found in the hosts service */
    category: string | null;

    /** Number of programmatic_ads rows recorded at this venue */
    totalAds: number;

    /** Number of media player slots configured at this venue, or null if the venue wasn't found in the hosts service */
    slotCount: number | null;

    /**
     * Estimated ad requests over the selected date range (or today, if no
     * range is selected), derived from the venue's business hours. 0 if the
     * venue wasn't found in the hosts service (business hours unknown).
     */
    expectedRequests: number;

    /**
     * Business hours for the selected date (e.g. "Monday: 9:00 AM - 5:00 PM"),
     * or today's if no date range is selected. Null if unknown (venue not
     * found in the hosts service). A fixed message instead if a multi-day range
     * is selected, since a single cell can only represent one calendar day.
     */
    businessHoursSchedule: string | null;

    /** Full week of business hours, Sunday through Saturday, for tooltip display */
    weeklySchedule: { day: string; hours: string }[];
}

/**
 * A US state ranked by play-record count, aggregated from every venue
 * (HostRankingEntry) whose hosts service record resolved to that state - a
 * many-venues-to-one-state rollup of buildHostRanking()'s own output, not a
 * separate query. Venues with no hosts service match (state: null) are grouped
 * under the "Unknown" state instead of being silently dropped.
 */
export interface StateRankingEntry {
    /** Two-letter US state code as returned by the hosts service (e.g. "CA"), or "Unknown" if not resolved for any of its venues */
    state: string;

    /** Number of distinct venues rolled into this state */
    venueCount: number;

    /** Sum of totalAds across every venue in this state */
    totalAds: number;

    /** Number of distinct creatives (creative_id + creative_source) played anywhere in this state */
    uniqueAdsPlayed: number;
}

/**
 * A venue category ranked by play-record count, aggregated from every venue
 * (HostRankingEntry) whose hosts service record resolved to that category - the
 * same many-venues-to-one-bucket rollup as StateRankingEntry, just keyed by
 * category instead of state. Venues with no hosts service match (category: null)
 * are grouped under the "Unknown" category instead of being silently dropped.
 */
export interface CategoryRankingEntry {
    /** Venue category as returned by the hosts service (e.g. "Restaurant"), or "Unknown" if not resolved for any of its venues */
    category: string;

    /** Number of distinct venues rolled into this category */
    venueCount: number;

    /** Sum of totalAds across every venue in this category */
    totalAds: number;

    /** Number of distinct creatives (creative_id + creative_source) played anywhere in this category */
    uniqueAdsPlayed: number;
}

/**
 * Full profile for a single venue - the hosts service fields not surfaced on
 * HostRankingEntry (address, contact, coordinates, timezone), plus the same
 * range-scoped totalAds/expectedRequests/businessHoursSchedule/weeklySchedule
 * HostRankingEntry rows carry. Powers the standalone Venue Profile page,
 * distinct from HostRankingEntry which only exists as one row of a larger
 * ranking table.
 */
export interface VenueProfile {
    /** Venue identifier (matches Host.vistarVenueId) */
    venueId: string;

    /** Venue/host name */
    hostName: string;

    /** Street address */
    address: string;

    /** City */
    city: string;

    /** Two-letter US state code (e.g. "CA") */
    state: string;

    /** Postal code */
    postalCode: string;

    /** Venue category */
    category: string;

    /** Venue type, or null if not set */
    venueType: string | null;

    /** Contact person's name */
    contactPerson: string;

    /** Contact person's phone number */
    contactNumber: string;

    /** Latitude coordinate */
    latitude: string;

    /** Longitude coordinate */
    longitude: string;

    /** Timezone identifier */
    timeZone: string;

    /** Number of programmatic_ads rows recorded at this venue over the selected range */
    totalAds: number;

    /** Number of media player slots configured at this venue */
    slotCount: number;

    /**
     * Estimated ad requests over the selected date range (or today, if no
     * range is selected), derived from the venue's business hours.
     */
    expectedRequests: number;

    /**
     * Business hours for the selected date (e.g. "Monday: 9:00 AM - 5:00 PM"),
     * or today's if no date range is selected. A fixed message instead if a
     * multi-day range is selected, since a single field can only represent
     * one calendar day.
     */
    businessHoursSchedule: string | null;

    /** Full week of business hours, Sunday through Saturday */
    weeklySchedule: { day: string; hours: string }[];

    /** Distinct device IDs that played ads at this venue over the selected range */
    deviceIds: string[];
}

/**
 * One calendar day's totals for the Map View daily bar chart.
 */
export interface DailyAdsSummaryEntry {
    /** Calendar date, "YYYY-MM-DD" (UTC) */
    date: string;

    /** Number of programmatic_ads rows fetched on this day */
    totalAds: number;

    /** Number of distinct venues that received at least one ad on this day */
    uniqueVenues: number;

    /** Number of distinct ads (creatives) received on this day */
    uniqueAds: number;
}

/**
 * One calendar day's per-device ad counts for a single venue - powers the
 * Venue Profile page's daily chart's device breakdown.
 */
export interface DailyDeviceAdsEntry {
    /** Calendar date, "YYYY-MM-DD" (UTC) */
    date: string;

    /** Ad count on this day, keyed by device_id */
    byDevice: Record<string, number>;
}
