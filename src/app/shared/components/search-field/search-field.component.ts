/** Angular Imports */
import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

/** Third Party Imports */
import { Input } from '@ntv360/component-pantry';
import { debounceTime } from 'rxjs';

/**
 * A small search box for a card's header (`card-tools` slot), 40px tall like the sort
 * control beside it. The parent owns what is searched; this only reports the typed text.
 *
 * @example
 * <app-search-field card-tools placeholder="Search states" (valueChange)="query.set($event)" />
 */
@Component({
    selector: 'app-search-field',
    imports: [Input, ReactiveFormsModule],
    templateUrl: './search-field.component.html',
    styleUrl: './search-field.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class SearchFieldComponent {
    /**
     * How long typing must pause before the text is reported, in milliseconds
     * @type {number}
     */
    private static readonly DEBOUNCE_MS = 400;

    /**
     * Hint inside the empty box
     * @type {InputSignal<string>}
     */
    public readonly placeholder = input('Search…');

    /**
     * The text to show (lets the parent clear the box)
     * @type {InputSignal<string>}
     */
    public readonly value = input('');

    /**
     * Emits the typed text on every change
     * @type {OutputEmitterRef<string>}
     */
    public readonly valueChange = output<string>();

    /**
     * The box's form control
     * @type {FormControl<string>}
     */
    protected readonly control = new FormControl('', { nonNullable: true });

    constructor() {
        // Waits for a pause in typing: a search can change what a page loads (the Dashboard's
        // Venue view loads the first match's slots), so a request per letter is wasteful
        this.control.valueChanges
            .pipe(debounceTime(SearchFieldComponent.DEBOUNCE_MS), takeUntilDestroyed())
            .subscribe((text) => this.valueChange.emit(text ?? ''));

        // Follows the parent when it sets the text (e.g. clears it)
        effect(() => {
            const text = this.value();
            if (text !== this.control.value) {
                this.control.setValue(text, { emitEvent: false });
            }
        });
    }
}
