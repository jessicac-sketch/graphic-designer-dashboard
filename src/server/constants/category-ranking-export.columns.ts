import type { SpreadsheetExportColumn } from '../services/spreadsheet-export.service.js';
import type { CategoryRankingEntry } from '../types/hosts.types.js';

/**
 * Columns included in the Category Ranking XLSX export, in order - matching what Ranking
 * Data's Category Ranking table shows.
 */
export const CATEGORY_RANKING_EXPORT_COLUMNS: readonly SpreadsheetExportColumn<CategoryRankingEntry>[] =
    [
        { header: 'Category', key: 'category', width: 28 },
        { header: 'Venue Count', key: 'venueCount', width: 14 },
        { header: 'Total Ads', key: 'totalAds', width: 14 },
        { header: 'Unique Ads Played', key: 'uniqueAdsPlayed', width: 18 },
    ];
