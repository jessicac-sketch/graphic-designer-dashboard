/** Local Imports */
import type { DashboardAdShare } from './dashboard-ad-share.interface';

/**
 * Every distinct creative received in one date range, with the venues that received it,
 * from GET /api/media-files/dashboard/ads. Needs the media files (titles, thumbnails),
 * not the Hosts API.
 */
export interface DashboardAds {
    /** Playables received - the denominator for every share */
    received: number;

    /** Distinct creatives, by received count, descending */
    ads: DashboardAdShare[];
}
