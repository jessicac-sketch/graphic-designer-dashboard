/**
 * Represents venue statistics from play records.
 */
export interface VenueStats {
    /** Venue identifier */
    venueId: string;

    /** Number of plays recorded at this venue */
    playCount: number;

    /** Most recent played timestamp at this venue */
    latestPlay: string;

    /** Total duration played at this venue, in seconds */
    totalDuration: number;
}

/**
 * Represents host/location information from the Hosts API.
 */
export interface Host {
    /** Unique host identifier */
    hostId: string;

    /** Venue/host name */
    name: string;

    /** Vistar venue identifier */
    vistarVenueId: string;

    /** Street address */
    address: string;

    /** City */
    city: string;

    /** State */
    state: string;

    /** Postal code */
    postalCode: string;

    /** Country */
    country: string;

    /** Venue category */
    category: string;

    /** Google Place ID (optional) */
    googlePlaceId?: string;

    /** Foursquare ID (optional) */
    foursquareId?: string;

    /** SafeGraph ID (optional) */
    safegraphId?: string;

    /** Merchant ID (optional) */
    merchantId?: string;

    /** Latitude coordinate */
    latitude: number;

    /** Longitude coordinate */
    longitude: number;

    /** Geopoint representation */
    geopoint: string;

    /** Timezone identifier */
    timezone: string;

    /** Host status */
    status: string;

    /** Timestamp when the host record was created */
    createdAt: string;
}

/**
 * Combined location data with venue stats and host information.
 */
export interface LocationData extends Record<string, unknown> {
    /** Venue identifier */
    venueId: string;

    /** Venue/host name */
    name: string;

    /** Street address */
    address: string;

    /** City */
    city: string;

    /** State */
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
 * from the Hosts API where available.
 */
export interface HostRankingEntry extends Record<string, unknown> {
    /** Venue identifier (matches Host.vistarVenueId) */
    venueId: string;

    /** Proof-of-play screenshot URL of this venue's most recently sent ad (by proof_of_play_sent), or null */
    screenshotUrl: string | null;

    /** Host/venue business name, or null if the venue wasn't found in the Hosts API */
    hostName: string | null;

    /** City, or null if the venue wasn't found in the Hosts API */
    city: string | null;

    /** State, or null if the venue wasn't found in the Hosts API */
    state: string | null;

    /** Venue category, or null if the venue wasn't found in the Hosts API */
    category: string | null;

    /** Number of programmatic_ads rows recorded at this venue */
    totalAds: number;

    /** Number of media player slots configured at this venue, or null if the venue wasn't found in the Hosts API */
    slotCount: number | null;

    /**
     * Estimated ad requests over the selected date range (or today, if no
     * range is selected), derived from the venue's business hours. 0 if the
     * venue wasn't found in the Hosts API (business hours unknown).
     */
    expectedRequests: number;

    /**
     * Business hours for the selected date (e.g. "Monday: 9:00 AM - 5:00 PM"),
     * or today's if no date range is selected. Null if unknown (venue not
     * found in the Hosts API). A fixed message instead if a multi-day range
     * is selected, since a single cell can only represent one calendar day.
     */
    businessHoursSchedule: string | null;

    /** Full week of business hours, Sunday through Saturday, for tooltip display */
    weeklySchedule: { day: string; hours: string }[];
}

/**
 * A US state ranked by play-record count, aggregated from every venue
 * (HostRankingEntry) whose Hosts API record resolved to that state - a
 * many-venues-to-one-state rollup, not a separate query.
 */
export interface StateRankingEntry extends Record<string, unknown> {
    /** Two-letter US state code as returned by the Hosts API (e.g. "CA"), or "Unknown" if not resolved for any of its venues */
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
 * (HostRankingEntry) whose Hosts API record resolved to that category - the
 * same many-venues-to-one-bucket rollup as StateRankingEntry, keyed by
 * category instead of state.
 */
export interface CategoryRankingEntry extends Record<string, unknown> {
    /** Venue category as returned by the Hosts API (e.g. "Restaurant"), or "Unknown" if not resolved for any of its venues */
    category: string;

    /** Number of distinct venues rolled into this category */
    venueCount: number;

    /** Sum of totalAds across every venue in this category */
    totalAds: number;

    /** Number of distinct creatives (creative_id + creative_source) played anywhere in this category */
    uniqueAdsPlayed: number;
}

/**
 * Full profile for a single venue - the Hosts API fields not surfaced on
 * HostRankingEntry (address, contact, coordinates, timezone), plus the same
 * range-scoped totalAds/expectedRequests/businessHoursSchedule/weeklySchedule
 * HostRankingEntry rows carry. Powers the standalone Venue Profile page.
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
export interface DailyAdsSummaryEntry extends Record<string, unknown> {
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
