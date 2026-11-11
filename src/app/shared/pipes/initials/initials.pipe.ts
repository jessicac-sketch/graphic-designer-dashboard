/** Angular Imports */
import { Pipe, PipeTransform } from '@angular/core';

/**
 * Turns a name (or email) into up to two uppercase initials for avatars.
 *
 * @example
 * {{ 'Earl Vhin' | initials }}       <!-- EV -->
 * {{ 'vhin@ntv360.com' | initials }} <!-- V -->
 */
@Pipe({
    name: 'initials',
})
export class InitialsPipe implements PipeTransform {
    /**
     * Builds initials from the first and last words of the value.
     *
     * @param value - A full name or email address
     * @returns {string} One or two uppercase letters, or '' when empty
     */
    transform(value: string | null | undefined): string {
        const words = (value ?? '').split('@')[0].trim().split(/\s+/).filter(Boolean);
        if (words.length === 0) {
            return '';
        }
        const first = words[0][0];
        const last = words.length > 1 ? words[words.length - 1][0] : '';
        return (first + last).toUpperCase();
    }
}
