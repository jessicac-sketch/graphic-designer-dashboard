/**
 * A choice in a select, sort or filter control.
 *
 * @template T - Type of the option's value
 */
export interface SelectOption<T> {
    /** Value stored when the option is chosen */
    value: T;

    /** Visible label */
    label: string;
}
