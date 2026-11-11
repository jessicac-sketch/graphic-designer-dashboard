/** Local Imports */
import type { DashboardRangePreset } from './dashboard-range-preset.type';

/**
 * A quick range with actual dates - every preset except `allTime` (no range) and
 * `custom` (whatever was picked in the date picker).
 */
export type DashboardDatedPreset = Exclude<DashboardRangePreset, 'custom' | 'allTime'>;
