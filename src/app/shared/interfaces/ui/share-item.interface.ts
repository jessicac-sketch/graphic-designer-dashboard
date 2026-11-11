/**
 * A row in a share list (`<app-share-list>`): something counted, shown with its share
 * of a total (e.g. one ad's received playables out of all received).
 */
export interface ShareItem {
    /** Stable identifier */
    id: string;

    /** Display name */
    name: string;

    /** Full name shown on hover, when `name` is shortened (defaults to `name`) */
    fullName?: string;

    /** Optional second line under the name (e.g. "Austin, TX" or "12 venues") */
    caption?: string;

    /** The count the share is computed from */
    value: number;

    /** Replaces the "<value> <unit>" text under the percentage (e.g. "496 all / 11 uniq / 12 slot") */
    figure?: string;

    /** Optional thumbnail URL */
    imageUrl?: string | null;

    /** Whether the thumbnail is a video (rendered as a muted first frame) */
    isVideo?: boolean;

    /** Optional router link for the name */
    route?: string | null;
}
