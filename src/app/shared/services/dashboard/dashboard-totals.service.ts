/** Angular Imports */
import { inject, Injectable } from '@angular/core';

/** Third Party Imports */
import type { Observable } from 'rxjs';

/** Local Imports */
import type {
    DashboardGeography,
    DashboardOverview,
    DashboardRange,
    DashboardSection,
} from '@shared/interfaces/dashboard';
import { loadDashboardSection } from '@shared/utils/load-dashboard-section.util';
import { DashboardRangeService } from './dashboard-range.service';
import { DashboardSummaryService } from './dashboard-summary.service';

/**
 * The Dashboard's totals for a range (DashboardRangeService). The root instance serves
 * the Dashboard page (the range shared by the pages); the top bar's totals provide their
 * own instance, with their own range, so pages don't change them.
 *
 * @remarks
 * Two independent sections: `overview` (received, unique ads / venues / devices, POP
 * buckets, timeline) and `geography` (venues, states, categories - needs the Hosts API).
 * Each reloads when the range changes, cancels its older request, and keeps its previous
 * data while reloading; a failed load clears it.
 */
@Injectable({ providedIn: 'root' })
export class DashboardTotalsService {
    /**
     * The shared range
     * @type {DashboardRangeService}
     */
    private readonly rangeService = inject(DashboardRangeService);

    /**
     * BFF calls
     * @type {DashboardSummaryService}
     */
    private readonly summaryService = inject(DashboardSummaryService);

    /**
     * Headline totals, proof-of-play buckets and the received timeline
     * @type {DashboardSection<DashboardOverview>}
     */
    public readonly overview = this.loadSection('overview', (range) =>
        this.summaryService.getOverview(range),
    );

    /**
     * Venues, states and categories that received playables
     * @type {DashboardSection<DashboardGeography>}
     */
    public readonly geography = this.loadSection('geography', (range) =>
        this.summaryService.getGeography(range),
    );

    /**
     * Loads one section for the shared range: reloads when the range changes or
     * `reload()` is called; a newer request cancels an older one.
     *
     * @param name - Which section, for the error log
     * @param request - Fetches the section for a range
     * @returns {DashboardSection<T>} The section's signals and its `reload`
     */
    public loadSection<T>(
        name: string,
        request: (range: DashboardRange | null) => Observable<T>,
    ): DashboardSection<T> {
        // pageRange: null for "All time" (only the top bar's own range ever has it here -
        // the Dashboard leaves All time when it opens)
        return loadDashboardSection(name, this.rangeService.pageRange, request);
    }
}
