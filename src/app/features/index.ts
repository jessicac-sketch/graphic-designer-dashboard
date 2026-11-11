/**
 * Features Module
 * Export all feature modules from their respective folders.
 */

export * from './ad-analytics';
export * from './analytics';
export * from './login';
export * from './settings';

// Deliberately NOT re-exported here, because their routes use loadComponent() and
// authenticated.routes.ts imports several other components from this same '@features'
// barrel eagerly - re-exporting any of them here would pull them into the initial bundle:
// - venue-profile: statically imports the full `echarts` package (via
//   DailyAdsBarChartComponent).
// - dashboard, asset-detail, users, change-password: page-sized, loaded when opened.
// - mini-library, channel, sponsorship: pull in the design system's uploader (and filestack-js).
// Import '@features/<page>' directly (as authenticated.routes.ts already does).
