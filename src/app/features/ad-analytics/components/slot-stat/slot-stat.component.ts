/** Angular Imports */
import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Local Imports */
import type { AdVenueSlot } from '@shared/interfaces/ad-analytics';

/**
 * "12 / 1": how many playlist slots have a playlist content ID / how many have none
 * recorded. Sits at the right end of a slot column's title.
 *
 * @example
 * <app-slot-stat [slots]="venueSlots()" />
 */
@Component({
    selector: 'app-slot-stat',
    imports: [DecimalPipe],
    templateUrl: './slot-stat.component.html',
    styleUrl: './slot-stat.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class SlotStatComponent {
    /**
     * The slots to count
     * @type {InputSignal<readonly AdVenueSlot[]>}
     */
    public readonly slots = input.required<readonly AdVenueSlot[]>();

    /**
     * Slots that have a playlist content ID
     * @type {Signal<number>}
     */
    protected readonly withId = computed(
        (): number => this.slots().filter((slot) => !!slot.slotPlaylistContentId).length,
    );

    /**
     * Slots with none recorded
     * @type {Signal<number>}
     */
    protected readonly withoutId = computed((): number => this.slots().length - this.withId());
}
