/** Express Imports */
import { NextFunction, Request, Response } from 'express';

/** Local Imports */
import {
    resolveAllowedTimeZone,
    zonedMidnightToUtcIso,
} from '../utils/zoned-calendar-date.util.js';

const CALENDAR_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Rewrites every request's `startDate`/`endDate` - in the query string or
 * the JSON body, wherever present - from a bare "YYYY-MM-DD" into the UTC
 * instant for that calendar date's midnight in the request's `timeZone`
 * (query param only, even for POST bodies - see `timeZoneInterceptor`
 * client-side), before any route handler runs.
 *
 * @remarks
 * This is the single integration point for the "Eastern Time / UTC" toggle's
 * query-boundary shift: every BFF date-range endpoint (17+ controller
 * methods) already reads a bare calendar date and assumes it means UTC
 * midnight (`MediaFilesService.toUtcMidnight`, the duplicate in
 * `RangeRecordsCacheService`) - rather than touching each one, this
 * middleware resolves the zone ONCE, upstream of all of them, so they keep
 * receiving exactly the shape they already expect (a date string
 * `new Date(...)` can parse) and need no changes themselves.
 *
 * In UTC mode (the default, or when `timeZone` is absent/unrecognized) this
 * produces the exact same `${date}T00:00:00.000Z` those functions already
 * built internally, so existing behavior is unchanged.
 *
 * `req.query` is replaced wholesale (via `Object.defineProperty`), not
 * mutated field-by-field - Express 5 makes `req.query` a getter that
 * re-parses the query string from `req.url` on every access, so assigning
 * into the object a previous read returned (`req.query.startDate = ...`) is
 * silently discarded; the next `req.query` read (in this same request, by
 * any later middleware or the controller) gets the original, unrewritten
 * value back. Only `req.query` has this problem - `req.body` is a plain
 * property body-parsing middleware assigns once, so mutating it in place
 * works as expected.
 *
 * @param req - Express request
 * @param _res - Express response (unused)
 * @param next - Next middleware
 * @returns void
 */
export function resolveDateZone(req: Request, _res: Response, next: NextFunction): void {
    const timeZone = resolveAllowedTimeZone(req.query['timeZone']);

    const query: Record<string, unknown> = { ...req.query };
    rewriteCalendarDate(query, 'startDate', timeZone);
    rewriteCalendarDate(query, 'endDate', timeZone);
    Object.defineProperty(req, 'query', { value: query, writable: true, configurable: true });

    if (req.body && typeof req.body === 'object') {
        rewriteCalendarDate(req.body as Record<string, unknown>, 'startDate', timeZone);
        rewriteCalendarDate(req.body as Record<string, unknown>, 'endDate', timeZone);
    }

    next();
}

/**
 * Rewrites one field of a query/body object in place, if it's a bare
 * "YYYY-MM-DD" - left untouched if absent, already a full instant (a caller
 * that doesn't go through this convention), or malformed (the route's own
 * validation reports that).
 *
 * @param source - `req.query` or `req.body`
 * @param field - "startDate" or "endDate"
 * @param timeZone - Resolved, allowlisted timezone
 * @returns void
 */
function rewriteCalendarDate(
    source: Record<string, unknown>,
    field: 'startDate' | 'endDate',
    timeZone: string,
): void {
    const value = source[field];
    if (typeof value === 'string' && CALENDAR_DATE_PATTERN.test(value)) {
        source[field] = zonedMidnightToUtcIso(value, timeZone);
    }
}
