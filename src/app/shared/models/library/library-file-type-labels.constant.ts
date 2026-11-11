/** Local Imports */
import type { LibraryFileType } from './library-file-type.type';

/**
 * How each file format is named in an asset's details, e.g. "PNG image".
 */
export const LIBRARY_FILE_TYPE_LABELS: Readonly<Record<LibraryFileType, string>> = {
    png: 'PNG image',
    jpg: 'JPG image',
    mp4: 'MP4 video',
};
