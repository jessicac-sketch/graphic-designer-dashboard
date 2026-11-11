/** Local Imports */
import type { LibraryAssetStatus } from '@shared/models/library/library-asset-status.type';
import { STATUS_TRANSITION_RULES } from '@shared/models/users/status-transition-rules.constant';
import type { UserRole } from '@shared/models/users/user-role.type';

/**
 * Whether a role may move an asset from one workflow status to another (admins always
 * may). Only for showing what's allowed - the BFF enforces the rules.
 *
 * @param role - The user's role, or null when unknown (nothing allowed)
 * @param from - Current status
 * @param to - New status
 * @returns {boolean} True when allowed
 *
 * @example
 * canChangeStatus('qc', 'review', 'approval'); // true
 * canChangeStatus('designer', 'review', 'approval'); // false
 */
export function canChangeStatus(
    role: UserRole | null,
    from: LibraryAssetStatus,
    to: LibraryAssetStatus,
): boolean {
    if (!role) {
        return false;
    }
    return (
        role === 'admin' ||
        STATUS_TRANSITION_RULES.some(
            (rule) => rule.from === from && rule.to === to && rule.roles.includes(role),
        )
    );
}
