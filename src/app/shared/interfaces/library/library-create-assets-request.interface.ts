/** Local Imports */
import type { LibraryCategoryId } from '@shared/models/library/library-category-id.type';

import type { LibraryNewAsset } from './library-new-asset.interface';

/**
 * Uploaded files to file under one category / subcategory / topic.
 */
export interface LibraryCreateAssetsRequest {
    /** Category to file the assets under */
    categoryId: LibraryCategoryId;

    /** Subcategory (required when the category has subcategories), or null */
    subcategoryId: string | null;

    /** Topic (required when the subcategory has topics), or null */
    topicId: string | null;

    /** The files, at least one */
    assets: LibraryNewAsset[];

    /** Tags for every file in the batch (may be empty) */
    tags: string[];
}
