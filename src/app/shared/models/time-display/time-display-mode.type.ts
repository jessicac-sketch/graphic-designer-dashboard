/**
 * How timestamps and date-range boundaries are interpreted app-wide.
 *
 * - `utc`: the app's long-standing default (every day/range is a UTC calendar day).
 * - `eastern`: America/New_York - handles daylight saving automatically, so the
 *   effective offset is -4 (EDT) or -5 (EST) depending on the date.
 */
export type TimeDisplayMode = 'utc' | 'eastern';
