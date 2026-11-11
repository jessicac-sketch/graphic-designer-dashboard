/** Local Imports */
import { VenueStat } from '../types/database.types.js';
import { LocationData } from '../types/hosts.types.js';
import { toUtcInstant } from '../utils/zoned-calendar-date.util.js';
import { dataStore } from './data-store.service.js';
import { hostsService } from './hosts.service.js';

/**
 * Service for fetching location data for programmatic ads.
 * Combines venue statistics from the data store with host details from the hosts service.
 */
export class LocationsService {
    /**
     * Converts a "YYYY-MM-DD" calendar date into a UTC-midnight ISO instant. A date
     * `resolveDateZone` already turned into an instant passes through unchanged.
     * Mirrors MediaFilesService.toUtcMidnight - see its doc comment for why
     * calendar dates, not instants, are accepted from callers.
     *
     * @param calendarDate - Date as "YYYY-MM-DD", an already-resolved ISO instant, or undefined
     * @returns UTC-midnight ISO instant, or undefined if no date was given
     */
    private toUtcMidnight(calendarDate: string | undefined): string | undefined {
        return toUtcInstant(calendarDate);
    }

    /**
     * Gets location data for a specific creative.
     * Combines play statistics with venue/host information.
     *
     * @param creativeId - The creative_id to get locations for
     * @param creativeSource - The creative_source to get locations for
     * @param duration - The creative's duration in seconds, used to compute total play time per venue
     * @param options - Query options
     * @param options.startDate - Only include rows fetched on/after this calendar date, as "YYYY-MM-DD" - omit for all-time
     * @param options.endDate - Only include rows fetched on/before this calendar date, as "YYYY-MM-DD" - omit for all-time
     * @returns Promise resolving to array of location data
     * @throws Error if the operation fails
     *
     * @example
     * ```typescript
     * const locations = await locationsService.getLocationsByCreative('abc123', 'Vistar', 15);
     * ```
     */
    async getLocationsByCreative(
        creativeId: string,
        creativeSource: string,
        duration: number,
        options?: { startDate?: string; endDate?: string },
    ): Promise<LocationData[]> {
        // Step 1: Get venue stats from the data store
        const venueStats = await dataStore.getVenueStatsByCreative(creativeId, creativeSource, {
            startDate: this.toUtcMidnight(options?.startDate),
            endDate: this.toUtcMidnight(options?.endDate),
        });

        if (venueStats.length === 0) {
            return [];
        }

        // Step 2: Extract venue IDs
        const venueIds = venueStats.map((stat: VenueStat) => stat.venue_id);

        // Step 3: Fetch host details from hosts service
        const hosts = await hostsService.searchByVenueIds(venueIds);

        // Step 4: Create a map of venue ID to host for quick lookup
        const hostsMap = new Map(hosts.map((host) => [host.vistarVenueId, host]));

        // Step 5: Combine the data. Venues the hosts service doesn't know are kept (state
        // "Unknown", named by their ID) so the per-state / per-venue shares add up
        return venueStats
            .map((stat: VenueStat) => {
                const host = hostsMap.get(stat.venue_id);

                if (!host) {
                    return {
                        venueId: stat.venue_id,
                        name: stat.venue_id,
                        address: '',
                        city: '',
                        state: 'Unknown',
                        category: 'Unknown',
                        playCount: Number(stat.play_count),
                        latestPlay: stat.latest_play,
                        totalDuration: Number(stat.play_count) * duration,
                    };
                }

                return {
                    venueId: stat.venue_id,
                    name: host.name,
                    address: `${host.address}, ${host.city}, ${host.state} ${host.postalCode}`,
                    city: host.city,
                    state: host.state,
                    category: host.category,
                    playCount: Number(stat.play_count),
                    latestPlay: stat.latest_play,
                    totalDuration: Number(stat.play_count) * duration,
                };
            })
            .filter((location): location is LocationData => location !== null);
    }
}

/**
 * Singleton instance of the locations service.
 */
export const locationsService = new LocationsService();
