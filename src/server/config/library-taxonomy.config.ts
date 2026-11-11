/** Local Imports */
import type {
    LibraryAssetStatus,
    LibraryCategoryConfig,
    LibraryCategoryId,
    LibraryFileType,
} from '../types/library.types.js';

/**
 * The library's categories, in display order (the first one opens by default), with how
 * each one is split.
 *
 * @remarks
 * A category can have subcategories, named by `subcategoryLabel` (e.g. "Channel"), and
 * each subcategory its own topics, named by its own `topicLabel` (e.g. "Sport" under
 * Extreme Sports only). The page builds its filters and the upload's "where" step from
 * this tree. IDs are stored with every asset, so never change an ID that has assets:
 * renaming a `label` is fine.
 */
export const LIBRARY_CATEGORIES: readonly LibraryCategoryConfig[] = [
    {
        id: 'channel',
        label: 'Channel',
        subcategoryLabel: 'Channel',
        subcategories: [
            { id: 'cutesy', label: 'Cutesy', topicLabel: null, topics: [] },
            { id: 'trivia', label: 'Trivia', topicLabel: null, topics: [] },
            {
                id: 'extreme-sports',
                label: 'Extreme Sports',
                topicLabel: 'Sport',
                topics: [
                    { id: 'skiing', label: 'Skiing' },
                    { id: 'basketball', label: 'Basketball' },
                    { id: 'motorbiking', label: 'Motorbiking' },
                ],
            },
        ],
    },
    {
        id: 'sponsorship',
        label: 'Sponsorship',
        subcategoryLabel: 'Type',
        subcategories: [
            { id: 'ribbon', label: 'Ribbon', topicLabel: null, topics: [] },
            // The words inside the ribbon, e.g. "Sponsored by:"
            { id: 'ribbon-text', label: 'Ribbon Text', topicLabel: null, topics: [] },
            { id: 'cta', label: 'CTA', topicLabel: null, topics: [] },
            { id: 'logo-animation', label: 'Logo Animation', topicLabel: null, topics: [] },
        ],
    },
    { id: 'ad-content', label: 'Ad Content', subcategoryLabel: null, subcategories: [] },
    { id: 'reels', label: 'Reels', subcategoryLabel: null, subcategories: [] },
    { id: 'statics', label: 'Statics', subcategoryLabel: null, subcategories: [] },
    { id: 'menu-board', label: 'Menu Board', subcategoryLabel: null, subcategories: [] },
];

/**
 * Preview of an uploaded video (no poster frame is generated yet), in public/.
 */
export const UPLOADED_VIDEO_THUMBNAIL = '/library/video-placeholder.svg';

/** Workflow statuses, in order. */
export const LIBRARY_STATUSES: readonly LibraryAssetStatus[] = [
    'review',
    'approval',
    'ready',
    'live',
];

/** Status a newly uploaded asset of a workflow category starts at. */
export const LIBRARY_INITIAL_STATUS: LibraryAssetStatus = 'review';

/** Categories whose assets go through the workflow (the Channel and Sponsorship pages). */
export const LIBRARY_WORKFLOW_CATEGORIES: readonly LibraryCategoryId[] = ['channel', 'sponsorship'];

/** Most tags one asset can have. */
export const LIBRARY_MAX_TAGS = 20;

/** Longest tag, in characters. */
export const LIBRARY_MAX_TAG_LENGTH = 30;

/** Longest asset description, in characters. */
export const LIBRARY_MAX_DESCRIPTION_LENGTH = 1000;

/** Longest comment, in characters (also checked by the database). */
export const LIBRARY_MAX_COMMENT_LENGTH = 2000;

/** Every file format an asset can have. */
export const LIBRARY_FILE_TYPES: readonly LibraryFileType[] = ['png', 'jpg', 'mp4'];
