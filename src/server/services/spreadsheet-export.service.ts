import ExcelJS from 'exceljs';

/**
 * A single exported column: which record property it reads and how it's
 * displayed.
 */
export interface SpreadsheetExportColumn<T> {
    /** Spreadsheet header label */
    header: string;

    /** Property read from each record */
    key: keyof T;

    /** Column width, in Excel character units */
    width: number;

    /**
     * Formats the cell value instead of using the raw property - for columns
     * the dashboard table itself displays as something other than the raw
     * value (e.g. a formatted date, "Yes"/"No" instead of true/false, a
     * computed duration), so the export reads identically to what's on screen.
     */
    format?: (row: T) => string | number | boolean | null;
}

/**
 * Options for building a styled XLSX workbook.
 */
export interface SpreadsheetExportOptions<T> {
    /** Workbook title, shown in the merged title row */
    title: string;

    /** Worksheet tab name */
    sheetName: string;

    /** Columns to include, in order */
    columns: readonly SpreadsheetExportColumn<T>[];

    /** Records to export, one per row */
    rows: T[];

    /** Column key(s) whose values should render as clickable hyperlinks, if any */
    hyperlinkColumnKey?: keyof T | (keyof T)[];
}

/** Navy dashboard header color in ARGB format. */
const NAVY = 'FF091635';

/** Pale dashboard accent surface color in ARGB format. */
const PALE_GREEN = 'FFF7FCF0';

/** Light dashboard border color in ARGB format. */
const BORDER = 'FFD9E0F0';

/**
 * Creates styled XLSX workbooks for dashboard exports - domain-agnostic, so
 * every export (Programmatic Ads, Venue Ranking, ...) shares one consistent
 * look instead of each building its own workbook from scratch.
 */
export class SpreadsheetExportService {
    /**
     * Builds a styled workbook containing the supplied records.
     *
     * @param options - Title, columns, and rows to export
     * @returns Promise resolving to an XLSX buffer
     *
     * @example
     * ```typescript
     * const buffer = await spreadsheetExportService.createWorkbook({
     *   title: 'Venue Ranking Export',
     *   sheetName: 'Venue Ranking',
     *   columns: VENUE_RANKING_EXPORT_COLUMNS,
     *   rows: venues,
     * });
     * ```
     */
    public async createWorkbook<T extends object>(
        options: SpreadsheetExportOptions<T>,
    ): Promise<Buffer> {
        const { title, sheetName, columns, rows, hyperlinkColumnKey } = options;

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Graphics Designer Tool';
        workbook.created = new Date();

        const worksheet = workbook.addWorksheet(sheetName);
        worksheet.views = [{ state: 'frozen', ySplit: 4, showGridLines: false }];
        worksheet.pageSetup = {
            orientation: 'landscape',
            fitToPage: true,
            fitToWidth: 1,
            fitToHeight: 0,
        };

        columns.forEach((column, index) => {
            worksheet.getColumn(index + 1).width = column.width;
        });

        worksheet.mergeCells(1, 1, 1, columns.length);
        const titleCell = worksheet.getCell('A1');
        titleCell.value = title;
        titleCell.font = { name: 'Nunito', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
        titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } };
        titleCell.alignment = { vertical: 'middle', horizontal: 'left' };
        worksheet.getRow(1).height = 30;

        worksheet.mergeCells(2, 1, 2, columns.length);
        const subtitleCell = worksheet.getCell('A2');
        subtitleCell.value = `Exported ${new Date().toISOString()} · ${rows.length} rows`;
        subtitleCell.font = { name: 'Nunito', size: 10, italic: true, color: { argb: NAVY } };
        subtitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: PALE_GREEN } };
        subtitleCell.alignment = { vertical: 'middle', horizontal: 'left' };
        worksheet.getRow(2).height = 20;

        worksheet.addRow([]);
        worksheet.addTable({
            name: sheetName.replace(/[^A-Za-z0-9_]/g, ''),
            ref: 'A4',
            headerRow: true,
            style: {
                theme: 'TableStyleMedium2',
                showFirstColumn: false,
                showLastColumn: false,
                showRowStripes: true,
                showColumnStripes: false,
            },
            columns: columns.map((column) => ({ name: column.header })),
            rows: rows.map((row) =>
                columns.map((column) =>
                    this.toCellValue(column.format ? column.format(row) : row[column.key]),
                ),
            ),
        });

        const headerRow = worksheet.getRow(4);
        headerRow.height = 28;
        headerRow.eachCell((cell) => {
            cell.font = { name: 'Nunito', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } };
            cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
            cell.border = this.getCellBorder();
        });

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber <= 4) {
                return;
            }

            row.height = 24;
            row.eachCell((cell) => {
                cell.font = { name: 'Nunito', size: 10, color: { argb: NAVY } };
                cell.alignment = { vertical: 'top', wrapText: true };
                cell.border = this.getCellBorder();

                if (rowNumber % 2 === 1) {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: PALE_GREEN },
                    };
                }
            });
        });

        if (hyperlinkColumnKey) {
            const keys = Array.isArray(hyperlinkColumnKey)
                ? hyperlinkColumnKey
                : [hyperlinkColumnKey];
            for (const key of keys) {
                this.addHyperlinks(worksheet, columns, key, rows.length);
            }
        }

        return Buffer.from(await workbook.xlsx.writeBuffer());
    }

    /**
     * Converts application values into Excel cell values.
     *
     * @param value - Application value
     * @returns Excel-compatible cell value
     */
    private toCellValue(value: unknown): string | number | boolean | null {
        if (value === null || value === undefined) {
            return null;
        }

        if (typeof value === 'object') {
            return JSON.stringify(value) ?? '';
        }

        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            return value;
        }

        return String(value);
    }

    /**
     * Turns HTTP URLs in the given column into clickable spreadsheet hyperlinks.
     *
     * @param worksheet - Workbook worksheet
     * @param columns - Columns as passed to createWorkbook
     * @param hyperlinkColumnKey - Which column's values to linkify
     * @param recordCount - Number of data records
     * @returns void
     */
    private addHyperlinks<T>(
        worksheet: ExcelJS.Worksheet,
        columns: readonly SpreadsheetExportColumn<T>[],
        hyperlinkColumnKey: keyof T,
        recordCount: number,
    ): void {
        const columnIndex = columns.findIndex((column) => column.key === hyperlinkColumnKey) + 1;
        if (columnIndex === 0) {
            return;
        }

        const linkColumn = worksheet.getColumn(columnIndex);

        linkColumn.eachCell((cell, rowNumber) => {
            if (rowNumber <= 4 || rowNumber > recordCount + 4 || typeof cell.value !== 'string') {
                return;
            }

            if (!cell.value.startsWith('http://') && !cell.value.startsWith('https://')) {
                return;
            }

            cell.value = { text: cell.value, hyperlink: cell.value };
            cell.font = {
                name: 'Nunito',
                size: 10,
                color: { argb: 'FF0563C1' },
                underline: true,
            };
        });
    }

    /**
     * Returns the standard dashboard spreadsheet border.
     *
     * @returns ExcelJS cell border definition
     */
    private getCellBorder(): ExcelJS.Borders {
        return {
            top: { style: 'thin', color: { argb: BORDER } },
            left: { style: 'thin', color: { argb: BORDER } },
            bottom: { style: 'thin', color: { argb: BORDER } },
            right: { style: 'thin', color: { argb: BORDER } },
            diagonal: {},
        };
    }
}

/** Singleton spreadsheet export service. */
export const spreadsheetExportService = new SpreadsheetExportService();
