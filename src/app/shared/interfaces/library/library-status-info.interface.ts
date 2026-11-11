/** Local Imports */
import type { LibraryAssetStatus } from '@shared/models/library/library-asset-status.type';

/**
 * How a workflow status is shown: its name, what it means and its icon.
 */
export interface LibraryStatusInfo {
    /** The status */
    value: LibraryAssetStatus;

    /** One-word name, e.g. "Approval" */
    label: string;

    /** What the status means, e.g. "Waiting for upper management" */
    description: string;

    /** Font Awesome icon name without the `fa-` prefix */
    icon: string;
}
