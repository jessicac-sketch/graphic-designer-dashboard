/** Angular Imports */
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    signal,
    viewChild,
    ViewEncapsulation,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';

/** Third Party Imports */
import { Popover } from '@ntv360/component-pantry';

/** Local Imports */
import { AuthService } from '@core/services/auth';
import { USER_ROLES } from '@shared/models/users';
import { InitialsPipe } from '@shared/pipes/initials';

/**
 * Signed-in user button (avatar, name, email) with a dropdown to log out.
 *
 * @remarks
 * Uses `ViewEncapsulation.None` because `ntv-popover` moves its panel to `document.body`,
 * out of reach of scoped styles. All classes are BEM-prefixed with `user-menu`.
 */
@Component({
    selector: 'app-user-menu',
    imports: [Popover, InitialsPipe, RouterLink],
    templateUrl: './user-menu.component.html',
    styleUrl: './user-menu.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
    encapsulation: ViewEncapsulation.None,
})
export class UserMenuComponent {
    /**
     * Authentication service instance
     * @type {AuthService}
     */
    private readonly authService = inject(AuthService);

    /**
     * Router service for navigation
     * @type {Router}
     */
    private readonly router = inject(Router);

    /**
     * Dropdown panel
     * @type {Signal<Popover>}
     */
    private readonly menu = viewChild.required<Popover>('menu');

    /**
     * Name shown on the button (the email's local part when the user has no name)
     * @type {Signal<string>}
     */
    protected readonly displayName = computed(() => {
        const user = this.authService.user();
        return user?.name || (user?.email ?? '').split('@')[0];
    });

    /**
     * The signed-in user's role, e.g. "Graphics QC"
     * @type {Signal<string>}
     */
    protected readonly roleLabel = computed(() => {
        const role = this.authService.role();
        return USER_ROLES.find((entry) => entry.value === role)?.label ?? '';
    });

    /**
     * Whether the user can change their password here (not the demo account)
     * @type {Signal<boolean>}
     */
    protected readonly canChangePassword = computed(() => !this.authService.user()?.isDemo);

    /**
     * Signed-in user's email
     * @type {Signal<string>}
     */
    protected readonly email = computed(() => this.authService.user()?.email ?? '');

    /**
     * Whether the dropdown is open (for aria-expanded and the chevron)
     * @type {WritableSignal<boolean>}
     */
    protected readonly isOpen = signal(false);

    /**
     * True while the logout request is in flight
     * @type {WritableSignal<boolean>}
     */
    protected readonly isLoggingOut = signal(false);

    /**
     * Signs the user out and returns to the login page.
     *
     * @returns {Promise<void>}
     */
    protected async onLogout(): Promise<void> {
        if (this.isLoggingOut()) {
            return;
        }

        this.isLoggingOut.set(true);
        await this.authService.logout();
        this.isLoggingOut.set(false);
        this.menu().hide();
        void this.router.navigateByUrl('/login');
    }
}
