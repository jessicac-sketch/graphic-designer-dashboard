/** Local Imports */
import type { SelectOption } from '@shared/interfaces/ui/select-option.interface';

import type { DashboardAdSort } from './dashboard-ad-sort.type';

/**
 * Sort choices for the Dashboard's Ads list, in display order.
 */
export const DASHBOARD_AD_SORT_OPTIONS: readonly SelectOption<DashboardAdSort>[] = [
    { value: 'received', label: 'Received' },
    { value: 'venues', label: 'Venues' },
    { value: 'states', label: 'States' },
];
