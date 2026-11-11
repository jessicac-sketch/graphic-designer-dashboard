/** Local Imports */
import type { SelectOption } from '@shared/interfaces/ui/select-option.interface';

import type { DashboardVenueSort } from './dashboard-venue-sort.type';

/**
 * Sort choices for the Dashboard's Venue breakdown, in display order.
 */
export const DASHBOARD_VENUE_SORT_OPTIONS: readonly SelectOption<DashboardVenueSort>[] = [
    { value: 'received', label: 'Received' },
    { value: 'ads', label: 'Ads' },
    { value: 'slots', label: 'Slots' },
];
