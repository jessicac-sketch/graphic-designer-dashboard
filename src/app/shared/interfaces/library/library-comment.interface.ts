/**
 * A comment on a Mini-Library asset. A top-level comment starts a thread and carries its
 * replies (one level deep); only a thread can be marked resolved.
 */
export interface LibraryComment {
    /** Comment identifier */
    id: string;

    /** The asset it is about */
    assetId: string;

    /** The comment it replies to, or null for a top-level comment */
    parentId: string | null;

    /** Who wrote it (their email) */
    author: string;

    /** The text */
    body: string;

    /** When it was written, as a UTC ISO timestamp */
    createdAt: string;

    /** When its thread was marked resolved (top-level only), or null */
    resolvedAt: string | null;

    /** Who marked it resolved, or null */
    resolvedBy: string | null;

    /** Replies, oldest first (always empty on a reply) */
    replies: LibraryComment[];
}
