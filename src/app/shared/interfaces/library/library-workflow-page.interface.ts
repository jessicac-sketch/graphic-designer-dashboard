/** Local Imports */
import type { LibraryCategoryId } from '@shared/models/library/library-category-id.type';

/**
 * What a workflow page (Channel, Sponsorship) shows: which library category, and its wording.
 */
export interface LibraryWorkflowPage {
    /** The library category whose assets the page lists, e.g. "sponsorship" */
    categoryId: LibraryCategoryId;
    /** Page title and the category's name, e.g. "Sponsorship" */
    title: string;
    /** Line under the title */
    subtitle: string;
    /** The category in a sentence, lowercase, e.g. "sponsorship" ("sponsorship content") */
    noun: string;
    /** The upload button's text, e.g. "Add sponsorship content" */
    addLabel: string;
    /** Font Awesome icon (no prefix) of the subcategory filter's entries, e.g. "tv" */
    subcategoryIcon: string;
}
