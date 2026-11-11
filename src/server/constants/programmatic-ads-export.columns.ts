import type { SpreadsheetExportColumn } from '../services/spreadsheet-export.service.js';
import type { PlayRecordContent } from '../types/play-record-content.types.js';
import {
    formatExportDateTime,
    formatExportPopDuration,
    formatExportYesNo,
} from '../utils/export-format.util.js';

/**
 * Builds the columns included in the Programmatic Ads XLSX export, in order -
 * matching exactly what the dashboard's Programmatic Ads table itself shows,
 * so an exported file reads the same as what's on screen, including its
 * timestamps in the same zone the table was viewed in.
 *
 * @param timeZone - IANA timezone identifier (or "UTC") the request's
 *   timestamp columns are formatted in - see resolveAllowedTimeZone
 */
export function buildProgrammaticAdsExportColumns(
    timeZone: string,
): readonly SpreadsheetExportColumn<PlayRecordContent>[] {
    return [
        { header: 'Creative', key: 'mediaUrl', width: 36 },
        { header: 'Screenshot', key: 'popScreenshot', width: 36 },
        { header: 'Creative ID', key: 'creativeId', width: 24 },
        { header: 'Creative Source', key: 'creativeSource', width: 20 },
        { header: 'Venue ID', key: 'venueId', width: 20 },
        { header: 'Device ID', key: 'deviceId', width: 20 },
        {
            header: 'Fetched At',
            key: 'fetchedAt',
            width: 22,
            format: (row) => formatExportDateTime(row.fetchedAt, timeZone),
        },
        {
            header: 'Proof of Play Sent',
            key: 'proofOfPlaySent',
            width: 22,
            format: (row) => formatExportDateTime(row.proofOfPlaySent, timeZone),
        },
        {
            header: 'POP Duration',
            key: 'popDurationMinutes',
            width: 16,
            format: (row) => formatExportPopDuration(row.popDurationMinutes),
        },
        {
            header: 'Served',
            key: 'served',
            width: 12,
            format: (row) => formatExportYesNo(row.served),
        },
        {
            header: 'Date Served',
            key: 'dateServed',
            width: 22,
            format: (row) => formatExportDateTime(row.dateServed, timeZone),
        },
        {
            header: 'Slot Playlist Content ID',
            key: 'slotPlaylistContentId',
            width: 24,
            format: (row) => row.slotPlaylistContentId ?? 'N/A',
        },
        {
            header: 'Slot Position',
            key: 'slotPlaylistContentPosition',
            width: 14,
            format: (row) => row.slotPlaylistContentPosition ?? 'N/A',
        },
    ];
}
