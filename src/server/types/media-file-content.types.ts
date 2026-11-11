/**
 * Frontend-facing interface for media file content.
 * Matches the structure expected by Angular components.
 *
 * @remarks
 * This interface is duplicated here for the BFF layer.
 * It should match src/app/core/models/media-file-content.model.ts
 */
export interface MediaFileContent {
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

    /** Normalized source name for display only - do not use for lookups/joins */
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
 * Frontend-facing interface for a media file's detail view, combining its
 * catalog data with aggregated play metrics from programmatic_ads.
 */
export interface MediaFileDetailContent extends MediaFileContent {
    /** Total number of play events for this creative */
    playCount: number;

    /** Total duration played in seconds (playCount * duration) */
    totalDurationPlayed: number;

    /** Most recent played timestamp, or null if never played */
    lastPlayed: string | null;
}
