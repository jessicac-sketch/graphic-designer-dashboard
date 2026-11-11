import type { SpreadsheetExportColumn } from '../services/spreadsheet-export.service.js';
import type { HostRankingEntry } from '../types/hosts.types.js';

/**
 * Columns included in the Venue Ranking XLSX export, in order - matching
 * exactly what the dashboard's Venue Ranking table itself shows.
 */
export const VENUE_RANKING_EXPORT_COLUMNS: readonly SpreadsheetExportColumn<HostRankingEntry>[] = [
    { header: 'Latest Play Screenshot', key: 'screenshotUrl', width: 36 },
    { header: 'Venue ID', key: 'venueId', width: 20 },
    { header: 'Host Business Name', key: 'hostName', width: 32 },
    { header: 'City', key: 'city', width: 20 },
    { header: 'State', key: 'state', width: 14 },
    { header: 'Category', key: 'category', width: 24 },
    { header: 'Business Hours', key: 'businessHoursSchedule', width: 32 },
    { header: 'Total Ads', key: 'totalAds', width: 14 },
    { header: 'Slot Count', key: 'slotCount', width: 14 },
    { header: 'Expected Reqs', key: 'expectedRequests', width: 16 },
];
