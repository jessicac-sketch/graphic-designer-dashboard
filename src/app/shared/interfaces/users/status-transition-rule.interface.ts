/** Local Imports */
import type { LibraryAssetStatus } from '@shared/models/library/library-asset-status.type';
import type { UserRole } from '@shared/models/users/user-role.type';

/**
 * A workflow status change some roles may make.
 */
export interface StatusTransitionRule {
    /** Status the asset has */
    from: LibraryAssetStatus;

    /** Status it moves to */
    to: LibraryAssetStatus;

    /** Roles allowed to make the change (admins always can) */
    roles: readonly UserRole[];
}
