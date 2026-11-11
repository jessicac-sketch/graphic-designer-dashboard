/** Local Imports */
import type { DashboardAdVenueShare } from './dashboard-ad-venue-share.interface';

/**
 * One distinct creative received in the Dashboard's range, with its received count.
 * Creatives with no media file are included (null media fields), so the counts add up
 * to the total received. Where it was received by state isn't in this response - see
 * DashboardAdWithStates.
 */
export interface DashboardAdShare {
    /** Vendor creative identifier */
    creativeId: string;

    /** Creative source (e.g. "Vistar") */
    source: string;

    /** Media-file ID for the Ad Analytics page, or null if the creative has no media file */
    contentId: string | null;

    /** Display title (falls back to the creative ID) */
    title: string;

    /** Media URL for the thumbnail, or null if the creative has no media file */
    mediaUrl: string | null;

    /** Creative type, or null if the creative has no media file */
    creativeType: 'video' | 'image' | null;

    /** Number of playables received for this creative */
    received: number;

    /** Number of distinct venues that received it */
    venueCount: number;

    /** Playables of this creative with no venue (counted in `received`, in no venue) */
    withoutVenue: number;

    /** Where it was received, by venue, by received count, descending (rows with no venue left out) */
    venues: DashboardAdVenueShare[];
}
