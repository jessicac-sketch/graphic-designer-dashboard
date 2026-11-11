/** Angular Imports */
import { Routes } from '@angular/router';

/** Local Imports */
import { roleGuard } from '@core/guards/role';
import { AdAnalyticsComponent, AnalyticsComponent, SettingsComponent } from '@features';
import { APP_NAME } from '@shared/models/app';

/**
 * Each route's `title` is the browser tab title ("Page · <APP_NAME>"), set by
 * Angular's router on navigation - same pattern as gbp-management-tool-ui.
 */
export const AUTHENTICATED_ROUTES: Routes = [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
    },
    {
        // The library dashboard, the first page after sign-in. Lazy-loaded like the other
        // library pages; not re-exported from the '@features' barrel.
        path: 'dashboard',
        title: `Dashboard · ${APP_NAME}`,
        loadComponent: () => import('@features/dashboard').then((m) => m.DashboardComponent),
    },
    {
        // Lazy-loaded: pulls in the uploader (and filestack-js on first upload), kept out
        // of the main bundle. Not re-exported from the '@features' barrel for that reason.
        path: 'mini-library',
        title: `Mini-Library · ${APP_NAME}`,
        loadComponent: () => import('@features/mini-library').then((m) => m.MiniLibraryComponent),
    },
    {
        // Lazy-loaded for the same reason as the Mini-Library (it reuses its uploader)
        path: 'channel',
        title: `Channel · ${APP_NAME}`,
        loadComponent: () => import('@features/channel').then((m) => m.ChannelComponent),
    },
    {
        // Lazy-loaded for the same reason as the Mini-Library (it reuses its uploader)
        path: 'sponsorship',
        title: `Sponsorship · ${APP_NAME}`,
        loadComponent: () => import('@features/sponsorship').then((m) => m.SponsorshipComponent),
    },
    {
        // One asset's page, opened in a new tab from the library lists. Lazy-loaded with
        // its comments; the browser tab is retitled with the asset's name once it loads.
        path: 'asset/:id',
        title: `Asset · ${APP_NAME}`,
        loadComponent: () => import('@features/asset-detail').then((m) => m.AssetDetailComponent),
    },
    {
        // User management, admins only
        path: 'users',
        title: `Users · ${APP_NAME}`,
        canMatch: [roleGuard('admin')],
        loadComponent: () => import('@features/users').then((m) => m.UsersComponent),
    },
    {
        path: 'ad/:id',
        title: `Ad Analytics · ${APP_NAME}`,
        component: AdAnalyticsComponent,
    },
    {
        // Lazy-loaded: pulls in echarts (via DailyAdsBarChartComponent),
        // kept out of the main bundle for users who never visit this page.
        path: 'venue/:venueId',
        title: `Venue Profile · ${APP_NAME}`,
        loadComponent: () => import('@features/venue-profile').then((m) => m.VenueProfileComponent),
    },
    {
        path: 'analytics',
        title: `Analytics · ${APP_NAME}`,
        component: AnalyticsComponent,
    },
    {
        path: 'settings',
        title: `Settings · ${APP_NAME}`,
        component: SettingsComponent,
    },
];
