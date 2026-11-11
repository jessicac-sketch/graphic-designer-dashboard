/** Angular Imports */
import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Local Imports */
import { WorkflowBoardComponent } from '@features/mini-library/components';
import { SPONSORSHIP_WORKFLOW_PAGE } from '@shared/models/library';

/**
 * Sponsorship page: every asset uploaded to the Mini-Library under the Sponsorship category
 * (ribbons, ribbon text, CTAs, logo animations), with its workflow status (Review → Approval
 * → Ready → Live). See WorkflowBoardComponent.
 */
@Component({
    selector: 'app-sponsorship',
    imports: [WorkflowBoardComponent],
    templateUrl: './sponsorship.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class SponsorshipComponent {
    /**
     * The Sponsorship category and its wording
     * @type {LibraryWorkflowPage}
     */
    protected readonly page = SPONSORSHIP_WORKFLOW_PAGE;
}
