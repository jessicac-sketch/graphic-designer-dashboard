/** Angular Imports */
import { Component, input, output } from '@angular/core';

/** Third Party Imports */
import { Popover } from '@ntv360/component-pantry';

/** Supported dashboard export formats. */
export type ExportFormat = 'csv' | 'xlsx';

/**
 * Excel-styled export button with a CSV/Styled-Excel format picker.
 *
 * @remarks
 * Purely presentational - the parent decides what "exporting" means (which
 * endpoint(s) to call, how to build the file, what filters apply) and just
 * feeds this component its current disabled/exporting state. Reused across
 * every table that offers an export (Programmatic Ads, Venue Ranking, ...)
 * so the button, popover, and Excel-brand styling exist in exactly one place.
 *
 * @example
 * ```html
 * <app-export-button
 *   [disabled]="!canExport()"
 *   [disabledReason]="exportDisabledReason()"
 *   [exporting]="isExporting()"
 *   (formatSelected)="onExport($event)" />
 * ```
 */
@Component({
    selector: 'app-export-button',
    standalone: true,
    imports: [Popover],
    template: `
        <div class="export-button">
            <!-- Disabled buttons don't fire hover events in most browsers, so a
                 title on the button itself would never show - the tooltip lives
                 on this wrapper instead. -->
            <span class="export-button__trigger-wrapper" [title]="disabledReason() ?? ''">
                <button
                    type="button"
                    class="export-button__trigger"
                    [disabled]="disabled() || exporting()"
                    (click)="popover.toggle($event)"
                    data-testid="export-button-trigger">
                    @if (exporting()) {
                        <i class="fa-sharp fa-regular fa-spinner-third fa-spin"></i>
                    } @else {
                        <i class="fa-sharp fa-regular fa-file-excel"></i>
                    }
                    Export
                </button>
            </span>
            <ntv-popover #popover placement="bottom-end" [minWidth]="'180px'">
                @for (option of formatOptions; track option.value) {
                    <button
                        type="button"
                        class="export-button__option"
                        (click)="selectFormat(option.value, popover)">
                        {{ option.label }}
                    </button>
                }
            </ntv-popover>
        </div>
    `,
    styles: [
        `
            .export-button {
                display: flex;
                align-items: center;
            }

            .export-button__trigger-wrapper {
                display: inline-block;
            }

            /* Outlined, like the app's other secondary buttons; the icon carries the
               accent. Colors come from the theme tokens (src/styles/_theme.scss). */
            .export-button__trigger {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                height: 40px;
                border: 1px solid var(--app-surface-border);
                padding: 0 0.875rem;
                font-size: 0.875rem;
                font-weight: 500;
                color: var(--app-content-secondary);
                background-color: transparent;
                transition:
                    background-color 0.15s ease,
                    color 0.15s ease;
            }

            .export-button__trigger:hover:not(:disabled) {
                background-color: var(--app-surface-hover);
                color: var(--app-content-primary);
            }

            .export-button__trigger:disabled {
                cursor: not-allowed;
                opacity: 0.5;
            }

            .export-button__trigger i {
                color: var(--app-brand);
            }

            /* No wrapper div here - ntv-popover's own panel already supplies
               the background/border/shadow/padding, so these render as direct
               children of it. */
            .export-button__option {
                display: block;
                width: 100%;
                padding: 0.5rem 0.75rem;
                text-align: left;
                font-size: 0.875rem;
                font-weight: 500;
                color: var(--app-content-secondary);
            }

            .export-button__option:hover {
                background-color: var(--app-surface-hover);
                color: var(--app-content-primary);
            }

            .export-button__option + .export-button__option {
                margin-top: 0.25rem;
            }
        `,
    ],
})
export class ExportButtonComponent {
    /** The two export formats this button always offers. */
    readonly formatOptions: { label: string; value: ExportFormat }[] = [
        { label: 'CSV (.csv)', value: 'csv' },
        { label: 'Styled Excel (.xlsx)', value: 'xlsx' },
    ];

    /** Whether the trigger button is disabled (in addition to while exporting). */
    disabled = input(false);

    /** Tooltip explaining why export is disabled, or null when it isn't. */
    disabledReason = input<string | null>(null);

    /** Whether an export is currently in flight - swaps the icon to a spinner and disables the trigger. */
    exporting = input(false);

    /** Emits the format the user picked from the popover. */
    formatSelected = output<ExportFormat>();

    /**
     * Closes the popover and emits the chosen format.
     *
     * @param {ExportFormat} format - Format the user picked
     * @param {Popover} popover - This button's own popover, to close after selection
     * @returns {void}
     */
    selectFormat(format: ExportFormat, popover: Popover): void {
        popover.hide();
        this.formatSelected.emit(format);
    }
}
