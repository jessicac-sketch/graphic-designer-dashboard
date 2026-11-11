/** Third Party Imports */
import type { CardConfig } from '@ntv360/component-pantry';

/**
 * Standard `ntv-card` look: flat and outlined (sharp corners, no shadow, no hover lift),
 * re-themed to the navy surface in _pantry-dark-fixes.scss.
 *
 * @example
 * <ntv-card [config]="cardConfig">…</ntv-card>
 */
export const CARD_CONFIG: Partial<CardConfig> = {
    variant: 'default',
    rounded: 'none',
    shadow: 'none',
    hoverEffect: false,
    fullWidth: true,
};
