/**
 * Which of the Dashboard's four breakdown cards (Categories, States, Ads, Venues) is currently
 * shown - only one renders at a time, switched by a control above the stack, so the user
 * doesn't have to scroll past the others to reach the one they want.
 */
export type DashboardBreakdownView = 'categories' | 'states' | 'ads' | 'venues';
