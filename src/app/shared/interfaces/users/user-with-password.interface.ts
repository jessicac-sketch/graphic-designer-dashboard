/** Local Imports */
import type { AppUser } from './app-user.interface';

/**
 * A user with the temporary password just set for them, shown to the admin once.
 */
export interface UserWithPassword {
    /** The user */
    user: AppUser;

    /** The temporary password; they must change it on first sign-in */
    temporaryPassword: string;
}
