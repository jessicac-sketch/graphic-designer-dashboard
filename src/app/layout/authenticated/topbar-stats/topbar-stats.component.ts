/** Angular Imports */
import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, Injector } from '@angular/core';

/** Local Imports */
import { RangeMenuComponent } from '@shared/components/range-menu';
import type { DashboardJumpTarget } from '@shared/models/dashboard/dashboard-jump-target.type';
import { DashboardRangeService } from '@shared/services/dashboard/dashboard-range.service';
import { DashboardTotalsService } from '@shared/services/dashboard/dashboard-totals.service';
import { DashboardViewStateService } from '@shared/services/dashboard/dashboard-view-state.service';

/**
 * The Dashboard's totals in the middle of the top bar, on every page: its own range menu,
 * then Received, Venues, Categories, States and Unique ads for that range.
 *
 * @remarks
 * On the Dashboard the range is the Dashboard's own: this menu and the page's controls
 * change the same range and the same data. On other pages the top bar has its own range
 * (Yesterday by default, changed only from this menu; the component provides its own
 * DashboardRangeService and DashboardTotalsService), so pages don't change it. Hidden on phones, and on the
 * Dashboard while its own stat tiles are on screen (it appears once they scroll away).
 * With `showOnlyOnDashboard` on (the current setting), not shown on other pages at all.
 * On the Dashboard each number is a button that jumps to its breakdown
 * (DashboardViewStateService).
 */
@Component({
    selector: 'app-topbar-stats',
    imports: [DecimalPipe, RangeMenuComponent],
    templateUrl: './topbar-stats.component.html',
    styleUrl: './topbar-stats.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
    // Its own range and totals, for pages other than the Dashboard (created only when
    // used there - see `totals`)
    providers: [DashboardRangeService, DashboardTotalsService],
    host: {
        '[class.topbar-stats--hidden]': 'isHidden()',
        '[class.topbar-stats--off]': 'isOff()',
    },
})
export class TopbarStatsComponent {
    /**
     * Show the totals only on the Dashboard (once its tiles scroll away) - not on other
     * pages. Set to false to show them on every page again (the rest of the behaviour is
     * unchanged).
     * @type {boolean}
     */
    private static readonly showOnlyOnDashboard = true;

    /**
     * This component's injector: its own range / totals (providers) and, skipping them,
     * the app-wide ones the Dashboard uses - both looked up only when needed
     * @type {Injector}
     */
    private readonly injector = inject(Injector);

    /**
     * The Dashboard's open / tiles-on-screen state, and where jump requests go
     * @type {DashboardViewStateService}
     */
    protected readonly viewState = inject(DashboardViewStateService);

    /**
     * Hidden while the Dashboard's own tiles show the same numbers
     * @type {Signal<boolean>}
     */
    protected readonly isHidden = computed(() => this.viewState.tilesInView());

    /**
     * Whether either totals request is in flight (shows the spinner)
     * @type {Signal<boolean>}
     */
    protected readonly isLoading = computed(
        () => this.totals().overview.isLoading() || this.totals().geography.isLoading(),
    );

    /**
     * Not shown at all on this page (other pages, while showOnlyOnDashboard is on). Kept
     * mounted rather than removed, so the top bar's own range survives leaving and coming
     * back to the Dashboard.
     * @type {Signal<boolean>}
     */
    protected readonly isOff = computed(
        () => TopbarStatsComponent.showOnlyOnDashboard && !this.viewState.dashboardActive(),
    );

    /**
     * Whether to use the Dashboard's range and totals (the app-wide ones): on the
     * Dashboard - so this menu and the page's own controls are the same range, and the
     * numbers aren't loaded twice - and whenever this isn't shown. Elsewhere the top bar
     * has its own range, which pages don't change.
     * @type {Signal<boolean>}
     */
    private readonly usesDashboardRange = computed(
        () => this.viewState.dashboardActive() || this.isOff(),
    );

    /**
     * The range the menu controls and the numbers are for
     * @type {Signal<DashboardRangeService>}
     */
    protected readonly rangeSource = computed(() =>
        this.usesDashboardRange()
            ? this.injector.get(DashboardRangeService, undefined, { skipSelf: true })
            : this.injector.get(DashboardRangeService),
    );

    /**
     * The totals shown (for `rangeSource`)
     * @type {Signal<DashboardTotalsService>}
     */
    protected readonly totals = computed(() =>
        this.usesDashboardRange()
            ? this.injector.get(DashboardTotalsService, undefined, { skipSelf: true })
            : this.injector.get(DashboardTotalsService),
    );

    /**
     * The numbers shown, each with the Dashboard breakdown it jumps to
     * @type {Signal<{ target: DashboardJumpTarget; label: string; value: number | null; loading: boolean }[]>}
     */
    protected readonly stats = computed(() => {
        const overview = this.totals().overview;
        const geography = this.totals().geography;
        const ov = overview.data();
        const geo = geography.data();

        return [
            {
                target: 'received' as const,
                label: 'Received',
                value: ov?.received ?? null,
                loading: overview.isLoading(),
            },
            {
                target: 'venues' as const,
                label: 'Venues',
                value: ov?.uniqueVenues ?? null,
                loading: overview.isLoading(),
            },
            {
                target: 'categories' as const,
                label: 'Categories',
                value: geo?.uniqueCategories ?? null,
                loading: geography.isLoading(),
            },
            {
                target: 'states' as const,
                label: 'States',
                value: geo?.uniqueStates ?? null,
                loading: geography.isLoading(),
            },
            {
                target: 'ads' as const,
                label: 'Unique ads',
                value: ov?.uniqueAds ?? null,
                loading: overview.isLoading(),
            },
        ] satisfies {
            target: DashboardJumpTarget;
            label: string;
            value: number | null;
            loading: boolean;
        }[];
    });
}
