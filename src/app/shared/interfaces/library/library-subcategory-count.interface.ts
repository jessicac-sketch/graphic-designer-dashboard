/** Local Imports */
import type { LibraryCount } from './library-count.interface';

/**
 * A subcategory (e.g. a channel such as Extreme Sports) with its asset count and its
 * topics' counts.
 */
export interface LibrarySubcategoryCount extends LibraryCount {
    /** What this subcategory's topics are called, e.g. "Sport"; null without any */
    topicLabel: string | null;

    /** Topics, in display order (empty when the subcategory isn't split) */
    topics: LibraryCount[];
}
