/** Angular Imports */
import { Routes } from '@angular/router';

/** Local Imports */
import { authGuard } from '@core';
import { AuthenticatedLayoutComponent } from './layout/authenticated/authenticated-layout/authenticated-layout.component';
import { AUTHENTICATED_ROUTES } from './layout/authenticated/authenticated.routes';
import { PUBLIC_ROUTES } from './layout/public';

export const routes: Routes = [
    ...PUBLIC_ROUTES,
    {
        path: '',
        component: AuthenticatedLayoutComponent,
        canMatch: [authGuard],
        children: AUTHENTICATED_ROUTES,
    },
];
