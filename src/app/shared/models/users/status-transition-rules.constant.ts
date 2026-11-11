/** Local Imports */
import type { StatusTransitionRule } from '@shared/interfaces/users/status-transition-rule.interface';

/**
 * Who may move an asset between workflow statuses (admins may make any change). A copy
 * of the BFF's rules (server/config/user-roles.config.ts), used to grey out menu entries;
 * the BFF is what enforces them.
 */
export const STATUS_TRANSITION_RULES: readonly StatusTransitionRule[] = [
    { from: 'review', to: 'approval', roles: ['qc'] },
    { from: 'approval', to: 'review', roles: ['qc', 'management'] },
    { from: 'approval', to: 'ready', roles: ['management'] },
    { from: 'ready', to: 'approval', roles: ['management'] },
    { from: 'ready', to: 'live', roles: ['designer'] },
    { from: 'live', to: 'ready', roles: ['designer'] },
];
