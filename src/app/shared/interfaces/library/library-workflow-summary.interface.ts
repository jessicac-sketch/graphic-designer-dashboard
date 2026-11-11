/** Local Imports */
import type { LibraryAssetStatus } from '@shared/models/library/library-asset-status.type';
import type { LibraryCategoryId } from '@shared/models/library/library-category-id.type';

/**
 * A workflow category's assets per status.
 */
export interface LibraryWorkflowSummary {
    /** Category, e.g. "channel" */
    categoryId: LibraryCategoryId;

    /** Its label, e.g. "Channel" */
    label: string;

    /** Assets in the category */
    total: number;

    /** Assets per status */
    counts: Record<LibraryAssetStatus, number>;
}
