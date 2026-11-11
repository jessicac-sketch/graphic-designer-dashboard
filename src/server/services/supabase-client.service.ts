/** Third Party Imports */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/** Local Imports */
import { SUPABASE_CONFIG } from '../config/environment.config.js';
import { ServiceUnavailableError } from '../utils/service-unavailable.error.js';

let client: SupabaseClient | null = null;

/**
 * The BFF's Supabase client (service role, server-side only), created on first use.
 *
 * @returns {SupabaseClient} The client
 * @throws {ServiceUnavailableError} When SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing
 */
export function getSupabase(): SupabaseClient {
    if (!SUPABASE_CONFIG.URL || !SUPABASE_CONFIG.SERVICE_ROLE_KEY) {
        throw new ServiceUnavailableError(
            'The library database is not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).',
        );
    }

    client ??= createClient(SUPABASE_CONFIG.URL, SUPABASE_CONFIG.SERVICE_ROLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
    return client;
}
