/**
 * File extensions the Mini-Library uploader accepts, by kind. `jpeg` is filed as JPG.
 */
export const LIBRARY_UPLOAD_FILE_TYPES = {
    /** Image extensions */
    images: ['png', 'jpg', 'jpeg'],
    /** Video extensions */
    videos: ['mp4'],
} as const;
