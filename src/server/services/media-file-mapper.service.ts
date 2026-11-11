/** Local Imports */
import { MediaFile, MediaFileWithMetrics } from '../types/database.types.js';
import { MediaFileContent, MediaFileDetailContent } from '../types/media-file-content.types.js';

/**
 * Service for mapping between database schema and frontend interface.
 * Transforms programmatic_media_files rows into MediaFileContent objects.
 *
 * @remarks
 * This mapper abstracts the database schema from the frontend,
 * allowing schema changes without breaking the Angular application.
 */
export class MediaFileMapperService {
    /**
     * Maps a database MediaFile to frontend MediaFileContent.
     *
     * @param dbFile - Database row from programmatic_media_files table
     * @returns Frontend-facing content object
     *
     * @example
     * ```typescript
     * const content = mapper.toContent(dbFile);
     * ```
     */
    toContent(dbFile: MediaFile): MediaFileContent {
        return {
            contentId: dbFile.id,
            creativeId: dbFile.creative_id,
            creativeSource: dbFile.creative_source,
            title: dbFile.creative_name || dbFile.creative_id,
            mediaUrl: dbFile.s3_url,
            creativeType: dbFile.creative_type,
            source: this.mapSource(dbFile.creative_source),
            duration: dbFile.duration || undefined,
            status: dbFile.status,
            converted: dbFile.converted,
            width: dbFile.width || undefined,
            height: dbFile.height || undefined,
            mimeType: dbFile.mime_type || undefined,
            createdAt: dbFile.created_at,
            updatedAt: dbFile.updated_at,
        };
    }

    /**
     * Maps a database MediaFileWithMetrics to frontend MediaFileDetailContent.
     *
     * @param dbFile - Database row from get_ad_by_id_with_metrics RPC
     * @returns Frontend-facing detail content object
     *
     * @example
     * ```typescript
     * const detail = mapper.toDetailContent(dbFile);
     * ```
     */
    toDetailContent(dbFile: MediaFileWithMetrics): MediaFileDetailContent {
        return {
            ...this.toContent(dbFile),
            playCount: dbFile.play_count,
            totalDurationPlayed: dbFile.total_duration_played,
            lastPlayed: dbFile.last_played,
        };
    }

    /**
     * Maps an array of database MediaFiles to MediaFileContent array.
     *
     * @param dbFiles - Array of database rows
     * @returns Array of frontend content objects
     *
     * @example
     * ```typescript
     * const contents = mapper.toContentList(dbFiles);
     * ```
     */
    toContentList(dbFiles: MediaFile[]): MediaFileContent[] {
        return dbFiles.map((file) => this.toContent(file));
    }

    /**
     * Maps creative_source to frontend source enum.
     *
     * @param source - Database creative_source value
     * @returns Normalized source name
     */
    private mapSource(source: string): 'Vistar' | 'Place Exchange' | 'Video Elephant' | 'Internal' {
        const normalized = source.toLowerCase();

        if (normalized.includes('vistar')) {
            return 'Vistar';
        }
        if (normalized.includes('place') && normalized.includes('exchange')) {
            return 'Place Exchange';
        }
        if (normalized.includes('video') && normalized.includes('elephant')) {
            return 'Video Elephant';
        }

        return 'Internal';
    }
}

/**
 * Singleton instance of the media file mapper service.
 */
export const mediaFileMapper = new MediaFileMapperService();
