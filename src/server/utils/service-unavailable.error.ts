/**
 * Thrown when a service the request needs isn't configured (e.g. Supabase credentials
 * missing). Controllers answer it with 503 and its message.
 */
export class ServiceUnavailableError extends Error {
    /**
     * @param message - What's missing, safe to show to the user
     */
    constructor(message: string) {
        super(message);
        this.name = 'ServiceUnavailableError';
    }
}
