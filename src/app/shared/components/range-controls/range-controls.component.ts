/** Angular Imports */
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';

/** Third Party Imports */
import { DateRangePicker } from '@ntv360/component-pantry';

/** Local Imports */
import { DashboardRangeService } from '@shared/services/dashboard/dashboard-range.service';
import { RangeMenuComponent } from '../range-menu/range-menu.component';

/**
 * A page's date range controls, for the shared range (DashboardRangeService): the quick
 * range menu and a date-range picker for any other range (clamped to the limit; clearing
 * it goes back to yesterday). Used in the page header of the Dashboard and Ranking Data.
 *
 * @example
 * <app-page-header title="Ranking Data"><app-range-controls [disabled]="isLoading()" /></app-page-header>
 */
@Component({
    selector: 'app-range-controls',
    imports: [DateRangePicker, RangeMenuComponent],
    templateUrl: './range-controls.component.html',
    styleUrl: './range-controls.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class RangeControlsComponent {
    /**
     * Blocks the picker (e.g. while the range's data loads); the picker has no
     * `disabled` input of its own
     * @type {InputSignal<boolean>}
     */
    public readonly disabled = input(false);

    /**
     * Whether the range menu lists "All time" (pages that can show every record)
     * @type {InputSignal<boolean>}
     */
    public readonly allowAllTime = input(false);

    /**
     * The shared range
     * @type {DashboardRangeService}
     */
    protected readonly rangeService = inject(DashboardRangeService);
}
