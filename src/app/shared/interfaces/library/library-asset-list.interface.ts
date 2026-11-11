/** Local Imports */
import type { LibraryFileTypeFilter } from '@shared/models/library/library-file-type-filter.type';
import type { LibraryStatusFilter } from '@shared/models/library/library-status-filter.type';

import type { LibraryAsset } from './library-asset.interface';

/**
 * An asset listing with per-format counts.
 */
export interface LibraryAssetList {
    /** The matching assets, in the requested order */
    assets: LibraryAsset[];

    /** Assets matching every filter except the file format, all and per format */
    fileTypeCounts: Record<LibraryFileTypeFilter, number>;

    /**
     * For a category with a workflow (Channel): assets matching every filter except the
     * status, all and per status. Null for other categories.
     */
    statusCounts: Record<LibraryStatusFilter, number> | null;
}
