/** Local Imports */
import type { SelectOption } from '@shared/interfaces/ui/select-option.interface';

import type { DashboardCategorySort } from './dashboard-category-sort.type';

/**
 * Sort choices for the Dashboard's Categories breakdown, in display order.
 */
export const DASHBOARD_CATEGORY_SORT_OPTIONS: readonly SelectOption<DashboardCategorySort>[] = [
    { value: 'received', label: 'Received' },
    { value: 'venues', label: 'Venues' },
    { value: 'ads', label: 'Ads' },
    { value: 'states', label: 'States' },
];
