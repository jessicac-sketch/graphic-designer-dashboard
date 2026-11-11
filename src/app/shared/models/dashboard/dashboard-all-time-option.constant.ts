/** Local Imports */
import type { DashboardRangeOption } from '@shared/interfaces/dashboard/dashboard-range-option.interface';

/**
 * The range menu's "All time" entry (every record, no range) - listed only by menus on
 * pages that support it.
 */
export const DASHBOARD_ALL_TIME_OPTION: DashboardRangeOption = {
    value: 'allTime',
    label: 'All time',
    dates: 'Every record',
};
