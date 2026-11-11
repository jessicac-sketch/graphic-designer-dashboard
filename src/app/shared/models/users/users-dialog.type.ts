/** Local Imports */
import type { AppUser } from '@shared/interfaces/users/app-user.interface';

/**
 * Which dialog the Users page shows: adding a user, a temporary password to hand over
 * (after adding or resetting), or confirming a reset or a delete.
 */
export type UsersDialog =
    | { kind: 'add' }
    | { kind: 'password'; user: AppUser; password: string; isNew: boolean }
    | { kind: 'reset'; user: AppUser }
    | { kind: 'delete'; user: AppUser };
