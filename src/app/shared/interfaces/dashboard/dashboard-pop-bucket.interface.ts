/** Local Imports */
import type { PopDurationBucket } from '@shared/utils/pop-duration.util';

/**
 * One proof-of-play duration bucket's count, shown beside the Dashboard's Received tile.
 */
export interface DashboardPopBucket {
    /** Bucket (green / yellow / red) - drives the swatch color */
    bucket: PopDurationBucket;

    /** Short range label under the count, e.g. "1-5 min" */
    label: string;

    /** Number of received playables in this bucket */
    value: number;
}
