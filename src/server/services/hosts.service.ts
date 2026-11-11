/** Local Imports */
import { getMockDataset } from '../mock-data/mock-dataset.js';
import type { Host } from '../types/hosts.types.js';

/**
 * Venue (host) details by venue ID, answered from the in-memory dummy dataset.
 *
 * @remarks
 * The second seam to replace for a real project: point these two methods at your venue
 * API or table. Callers only rely on the signatures - a venue that isn't found is just
 * left out of the result (the UI then shows it as "Unknown").
 */
export class HostsService {
    /**
     * Looks up hosts by venue IDs.
     *
     * @param venueIds - Venue IDs to look up
     * @returns The hosts found, in no particular order
     *
     * @example
     * ```typescript
     * const hosts = await hostsService.searchByVenueIds(['VEN-0001', 'VEN-0002']);
     * ```
     */
    async searchByVenueIds(venueIds: string[]): Promise<Host[]> {
        const ids = new Set(venueIds);
        return getMockDataset().hosts.filter((host) => ids.has(host.vistarVenueId));
    }

    /**
     * Gets a single host by venue ID.
     *
     * @param venueId - Venue ID to look up
     * @returns The host, or null if not found
     */
    async getByVenueId(venueId: string): Promise<Host | null> {
        return getMockDataset().hosts.find((host) => host.vistarVenueId === venueId) ?? null;
    }
}

/**
 * Singleton instance of the hosts service.
 */
export const hostsService = new HostsService();
