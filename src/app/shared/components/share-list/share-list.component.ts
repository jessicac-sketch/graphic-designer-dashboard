/** Angular Imports */
import { DecimalPipe } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    computed,
    input,
    output,
    signal,
    viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';

/** Local Imports */
import type { ShareItem } from '@shared/interfaces/ui';
import { formatShare } from '@shared/utils/format-share.util';

/**
 * Ranked list of counts with each row's share of a total: rank, optional thumbnail,
 * name (optionally linked) and caption, the percentage of `total`, the count, and a bar
 * scaled to the leader. Shows the first `limit` rows; "Show all" reveals the rest in the
 * same height, scrolling inside the list instead of growing the card.
 *
 * @remarks
 * The share list sibling of gbp's `<app-ranked-list>`: same rank badges and bars, plus
 * percentages, thumbnails and long-list handling.
 *
 * @example
 * <app-share-list [items]="adItems()" [total]="totals.received" unit="received" [showThumbnails]="true" />
 * <app-share-list [items]="adItems()" [total]="total" [selectable]="true" [selectedId]="selectedId()" (selectItem)="select($event)" />
 */
@Component({
    selector: 'app-share-list',
    imports: [DecimalPipe, RouterLink],
    templateUrl: './share-list.component.html',
    styleUrl: './share-list.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class ShareListComponent {
    /**
     * Rows, highest first
     * @type {InputSignal<readonly ShareItem[]>}
     */
    public readonly items = input.required<readonly ShareItem[]>();

    /**
     * The total each row's percentage is taken against (e.g. all received playables)
     * @type {InputSignal<number>}
     */
    public readonly total = input.required<number>();

    /**
     * Unit shown after each count (e.g. "received")
     * @type {InputSignal<string>}
     */
    public readonly unit = input('');

    /**
     * Rows shown before "Show all"
     * @type {InputSignal<number>}
     */
    public readonly limit = input(10);

    /**
     * Whether to show a thumbnail column (rows without an image get an empty box)
     * @type {InputSignal<boolean>}
     */
    public readonly showThumbnails = input(false);

    /**
     * Whether to show each row's percentage, count and bar; off for a plain list of
     * names (e.g. the venues an ad was received at in one state)
     * @type {InputSignal<boolean>}
     */
    public readonly showShares = input(true);

    /**
     * Whether rows can be selected (click or Enter); the selected row is highlighted
     * @type {InputSignal<boolean>}
     */
    public readonly selectable = input(false);

    /**
     * ID of the selected row, when `selectable`
     * @type {InputSignal<string | null>}
     */
    public readonly selectedId = input<string | null>(null);

    /**
     * Emits a row's ID when it is selected (only when `selectable`)
     * @type {OutputEmitterRef<string>}
     */
    public readonly selectItem = output<string>();

    /**
     * Message shown when there are no rows
     * @type {InputSignal<string>}
     */
    public readonly emptyText = input('Nothing received.');

    /**
     * Whether every row is shown (vs. the first `limit`)
     * @type {WritableSignal<boolean>}
     */
    protected readonly isExpanded = signal(false);

    /**
     * The collapsed list's height, measured on "Show all" and kept while expanded, so
     * the list scrolls instead of growing
     * @type {WritableSignal<number | null>}
     */
    protected readonly lockedHeight = signal<number | null>(null);

    /**
     * The rows' list element, measured before expanding
     * @type {Signal<ElementRef<HTMLOListElement> | undefined>}
     */
    private readonly list = viewChild<ElementRef<HTMLOListElement>>('list');

    /**
     * Rows currently shown
     * @type {Signal<readonly ShareItem[]>}
     */
    protected readonly visibleItems = computed(() =>
        this.isExpanded() ? this.items() : this.items().slice(0, this.limit()),
    );

    /**
     * Highest count in the list, used to scale the bars
     * @type {Signal<number>}
     */
    protected readonly maxValue = computed(() =>
        Math.max(1, ...this.items().map((item) => item.value)),
    );

    /**
     * Switches between the first `limit` rows and all rows. Expanding locks the list at
     * its current (collapsed) height so the extra rows scroll inside it.
     *
     * @returns {void}
     */
    protected toggle(): void {
        if (!this.isExpanded()) {
            this.lockedHeight.set(this.list()?.nativeElement.offsetHeight ?? null);
        }
        this.isExpanded.set(!this.isExpanded());
    }

    /**
     * Selects a row, when the list is selectable.
     *
     * @param id - The row's ID
     * @returns {void}
     */
    protected onSelect(id: string): void {
        if (this.selectable()) {
            this.selectItem.emit(id);
        }
    }

    /**
     * Formats a count as a percentage of `total`: one decimal, "<0.1%" for tiny
     * non-zero shares, "0%" when the total is zero.
     *
     * @param value - The row's count
     * @returns {string} The share, e.g. "12.5%"
     */
    protected formatShare(value: number): string {
        return formatShare(value, this.total());
    }
}
