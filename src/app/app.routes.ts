/** Angular Imports */
import { Routes } from '@angular/router';

/** Local Imports */
import { authGuard, signedInGuard } from '@core';
import { APP_NAME } from '@shared/models/app';
import { AuthenticatedLayoutComponent } from './layout/authenticated/authenticated-layout/authenticated-layout.component';
import { AUTHENTICATED_ROUTES } from './layout/authenticated/authenticated.routes';
import { PUBLIC_ROUTES } from './layout/public';

export const routes: Routes = [
    ...PUBLIC_ROUTES,
    {
        // Full screen, outside the app layout: the only page open to a user who still has
        // a temporary password (authGuard sends them here)
        path: 'change-password',
        title: `Change password · ${APP_NAME}`,
        canMatch: [signedInGuard],
        loadComponent: () =>
            import('@features/change-password').then((m) => m.ChangePasswordComponent),
    },
    {
        path: '',
        component: AuthenticatedLayoutComponent,
        canMatch: [authGuard],
        children: AUTHENTICATED_ROUTES,
    },
];
