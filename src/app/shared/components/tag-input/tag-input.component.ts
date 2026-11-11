/** Angular Imports */
import { ChangeDetectionStrategy, Component, computed, input, model, signal } from '@angular/core';

/**
 * A field of removable tag chips: type a tag and press Enter or comma to add it (pasting
 * "a, b, c" adds three); × or Backspace in the empty field removes one. Tags are trimmed,
 * inner spaces collapsed, and duplicates (ignoring case) skipped.
 *
 * @remarks
 * The design system has no tag input (`ntv-tag` is a display-only badge), so the field
 * is styled like `ntv-input`: 40px min height, field tokens, brand focus.
 *
 * @example
 * <app-tag-input label="Tags" [(tags)]="tags" [maxTags]="20" [maxLength]="30" />
 */
@Component({
    selector: 'app-tag-input',
    templateUrl: './tag-input.component.html',
    styleUrl: './tag-input.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class TagInputComponent {
    /**
     * The tags, two-way bound (`[(tags)]`)
     * @type {ModelSignal<string[]>}
     */
    public readonly tags = model<string[]>([]);

    /**
     * Accessible name of the text field, e.g. "Tags"
     * @type {InputSignal<string>}
     */
    public readonly label = input('Tags');

    /**
     * Shown in the empty text field
     * @type {InputSignal<string>}
     */
    public readonly placeholder = input('Add a tag and press Enter');

    /**
     * Most tags allowed; the field stops accepting new ones at the limit
     * @type {InputSignal<number>}
     */
    public readonly maxTags = input(20);

    /**
     * Longest tag, in characters (the text field won't take more)
     * @type {InputSignal<number>}
     */
    public readonly maxLength = input(30);

    /**
     * Whether the field is inactive
     * @type {InputSignal<boolean>}
     */
    public readonly disabled = input(false);

    /**
     * Text typed but not yet added as a tag
     * @type {WritableSignal<string>}
     */
    protected readonly draft = signal('');

    /**
     * Whether no more tags can be added
     * @type {Signal<boolean>}
     */
    protected readonly isFull = computed(() => this.tags().length >= this.maxTags());

    /**
     * Handles Enter / comma (add the draft) and Backspace in an empty field (remove the
     * last tag).
     *
     * @param event - The text field's keydown event
     * @returns {void}
     */
    protected onKeydown(event: KeyboardEvent): void {
        if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault();
            this.add(this.draft());
            return;
        }
        if (event.key === 'Backspace' && !this.draft() && this.tags().length > 0) {
            this.remove(this.tags().length - 1);
        }
    }

    /**
     * Keeps the draft in step with the text field; a comma typed or pasted in adds every
     * complete part as a tag.
     *
     * @param event - The text field's input event
     * @returns {void}
     */
    protected onInput(event: Event): void {
        const field = event.target as HTMLInputElement;
        const parts = field.value.split(',');
        if (parts.length > 1) {
            for (const part of parts.slice(0, -1)) {
                this.add(part);
            }
            field.value = parts[parts.length - 1];
        }
        this.draft.set(field.value);
    }

    /**
     * Adds what's left in the field when it loses focus, so a typed tag isn't lost.
     *
     * @returns {void}
     */
    protected onBlur(): void {
        this.add(this.draft());
    }

    /**
     * Removes the tag at a position.
     *
     * @param index - Position in the list
     * @returns {void}
     */
    protected remove(index: number): void {
        this.tags.update((tags) => tags.filter((_tag, i) => i !== index));
    }

    /**
     * Adds a tag (cleaned) unless it's empty, a duplicate or over the limit, and clears
     * the draft.
     *
     * @param raw - Text to add
     * @returns {void}
     */
    private add(raw: string): void {
        const tag = raw.trim().replace(/\s+/g, ' ').slice(0, this.maxLength());
        this.draft.set('');
        if (!tag || this.isFull()) {
            return;
        }
        const exists = this.tags().some((existing) => existing.toLowerCase() === tag.toLowerCase());
        if (!exists) {
            this.tags.update((tags) => [...tags, tag]);
        }
    }
}
