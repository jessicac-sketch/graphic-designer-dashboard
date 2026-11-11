/** Angular Imports */
import {
    ChangeDetectionStrategy,
    Component,
    input,
    output,
    signal,
    viewChild,
} from '@angular/core';

/** Third Party Imports */
import { Popover } from '@ntv360/component-pantry';

/** Local Imports */
import { StatusBadgeComponent } from '@shared/components/status-badge';
import type { LibraryAssetStatus } from '@shared/models/library/library-asset-status.type';
import { LIBRARY_STATUSES } from '@shared/models/library/library-statuses.constant';

/**
 * A Channel asset's status that can be changed: the status badge as a button, opening a
 * menu of every status (in workflow order, with what each means). Built like
 * `<app-range-menu>`.
 *
 * @example
 * <app-status-menu [status]="asset.status" [busy]="saving()" (statusChange)="move(asset, $event)" />
 */
@Component({
    selector: 'app-status-menu',
    imports: [Popover, StatusBadgeComponent],
    templateUrl: './status-menu.component.html',
    styleUrl: './status-menu.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class StatusMenuComponent {
    /**
     * The current status
     * @type {InputSignal<LibraryAssetStatus>}
     */
    public readonly status = input.required<LibraryAssetStatus>();

    /**
     * Whether a change is being saved (the button shows a spinner and is inactive)
     * @type {InputSignal<boolean>}
     */
    public readonly busy = input(false);

    /**
     * What the menu changes, for screen readers, e.g. "Status of Logo_01"
     * @type {InputSignal<string>}
     */
    public readonly label = input('Status');

    /**
     * Emits the status the user picks (never the current one)
     * @type {OutputEmitterRef<LibraryAssetStatus>}
     */
    public readonly statusChange = output<LibraryAssetStatus>();

    /**
     * Every status, in workflow order
     * @type {readonly LibraryStatusInfo[]}
     */
    protected readonly statuses = LIBRARY_STATUSES;

    /**
     * The menu's popover, closed after a pick
     * @type {Signal<Popover>}
     */
    private readonly menu = viewChild.required<Popover>('menu');

    /**
     * Whether the menu is open (rotates the chevron)
     * @type {WritableSignal<boolean>}
     */
    protected readonly isOpen = signal(false);

    /**
     * Applies a picked status and closes the menu.
     *
     * @param status - The picked status
     * @returns {void}
     */
    protected select(status: LibraryAssetStatus): void {
        this.menu().hide();
        if (status !== this.status()) {
            this.statusChange.emit(status);
        }
    }
}
