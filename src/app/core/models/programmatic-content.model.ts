/**
 * Programmatic content data model.
 *
 * @remarks
 * Represents a programmatic advertising content item.
 * This interface matches the structure expected by Angular components.
 * Maps from the BFF layer's ProgrammaticContent interface.
 */
export interface ProgrammaticContent extends Record<string, unknown> {
    /** Unique content identifier (UUID) */
    contentId: string;

    /** Creative identifier */
    creativeId: string;

    /** Creative group identifier */
    creativeGroupId: string;

    /** Content title/name */
    title: string;

    /** Thumbnail image URL */
    thumbnail: string;

    /** Creative asset URL */
    creativeUrl: string;

    /** Type of creative (video or image) */
    creativeType: 'video' | 'image';

    /** Location where content was played */
    location: string;

    /** Last time content was played */
    lastPlayTime: string;

    /** Timestamp when ad was actually played (null if not yet played) */
    playedAt: string | null;

    /** Number of times content was played */
    plays: number;

    /** Total duration played in seconds (computed from play_count * duration) */
    totalDurationPlayed?: number;

    /** Source of the content */
    source: 'Vistar' | 'Place Exchange' | 'Video Elephant' | 'Internal';

    /** Date and time content was fetched */
    fetchedDate: string;

    /** Revenue generated (optional) */
    revenue?: number;

    /** Duration in seconds (optional) */
    duration?: number;

    /** Programmatic configuration ID */
    programmaticId: string;

    /** Vendor identification key */
    vendorKey: string;

    /** Device identifier where ad was played */
    deviceId?: string | null;

    /** Proof of play sent timestamp */
    proofOfPlaySent?: string | null;
}
