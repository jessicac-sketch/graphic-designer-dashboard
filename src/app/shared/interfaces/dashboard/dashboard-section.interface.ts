/** Angular Imports */
import type { Signal } from '@angular/core';

/**
 * One independently loaded part of the Dashboard (overview, geography or ads): its data,
 * whether it is loading, whether its last load failed, and a way to try again.
 */
export interface DashboardSection<T> {
    /** The loaded data, or null until the first load succeeds (and after a failed load) */
    data: Signal<T | null>;

    /** True while this section is loading (the previous data, if any, is still in `data`) */
    isLoading: Signal<boolean>;

    /** True when the last load failed - `data` is then null */
    hasError: Signal<boolean>;

    /** Loads this section again for the current range */
    reload: () => void;
}
