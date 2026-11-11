/**
 * Password length limits, matching the BFF's (Supabase Auth takes at most 72).
 */
export const PASSWORD_RULES = {
    /** Shortest password a user may choose */
    minLength: 8,
    /** Longest password */
    maxLength: 72,
} as const;
