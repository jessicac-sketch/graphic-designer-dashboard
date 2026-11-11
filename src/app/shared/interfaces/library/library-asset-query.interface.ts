/** Local Imports */
import type { LibraryAssetStatus } from '@shared/models/library/library-asset-status.type';
import type { LibraryCategoryId } from '@shared/models/library/library-category-id.type';
import type { LibraryFileType } from '@shared/models/library/library-file-type.type';
import type { LibrarySort } from '@shared/models/library/library-sort.type';
import type { SortDirection } from '@shared/models/ui/sort-direction.type';

/**
 * Filters and order for a Mini-Library asset listing.
 */
export interface LibraryAssetQuery {
    /** Only assets of this category */
    categoryId: LibraryCategoryId;

    /** Only assets of this subcategory, or null for any */
    subcategoryId: string | null;

    /** Only assets of this topic, or null for any */
    topicId: string | null;

    /** Title or path search, or empty for none */
    search: string;

    /** Only assets of this file format, or null for any */
    fileType: LibraryFileType | null;

    /** Only assets with this workflow status (Channel), or null/omitted for any */
    status?: LibraryAssetStatus | null;

    /** Order */
    sort: LibrarySort;

    /** Order direction */
    direction: SortDirection;
}
