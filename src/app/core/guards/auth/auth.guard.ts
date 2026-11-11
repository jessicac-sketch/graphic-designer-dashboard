/** Angular Imports */
import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';

/** Local Imports */
import { AuthService } from '../../services/auth/auth.service';

/**
 * Route guard that allows access only to authenticated users who don't have to change
 * a temporary password.
 *
 * @param route - The activated route snapshot
 * @param segments - The URL segments
 * @returns {boolean} True if the user may use the app; otherwise redirects to /login, or to
 * /change-password while their password is temporary
 *
 * @remarks
 * This is a functional guard (Angular 15+) used with `canMatch`.
 */
export const authGuard: CanMatchFn = async (route, segments) => {
    /**
     * Authentication service instance
     * @type {AuthService}
     */
    const authService: AuthService = inject(AuthService);

    /**
     * Router service for navigation
     * @type {Router}
     */
    const router: Router = inject(Router);

    const isAuthenticated = await authService.checkAuthStatus();

    if (!isAuthenticated) {
        router.navigate(['/login']);
        return false;
    }

    if (authService.user()?.mustChangePassword) {
        router.navigate(['/change-password']);
        return false;
    }

    return true;
};
