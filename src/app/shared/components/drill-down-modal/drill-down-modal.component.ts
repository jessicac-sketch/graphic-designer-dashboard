/** Angular Imports */
import { Component, input, output } from '@angular/core';

/** Third Party Imports */
import { Modal } from '@ntv360/component-pantry';

/**
 * Shared chrome for every "click a cell, see a breakdown" drill-down modal
 * on the dashboard (Total Ads, Play Count/Locations, State Ranking's Venue
 * Count/Unique Ads Played, etc.) - a title, an optional subtitle, a close
 * button, and a projected content area for whatever table each drill-down
 * shows. Without this, every new drill-down modal re-implements the same
 * `<ntv-modal>` wrapper, header markup, and close button from scratch.
 *
 * @example
 * ```html
 * @if (selectedThing(); as thing) {
 *     <app-drill-down-modal
 *         [title]="thing.name"
 *         [subtitle]="thing.count + ' items'"
 *         (closed)="closeThing()">
 *         <ntv-table ...>...</ntv-table>
 *     </app-drill-down-modal>
 * }
 * ```
 */
@Component({
    selector: 'app-drill-down-modal',
    standalone: true,
    imports: [Modal],
    template: `
        <ntv-modal
            [isVisible]="true"
            [showHeader]="false"
            [closable]="false"
            [closeOnBackdrop]="true"
            [closeOnEscape]="true"
            size="xlarge"
            [modalWidth]="'min(95vw, 90rem)'"
            [modalHeight]="'auto'"
            backdrop="blur"
            (modalClose)="closed.emit()"
            (backdropClick)="closed.emit()">
            <div class="drill-down-modal" (click)="$event.stopPropagation()">
                <header class="drill-down-modal__header">
                    <div>
                        <h2 class="drill-down-modal__title">{{ title() }}</h2>
                        @if (subtitle()) {
                            <p class="drill-down-modal__subtitle">{{ subtitle() }}</p>
                        }
                    </div>
                    <button
                        type="button"
                        class="drill-down-modal__close"
                        aria-label="Close"
                        (click)="closed.emit()">
                        <i class="fa-sharp fa-regular fa-xmark" aria-hidden="true"></i>
                    </button>
                </header>

                <ng-content />
            </div>
        </ntv-modal>
    `,
    styles: [
        `
            .drill-down-modal {
                display: flex;
                flex-direction: column;
                gap: 1rem;
                padding: 0.75rem;

                &__header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 1rem;
                    margin: -0.75rem -0.75rem 0;
                    padding: 0.75rem 1.25rem;
                    border-bottom: 1px solid var(--app-surface-border);
                }

                &__title {
                    margin: 0;
                    font-size: 1rem;
                    font-weight: 700;
                    color: var(--app-content-primary);
                }

                &__subtitle {
                    margin: 0.25rem 0 0;
                    color: var(--app-content-muted);
                    font-size: 0.875rem;
                }

                &__close {
                    display: flex;
                    flex-shrink: 0;
                    align-items: center;
                    justify-content: center;
                    width: 2rem;
                    height: 2rem;
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: var(--app-content-muted);
                    transition:
                        background-color 0.15s ease,
                        color 0.15s ease;

                    &:hover {
                        background-color: var(--app-surface-hover);
                        color: var(--app-content-primary);
                    }
                }
            }
        `,
    ],
})
export class DrillDownModalComponent {
    /** Modal heading. */
    title = input.required<string>();

    /** Optional line under the heading (e.g. "42 ads across 5 venues"). */
    subtitle = input<string | null>(null);

    /** Emitted on close button, backdrop click, or Escape. */
    closed = output<void>();
}
