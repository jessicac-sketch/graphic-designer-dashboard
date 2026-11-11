/** Local Imports */
import type { ProgrammaticAdSummary } from '../types/database.types.js';
import { toUtcInstant } from '../utils/zoned-calendar-date.util.js';
import { dataStore } from './data-store.service.js';

/**
 * One cached range: the in-flight (or settled) fetch and when it stops being served.
 */
interface CachedRange {
    /** The fetch - shared by every caller that asked for this range while it was fresh */
    records: Promise<ProgrammaticAdSummary[]>;

    /** Epoch ms after which this entry is refetched */
    expiresAt: number;
}

/**
 * Short-lived cache of the programmatic_ads rows for a calendar-date range.
 *
 * @remarks
 * The Dashboard is served as three concurrent calls (overview, geography, ads) that all
 * need the same rows, and the row scan is the most expensive step. Caching the promise,
 * not just the result, lets calls that arrive while the scan is still running share it
 * instead of each starting their own. Entries expire after a few minutes (late
 * proof-of-play data lands in these rows), only a few ranges are kept, and a failed
 * fetch is dropped so the next call retries.
 */
export class RangeRecordsCacheService {
    /**
     * How long a fetched range is served before it is refetched
     * @type {number}
     */
    private static readonly TTL_MS = 5 * 60 * 1000;

    /**
     * Most ranges kept at once (a month of rows is tens of MB)
     * @type {number}
     */
    private static readonly MAX_ENTRIES = 4;

    /**
     * Cached ranges, keyed "start|end", oldest first
     * @type {Map<string, CachedRange>}
     */
    private readonly entries = new Map<string, CachedRange>();

    /**
     * Gets every programmatic_ads row received in a UTC calendar-date range (inclusive),
     * from the cache when it holds a fresh copy.
     *
     * @param startDate - First calendar date, "YYYY-MM-DD" (UTC); omit for no lower bound
     * @param endDate - Last calendar date, "YYYY-MM-DD" (UTC); omit for no upper bound
     * @returns Promise resolving to the range's rows
     * @throws Error if the underlying query fails
     */
    getRecords(startDate?: string, endDate?: string): Promise<ProgrammaticAdSummary[]> {
        const key = `${startDate ?? ''}|${endDate ?? ''}`;
        const now = Date.now();

        const cached = this.entries.get(key);
        if (cached && cached.expiresAt > now) {
            return cached.records;
        }

        const records = dataStore.getProgrammaticAds({
            startDate: toUtcInstant(startDate),
            endDate: toUtcInstant(endDate),
        });
        const entry: CachedRange = {
            records,
            expiresAt: now + RangeRecordsCacheService.TTL_MS,
        };

        this.entries.delete(key);
        this.entries.set(key, entry);
        this.evictOldest();

        // A failed fetch must not be served again - drop it (unless a newer one replaced it)
        records.catch(() => {
            if (this.entries.get(key) === entry) {
                this.entries.delete(key);
            }
        });

        return records;
    }

    /**
     * Drops the oldest ranges once more than MAX_ENTRIES are held.
     *
     * @returns void
     */
    private evictOldest(): void {
        while (this.entries.size > RangeRecordsCacheService.MAX_ENTRIES) {
            const oldest = this.entries.keys().next().value;
            if (oldest === undefined) {
                return;
            }
            this.entries.delete(oldest);
        }
    }
}

export const rangeRecordsCache = new RangeRecordsCacheService();
