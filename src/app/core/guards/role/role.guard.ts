/** Angular Imports */
import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';

/** Local Imports */
import type { UserRole } from '@shared/models/users/user-role.type';
import { AuthService } from '../../services/auth/auth.service';

/**
 * Route guard factory: allows only users with one of the given roles. Use on routes under
 * the authenticated layout (whose `authGuard` has already loaded the user).
 *
 * @param roles - Roles allowed
 * @returns {CanMatchFn} The guard; other users are sent to the dashboard
 *
 * @example
 * { path: 'users', canMatch: [roleGuard('admin')], loadComponent: … }
 */
export function roleGuard(...roles: UserRole[]): CanMatchFn {
    return () => {
        const role = inject(AuthService).role();
        if (role && roles.includes(role)) {
            return true;
        }
        return inject(Router).createUrlTree(['/dashboard']);
    };
}
