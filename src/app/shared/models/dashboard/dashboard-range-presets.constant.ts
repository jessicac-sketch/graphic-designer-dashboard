/** Local Imports */
import type { DashboardRangePresetSpec } from '@shared/interfaces/dashboard/dashboard-range-preset-spec.interface';

/**
 * The Dashboard's quick ranges, in dropdown order. Their dates are worked out in
 * DashboardComponent.presetRange().
 */
export const DASHBOARD_RANGE_PRESETS: readonly DashboardRangePresetSpec[] = [
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'today', label: 'Today' },
    { value: 'last7', label: 'Last 7 days' },
    { value: 'last14', label: 'Last 14 days' },
    { value: 'last21', label: 'Last 3 weeks' },
    { value: 'thisMonth', label: 'This month' },
    { value: 'lastMonth', label: 'Last month' },
];
