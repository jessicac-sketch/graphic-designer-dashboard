/** Local Imports */
import type { UserRole } from '@shared/models/users/user-role.type';

/**
 * A user of the app, as the BFF returns it (/api/auth, /api/users).
 */
export interface AppUser {
    /** User ID ("demo-user" for the demo account) */
    id: string;

    /** Sign-in email */
    email: string;

    /** Display name */
    name: string;

    /** What the user may do */
    role: UserRole;

    /** Whether the user must replace a temporary password before using the app */
    mustChangePassword: boolean;

    /** Whether the user can sign in */
    active: boolean;

    /** Whether this is the demo account from the server's environment (not editable) */
    isDemo: boolean;

    /** When the account was created, as a UTC ISO timestamp (null for the demo account) */
    createdAt: string | null;

    /** Last sign-in, as a UTC ISO timestamp, or null when never */
    lastSignInAt: string | null;
}
