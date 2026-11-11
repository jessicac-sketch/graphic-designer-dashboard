/** Angular Imports */
import {
    ChangeDetectionStrategy,
    Component,
    input,
    output,
    ViewEncapsulation,
} from '@angular/core';

/** Third Party Imports */
import { Button, Modal } from '@ntv360/component-pantry';

/** Local Imports */
import { DialogActionTone } from '@shared/models/ui/dialog-action-tone.type';

/**
 * Standard modal dialog: a header with the title and a close (×) button, a scrolling
 * body for the projected content, and a footer with Cancel and one action button.
 * The three parts are separated by full-width rules.
 *
 * @remarks
 * Built on `ntv-modal` (backdrop, Escape, animation, focus). `ntv-modal` only projects
 * a header and draws no title or close button of its own, so this component supplies
 * both. Styles are unencapsulated (scoped under `.app-dialog`) because they reset the
 * padding `ntv-modal` puts around its panel and body.
 *
 * The dialog does not close itself: handle `closed` (×, Cancel, Escape, backdrop) by
 * setting `visible` to false. `action` is the action button; while `busy`, every close
 * trigger is ignored and the action shows a spinner.
 *
 * @example
 * <app-dialog
 *     title="Register template"
 *     actionLabel="Register template"
 *     actionIcon="plus"
 *     [visible]="isOpen()"
 *     (closed)="isOpen.set(false)"
 *     (action)="save()">
 *     <p>Body content</p>
 * </app-dialog>
 */
@Component({
    selector: 'app-dialog',
    imports: [Button, Modal],
    templateUrl: './dialog.component.html',
    styleUrl: './dialog.component.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class DialogComponent {
    /**
     * Whether the dialog is open
     * @type {InputSignal<boolean>}
     */
    public readonly visible = input(false);

    /**
     * Title shown in the header
     * @type {InputSignal<string>}
     */
    public readonly title = input.required<string>();

    /**
     * Label of the action button, or null for no action (the footer then shows only the
     * cancel button, e.g. labelled "Close")
     * @type {InputSignal<string | null>}
     */
    public readonly actionLabel = input<string | null>(null);

    /**
     * Font Awesome icon (without `fa-`) shown before the action label, or null for none
     * @type {InputSignal<string | null>}
     */
    public readonly actionIcon = input<string | null>(null);

    /**
     * Style of the action button
     * @type {InputSignal<DialogActionTone>}
     */
    public readonly actionTone = input<DialogActionTone>('primary');

    /**
     * Disables the action button
     * @type {InputSignal<boolean>}
     */
    public readonly actionDisabled = input(false);

    /**
     * Label of the cancel button
     * @type {InputSignal<string>}
     */
    public readonly cancelLabel = input('Cancel');

    /**
     * Work in progress: shows a spinner on the action and blocks every way of closing
     * @type {InputSignal<boolean>}
     */
    public readonly busy = input(false);

    /**
     * Panel width, with a CSS unit
     * @type {InputSignal<string>}
     */
    public readonly width = input('560px');

    /**
     * Whether clicking the backdrop closes the dialog (off by default, so typed input
     * is not lost by a stray click)
     * @type {InputSignal<boolean>}
     */
    public readonly closeOnBackdrop = input(false);

    /**
     * Emits when the dialog should close: ×, Cancel, Escape or backdrop
     * @type {OutputEmitterRef<void>}
     */
    public readonly closed = output<void>();

    /**
     * Emits when the action button is pressed
     * @type {OutputEmitterRef<void>}
     */
    public readonly action = output<void>();

    /**
     * Requests closing, unless work is in progress.
     *
     * @returns {void}
     */
    protected close(): void {
        if (!this.busy()) {
            this.closed.emit();
        }
    }

    /**
     * Emits the action, unless it is disabled or work is in progress.
     *
     * @returns {void}
     */
    protected runAction(): void {
        if (!this.busy() && !this.actionDisabled()) {
            this.action.emit();
        }
    }
}
