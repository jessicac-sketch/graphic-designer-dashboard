/** Angular Imports */
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/** Local Imports */
import { TopbarStatsComponent } from '@layouts/authenticated/topbar-stats';
import { UserMenuComponent } from '@layouts/authenticated/user-menu';

/**
 * Top bar of the signed-in app: the sidebar's fold button on the left, the Dashboard's
 * totals in the middle (app-topbar-stats) and the user menu on the right. (Navigation
 * itself lives in the sidebar.)
 */
@Component({
    selector: 'app-topbar',
    imports: [TopbarStatsComponent, UserMenuComponent],
    templateUrl: './topbar.component.html',
    styleUrl: './topbar.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class TopbarComponent {
    /**
     * Accessible name and tooltip of the fold button, e.g. "Collapse navigation"
     * @type {InputSignal<string>}
     */
    public readonly toggleLabel = input('Toggle navigation');

    /**
     * Whether the navigation is currently shown in full (for `aria-expanded`)
     * @type {InputSignal<boolean>}
     */
    public readonly expanded = input(true);

    /**
     * Emits when the fold button is pressed
     * @type {OutputEmitterRef<void>}
     */
    public readonly sidebarToggle = output<void>();
}
