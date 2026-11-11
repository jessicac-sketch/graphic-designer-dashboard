/**
 * CSV column definition: a spreadsheet header paired with the record property it reads.
 *
 * @template T - Type of the exported record
 */
export interface DashboardExportColumn<T> {
    /** Spreadsheet header label. */
    header: string;

    /** Property read from a record. */
    key: keyof T;

    /**
     * Formats the cell value instead of using the raw property - for columns the page
     * itself displays as something other than the raw value, so the export reads
     * identically to what's on screen.
     */
    format?: (row: T) => string;
}
