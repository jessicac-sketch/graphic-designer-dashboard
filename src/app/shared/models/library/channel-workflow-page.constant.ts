/** Local Imports */
import type { LibraryWorkflowPage } from '@shared/interfaces/library/library-workflow-page.interface';

/**
 * The Channel page: Mini-Library assets of the Channel category, through the workflow.
 */
export const CHANNEL_WORKFLOW_PAGE: LibraryWorkflowPage = {
    categoryId: 'channel',
    title: 'Channel',
    subtitle:
        'Every Channel upload and where it is: QC review, management approval, ready to upload, live',
    noun: 'channel',
    addLabel: 'Add channel content',
    subcategoryIcon: 'tv',
};
