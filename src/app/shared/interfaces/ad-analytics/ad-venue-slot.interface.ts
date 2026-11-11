/**
 * One playlist slot of a venue, for a single ad (from GET /api/media-files/:id/venue-slots):
 * the ad's plays at that venue grouped by the slot the player reported.
 */
export interface AdVenueSlot {
    /** Playlist-ui-side content ID of the slot, or null for plays that didn't report one */
    slotPlaylistContentId: string | null;

    /** Position of the slot in the playlist as reported by the player, or null if not reported */
    slotPosition: string | null;

    /** Number of this ad's plays at the venue in this slot */
    plays: number;

    /** When the newest play in this slot happened (played, else fetched), ISO timestamp */
    latestPlayed: string | null;

    /** Proof-of-play screenshot of the newest play in this slot that has one, or null */
    latestScreenshot: string | null;
}
