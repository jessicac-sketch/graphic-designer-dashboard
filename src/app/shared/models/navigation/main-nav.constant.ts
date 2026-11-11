/** Local Imports */
import { NavItem } from '@shared/interfaces/navigation';

/**
 * Primary sidebar navigation, in display order.
 */
export const MAIN_NAV_ITEMS: readonly NavItem[] = [
    { label: 'Dashboard', icon: 'grid-2', route: '/dashboard' },
    { label: 'Mini-Library', icon: 'photo-film', route: '/mini-library' },
    { label: 'Channel', icon: 'tv', route: '/channel' },
    { label: 'Sponsorship', icon: 'handshake', route: '/sponsorship' },
];
