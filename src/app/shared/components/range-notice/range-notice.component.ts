/** Angular Imports */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

/** Local Imports */
import { DashboardRangeService } from '@shared/services/dashboard/dashboard-range.service';

/**
 * Warning box shown when a picked range was shortened to the limit (DashboardRangeService
 * `notice`), with a dismiss button. Renders nothing otherwise.
 *
 * @example
 * <app-range-notice />
 */
@Component({
    selector: 'app-range-notice',
    templateUrl: './range-notice.component.html',
    styleUrl: './range-notice.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class RangeNoticeComponent {
    /**
     * The shared range, holding the notice
     * @type {DashboardRangeService}
     */
    protected readonly rangeService = inject(DashboardRangeService);
}
