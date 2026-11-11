/**
 * Headline numbers of the Dashboard.
 */
export interface LibraryDashboardTotals {
    /** Assets in the library */
    assets: number;

    /** Assets added since Monday (UTC) */
    uploadsThisWeek: number;

    /** Assets added the week before */
    uploadsLastWeek: number;

    /** Workflow assets waiting on someone: in Review or Approval */
    waiting: number;

    /** Workflow assets Live */
    live: number;

    /** Comment threads not resolved */
    openThreads: number;
}
