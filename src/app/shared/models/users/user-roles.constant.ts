/** Local Imports */
import type { UserRoleInfo } from '@shared/interfaces/users/user-role-info.interface';

/**
 * Every role, from most to least access, with how each is shown.
 */
export const USER_ROLES: readonly UserRoleInfo[] = [
    {
        value: 'admin',
        label: 'Admin',
        description: 'Manages users; can do everything',
        icon: 'user-shield',
    },
    {
        value: 'qc',
        label: 'Graphics QC',
        description: 'Checks uploads and passes them to management',
        icon: 'magnifying-glass',
    },
    {
        value: 'management',
        label: 'Management',
        description: 'Approves assets for upload',
        icon: 'user-check',
    },
    {
        value: 'designer',
        label: 'Designer',
        description: 'Uploads assets and puts approved ones live',
        icon: 'pen-ruler',
    },
];
