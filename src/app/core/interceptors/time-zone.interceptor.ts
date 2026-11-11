/** Angular Imports */
import type { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

/** Local Imports */
import { TimeDisplayService } from '@shared/services/time-display';

/**
 * Appends the active display timezone (`timeZone=America/New_York` or
 * `timeZone=UTC`) to every outgoing `/api/*` request.
 *
 * @remarks
 * This is the single integration point for the "Eastern Time / UTC" toggle's
 * query-boundary shift: every BFF date-range endpoint already receives a
 * bare "YYYY-MM-DD" `startDate`/`endDate` (there are 20+ call sites across
 * MediaFilesService and DashboardSummaryService) - rather than touching each
 * one, this interceptor adds the one new piece of information the BFF needs
 * to interpret that calendar date in the right zone (see
 * `toZonedDateBoundary` server-side). Pages/services that build date params
 * don't need to change at all.
 */
export const timeZoneInterceptor: HttpInterceptorFn = (req, next) => {
    if (!req.url.startsWith('/api/')) {
        return next(req);
    }

    const timeDisplayService = inject(TimeDisplayService);

    return next(req.clone({ setParams: { timeZone: timeDisplayService.zoneId() } }));
};
