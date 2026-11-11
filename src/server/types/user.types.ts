/**
 * Type definitions for the app's users: Supabase Auth accounts with a workflow role,
 * plus the demo account from the environment (a backup Admin login).
 */

/**
 * What a user may do:
 * - admin: manages users, and can do everything else
 * - qc: Graphics QC, passes assets from Review to Approval
 * - management: approves assets (Approval → Ready)
 * - designer: uploads, comments, and puts Ready assets Live
 */
export type UserRole = 'admin' | 'qc' | 'management' | 'designer';

/** A user of the app. */
export interface AppUser {
    /** User ID (Supabase Auth user ID, or "demo-user" for the demo account) */
    id: string;

    /** Sign-in email */
    email: string;

    /** Display name */
    name: string;

    /** What the user may do */
    role: UserRole;

    /** Whether the user must replace a temporary password before using the app */
    mustChangePassword: boolean;

    /** Whether the user can sign in (false once an admin disables them) */
    active: boolean;

    /** Whether this is the demo account from the environment (not editable) */
    isDemo: boolean;

    /** When the account was created, as a UTC ISO timestamp (null for the demo account) */
    createdAt: string | null;

    /** Last sign-in, as a UTC ISO timestamp, or null when never */
    lastSignInAt: string | null;
}

/** What an admin enters to add a user. */
export interface NewUserRequest {
    /** Display name */
    name: string;

    /** Sign-in email */
    email: string;

    /** Role */
    role: UserRole;
}

/** What an admin can change on a user (only the fields given change). */
export interface UserUpdateRequest {
    /** New display name */
    name?: string;

    /** New role */
    role?: UserRole;

    /** Enable (true) or disable (false) sign-in */
    active?: boolean;
}

/** A user together with the temporary password just set for them (shown once). */
export interface UserWithPassword {
    /** The user */
    user: AppUser;

    /** The temporary password, to hand to the user; they must change it on first sign-in */
    temporaryPassword: string;
}

/** A workflow status change some roles may make. */
export interface StatusTransitionRule {
    /** Status the asset has */
    from: string;

    /** Status it moves to */
    to: string;

    /** Roles allowed to make the change (admins always can) */
    roles: readonly UserRole[];
}
