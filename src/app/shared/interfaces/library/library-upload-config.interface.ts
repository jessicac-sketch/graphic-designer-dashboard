/**
 * How the browser uploads Mini-Library files, from the BFF.
 */
export interface LibraryUploadConfig {
    /** Filestack API key (public), or null when uploads aren't configured */
    filestackApiKey: string | null;
}
