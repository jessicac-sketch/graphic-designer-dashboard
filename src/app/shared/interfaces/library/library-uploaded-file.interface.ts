/** Local Imports */
import type { LibraryFileType } from '@shared/models/library/library-file-type.type';

/**
 * A file that finished uploading to Filestack and waits to be saved to the Mini-Library.
 */
export interface LibraryUploadedFile {
    /** The uploader's queue ID */
    id: string;

    /** Title: the file name without its extension, as renamed in the uploader */
    name: string;

    /** File format */
    fileType: LibraryFileType;

    /** Uploaded file URL (Filestack CDN) */
    url: string;

    /** File size in bytes, or null when unknown */
    size: number | null;
}
