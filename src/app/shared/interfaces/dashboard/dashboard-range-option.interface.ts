/** Local Imports */
import type { DashboardRangePreset } from '@shared/models/dashboard/dashboard-range-preset.type';

/**
 * An entry in the Dashboard's range menu: a quick range (or "Custom") with its dates.
 */
export interface DashboardRangeOption {
    /** Preset value */
    value: DashboardRangePreset;

    /** Name, e.g. "Last 7 days" */
    label: string;

    /** The dates it covers, e.g. "Oct 5 – Oct 11, 2026" */
    dates: string;
}
