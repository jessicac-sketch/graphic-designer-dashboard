/** Local Imports */
import type { LibraryFileType } from '@shared/models/library/library-file-type.type';

/**
 * A recently added asset.
 */
export interface LibraryRecentUpload {
    /** Asset ID */
    id: string;

    /** Title */
    title: string;

    /** Where it's filed */
    location: string;

    /** File format */
    fileType: LibraryFileType;

    /** Preview image URL */
    thumbnailUrl: string;

    /** The file (for a video's first frame) */
    fileUrl: string;

    /** When it was added, as a UTC ISO timestamp */
    createdAt: string;

    /** Who added it (email), or null when unknown */
    createdBy: string | null;
}
