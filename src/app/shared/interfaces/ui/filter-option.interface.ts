/**
 * An entry in a {@link FilterListComponent}: a value with a label, an icon and a count.
 *
 * @template T - Type of the filter value
 */
export interface FilterOption<T extends string> {
    /** Value emitted when the entry is picked */
    value: T;

    /** Visible label */
    label: string;

    /** Font Awesome icon name without the `fa-` prefix */
    icon: string;

    /** Number of matching items, shown on the right */
    count: number;
}
