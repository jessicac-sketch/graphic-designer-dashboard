/** Local Imports */
import type { LibraryStatusInfo } from '@shared/interfaces/library/library-status-info.interface';

/**
 * The Channel workflow's statuses, in order, with how each is shown.
 */
export const LIBRARY_STATUSES: readonly LibraryStatusInfo[] = [
    {
        value: 'review',
        label: 'Review',
        description: 'Waiting for Graphics QC',
        icon: 'magnifying-glass',
    },
    {
        value: 'approval',
        label: 'Approval',
        description: 'Waiting for upper management',
        icon: 'user-check',
    },
    {
        value: 'ready',
        label: 'Ready',
        description: 'Approved, waiting to be uploaded to the dashboard',
        icon: 'cloud-arrow-up',
    },
    {
        value: 'live',
        label: 'Live',
        description: 'In the dashboard now',
        icon: 'signal-stream',
    },
];
