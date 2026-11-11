import type { SpreadsheetExportColumn } from '../services/spreadsheet-export.service.js';
import type { DashboardTopAd } from '../types/dashboard-analytics.types.js';
import { formatExportDateTime } from '../utils/export-format.util.js';

/**
 * Builds the columns included in the Ad Ranking XLSX export, in order -
 * matching exactly what the dashboard's Ad Ranking table itself shows,
 * including its timestamp in the same zone the table was viewed in.
 *
 * @param timeZone - IANA timezone identifier (or "UTC") the request's
 *   timestamp column is formatted in - see resolveAllowedTimeZone
 */
export function buildAdRankingExportColumns(
    timeZone: string,
): readonly SpreadsheetExportColumn<DashboardTopAd>[] {
    return [
        { header: 'Creative', key: 'creativeUrl', width: 36 },
        { header: 'Content ID', key: 'contentId', width: 38 },
        { header: 'Filename', key: 'title', width: 28 },
        { header: 'Location', key: 'location', width: 18 },
        { header: 'Play Count', key: 'plays', width: 14 },
        { header: 'Source', key: 'source', width: 18 },
        {
            header: 'Date Created',
            key: 'fetchedDate',
            width: 22,
            format: (row) => formatExportDateTime(row.fetchedDate, timeZone),
        },
    ];
}
