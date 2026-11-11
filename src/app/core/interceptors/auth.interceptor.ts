/** Angular Imports */
import type { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

/** Third Party Imports */
import { catchError, throwError } from 'rxjs';

/**
 * Redirects to /login when any /api/* call (other than the auth endpoints
 * themselves) comes back 401, covering session expiry mid-use - the initial
 * "am I logged in" check is handled by the route guards, not this. A 403
 * `password_change_required` goes to /change-password instead.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);

    return next(req).pipe(
        catchError((error) => {
            const isAppApi = req.url.startsWith('/api/') && !req.url.startsWith('/api/auth/');
            if (error?.status === 401 && isAppApi) {
                router.navigate(['/login']);
            } else if (
                error?.status === 403 &&
                isAppApi &&
                error?.error?.error === 'password_change_required'
            ) {
                // An admin reset the password while the user was signed in
                router.navigate(['/change-password']);
            }
            return throwError(() => error);
        }),
    );
};
