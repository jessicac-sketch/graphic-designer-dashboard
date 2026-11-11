/** Local Imports */
import type { LibraryCount } from '@shared/interfaces/library/library-count.interface';
import type { FilterOption } from '@shared/interfaces/ui/filter-option.interface';

/**
 * Turns Mini-Library taxonomy entries (categories, subcategories or topics) into filter
 * choices with their counts.
 *
 * @param entries - Taxonomy entries, in display order
 * @param icon - Font Awesome icon (no `fa-` prefix) shown on every choice
 * @returns {FilterOption<string>[]} One choice per entry, in the same order
 *
 * @example
 * const options = toLibraryFilterOptions(category.subcategories, 'folder');
 */
export function toLibraryFilterOptions(
    entries: readonly LibraryCount[],
    icon: string,
): FilterOption<string>[] {
    return entries.map((entry) => ({
        value: entry.id,
        label: entry.label,
        icon,
        count: entry.count,
    }));
}
