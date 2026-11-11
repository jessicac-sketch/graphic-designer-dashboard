/** Local Imports */
import type { LibraryCategoryCount } from './library-category-count.interface';

/**
 * The Mini-Library's navigation tree with asset counts.
 */
export interface LibraryTaxonomy {
    /** Every category, in display order */
    categories: LibraryCategoryCount[];
}
