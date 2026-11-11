/** Angular Imports */
import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';

/** Local Imports */
import { AuthService } from '../../services/auth/auth.service';

/**
 * Route guard that allows any signed-in user, also one who still has a temporary
 * password (unlike `authGuard`) - for the change-password page.
 *
 * @param route - The activated route snapshot
 * @param segments - The URL segments
 * @returns {boolean} True if signed in, otherwise redirects to /login
 */
export const signedInGuard: CanMatchFn = async (route, segments) => {
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

    if (await authService.checkAuthStatus()) {
        return true;
    }
    router.navigate(['/login']);
    return false;
};
