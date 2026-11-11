/** Local Imports */
import type { LibraryStatusFilter } from '@shared/models/library/library-status-filter.type';

import type { LibraryStatusInfo } from './library-status-info.interface';

/**
 * A status tile on the Channel page: a status (or all) with how many assets have it.
 */
export interface LibraryStatusTile extends Omit<LibraryStatusInfo, 'value'> {
    /** The status filter the tile applies */
    value: LibraryStatusFilter;

    /** Matching assets */
    count: number;
}
