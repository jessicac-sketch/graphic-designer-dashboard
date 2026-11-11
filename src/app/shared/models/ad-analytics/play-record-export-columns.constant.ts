/** Local Imports */
import type { PlayRecordContent } from '@core/models/play-record-content.model';
import type { DashboardExportColumn } from '@shared/interfaces/ui/export-column.interface';
import { formatExportDateTime, formatExportYesNo } from '@shared/utils/export.util';
import { formatPopDuration } from '@shared/utils/pop-duration.util';

/**
 * Builds the play-record fields included in Ad Analytics' CSV export, in order,
 * including its timestamps in the same zone the page was viewed in.
 *
 * @param timeZone - IANA timezone identifier (or "UTC") - TimeDisplayService.zoneId()
 * @returns {readonly DashboardExportColumn<PlayRecordContent>[]} The columns
 *
 * @example
 * const columns = buildDashboardExportColumns(this.timeDisplayService.zoneId());
 */
export function buildDashboardExportColumns(
    timeZone: string,
): readonly DashboardExportColumn<PlayRecordContent>[] {
    return [
        { header: 'Creative', key: 'mediaUrl' },
        { header: 'Screenshot', key: 'popScreenshot' },
        { header: 'Creative ID', key: 'creativeId' },
        { header: 'Creative Source', key: 'creativeSource' },
        { header: 'Venue ID', key: 'venueId' },
        { header: 'Device ID', key: 'deviceId' },
        {
            header: 'Fetched At',
            key: 'fetchedAt',
            format: (row) => formatExportDateTime(row.fetchedAt, timeZone),
        },
        {
            header: 'Proof of Play Sent',
            key: 'proofOfPlaySent',
            format: (row) => formatExportDateTime(row.proofOfPlaySent, timeZone),
        },
        {
            header: 'POP Duration',
            key: 'popDurationMinutes',
            format: (row) => formatPopDuration(row.popDurationMinutes),
        },
        { header: 'Served', key: 'served', format: (row) => formatExportYesNo(row.served) },
        {
            header: 'Date Served',
            key: 'dateServed',
            format: (row) => formatExportDateTime(row.dateServed, timeZone),
        },
    ];
}
