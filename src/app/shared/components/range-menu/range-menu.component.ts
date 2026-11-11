/** Angular Imports */
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    input,
    signal,
    viewChild,
} from '@angular/core';

/** Third Party Imports */
import { Popover } from '@ntv360/component-pantry';

/** Local Imports */
import type { DashboardRangeOption } from '@shared/interfaces/dashboard/dashboard-range-option.interface';
import type { DashboardRangePreset } from '@shared/models/dashboard/dashboard-range-preset.type';
import { DashboardRangeService } from '@shared/services/dashboard/dashboard-range.service';

/**
 * Button and menu for the Dashboard totals' date range (DashboardRangeService): the
 * button shows the selected quick range and its dates; the menu lists every quick range
 * ("Custom" shows a range picked in the date picker, read-only).
 *
 * @example
 * <app-range-menu />
 * <app-range-menu [compact]="true" placement="bottom-start" />
 * <app-range-menu [allowAllTime]="true" />
 */
@Component({
    selector: 'app-range-menu',
    imports: [Popover],
    templateUrl: './range-menu.component.html',
    styleUrl: './range-menu.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class RangeMenuComponent {
    /**
     * Smaller button (32px, smaller text), e.g. in the top bar
     * @type {InputSignal<boolean>}
     */
    public readonly compact = input(false);

    /**
     * Where the menu opens relative to the button
     * @type {InputSignal<'bottom-end' | 'bottom-start'>}
     */
    public readonly placement = input<'bottom-end' | 'bottom-start'>('bottom-end');

    /**
     * Whether to list "All time" (every record) - only on pages that can show it, not the
     * Dashboard
     * @type {InputSignal<boolean>}
     */
    public readonly allowAllTime = input(false);

    /**
     * The shared range
     * @type {DashboardRangeService}
     */
    private readonly injectedRange = inject(DashboardRangeService);

    /**
     * Which range this menu controls; null for the one from the injector (the
     * app-wide range shared by the pages)
     * @type {InputSignal<DashboardRangeService | null>}
     */
    public readonly source = input<DashboardRangeService | null>(null);

    /**
     * The range this menu shows and changes
     * @type {Signal<DashboardRangeService>}
     */
    protected readonly rangeService = computed(() => this.source() ?? this.injectedRange);

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
     * The menu's entries ("All time" left out where it isn't allowed)
     * @type {Signal<DashboardRangeOption[]>}
     */
    protected readonly options = computed((): DashboardRangeOption[] =>
        this.rangeService()
            .options()
            .filter((option) => option.value !== 'allTime' || this.allowAllTime()),
    );

    /**
     * Applies a picked quick range ("Custom" only shows the picked range).
     *
     * @param value - The picked entry
     * @returns {void}
     */
    protected select(value: DashboardRangePreset): void {
        this.menu().hide();
        if (value === 'allTime') {
            this.rangeService().applyAllTime();
        } else if (value !== 'custom') {
            this.rangeService().applyPreset(value);
        }
    }
}
