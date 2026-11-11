/**
 * A Mini-Library category, sport or topic with how many assets it holds.
 *
 * @template T - Type of the identifier
 */
export interface LibraryCount<T extends string = string> {
    /** Stable identifier, used in queries */
    id: T;

    /** Visible label */
    label: string;

    /** Number of assets filed under it */
    count: number;
}
