/** Angular Imports */
import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Local Imports */
import { WorkflowBoardComponent } from '@features/mini-library/components';
import { CHANNEL_WORKFLOW_PAGE } from '@shared/models/library';

/**
 * Channel page: every asset uploaded to the Mini-Library under the Channel category, with
 * its workflow status (Review → Approval → Ready → Live). See WorkflowBoardComponent.
 */
@Component({
    selector: 'app-channel',
    imports: [WorkflowBoardComponent],
    templateUrl: './channel.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class ChannelComponent {
    /**
     * The Channel category and its wording
     * @type {LibraryWorkflowPage}
     */
    protected readonly page = CHANNEL_WORKFLOW_PAGE;
}
