/**
 * A link in the app sidebar navigation.
 */
export interface NavItem {
    /** Visible label */
    label: string;

    /** Font Awesome icon name without the `fa-` prefix (e.g. 'grid-2') */
    icon: string;

    /** Router path the item links to */
    route: string;

    /** Match the route exactly when highlighting the active item (use for '/') */
    exact?: boolean;

    /** Optional short badge shown after the label (e.g. 'Beta') */
    badge?: string;
}
