/** Angular Imports */
import { Routes } from '@angular/router';

/** Local Imports */
import { guestGuard } from '@core';
import { APP_NAME } from '@shared/models/app';

export const PUBLIC_ROUTES: Routes = [
    {
        path: 'login',
        title: `Sign in · ${APP_NAME}`,
        loadComponent: () => import('@features/login').then((m) => m.LoginComponent),
        canMatch: [guestGuard],
    },
];
