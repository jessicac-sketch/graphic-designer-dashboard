/** Local Imports */
import type { LibraryFileType } from '@shared/models/library/library-file-type.type';

/**
 * One uploaded file to add to the Mini-Library.
 */
export interface LibraryNewAsset {
    /** Asset title */
    title: string;

    /** File format */
    fileType: LibraryFileType;

    /** Uploaded file URL: https://cdn.filestackcontent.com/<handle> */
    url: string;

    /** File size in bytes, or null when unknown */
    size: number | null;
}
