/** Angular Imports */
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/** Local Imports */
import { SelectOption } from '@shared/interfaces/ui/select-option.interface';
import type { SortDirection } from '@shared/models/ui/sort-direction.type';

/**
 * Segmented sort control (40px tall, matching inputs and buttons): a sort icon, then one
 * equal-width button per option, one active at a time.
 *
 * With `direction` bound, the active option shows an arrow and clicking it again
 * reverses the direction; picking another option starts at `desc`. (Programmatic Reports
 * addition; without `direction` it behaves exactly like gbp's.)
 *
 * @template T - Type of the sort value
 *
 * @example
 * <app-sort-control label="Sort templates" [options]="sortOptions" [value]="sort()"
 *     (valueChange)="sort.set($event)" />
 * <app-sort-control [options]="sortOptions" [value]="sort()" (valueChange)="sort.set($event)"
 *     [direction]="dir()" (directionChange)="dir.set($event)" />
 */
@Component({
    selector: 'app-sort-control',
    templateUrl: './sort-control.component.html',
    styleUrl: './sort-control.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class SortControlComponent<T extends string> {
    /**
     * Accessible name of the control, e.g. "Sort templates" - also shown as the leading
     * icon's tooltip, so it should read sensibly there even when this isn't a sort (e.g.
     * "Show breakdown" for a view switcher built on this same control).
     * @type {InputSignal<string>}
     */
    public readonly label = input('Sort');

    /**
     * Leading icon (Font Awesome Sharp Regular name, no "fa-" prefix) - defaults to the
     * sort icon; pass a different one (e.g. "arrow-right-arrow-left") when this control is
     * reused for something other than sorting.
     * @type {InputSignal<string>}
     */
    public readonly icon = input('arrow-down-wide-short');

    /**
     * Sort choices, in display order
     * @type {InputSignal<readonly SelectOption<T>[]>}
     */
    public readonly options = input.required<readonly SelectOption<T>[]>();

    /**
     * The selected sort
     * @type {InputSignal<T | undefined>}
     */
    public readonly value = input<T>();

    /**
     * Emits the sort the user picks
     * @type {OutputEmitterRef<T>}
     */
    public readonly valueChange = output<T>();

    /**
     * Current direction, or null for a control without directions
     * @type {InputSignal<SortDirection | null>}
     */
    public readonly direction = input<SortDirection | null>(null);

    /**
     * Emits the new direction: reversed when the active option is clicked again, `desc`
     * when another option is picked
     * @type {OutputEmitterRef<SortDirection>}
     */
    public readonly directionChange = output<SortDirection>();

    /**
     * Picks an option, or reverses the direction when it's already active.
     *
     * @param option - The clicked option's value
     * @returns {void}
     */
    protected select(option: T): void {
        const direction = this.direction();
        if (option === this.value()) {
            if (direction) {
                this.directionChange.emit(direction === 'desc' ? 'asc' : 'desc');
            }
            return;
        }

        this.valueChange.emit(option);
        if (direction) {
            this.directionChange.emit('desc');
        }
    }
}
