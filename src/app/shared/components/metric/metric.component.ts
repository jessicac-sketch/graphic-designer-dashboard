/** Angular Imports */
import { DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/** Local Imports */
import { MetricLayout, MetricTone } from '@shared/models';

/**
 * A single labelled number (e.g. "Total templates · 12").
 *
 * @example
 * <app-metric label="Needs attention" [value]="4" tone="warn" hint="Expiring or disconnected" />
 * <app-metric layout="inline" icon="city" label="Total businesses" [value]="24" hint="All businesses" />
 * <app-metric label="Received" [value]="5361" [hasAside]="true"><div metric-aside>…</div></app-metric>
 * <app-metric label="States" [value]="30" [clickable]="true" (activate)="scrollTo('states')" />
 */
@Component({
    selector: 'app-metric',
    imports: [DecimalPipe, NgTemplateOutlet],
    templateUrl: './metric.component.html',
    styleUrl: './metric.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
    // Clickable: the whole tile acts as a button (click, Enter or Space)
    host: {
        '[class.metric-host--clickable]': 'clickable()',
        '[attr.role]': "clickable() ? 'button' : null",
        '[attr.tabindex]': 'clickable() ? 0 : null',
        '[attr.aria-label]': 'clickable() ? (actionLabel() ?? label()) : null',
        '(click)': 'onActivate()',
        '(keydown.enter)': 'onActivate()',
        '(keydown.space)': 'onActivate($event)',
    },
})
export class MetricComponent {
    /**
     * Running counter for unique tooltip ids
     * @type {number}
     */
    private static instanceCount = 0;

    /**
     * What the number measures
     * @type {InputSignal<string>}
     */
    public readonly label = input.required<string>();

    /**
     * The number
     * @type {InputSignal<number>}
     */
    public readonly value = input.required<number>();

    /**
     * Optional second, related number shown after the value as "value / secondary",
     * smaller and in the accent color
     * (e.g. venues / devices)
     * @type {InputSignal<number | null>}
     */
    public readonly secondaryValue = input<number | null>(null);

    /**
     * Optional label for `secondaryValue`, shown after the label as "/ <label>" in the
     * same accent color (e.g. "devices")
     * @type {InputSignal<string | null>}
     */
    public readonly secondaryLabel = input<string | null>(null);

    /**
     * Makes the secondary value a button (emits `secondaryClick`), e.g. "1 unknown" opens
     * the list of unknown venues
     * @type {InputSignal<boolean>}
     */
    public readonly secondaryClickable = input(false);

    /**
     * Tooltip / accessible description of the secondary value's button
     * @type {InputSignal<string>}
     */
    public readonly secondaryActionLabel = input('Show details');

    /**
     * Emits when the secondary value's button is pressed (only when `secondaryClickable`)
     * @type {OutputEmitterRef<void>}
     */
    public readonly secondaryClick = output<void>();

    /**
     * Optional extra explanation, shown as an info icon beside the label with a
     * hover / focus tooltip (never under the value, so cards in a row keep one height)
     * @type {InputSignal<string | null>}
     */
    public readonly hint = input<string | null>(null);

    /**
     * Optional Font Awesome icon name (without the `fa-` prefix) shown before the label
     * @type {InputSignal<string | null>}
     */
    public readonly icon = input<string | null>(null);

    /**
     * Color emphasis; status tones also color the left edge
     * @type {InputSignal<MetricTone>}
     */
    public readonly tone = input<MetricTone>('default');

    /**
     * Label above the value (`stacked`) or label left, value right (`inline`)
     * @type {InputSignal<MetricLayout>}
     */
    public readonly layout = input<MetricLayout>('stacked');

    /**
     * Whether `[metric-aside]` content is projected: shown on the right of the label and
     * value when it fits, wrapped underneath when it doesn't
     * @type {InputSignal<boolean>}
     */
    public readonly hasAside = input(false);

    /**
     * Whether the whole tile is clickable (Programmatic Reports addition), e.g. to jump to
     * the number's breakdown; emits `activate`
     * @type {InputSignal<boolean>}
     */
    public readonly clickable = input(false);

    /**
     * Accessible name of the tile when clickable, e.g. "Go to the States breakdown"
     * (defaults to the label)
     * @type {InputSignal<string | null>}
     */
    public readonly actionLabel = input<string | null>(null);

    /**
     * Emits when a clickable tile is clicked (or Enter / Space)
     * @type {OutputEmitterRef<void>}
     */
    public readonly activate = output<void>();

    /**
     * Unique id linking the info icon to its tooltip
     * @type {string}
     */
    protected readonly tooltipId = `metric-hint-${++MetricComponent.instanceCount}`;

    /**
     * Emits `activate` for a clickable tile.
     *
     * @param event - The key event, for Space (so it doesn't scroll the page)
     * @returns {void}
     */
    protected onActivate(event?: Event): void {
        if (!this.clickable()) {
            return;
        }
        event?.preventDefault();
        this.activate.emit();
    }
}
