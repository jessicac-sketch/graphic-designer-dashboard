/** Angular Imports */
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

/** Local Imports */
import { AuthService } from '@core/services/auth';
import { BrandComponent } from '@shared/components/brand';
import { APP_CAPTION, APP_VERSION } from '@shared/models/app';
import { MAIN_NAV_ITEMS } from '@shared/models/navigation';
import { TimeDisplayService } from '@shared/services/time-display';

/**
 * App sidebar: brand, primary navigation, and a footer with the app version. Collapsed,
 * it is an icon-only rail (labels as tooltips) - the shell collapses it below 992px and
 * when the user folds it with the top bar's toggle button.
 */
@Component({
    selector: 'app-sidebar',
    imports: [RouterLink, RouterLinkActive, BrandComponent],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class SidebarComponent {
    /**
     * Global "Eastern Time / UTC" display preference, surfaced here as a
     * toggle above the footer.
     * @type {TimeDisplayService}
     */
    protected readonly timeDisplayService = inject(TimeDisplayService);

    /**
     * Emits when a navigation link is followed (used to close the mobile drawer)
     * @type {OutputEmitterRef<void>}
     */
    public readonly navigate = output<void>();

    /**
     * Icon-only rail instead of the full sidebar
     * @type {InputSignal<boolean>}
     */
    public readonly collapsed = input(false);

    /**
     * The signed-in user (some items are for certain roles only)
     * @type {AuthService}
     */
    private readonly authService = inject(AuthService);

    /**
     * Primary navigation items the signed-in user may see
     * @type {Signal<readonly NavItem[]>}
     */
    protected readonly navItems = computed(() => {
        const role = this.authService.role();
        return MAIN_NAV_ITEMS.filter(
            (item) => !item.roles || (!!role && item.roles.includes(role)),
        );
    });

    /**
     * App version shown in the footer
     * @type {string}
     */
    protected readonly version = APP_VERSION;

    /**
     * Tagline under the wordmark and in the footer
     * @type {string}
     */
    protected readonly caption = APP_CAPTION;
}
