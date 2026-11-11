/** Local Imports */
import type { SelectOption } from '@shared/interfaces/ui/select-option.interface';

import type { DashboardStateSort } from './dashboard-state-sort.type';

/**
 * Sort choices for the Dashboard's States list, in display order.
 */
export const DASHBOARD_STATE_SORT_OPTIONS: readonly SelectOption<DashboardStateSort>[] = [
    { value: 'received', label: 'Received' },
    { value: 'venues', label: 'Venues' },
    { value: 'ads', label: 'Ads' },
];
