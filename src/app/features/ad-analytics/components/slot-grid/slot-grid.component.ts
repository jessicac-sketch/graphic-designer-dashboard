/** Angular Imports */
import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

/** Local Imports */
import type { AdSlotTile, AdVenueSlot } from '@shared/interfaces/ad-analytics';
import { TimeDisplayService } from '@shared/services/time-display';
import { formatShare } from '@shared/utils/format-share.util';
import { truncateMiddle } from '@shared/utils/truncate-middle.util';

/**
 * A grid of playlist slots: one card per slot (slot playlist content ID + position) with
 * the newest screenshot, the slot position, how many plays it got, its share of all the
 * plays shown, and when it last played. Shown in the order given (ascending by position).
 *
 * @remarks
 * Playlist content IDs are UUIDs, so they're shortened in the middle ("bfa008a6...56a0b")
 * with the full ID on hover. A slot with no reported position / content ID (older plays)
 * shows "--" / "No slot data".
 *
 * @example
 * <app-slot-grid [slots]="venueSlots()" emptyText="No plays found for this venue." />
 */
@Component({
    selector: 'app-slot-grid',
    imports: [DecimalPipe],
    templateUrl: './slot-grid.component.html',
    styleUrl: './slot-grid.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class SlotGridComponent {
    /**
     * Time zone for the "last played" times (Eastern or UTC, as chosen app-wide)
     * @type {TimeDisplayService}
     */
    private readonly timeDisplayService = inject(TimeDisplayService);

    /**
     * The slots to draw, in display order
     * @type {InputSignal<readonly AdVenueSlot[]>}
     */
    public readonly slots = input.required<readonly AdVenueSlot[]>();

    /**
     * Message shown when there are no slots
     * @type {InputSignal<string>}
     */
    public readonly emptyText = input('No plays found.');

    /**
     * All the plays across the slots - the total each slot's share is taken against
     * @type {Signal<number>}
     */
    private readonly totalPlays = computed((): number =>
        this.slots().reduce((sum, slot) => sum + slot.plays, 0),
    );

    /**
     * The slots as ready-to-draw tiles
     * @type {Signal<AdSlotTile[]>}
     */
    protected readonly tiles = computed((): AdSlotTile[] => {
        const total = this.totalPlays();

        return this.slots().map((slot) => ({
            key: `${slot.slotPlaylistContentId ?? ''}|${slot.slotPosition ?? ''}`,
            position: slot.slotPosition ?? '--',
            // Older plays carry neither field, some only one of them - say which is missing
            contentIdLabel: slot.slotPlaylistContentId
                ? truncateMiddle(slot.slotPlaylistContentId, 8, 5)
                : slot.slotPosition
                  ? 'No playlist content ID'
                  : 'No slot data',
            contentId: slot.slotPlaylistContentId ?? '',
            plays: slot.plays,
            share: formatShare(slot.plays, total),
            latest: this.timeDisplayService.formatTimestamp(slot.latestPlayed),
            screenshot: slot.latestScreenshot,
        }));
    });
}
