/**
 * A playlist slot ready to draw as a tile in the slot grid.
 */
export interface AdSlotTile {
    /** Stable key: playlist content ID + position */
    key: string;

    /** Slot position to show, "--" when the plays reported none */
    position: string;

    /** Playlist content ID shortened in the middle for display, or "No slot data" */
    contentIdLabel: string;

    /** The full playlist content ID (shown on hover), or an empty string when there is none */
    contentId: string;

    /** Number of plays in this slot */
    plays: number;

    /** This slot's share of all the venue's plays of the ad, e.g. "4.3%" */
    share: string;

    /** Newest play in this slot, formatted in the chosen time zone ("--" when unknown) */
    latest: string;

    /** Newest screenshot of this slot, or null */
    screenshot: string | null;
}
