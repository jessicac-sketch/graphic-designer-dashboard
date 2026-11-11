/** Local Imports */
import type { SelectOption } from '@shared/interfaces/ui/select-option.interface';

import type { LibraryView } from './library-view.type';

/**
 * Layout choices for the Mini-Library, in display order.
 */
export const LIBRARY_VIEW_OPTIONS: readonly SelectOption<LibraryView>[] = [
    { value: 'grid', label: 'Grid' },
    { value: 'list', label: 'List' },
];
