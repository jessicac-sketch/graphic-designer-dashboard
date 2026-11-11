/** Angular Imports */
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Page heading used by the list pages (Templates, Franchisees, Businesses): an orange
 * eyebrow, the title with an optional "Preview" tag, a subtitle, and the page's main
 * action projected on the right.
 *
 * @example
 * <app-page-header eyebrow="Businesses" title="Businesses" subtitle="…" [preview]="true">
 *     <ntv-button variant="primary" size="xl">Add business</ntv-button>
 * </app-page-header>
 * <app-page-header title="Map View" subtitle="…">
 *     <p page-header-meta class="total">Total: 2,852</p>
 * </app-page-header>
 */
@Component({
    selector: 'app-page-header',
    templateUrl: './page-header.component.html',
    styleUrl: './page-header.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class PageHeaderComponent {
    /**
     * Small label above the title
     * @type {InputSignal<string>}
     */
    public readonly eyebrow = input.required<string>();

    /**
     * Page title
     * @type {InputSignal<string>}
     */
    public readonly title = input.required<string>();

    /**
     * One-line description under the title
     * @type {InputSignal<string>}
     */
    public readonly subtitle = input('');

    /**
     * Shows a "Preview" tag next to the title (page runs on sample data)
     * @type {InputSignal<boolean>}
     */
    public readonly preview = input(false);
}
