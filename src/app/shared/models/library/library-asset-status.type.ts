/**
 * Workflow status of a Channel asset: Graphics QC review → upper management approval →
 * ready to upload to the other system's dashboard → live there.
 */
export type LibraryAssetStatus = 'review' | 'approval' | 'ready' | 'live';
