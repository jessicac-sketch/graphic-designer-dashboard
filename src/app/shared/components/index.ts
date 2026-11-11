/**
 * Shared Components
 * Export all shared components from their respective folders.
 */

export * from './brand';
export * from './copy-button/copy-button.component';
export * from './dialog';
export * from './drill-down-modal/drill-down-modal.component';
export * from './export-button/export-button.component';
export * from './filter-list';
export * from './filter-menu';
export * from './metric';
export * from './page-header';
export * from './range-controls';
export * from './range-menu';
export * from './range-notice';
export * from './section-error';
export * from './share-list';
export * from './sort-control';
export * from './status-badge';
export * from './status-menu';
export * from './summary-card';
export * from './tag-input';

// Deliberately NOT re-exported here: DailyAdsBarChartComponent statically
// imports the full `echarts` package. This barrel is imported by eagerly
// loaded pages - re-exporting it here would pull echarts into the initial
// bundle for every page, not just Dashboard / Venue Profile. Import it
// directly via
// '@shared/components/daily-ads-bar-chart/daily-ads-bar-chart.component'
// instead.
