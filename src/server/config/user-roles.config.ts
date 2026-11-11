/** Local Imports */
import type { StatusTransitionRule, UserRole } from '../types/user.types.js';

/** Every role, from most to least access. */
export const USER_ROLES: readonly UserRole[] = ['admin', 'qc', 'management', 'designer'];

/** Role of a new user when none is given. */
export const DEFAULT_USER_ROLE: UserRole = 'designer';

/** ID of the demo account (AUTH_CONFIG), a backup Admin that isn't a Supabase user. */
export const DEMO_USER_ID = 'demo-user';

/** Shortest password a user may choose. */
export const MIN_PASSWORD_LENGTH = 8;

/** Length of a generated temporary password. */
export const TEMPORARY_PASSWORD_LENGTH = 12;

/**
 * Who may move an asset between workflow statuses. Admins may make any change; every
 * other role only the steps listed here (forward, and back for its own step).
 *
 * @remarks
 * Keep in sync with the frontend's copy (shared/models/users/status-transition-rules.constant.ts),
 * which only greys out menu entries - this list is what's enforced.
 */
export const STATUS_TRANSITION_RULES: readonly StatusTransitionRule[] = [
    // Graphics QC passes an asset on to management
    { from: 'review', to: 'approval', roles: ['qc'] },
    // QC or management send it back for rework
    { from: 'approval', to: 'review', roles: ['qc', 'management'] },
    // Management approves it
    { from: 'approval', to: 'ready', roles: ['management'] },
    // Management withdraws an approval
    { from: 'ready', to: 'approval', roles: ['management'] },
    // Designers put it on the dashboard
    { from: 'ready', to: 'live', roles: ['designer'] },
    // Designers take it off the dashboard
    { from: 'live', to: 'ready', roles: ['designer'] },
];

/**
 * How long a looked-up user (role, active, password state) is reused before it's read
 * from Supabase again. A disabled user or a role change applies within this time.
 */
export const USER_CACHE_TTL_MS = 30_000;
