/** Angular Imports */
import { Component, input, signal } from '@angular/core';

/**
 * Small icon button that copies a value to the clipboard, showing a brief
 * checkmark to confirm the copy.
 *
 * @remarks
 * Meant for table cells showing a truncated value (e.g. Creative ID, Device ID)
 * where the user needs the full untruncated string copied to the clipboard.
 *
 * @example
 * ```html
 * <app-copy-button [value]="rowData['creativeId']" />
 * ```
 */
@Component({
    selector: 'app-copy-button',
    standalone: true,
    template: `
        <button
            type="button"
            class="copy-button"
            [attr.aria-label]="'Copy ' + (value() || '')"
            [attr.data-testid]="'copy-button'"
            (click)="copy($event)">
            @if (copied()) {
                <i class="fa-sharp fa-regular fa-check"></i>
            } @else {
                <i class="fa-sharp fa-regular fa-copy"></i>
            }
        </button>
    `,
    styles: [
        `
            .copy-button {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                background: transparent;
                border: none;
                cursor: pointer;
                padding: 2px 4px;
                color: var(--app-content-muted);
                font-size: 0.8rem;
            }

            .copy-button:hover {
                color: var(--app-content-primary);
            }
        `,
    ],
})
export class CopyButtonComponent {
    /**
     * The full (untruncated) value to copy to the clipboard.
     */
    value = input<string | null | undefined>(null);

    /**
     * Whether the value was just copied, used to briefly show a checkmark.
     */
    copied = signal(false);

    /**
     * Copies the value to the clipboard and briefly shows a checkmark.
     *
     * @param {Event} event - Click event, stopped from bubbling to the row
     * @returns {void}
     */
    copy(event: Event): void {
        event.stopPropagation();

        const text = this.value();
        if (!text) {
            return;
        }

        navigator.clipboard
            .writeText(text)
            .then(() => {
                this.copied.set(true);
                setTimeout(() => this.copied.set(false), 1500);
            })
            .catch((error) => console.error('[CopyButton] Failed to copy to clipboard:', error));
    }
}
