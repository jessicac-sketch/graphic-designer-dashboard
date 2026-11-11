/** Local Imports */
import type { UserRole } from '@shared/models/users/user-role.type';

/**
 * What an admin enters to add a user.
 */
export interface NewUserRequest {
    /** Display name */
    name: string;

    /** Sign-in email */
    email: string;

    /** Role */
    role: UserRole;
}
