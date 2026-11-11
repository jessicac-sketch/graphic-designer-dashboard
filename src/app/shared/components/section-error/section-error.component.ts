/** Angular Imports */
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * Inline error for one section of a page whose data failed to load, with a Retry button -
 * so one failed request doesn't take the rest of the page with it.
 *
 * @example
 * <app-section-error message="Failed to load the venues." (retry)="reload()" />
 */
@Component({
    selector: 'app-section-error',
    templateUrl: './section-error.component.html',
    styleUrl: './section-error.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class SectionErrorComponent {
    /**
     * What failed, shown next to the Retry button
     * @type {InputSignal<string>}
     */
    public readonly message = input(
        'Failed to load this. This is usually a transient connection issue.',
    );

    /**
     * Emits when Retry is clicked
     * @type {OutputEmitterRef<void>}
     */
    public readonly retry = output<void>();
}
