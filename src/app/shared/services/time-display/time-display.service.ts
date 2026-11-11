/** Angular Imports */
import { Injectable, signal } from '@angular/core';

/** Local Imports */
import type { TimeDisplayMode } from '@shared/models/time-display';
import { zonedUtcOffsetMinutes } from '@shared/utils/zoned-calendar-date.util';

const STORAGE_KEY = 'ntv360-time-display-mode';
const EASTERN_TIME_ZONE = 'America/New_York';

/**
 * Global "Eastern Time / UTC" display preference. Toggling it changes how
 * every displayed timestamp is formatted, and (via DashboardRangeService)
 * what calendar day "yesterday"/a picked day means and which instant a
 * date-range filter actually queries - so switching to Eastern Time doesn't
 * just relabel the same data, it shows the day as it fell in Eastern Time.
 */
@Injectable({ providedIn: 'root' })
export class TimeDisplayService {
    /** Current display mode - defaults to 'utc', restored from localStorage. */
    readonly mode = signal<TimeDisplayMode>(this.readStoredMode());

    /**
     * Reads the persisted mode from localStorage - tolerant of a
     * corrupted/unexpected value or of storage being unavailable (private
     * browsing, blocked site data).
     *
     * @returns The stored mode, or 'utc' if unset/unavailable/invalid
     */
    private readStoredMode(): TimeDisplayMode {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored === 'eastern' || stored === 'utc' ? stored : 'utc';
        } catch {
            return 'utc';
        }
    }

    /**
     * Sets the display mode and persists it for future visits.
     *
     * @param mode - 'eastern' or 'utc'
     * @returns void
     */
    setMode(mode: TimeDisplayMode): void {
        this.mode.set(mode);
        try {
            localStorage.setItem(STORAGE_KEY, mode);
        } catch {
            // Ignore - see readStoredMode(). This is a display convenience,
            // not load-bearing state.
        }
    }

    /** Toggles between 'eastern' and 'utc'. */
    toggle(): void {
        this.setMode(this.mode() === 'eastern' ? 'utc' : 'eastern');
    }

    /**
     * The IANA timezone the current mode resolves to - what every date
     * conversion (display and query boundaries) should use.
     *
     * @returns "America/New_York" in Eastern mode, otherwise "UTC"
     */
    zoneId(): string {
        return this.mode() === 'eastern' ? EASTERN_TIME_ZONE : 'UTC';
    }

    /**
     * Formats a UTC timestamp for display, honoring the current mode.
     *
     * @param isoTimestamp - UTC timestamp (ISO string), or null/undefined for no value
     * @returns Formatted string (e.g. "Oct 14, 2026, 9:12 PM EDT" or "Oct 15, 2026, 2:12 AM UTC"), or '--' if isoTimestamp is missing
     */
    formatTimestamp(isoTimestamp: string | null | undefined): string {
        if (!isoTimestamp) {
            return '--';
        }

        const date = new Date(isoTimestamp);
        if (Number.isNaN(date.getTime())) {
            return '--';
        }

        const timeZone = this.zoneId();
        const formatted = new Intl.DateTimeFormat('en-US', {
            timeZone,
            month: 'short',
            day: '2-digit',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        }).format(date);

        return `${formatted} ${this.zoneAbbreviation(date, timeZone)}`;
    }

    /**
     * Resolves a short zone abbreviation (e.g. "EDT", "EST", "UTC") for a
     * given instant - accounts for daylight saving so a winter timestamp and
     * a summer timestamp in Eastern mode label correctly.
     *
     * @param date - The instant to resolve the abbreviation for
     * @param timeZone - IANA timezone identifier
     * @returns Short zone abbreviation, or the timezone id if it couldn't be resolved
     */
    private zoneAbbreviation(date: Date, timeZone: string): string {
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone,
            timeZoneName: 'short',
        }).formatToParts(date);

        return parts.find((part) => part.type === 'timeZoneName')?.value ?? timeZone;
    }

    /**
     * The current mode's offset from UTC, in minutes, at a given instant
     * (JS-style sign: positive west of UTC) - 0 in UTC mode. Used by
     * DashboardRangeService to compute "today"/query boundaries in the
     * active zone without duplicating the offset lookup.
     *
     * @param at - The instant to resolve the offset for
     * @returns Offset in minutes
     */
    utcOffsetMinutes(at: Date): number {
        if (this.mode() === 'utc') {
            return 0;
        }
        return zonedUtcOffsetMinutes(EASTERN_TIME_ZONE, at);
    }
}
