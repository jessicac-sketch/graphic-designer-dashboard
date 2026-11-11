/** Angular Imports */
import { computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';

/** Third Party Imports */
import { catchError, type Observable, of, switchMap, tap } from 'rxjs';

/** Local Imports */
import type { DashboardRange } from '@shared/interfaces/dashboard/dashboard-range.interface';
import type { DashboardSection } from '@shared/interfaces/dashboard/dashboard-section.interface';
import { TimeDisplayService } from '@shared/services/time-display';

/**
 * Loads one part of the Dashboard for a range signal (call in an injection context). It
 * reloads whenever the range changes, the "Eastern Time / UTC" display mode changes, or
 * `reload()` is called, and a newer request cancels an older, still-running one. While
 * reloading, the previous data stays in `data` (pages dim it); a failed load clears it, so
 * numbers from another range are never shown under the new range's label.
 *
 * @remarks
 * The mode is included as its own reactive key, separate from `range()` - a quick range
 * like "Yesterday" can resolve to the exact same calendar-date label in both zones for
 * most of the day (they only disagree for the ~4-5 hours after UTC midnight before
 * Eastern's own midnight), but the two zones still mean genuinely different UTC instant
 * windows underneath that label (resolve-date-zone.middleware.ts). Keying only on `range()`
 * would silently skip the refetch whenever the label happens to match, leaving the old
 * zone's numbers on screen.
 *
 * @param name - Which section, for the error log
 * @param range - The range to load for (null = all time, where the request supports it)
 * @param request - Fetches the section for a range
 * @returns {DashboardSection<T>} The section's signals and its `reload`
 */
export function loadDashboardSection<T, R extends DashboardRange | null = DashboardRange>(
    name: string,
    range: () => R,
    request: (range: R) => Observable<T>,
): DashboardSection<T> {
    const timeDisplayService = inject(TimeDisplayService);
    const data = signal<T | null>(null);
    const isLoading = signal(true);
    const hasError = signal(false);
    const reloads = signal(0);

    toObservable(
        computed(() => ({
            range: range(),
            timeDisplayMode: timeDisplayService.mode(),
            reloads: reloads(),
        })),
    )
        .pipe(
            tap(() => {
                isLoading.set(true);
                hasError.set(false);
            }),
            switchMap(({ range: current }) =>
                request(current).pipe(
                    catchError((error: unknown) => {
                        console.error(`[Dashboard] Failed to load ${name}:`, error);
                        return of(null);
                    }),
                ),
            ),
            takeUntilDestroyed(),
        )
        .subscribe((result) => {
            isLoading.set(false);
            data.set(result);
            hasError.set(result === null);
        });

    return {
        data,
        isLoading,
        hasError,
        reload: () => reloads.update((count) => count + 1),
    };
}
