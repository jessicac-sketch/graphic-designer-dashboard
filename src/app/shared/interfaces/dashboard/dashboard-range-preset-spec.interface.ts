/** Local Imports */
import type { DashboardDatedPreset } from '@shared/models/dashboard/dashboard-dated-preset.type';

/**
 * One quick range in the Dashboard's range dropdown (UTC days).
 */
export interface DashboardRangePresetSpec {
    /** Preset value */
    value: DashboardDatedPreset;

    /** Name shown in the dropdown */
    label: string;
}
