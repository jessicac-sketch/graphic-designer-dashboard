/**
 * A recent comment, with the asset it's on.
 */
export interface LibraryRecentComment {
    /** Comment ID */
    id: string;

    /** The asset */
    assetId: string;

    /** The asset's title */
    assetTitle: string;

    /** Who wrote it (email) */
    author: string;

    /** The text */
    body: string;

    /** When it was written, as a UTC ISO timestamp */
    createdAt: string;

    /** Whether it's a reply */
    isReply: boolean;
}
