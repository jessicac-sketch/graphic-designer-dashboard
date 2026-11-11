/** Angular Imports */
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Third Party Imports */
import { Card } from '@ntv360/component-pantry';

/**
 * Outlined dashboard card with an icon, title, optional "View all" link and Preview tag.
 * The card body is projected content; `[card-tools]` content sits right after the title
 * (e.g. a search) and `[card-action]` content on the right of the header.
 *
 * @example
 * <app-summary-card title="Templates" icon="clipboard" route="/templates" [isPreview]="true">
 *     ...
 * </app-summary-card>
 */
@Component({
    selector: 'app-summary-card',
    imports: [RouterLink, Card],
    templateUrl: './summary-card.component.html',
    styleUrl: './summary-card.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
    // The `title` input also stays on the host as a native `title` attribute, which made
    // the browser show the card's title as a tooltip anywhere in the card: drop it
    host: { '[attr.title]': 'null' },
})
export class SummaryCardComponent {
    /**
     * Card title
     * @type {InputSignal<string>}
     */
    public readonly title = input.required<string>();

    /**
     * Font Awesome icon name without the `fa-` prefix
     * @type {InputSignal<string>}
     */
    public readonly icon = input.required<string>();

    /**
     * Route for the "View all" link; omit to hide the link
     * @type {InputSignal<string | null>}
     */
    public readonly route = input<string | null>(null);

    /**
     * Optional one-sentence instruction shown centered in the header (e.g. "Pick an ad
     * to see its states"); hidden on small screens
     * @type {InputSignal<string | null>}
     */
    public readonly hint = input<string | null>(null);

    /**
     * Marks the card as showing sample data
     * @type {InputSignal<boolean>}
     */
    public readonly isPreview = input(false);
}
