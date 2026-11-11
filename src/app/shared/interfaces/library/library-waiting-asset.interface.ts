/** Local Imports */
import type { LibraryAssetStatus } from '@shared/models/library/library-asset-status.type';

/**
 * An asset waiting in Review or Approval.
 */
export interface LibraryWaitingAsset {
    /** Asset ID */
    id: string;

    /** Title */
    title: string;

    /** Where it's filed, e.g. "Channel › Extreme Sports › Skiing" */
    location: string;

    /** Its status (review or approval) */
    status: LibraryAssetStatus;

    /** Since when, as a UTC ISO timestamp */
    since: string;
}
