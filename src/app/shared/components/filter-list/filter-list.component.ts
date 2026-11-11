/** Angular Imports */
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    input,
    linkedSignal,
    output,
} from '@angular/core';

/** Local Imports */
import type { FilterOption } from '@shared/interfaces/ui/filter-option.interface';

/**
 * A labelled, collapsible list of filter choices with counts, one active at a time
 * (e.g. creative type on the Ads Gallery). Copied from gbp-management-tool-ui.
 *
 * @remarks
 * The heading expands and collapses the list. Collapsed, it still shows the active
 * choice when it isn't the first ("All …") option, so a filter in use stays visible.
 *
 * @template T - Type of the filter value
 *
 * @example
 * <app-filter-list label="Connection" [options]="options()" [value]="filter()"
 *     (valueChange)="filter.set($event)" />
 * <app-filter-list label="Franchisee" [collapsed]="true" … />
 */
@Component({
    selector: 'app-filter-list',
    templateUrl: './filter-list.component.html',
    styleUrl: './filter-list.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class FilterListComponent<T extends string> {
    /**
     * Heading above the list
     * @type {InputSignal<string>}
     */
    public readonly label = input.required<string>();

    /**
     * Choices, in display order (the first one means "no filter")
     * @type {InputSignal<readonly FilterOption<T>[]>}
     */
    public readonly options = input.required<readonly FilterOption<T>[]>();

    /**
     * The selected value
     * @type {InputSignal<T | undefined>}
     */
    public readonly value = input<T>();

    /**
     * Whether the list starts collapsed
     * @type {InputSignal<boolean>}
     */
    public readonly collapsed = input(false);

    /**
     * Emits the value the user picks
     * @type {OutputEmitterRef<T>}
     */
    public readonly valueChange = output<T>();

    /**
     * Whether the list is open (starts from `collapsed`, then follows the toggle)
     * @type {WritableSignal<boolean>}
     */
    protected readonly isOpen = linkedSignal(() => !this.collapsed());

    /**
     * The active choice when it is a real filter (not the first option), for the
     * collapsed heading
     * @type {Signal<FilterOption<T> | null>}
     */
    protected readonly activeFilter = computed(() => {
        const [first, ...rest] = this.options();
        return first?.value === this.value()
            ? null
            : (rest.find((option) => option.value === this.value()) ?? null);
    });
}
