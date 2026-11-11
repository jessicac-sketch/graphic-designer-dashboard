/** Local Imports */
import type { LibraryFileTypeFilter } from './library-file-type-filter.type';

/**
 * Font Awesome icon (no `fa-` prefix) for each entry of the file-format filter.
 */
export const LIBRARY_FILE_TYPE_ICONS: Readonly<Record<LibraryFileTypeFilter, string>> = {
    all: 'layer-group',
    png: 'file-image',
    jpg: 'file-image',
    mp4: 'file-video',
};
