/** Angular Imports */
import type { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

/** Third Party Imports */
import { catchError, throwError } from 'rxjs';

/**
 * Redirects to /login when any /api/* call (other than the auth endpoints
 * themselves) comes back 401, covering session expiry mid-use - the initial
 * "am I logged in" check is handled by the route guards, not this.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);

    return next(req).pipe(
        catchError((error) => {
            if (
                error?.status === 401 &&
                req.url.startsWith('/api/') &&
                !req.url.startsWith('/api/auth/')
            ) {
                router.navigate(['/login']);
            }
            return throwError(() => error);
        }),
    );
};
