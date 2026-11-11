/** Angular Imports */
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    input,
    output,
    signal,
    viewChild,
} from '@angular/core';

/** Third Party Imports */
import { Popover } from '@ntv360/component-pantry';

/** Local Imports */
import { AuthService } from '@core/services/auth';
import { StatusBadgeComponent } from '@shared/components/status-badge';
import type { LibraryStatusInfo } from '@shared/interfaces/library/library-status-info.interface';
import type { LibraryAssetStatus } from '@shared/models/library/library-asset-status.type';
import { LIBRARY_STATUSES } from '@shared/models/library/library-statuses.constant';
import { canChangeStatus } from '@shared/utils/can-change-status.util';

/**
 * A Channel or Sponsorship asset's status that can be changed: the status badge as a
 * button, opening a menu of every status (in workflow order, with what each means). The
 * steps the user's role may not take are greyed out (see STATUS_TRANSITION_RULES); with
 * none left, the badge is shown without a menu. Built like `<app-range-menu>`.
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
     * The signed-in user (their role decides which changes they may make)
     * @type {AuthService}
     */
    private readonly authService = inject(AuthService);

    /**
     * Every status, in workflow order, with whether the user may move the asset there
     * (the current status counts as allowed, so it stays selectable)
     * @type {Signal<Array<LibraryStatusInfo & { allowed: boolean }>>}
     */
    protected readonly statuses = computed(() => {
        const role = this.authService.role();
        const current = this.status();
        return LIBRARY_STATUSES.map((entry) => ({
            ...entry,
            allowed: entry.value === current || canChangeStatus(role, current, entry.value),
        }));
    });

    /**
     * Whether the user may make any change at all (otherwise the badge isn't a menu)
     * @type {Signal<boolean>}
     */
    protected readonly canChange = computed(() =>
        this.statuses().some((entry) => entry.allowed && entry.value !== this.status()),
    );

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
        const allowed = this.statuses().find((entry) => entry.value === status)?.allowed;
        if (status !== this.status() && allowed) {
            this.statusChange.emit(status);
        }
    }
}
