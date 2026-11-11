/** Local Imports */
import type { UserRole } from '@shared/models/users/user-role.type';

/**
 * What an admin can change on a user (only the fields given change).
 */
export interface UserUpdateRequest {
    /** New display name */
    name?: string;

    /** New role */
    role?: UserRole;

    /** Enable (true) or disable (false) sign-in */
    active?: boolean;
}
