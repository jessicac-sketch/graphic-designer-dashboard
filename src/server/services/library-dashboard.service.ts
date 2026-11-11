/** Local Imports */
import {
    LIBRARY_CATEGORIES,
    LIBRARY_FILE_TYPES,
    LIBRARY_STATUSES,
    LIBRARY_WORKFLOW_CATEGORIES,
    UPLOADED_VIDEO_THUMBNAIL,
} from '../config/library-taxonomy.config.js';
import type {
    LibraryAssetStatus,
    LibraryCategoryId,
    LibraryDashboard,
    LibraryFileType,
} from '../types/library.types.js';
import { getSupabase } from './supabase-client.service.js';

/** Weeks of uploads the chart shows (the current one included). */
const WEEKS = 12;

/** Days the top-uploaders list looks back. */
export const CONTRIBUTOR_DAYS = 30;

/** Rows each "latest" / "waiting" list returns. */
const LIST_SIZE = 6;

/** Most assets / comments read for the numbers (enough for an internal library). */
const READ_LIMIT = 10_000;

/** Days in a week, in milliseconds. */
const WEEK_MS = 7 * 24 * 3600 * 1000;

/** The asset columns the dashboard needs. */
interface DashboardAssetRow {
    id: string;
    title: string;
    category_id: string;
    subcategory_id: string | null;
    path: string[];
    file_type: string;
    status: string | null;
    status_updated_at: string | null;
    created_at: string;
    created_by: string | null;
    thumbnail_url: string | null;
    file_url: string;
}

/** The comment columns the dashboard needs, with the asset's title. */
interface DashboardCommentRow {
    id: string;
    asset_id: string;
    parent_id: string | null;
    author: string;
    body: string;
    created_at: string;
    library_assets: { title: string } | { title: string }[] | null;
}

/**
 * The Dashboard's numbers, computed from the library's assets and comments.
 */
export class LibraryDashboardService {
    /**
     * Everything the dashboard shows, as of now.
     *
     * @returns {Promise<LibraryDashboard>} The dashboard data
     * @throws {Error} When a query fails (ServiceUnavailableError when not configured)
     */
    async getDashboard(): Promise<LibraryDashboard> {
        const supabase = getSupabase();

        const [assetsResult, commentsResult, openThreadsResult] = await Promise.all([
            supabase
                .from('library_assets')
                .select(
                    'id, title, category_id, subcategory_id, path, file_type, status, status_updated_at, created_at, created_by, thumbnail_url, file_url',
                )
                .order('created_at', { ascending: false })
                .limit(READ_LIMIT),
            supabase
                .from('library_asset_comments')
                .select('id, asset_id, parent_id, author, body, created_at, library_assets(title)')
                .order('created_at', { ascending: false })
                .limit(LIST_SIZE),
            supabase
                .from('library_asset_comments')
                .select('id', { count: 'exact', head: true })
                .is('parent_id', null)
                .is('resolved_at', null),
        ]);
        if (assetsResult.error) {
            throw new Error(`Failed to read the library assets: ${assetsResult.error.message}`);
        }
        if (commentsResult.error) {
            throw new Error(`Failed to read the comments: ${commentsResult.error.message}`);
        }
        if (openThreadsResult.error) {
            throw new Error(`Failed to count the comments: ${openThreadsResult.error.message}`);
        }

        const assets = (assetsResult.data ?? []) as DashboardAssetRow[];
        const comments = (commentsResult.data ?? []) as DashboardCommentRow[];
        const now = Date.now();
        const thisWeek = this.mondayOf(now);

        const isWorkflow = (row: DashboardAssetRow): boolean =>
            (LIBRARY_WORKFLOW_CATEGORIES as readonly string[]).includes(row.category_id);
        const addedIn = (row: DashboardAssetRow, start: number, end: number): boolean => {
            const time = Date.parse(row.created_at);
            return time >= start && time < end;
        };

        // Uploads per week, oldest first
        const weeklyUploads = Array.from({ length: WEEKS }, (_value, index) => {
            const start = thisWeek - (WEEKS - 1 - index) * WEEK_MS;
            return {
                weekStart: new Date(start).toISOString().slice(0, 10),
                count: assets.filter((row) => addedIn(row, start, start + WEEK_MS)).length,
            };
        });

        // Top uploaders over the last CONTRIBUTOR_DAYS days
        const since = now - CONTRIBUTOR_DAYS * 24 * 3600 * 1000;
        const perUploader = new Map<string, number>();
        for (const row of assets) {
            if (row.created_by && Date.parse(row.created_at) >= since) {
                perUploader.set(row.created_by, (perUploader.get(row.created_by) ?? 0) + 1);
            }
        }

        const fileTypes = Object.fromEntries(LIBRARY_FILE_TYPES.map((type) => [type, 0])) as Record<
            LibraryFileType,
            number
        >;
        for (const row of assets) {
            if (row.file_type in fileTypes) {
                fileTypes[row.file_type as LibraryFileType]++;
            }
        }

        return {
            totals: {
                assets: assets.length,
                uploadsThisWeek: assets.filter((row) => addedIn(row, thisWeek, Infinity)).length,
                uploadsLastWeek: assets.filter((row) => addedIn(row, thisWeek - WEEK_MS, thisWeek))
                    .length,
                waiting: assets.filter(
                    (row) =>
                        isWorkflow(row) && (row.status === 'review' || row.status === 'approval'),
                ).length,
                live: assets.filter((row) => isWorkflow(row) && row.status === 'live').length,
                openThreads: openThreadsResult.count ?? 0,
            },
            workflow: LIBRARY_WORKFLOW_CATEGORIES.map((categoryId) => {
                const inCategory = assets.filter((row) => row.category_id === categoryId);
                const counts = Object.fromEntries(
                    LIBRARY_STATUSES.map((status) => [
                        status,
                        inCategory.filter((row) => row.status === status).length,
                    ]),
                ) as Record<LibraryAssetStatus, number>;
                return {
                    categoryId,
                    label: this.categoryLabel(categoryId),
                    total: inCategory.length,
                    counts,
                };
            }),
            categories: LIBRARY_CATEGORIES.map((category) => ({
                id: category.id,
                label: category.label,
                count: assets.filter((row) => row.category_id === category.id).length,
            })),
            fileTypes,
            weeklyUploads,
            waitingLongest: assets
                .filter(
                    (row) =>
                        isWorkflow(row) &&
                        (row.status === 'review' || row.status === 'approval') &&
                        !!row.status_updated_at,
                )
                .sort((a, b) => Date.parse(a.status_updated_at!) - Date.parse(b.status_updated_at!))
                .slice(0, LIST_SIZE)
                .map((row) => ({
                    id: row.id,
                    title: row.title,
                    location: this.location(row),
                    status: row.status as LibraryAssetStatus,
                    since: row.status_updated_at!,
                })),
            recentUploads: assets.slice(0, LIST_SIZE).map((row) => ({
                id: row.id,
                title: row.title,
                location: this.location(row),
                fileType: row.file_type as LibraryFileType,
                thumbnailUrl: row.thumbnail_url ?? UPLOADED_VIDEO_THUMBNAIL,
                fileUrl: row.file_url,
                createdAt: row.created_at,
                createdBy: row.created_by,
            })),
            recentComments: comments.map((row) => {
                const asset = Array.isArray(row.library_assets)
                    ? row.library_assets[0]
                    : row.library_assets;
                return {
                    id: row.id,
                    assetId: row.asset_id,
                    assetTitle: asset?.title ?? 'Deleted asset',
                    author: row.author,
                    body: row.body,
                    createdAt: row.created_at,
                    isReply: !!row.parent_id,
                };
            }),
            contributors: [...perUploader.entries()]
                .map(([email, count]) => ({ email, count }))
                .sort((a, b) => b.count - a.count || a.email.localeCompare(b.email))
                .slice(0, 5),
        };
    }

    /**
     * Midnight (UTC) of the Monday starting the week of a time.
     *
     * @param time - Epoch milliseconds
     * @returns {number} That Monday, in epoch milliseconds
     */
    private mondayOf(time: number): number {
        const date = new Date(time);
        const sinceMonday = (date.getUTCDay() + 6) % 7;
        return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - sinceMonday);
    }

    /**
     * A category's label.
     *
     * @param id - Category ID
     * @returns {string} Its label (the ID when unknown)
     */
    private categoryLabel(id: string): string {
        return LIBRARY_CATEGORIES.find((category) => category.id === id)?.label ?? id;
    }

    /**
     * Where an asset is filed, e.g. "Channel › Extreme Sports › Skiing".
     *
     * @param row - The asset
     * @returns {string} Its location
     */
    private location(row: DashboardAssetRow): string {
        const category = this.categoryLabel(row.category_id as LibraryCategoryId);
        // A category that isn't split already has its own label as the path
        return (row.subcategory_id ? [category, ...row.path] : row.path).join(' › ');
    }
}

export const libraryDashboardService = new LibraryDashboardService();
