/**
 * Limits on Mini-Library free text, matching the BFF's (config/library-taxonomy.config.ts).
 */
export const LIBRARY_TEXT_LIMITS = {
    /** Longest asset description, in characters */
    maxDescription: 1000,
    /** Longest comment, in characters */
    maxComment: 2000,
} as const;
