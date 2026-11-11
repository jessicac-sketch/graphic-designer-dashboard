/** Angular Imports */
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Local Imports */
import type { LibraryAssetStatus } from '@shared/models/library/library-asset-status.type';
import { LIBRARY_STATUSES } from '@shared/models/library/library-statuses.constant';

/**
 * A Channel asset's workflow status as a small badge: icon and one-word name, colored per
 * status (Review neutral, Approval orange, Ready bright, Live green). The icon carries the
 * meaning too, so the colors are never the only cue.
 *
 * @example
 * <app-status-badge status="approval" />
 */
@Component({
    selector: 'app-status-badge',
    templateUrl: './status-badge.component.html',
    styleUrl: './status-badge.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class StatusBadgeComponent {
    /**
     * The status to show
     * @type {InputSignal<LibraryAssetStatus>}
     */
    public readonly status = input.required<LibraryAssetStatus>();

    /**
     * Name, meaning and icon of the status
     * @type {Signal<LibraryStatusInfo | undefined>}
     */
    protected readonly info = computed(() =>
        LIBRARY_STATUSES.find((entry) => entry.value === this.status()),
    );
}
