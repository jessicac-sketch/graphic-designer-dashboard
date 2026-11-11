import type { SpreadsheetExportColumn } from '../services/spreadsheet-export.service.js';
import type { StateRankingEntry } from '../types/hosts.types.js';

/**
 * Columns included in the State Ranking XLSX export, in order - matching what Ranking
 * Data's State Ranking table shows.
 */
export const STATE_RANKING_EXPORT_COLUMNS: readonly SpreadsheetExportColumn<StateRankingEntry>[] = [
    { header: 'State', key: 'state', width: 14 },
    { header: 'Venue Count', key: 'venueCount', width: 14 },
    { header: 'Total Ads', key: 'totalAds', width: 14 },
    { header: 'Unique Ads Played', key: 'uniqueAdsPlayed', width: 18 },
];
