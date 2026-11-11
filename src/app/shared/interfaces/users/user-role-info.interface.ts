/** Local Imports */
import type { UserRole } from '@shared/models/users/user-role.type';

/**
 * How a role is shown: name, what it may do, icon.
 */
export interface UserRoleInfo {
    /** The role */
    value: UserRole;

    /** Name, e.g. "Graphics QC" */
    label: string;

    /** What the role may do, in a line */
    description: string;

    /** Font Awesome icon name without the `fa-` prefix */
    icon: string;
}
