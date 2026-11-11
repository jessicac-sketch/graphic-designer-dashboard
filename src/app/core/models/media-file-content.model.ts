/**
 * Media file content data model.
 *
 * @remarks
 * Represents a media asset from the programmatic_media_files table.
 * This interface matches the structure expected by Angular components.
 * Maps from the BFF layer's MediaFileContent interface.
 */
export interface MediaFileContent extends Record<string, unknown> {
    /** Unique content identifier (UUID) */
    contentId: string;

    /** Creative identifier from the vendor */
    creativeId: string;

    /** Raw creative_source value, used as the FK join key against programmatic_ads */
    creativeSource: string;

    /** Content title/name */
    title: string;

    /** S3-hosted media asset URL (null if not yet converted) */
    mediaUrl: string | null;

    /** Type of creative (video or image) */
    creativeType: 'video' | 'image';

    /** Normalized source name for display only */
    source: 'Vistar' | 'Place Exchange' | 'Video Elephant' | 'Internal';

    /** Duration in seconds (optional) */
    duration?: number;

    /** Processing status of the media file */
    status: 'pending' | 'uploading' | 'processing' | 'ready' | 'failed';

    /** Whether the media has finished conversion */
    converted: boolean;

    /** Media width in pixels (optional) */
    width?: number;

    /** Media height in pixels (optional) */
    height?: number;

    /** MIME type of the media asset (optional) */
    mimeType?: string;

    /** Timestamp when the row was created */
    createdAt: string;

    /** Timestamp when the row was last updated */
    updatedAt: string;

    /** All-time play count - only set when the list is sorted by plays */
    playCount?: number;
}

/**
 * Media file detail data model, combining catalog data with aggregated
 * play metrics sourced from programmatic_ads.
 */
export interface MediaFileDetailContent extends MediaFileContent {
    /** Total number of play events for this creative */
    playCount: number;

    /** Total duration played in seconds (playCount * duration) */
    totalDurationPlayed: number;

    /** Most recent played timestamp, or null if never played */
    lastPlayed: string | null;
}
