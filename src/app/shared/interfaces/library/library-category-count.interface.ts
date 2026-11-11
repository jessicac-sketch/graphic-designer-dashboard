/** Local Imports */
import type { LibraryCategoryId } from '@shared/models/library/library-category-id.type';

import type { LibraryCount } from './library-count.interface';
import type { LibrarySubcategoryCount } from './library-subcategory-count.interface';

/**
 * A Mini-Library category with its asset count and how it is split.
 */
export interface LibraryCategoryCount extends LibraryCount<LibraryCategoryId> {
    /** What the subcategories are called, e.g. "Channel"; null without any */
    subcategoryLabel: string | null;

    /** Subcategories, in display order (empty when the category isn't split) */
    subcategories: LibrarySubcategoryCount[];
}
