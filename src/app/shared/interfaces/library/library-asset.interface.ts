/** Local Imports */
import type { LibraryAssetStatus } from '@shared/models/library/library-asset-status.type';
import type { LibraryCategoryId } from '@shared/models/library/library-category-id.type';
import type { LibraryFileType } from '@shared/models/library/library-file-type.type';

/**
 * One creative asset in the Mini-Library.
 */
export interface LibraryAsset {
    /** Asset identifier */
    id: string;

    /** Asset title */
    title: string;

    /** Category the asset is filed under */
    categoryId: LibraryCategoryId;

    /** Subcategory within the category, or null when the category isn't split */
    subcategoryId: string | null;

    /** Topic within the subcategory, or null when the subcategory isn't split */
    topicId: string | null;

    /** Where the asset sits, as labels: e.g. [subcategory, topic], or [category] */
    path: string[];

    /** File format */
    fileType: LibraryFileType;

    /** Version number, starting at 1 */
    version: number;

    /** Last update, as a UTC ISO timestamp */
    updatedAt: string;

    /** Preview image URL */
    thumbnailUrl: string;

    /** The uploaded file (Filestack CDN URL) */
    fileUrl: string;

    /** Tags for search, e.g. ["Buyer", "dog lover"] (may be empty) */
    tags: string[];

    /** Workflow status (Channel and Sponsorship assets), or null for categories without a workflow */
    status: LibraryAssetStatus | null;

    /** When the status last changed (UTC ISO timestamp), or null */
    statusUpdatedAt: string | null;

    /** Free-text description (may be empty) */
    description: string;

    /** File size in bytes, or null when unknown */
    fileSize: number | null;

    /** Who uploaded it (their email), or null when unknown */
    createdBy: string | null;

    /** When it was added to the library, as a UTC ISO timestamp */
    createdAt: string;
}
