/** Local Imports */
import type { ProgrammaticAd, ProgrammaticAdPage } from '../types/database.types.js';
import type { PlayRecordContent } from '../types/play-record-content.types.js';

/**
 * Service for mapping between database schema and frontend interface.
 * Transforms programmatic_ads rows into PlayRecordContent objects.
 */
export class PlayRecordMapperService {
    /**
     * Maps a database ProgrammaticAd (optionally with computed pop_duration_minutes
     * from get_programmatic_ads_page) to frontend PlayRecordContent.
     *
     * @param dbAd - Database row from programmatic_ads table
     * @returns Frontend-facing play record object
     */
    toContent(dbAd: ProgrammaticAd | ProgrammaticAdPage): PlayRecordContent {
        return {
            id: dbAd.id,
            creativeId: dbAd.creative_id,
            creativeSource: dbAd.creative_source,
            creativeGroupId: dbAd.creative_group_id,
            programmaticId: dbAd.programmatic_id,
            apiUrl: dbAd.api_url,
            vendorKey: dbAd.vendor_key,
            venueId: dbAd.venue_id,
            deviceId: dbAd.device_id,
            fetchedAt: dbAd.fetched_at,
            served: dbAd.served,
            dateServed: dbAd.date_served,
            proofOfPlayData: dbAd.proof_of_play_data,
            played: dbAd.played,
            proofOfPlaySent: dbAd.proof_of_play_sent,
            popScreenshot: dbAd.pop_screenshot,
            metadata: dbAd.metadata,
            opensearchSaved: dbAd.opensearch_saved,
            popDurationMinutes:
                'pop_duration_minutes' in dbAd ? dbAd.pop_duration_minutes : undefined,
            trackerId: this.extractTrackerId(dbAd.metadata),
            slotPlaylistContentId: dbAd.slot_playlist_content_id,
            slotPlaylistContentPosition: dbAd.slot_playlist_content_position,
        };
    }

    /**
     * Extracts the vendor tracking ID from a programmatic_ads row's metadata
     * JSONB column, e.g. { "trackerId": "6aa85d6f802663679c62adf3", ... }.
     * There's no dedicated tracking_id column - this is the only place it's stored.
     *
     * @param metadata - Raw metadata JSONB value
     * @returns The tracking ID, or null if metadata is missing or has no trackerId
     */
    private extractTrackerId(metadata: Record<string, unknown> | null): string | null {
        if (!metadata || typeof metadata['trackerId'] !== 'string') {
            return null;
        }

        return metadata['trackerId'];
    }

    /**
     * Maps an array of database ProgrammaticAds to PlayRecordContent array.
     *
     * @param dbAds - Array of database rows
     * @returns Array of frontend play record objects
     */
    toContentList(dbAds: (ProgrammaticAd | ProgrammaticAdPage)[]): PlayRecordContent[] {
        return dbAds.map((ad) => this.toContent(ad));
    }
}

/**
 * Singleton instance of the play record mapper service.
 */
export const playRecordMapper = new PlayRecordMapperService();
