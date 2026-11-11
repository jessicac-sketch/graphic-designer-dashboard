/** Local Imports */
import type { SelectOption } from '@shared/interfaces/ui/select-option.interface';

import type { DashboardBreakdownView } from './dashboard-breakdown-view.type';

/**
 * Choices for the Dashboard's breakdown switcher, in display order.
 */
export const DASHBOARD_BREAKDOWN_VIEW_OPTIONS: readonly SelectOption<DashboardBreakdownView>[] = [
    { value: 'states', label: 'States' },
    { value: 'categories', label: 'Category' },
    { value: 'venues', label: 'Venue' },
    { value: 'ads', label: 'Ads' },
];
