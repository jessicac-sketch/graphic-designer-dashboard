/**
 * Limits on Mini-Library asset tags, matching the BFF's (config/library-taxonomy.config.ts).
 */
export const LIBRARY_TAG_LIMITS = {
    /** Most tags one asset can have */
    maxTags: 20,
    /** Longest tag, in characters */
    maxLength: 30,
} as const;
