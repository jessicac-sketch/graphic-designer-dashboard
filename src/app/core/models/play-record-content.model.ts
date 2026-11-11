/**
 * Play record data model.
 *
 * @remarks
 * Represents a single play event from the programmatic_ads table.
 * Maps from the BFF layer's PlayRecordContent interface.
 */
export interface PlayRecordContent extends Record<string, unknown> {
    /** Unique play event identifier (UUID) */
    id: string;

    /** Creative identity copied from programmatic_ads */
    creativeId: string;
    creativeSource: string;
    creativeGroupId: string;
    programmaticId: string;

    /** Vendor delivery metadata */
    apiUrl: string;
    vendorKey: string;

    /** Delivery and playback data */
    venueId: string | null;
    deviceId: string | null;
    fetchedAt: string;
    served: boolean;
    dateServed: string | null;
    proofOfPlayData: string | null;
    played: string | null;
    proofOfPlaySent: string | null;
    popScreenshot: string | null;
    metadata: Record<string, unknown> | null;
    opensearchSaved: boolean | null;

    /** S3-hosted media asset URL for this creative, resolved from programmatic_media_files (optional) */
    mediaUrl?: string | null;

    /** Creative type for this creative, resolved from programmatic_media_files (optional) */
    creativeType?: 'video' | 'image';

    /**
     * Minutes between fetchedAt and proofOfPlaySent, computed by the database.
     * Only present when returned by the paginated Programmatic Ads listing (optional).
     */
    popDurationMinutes?: number | null;

    /**
     * Vendor tracking ID, extracted from metadata.trackerId (e.g.
     * "6aa85d6f802663679c62adf3") - not a top-level programmatic_ads column.
     */
    trackerId?: string | null;

    /**
     * Playlist-ui-side identifier for which slot this ad played from, as
     * reported by the player on proof-of-play. Null if the player didn't
     * send it (optional field, not always present).
     */
    slotPlaylistContentId: string | null;

    /**
     * Sequence/order number of the slot within the playlist, as reported by
     * the player on proof-of-play. Null if the player didn't send it
     * (optional field, not always present).
     */
    slotPlaylistContentPosition: string | null;
}
