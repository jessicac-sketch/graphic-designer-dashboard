/** Local Imports */
import type { LibraryFileType } from '@shared/models/library/library-file-type.type';
import type { LibraryContributor } from './library-contributor.interface';
import type { LibraryCount } from './library-count.interface';
import type { LibraryDashboardTotals } from './library-dashboard-totals.interface';
import type { LibraryRecentComment } from './library-recent-comment.interface';
import type { LibraryRecentUpload } from './library-recent-upload.interface';
import type { LibraryWaitingAsset } from './library-waiting-asset.interface';
import type { LibraryWeekCount } from './library-week-count.interface';
import type { LibraryWorkflowSummary } from './library-workflow-summary.interface';

/**
 * Everything the Dashboard shows (GET /api/library/dashboard).
 */
export interface LibraryDashboard {
    /** Headline numbers */
    totals: LibraryDashboardTotals;

    /** Per workflow category, assets per status */
    workflow: LibraryWorkflowSummary[];

    /** Assets per category, in taxonomy order */
    categories: LibraryCount[];

    /** Assets per file format */
    fileTypes: Record<LibraryFileType, number>;

    /** Assets added per week (12 weeks), oldest first, the current week last */
    weeklyUploads: LibraryWeekCount[];

    /** Workflow assets waiting longest in Review or Approval, oldest first */
    waitingLongest: LibraryWaitingAsset[];

    /** Latest uploads, newest first */
    recentUploads: LibraryRecentUpload[];

    /** Latest comments, newest first */
    recentComments: LibraryRecentComment[];

    /** Who added the most assets in the last 30 days, most first (at most 5) */
    contributors: LibraryContributor[];
}
