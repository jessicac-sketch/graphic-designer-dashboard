/** Local Imports */
import type { SelectOption } from '@shared/interfaces/ui/select-option.interface';

import type { LibrarySort } from './library-sort.type';

/**
 * Sort choices for the Mini-Library, in display order.
 */
export const LIBRARY_SORT_OPTIONS: readonly SelectOption<LibrarySort>[] = [
    { value: 'updated', label: 'Updated' },
    { value: 'title', label: 'Title' },
];
