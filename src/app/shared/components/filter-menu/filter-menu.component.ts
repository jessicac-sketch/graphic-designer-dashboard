/** Angular Imports */
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    input,
    output,
    signal,
    viewChild,
} from '@angular/core';

/** Third Party Imports */
import { Popover } from '@ntv360/component-pantry';

/** Local Imports */
import type { FilterOption } from '@shared/interfaces/ui/filter-option.interface';

/**
 * A compact filter for a toolbar: a 40px button showing the filter's name and the
 * selected choice, opening a menu of choices with counts (one active at a time). The
 * horizontal counterpart of `<app-filter-list>`, built like `<app-range-menu>`.
 *
 * @template T - Type of the filter value
 *
 * @example
 * <app-filter-menu label="File type" [options]="fileTypeOptions()" [value]="fileType()"
 *     (valueChange)="fileType.set($event)" />
 * <app-filter-menu label="Topic" [options]="[]" [disabled]="true" placeholder="Pick a sport" />
 */
@Component({
    selector: 'app-filter-menu',
    imports: [Popover],
    templateUrl: './filter-menu.component.html',
    styleUrl: './filter-menu.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class FilterMenuComponent<T extends string> {
    /**
     * Filter name shown before the selected choice, e.g. "Sport"
     * @type {InputSignal<string>}
     */
    public readonly label = input.required<string>();

    /**
     * Choices, in display order (the first one usually means "no filter")
     * @type {InputSignal<readonly FilterOption<T>[]>}
     */
    public readonly options = input.required<readonly FilterOption<T>[]>();

    /**
     * The selected value
     * @type {InputSignal<T | undefined>}
     */
    public readonly value = input<T>();

    /**
     * Shown instead of a choice when no option matches `value` (e.g. while disabled)
     * @type {InputSignal<string>}
     */
    public readonly placeholder = input('All');

    /**
     * Whether the button is inactive
     * @type {InputSignal<boolean>}
     */
    public readonly disabled = input(false);

    /**
     * Emits the value the user picks
     * @type {OutputEmitterRef<T>}
     */
    public readonly valueChange = output<T>();

    /**
     * The menu's popover, closed after a pick
     * @type {Signal<Popover>}
     */
    private readonly menu = viewChild.required<Popover>('menu');

    /**
     * Whether the menu is open (rotates the chevron)
     * @type {WritableSignal<boolean>}
     */
    protected readonly isOpen = signal(false);

    /**
     * The selected choice, or null when none matches
     * @type {Signal<FilterOption<T> | null>}
     */
    protected readonly selected = computed(
        () => this.options().find((option) => option.value === this.value()) ?? null,
    );

    /**
     * Whether a real filter is applied (anything but the first, "All", option) -
     * highlights the button so an active filter stays visible
     * @type {Signal<boolean>}
     */
    protected readonly isFiltering = computed(() => {
        const first = this.options()[0];
        return !!this.selected() && this.value() !== first?.value;
    });

    /**
     * Applies a picked choice and closes the menu.
     *
     * @param value - The picked choice
     * @returns {void}
     */
    protected select(value: T): void {
        this.menu().hide();
        this.valueChange.emit(value);
    }
}
