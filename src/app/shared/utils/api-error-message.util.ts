/** Angular Imports */
import { HttpErrorResponse } from '@angular/common/http';

/**
 * The message to show for a failed BFF call: the BFF's own `errorDescription` when it
 * sent one (e.g. "The library database is not configured"), otherwise a fallback.
 *
 * @param error - What the HTTP call failed with
 * @param fallback - Message when the BFF gave no description
 * @returns {string} The message
 *
 * @example
 * catchError((error) => { this.message.set(apiErrorMessage(error, 'Failed to load.')); ... })
 */
export function apiErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
        const body: unknown = error.error;
        if (body && typeof body === 'object' && 'errorDescription' in body) {
            const description = (body as { errorDescription?: unknown }).errorDescription;
            if (typeof description === 'string' && description) {
                return description;
            }
        }
    }
    return fallback;
}
