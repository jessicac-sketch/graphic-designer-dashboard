/** Local Imports */
import { UPLOAD_CONFIG } from '../config/environment.config.js';
import {
    LIBRARY_CATEGORIES,
    LIBRARY_FILE_TYPES,
    LIBRARY_INITIAL_STATUS,
    LIBRARY_STATUSES,
    LIBRARY_WORKFLOW_CATEGORIES,
    UPLOADED_VIDEO_THUMBNAIL,
} from '../config/library-taxonomy.config.js';
import type {
    LibraryAsset,
    LibraryAssetCountRow,
    LibraryAssetDetailsUpdate,
    LibraryAssetList,
    LibraryAssetQuery,
    LibraryAssetRow,
    LibraryAssetStatus,
    LibraryCategoryId,
    LibraryComment,
    LibraryCommentRow,
    LibraryCreateAssetsRequest,
    LibraryFileType,
    LibraryQueryScope,
    LibraryTaxonomy,
    LibraryUploadConfig,
} from '../types/library.types.js';
import { getSupabase } from './supabase-client.service.js';

/** Table of asset records (supabase/migrations). */
const ASSETS_TABLE = 'library_assets';

/** Table of comments on assets (supabase/migrations). */
const COMMENTS_TABLE = 'library_asset_comments';

/** View of asset counts per category / subcategory / topic. */
const COUNTS_VIEW = 'library_asset_counts';

/** Most assets one listing returns (the page has no paging yet). */
const LIST_LIMIT = 1000;

/** A Filestack CDN file URL; group 1 is the file handle. */
const FILESTACK_URL = /^https:\/\/cdn\.filestackcontent\.com\/([A-Za-z0-9]+)$/;

/**
 * The Mini-Library's data: asset records in Supabase (`library_assets`), filed under the
 * category tree in `config/library-taxonomy.config.ts`.
 *
 * @remarks
 * Files themselves live in Filestack; a record holds the CDN URL, the handle and where
 * the asset is filed. Every method throws ServiceUnavailableError while Supabase isn't
 * configured.
 */
export class LibraryService {
    /**
     * The category tree (categories, their subcategories and topics) with how many
     * assets each entry holds.
     *
     * @returns {Promise<LibraryTaxonomy>} The taxonomy, in display order
     * @throws {Error} When the query fails
     */
    async getTaxonomy(): Promise<LibraryTaxonomy> {
        const { data, error } = await getSupabase().from(COUNTS_VIEW).select('*');
        if (error) {
            throw new Error(`Failed to count library assets: ${error.message}`);
        }
        const rows = (data ?? []) as LibraryAssetCountRow[];

        const countWhere = (match: (row: LibraryAssetCountRow) => boolean): number =>
            rows.filter(match).reduce((sum, row) => sum + row.asset_count, 0);

        return {
            categories: LIBRARY_CATEGORIES.map((category) => ({
                id: category.id,
                label: category.label,
                subcategoryLabel: category.subcategoryLabel,
                count: countWhere((row) => row.category_id === category.id),
                subcategories: category.subcategories.map((subcategory) => {
                    const inSubcategory = (row: LibraryAssetCountRow): boolean =>
                        row.category_id === category.id && row.subcategory_id === subcategory.id;
                    return {
                        id: subcategory.id,
                        label: subcategory.label,
                        topicLabel: subcategory.topicLabel,
                        count: countWhere(inSubcategory),
                        topics: subcategory.topics.map((topic) => ({
                            ...topic,
                            count: countWhere(
                                (row) => inSubcategory(row) && row.topic_id === topic.id,
                            ),
                        })),
                    };
                }),
            })),
        };
    }

    /**
     * Lists the assets matching a query (at most LIST_LIMIT), plus how many match per
     * file format.
     *
     * @param query - Category / subcategory / topic / search / format filters and the order
     * @returns {Promise<LibraryAssetList>} The matching assets, sorted (ties broken by
     * title), and the per-format counts of the assets matching every filter except the format
     * @throws {Error} When a query fails
     */
    async listAssets(query: LibraryAssetQuery): Promise<LibraryAssetList> {
        const supabase = getSupabase();
        const ascending = query.direction === 'asc';

        const scope = this.scopeOf(query);

        let list = supabase.from(ASSETS_TABLE).select('*').match(scope.match);
        if (scope.searchPattern) {
            list = list.ilike('search_text', scope.searchPattern);
        }
        if (query.fileType) {
            list = list.eq('file_type', query.fileType);
        }

        const countWhere = async (match: Record<string, string>): Promise<number> => {
            let count = supabase
                .from(ASSETS_TABLE)
                .select('id', { count: 'exact', head: true })
                .match(match);
            if (scope.searchPattern) {
                count = count.ilike('search_text', scope.searchPattern);
            }
            const result = await count;
            if (result.error) {
                throw new Error(`Failed to count library assets: ${result.error.message}`);
            }
            return result.count ?? 0;
        };

        // Per status for a workflow category: every filter but the status (format included)
        const hasWorkflow =
            !!query.categoryId && LIBRARY_WORKFLOW_CATEGORIES.includes(query.categoryId);
        const { status: _status, ...matchButStatus } = scope.match;
        const statusBase = query.fileType
            ? { ...matchButStatus, file_type: query.fileType }
            : matchButStatus;

        const [listResult, all, perType, statusAll, perStatus] = await Promise.all([
            list
                .order(query.sort === 'title' ? 'title' : 'updated_at', { ascending })
                .order('title', { ascending: true })
                .limit(LIST_LIMIT),
            countWhere(scope.match),
            Promise.all(
                LIBRARY_FILE_TYPES.map((fileType) =>
                    countWhere({ ...scope.match, file_type: fileType }),
                ),
            ),
            hasWorkflow ? countWhere(statusBase) : Promise.resolve(0),
            hasWorkflow
                ? Promise.all(
                      LIBRARY_STATUSES.map((status) => countWhere({ ...statusBase, status })),
                  )
                : Promise.resolve([]),
        ]);

        if (listResult.error) {
            throw new Error(`Failed to list library assets: ${listResult.error.message}`);
        }

        const fileTypeCounts = { all } as LibraryAssetList['fileTypeCounts'];
        LIBRARY_FILE_TYPES.forEach((fileType, index) => {
            fileTypeCounts[fileType] = perType[index];
        });

        let statusCounts: LibraryAssetList['statusCounts'] = null;
        if (hasWorkflow) {
            statusCounts = { all: statusAll } as NonNullable<LibraryAssetList['statusCounts']>;
            LIBRARY_STATUSES.forEach((status, index) => {
                statusCounts![status] = perStatus[index];
            });
        }

        return {
            assets: ((listResult.data ?? []) as LibraryAssetRow[]).map((row) => this.toAsset(row)),
            fileTypeCounts,
            statusCounts,
        };
    }

    /**
     * How the browser uploads files.
     *
     * @returns {LibraryUploadConfig} The Filestack key, or null when not configured
     */
    getUploadConfig(): LibraryUploadConfig {
        return { filestackApiKey: UPLOAD_CONFIG.FILESTACK_API_KEY };
    }

    /**
     * Checks where a request files its assets against the taxonomy: a known category, a
     * subcategory of it when it has any (none otherwise), and a topic of that subcategory
     * when it has any (none otherwise).
     *
     * @param request - The filing request
     * @returns {string | null} What's wrong, or null when the filing is valid
     */
    filingError(request: LibraryCreateAssetsRequest): string | null {
        const category = LIBRARY_CATEGORIES.find((entry) => entry.id === request.categoryId);
        if (!category) {
            return `Unknown category "${request.categoryId}"`;
        }

        if (category.subcategories.length === 0) {
            return request.subcategoryId || request.topicId
                ? `${category.label} has no subcategories`
                : null;
        }

        const subcategory = category.subcategories.find(
            (entry) => entry.id === request.subcategoryId,
        );
        if (!subcategory) {
            return `Pick a ${category.subcategoryLabel?.toLowerCase() ?? 'subcategory'}`;
        }

        if (subcategory.topics.length === 0) {
            return request.topicId ? `${subcategory.label} has no topics` : null;
        }

        return subcategory.topics.some((entry) => entry.id === request.topicId)
            ? null
            : `Pick a ${subcategory.topicLabel?.toLowerCase() ?? 'topic'}`;
    }

    /**
     * Whether a URL is a Filestack CDN file URL (the only kind of file the library stores).
     *
     * @param url - URL to check
     * @returns {boolean} True for https://cdn.filestackcontent.com/<handle>
     */
    isFilestackUrl(url: string): boolean {
        return FILESTACK_URL.test(url);
    }

    /**
     * Saves uploaded files to the library. Call filingError() first, and check every URL
     * with isFilestackUrl().
     *
     * @param request - A valid filing request
     * @param uploader - Who uploads them (their email), or null when unknown
     * @returns {Promise<LibraryAsset[]>} The new assets
     * @throws {Error} When the insert fails
     */
    async addAssets(
        request: LibraryCreateAssetsRequest,
        uploader: string | null,
    ): Promise<LibraryAsset[]> {
        const category = LIBRARY_CATEGORIES.find((entry) => entry.id === request.categoryId)!;
        const subcategory = category.subcategories.find(
            (entry) => entry.id === request.subcategoryId,
        );
        const topic = subcategory?.topics.find((entry) => entry.id === request.topicId);
        const path = subcategory
            ? [subcategory.label, ...(topic ? [topic.label] : [])]
            : [category.label];

        const inWorkflow = LIBRARY_WORKFLOW_CATEGORIES.includes(category.id);
        const rows = request.assets.map((asset) => {
            const handle = FILESTACK_URL.exec(asset.url)![1];
            const title = asset.title.trim();
            return {
                title,
                category_id: category.id,
                subcategory_id: subcategory?.id ?? null,
                topic_id: topic?.id ?? null,
                path,
                file_type: asset.fileType,
                file_url: asset.url,
                filestack_handle: handle,
                thumbnail_url:
                    asset.fileType === 'mp4'
                        ? null
                        : `https://cdn.filestackcontent.com/resize=width:640/${handle}`,
                tags: request.tags,
                status: inWorkflow ? LIBRARY_INITIAL_STATUS : null,
                status_updated_at: inWorkflow ? new Date().toISOString() : null,
                file_size: asset.size,
                created_by: uploader,
                search_text: this.searchText(title, path, request.tags, ''),
            };
        });

        const { data, error } = await getSupabase().from(ASSETS_TABLE).insert(rows).select('*');
        if (error) {
            throw new Error(`Failed to save library assets: ${error.message}`);
        }
        return ((data ?? []) as LibraryAssetRow[]).map((row) => this.toAsset(row));
    }

    /**
     * Moves an asset of a workflow category (Channel, Sponsorship) to another status.
     *
     * @param id - The asset's ID
     * @param status - The new status
     * @returns {Promise<LibraryAsset | 'not_found' | 'no_workflow'>} The updated asset, or
     * why it couldn't be updated
     * @throws {Error} When a query fails
     */
    async updateStatus(
        id: string,
        status: LibraryAssetStatus,
    ): Promise<LibraryAsset | 'not_found' | 'no_workflow'> {
        const supabase = getSupabase();

        const found = await supabase
            .from(ASSETS_TABLE)
            .select('category_id')
            .eq('id', id)
            .maybeSingle();
        if (found.error) {
            throw new Error(`Failed to find library asset: ${found.error.message}`);
        }
        if (!found.data) {
            return 'not_found';
        }
        const categoryId = (found.data as { category_id: string }).category_id;
        if (!(LIBRARY_WORKFLOW_CATEGORIES as readonly string[]).includes(categoryId)) {
            return 'no_workflow';
        }

        const { data, error } = await supabase
            .from(ASSETS_TABLE)
            .update({ status, status_updated_at: new Date().toISOString() })
            .eq('id', id)
            .select('*')
            .single();
        if (error) {
            throw new Error(`Failed to update the asset status: ${error.message}`);
        }
        return this.toAsset(data as LibraryAssetRow);
    }

    /**
     * One asset.
     *
     * @param id - The asset's ID
     * @returns {Promise<LibraryAsset | null>} The asset, or null when there's none
     * @throws {Error} When the query fails
     */
    async getAsset(id: string): Promise<LibraryAsset | null> {
        const { data, error } = await getSupabase()
            .from(ASSETS_TABLE)
            .select('*')
            .eq('id', id)
            .maybeSingle();
        if (error) {
            throw new Error(`Failed to load the library asset: ${error.message}`);
        }
        return data ? this.toAsset(data as LibraryAssetRow) : null;
    }

    /**
     * Changes an asset's editable details (its description), keeping it searchable by them.
     *
     * @param id - The asset's ID
     * @param update - The new details
     * @returns {Promise<LibraryAsset | null>} The updated asset, or null when there's none
     * @throws {Error} When a query fails
     */
    async updateDetails(
        id: string,
        update: LibraryAssetDetailsUpdate,
    ): Promise<LibraryAsset | null> {
        const current = await this.getAsset(id);
        if (!current) {
            return null;
        }

        const { data, error } = await getSupabase()
            .from(ASSETS_TABLE)
            .update({
                description: update.description,
                search_text: this.searchText(
                    current.title,
                    current.path,
                    current.tags,
                    update.description,
                ),
            })
            .eq('id', id)
            .select('*')
            .single();
        if (error) {
            throw new Error(`Failed to update the asset: ${error.message}`);
        }
        return this.toAsset(data as LibraryAssetRow);
    }

    /**
     * An asset's comments as threads: top-level comments, oldest first, each with its
     * replies, oldest first.
     *
     * @param assetId - The asset's ID
     * @returns {Promise<LibraryComment[] | null>} The threads, or null when there's no such asset
     * @throws {Error} When a query fails
     */
    async listComments(assetId: string): Promise<LibraryComment[] | null> {
        if (!(await this.assetExists(assetId))) {
            return null;
        }

        const { data, error } = await getSupabase()
            .from(COMMENTS_TABLE)
            .select('*')
            .eq('asset_id', assetId)
            .order('created_at', { ascending: true });
        if (error) {
            throw new Error(`Failed to load the comments: ${error.message}`);
        }

        const comments = ((data ?? []) as LibraryCommentRow[]).map((row) => this.toComment(row));
        const threads = comments.filter((comment) => !comment.parentId);
        const byId = new Map(threads.map((thread) => [thread.id, thread]));
        for (const reply of comments.filter((comment) => comment.parentId)) {
            byId.get(reply.parentId!)?.replies.push(reply);
        }
        return threads;
    }

    /**
     * Adds a comment to an asset, or a reply to one of its top-level comments.
     *
     * @param assetId - The asset's ID
     * @param parentId - The top-level comment replied to, or null for a new thread
     * @param author - Who writes it (their email)
     * @param body - The text (already trimmed and length-checked)
     * @returns {Promise<LibraryComment | 'not_found' | 'bad_parent'>} The new comment, or
     * why it couldn't be added
     * @throws {Error} When a query fails
     */
    async addComment(
        assetId: string,
        parentId: string | null,
        author: string,
        body: string,
    ): Promise<LibraryComment | 'not_found' | 'bad_parent'> {
        if (!(await this.assetExists(assetId))) {
            return 'not_found';
        }
        if (parentId) {
            const parent = await this.findComment(parentId);
            // Replies go one level deep, under a comment on the same asset
            if (!parent || parent.asset_id !== assetId || parent.parent_id) {
                return 'bad_parent';
            }
        }

        const { data, error } = await getSupabase()
            .from(COMMENTS_TABLE)
            .insert({ asset_id: assetId, parent_id: parentId, author, body })
            .select('*')
            .single();
        if (error) {
            throw new Error(`Failed to save the comment: ${error.message}`);
        }
        return this.toComment(data as LibraryCommentRow);
    }

    /**
     * Marks a thread (a top-level comment) resolved, or open again.
     *
     * @param commentId - The top-level comment's ID
     * @param resolved - True to resolve, false to reopen
     * @param user - Who does it (their email)
     * @returns {Promise<LibraryComment | 'not_found' | 'not_thread'>} The updated comment
     * (without replies), or why it couldn't be changed
     * @throws {Error} When a query fails
     */
    async setResolved(
        commentId: string,
        resolved: boolean,
        user: string,
    ): Promise<LibraryComment | 'not_found' | 'not_thread'> {
        const comment = await this.findComment(commentId);
        if (!comment) {
            return 'not_found';
        }
        if (comment.parent_id) {
            return 'not_thread';
        }

        const { data, error } = await getSupabase()
            .from(COMMENTS_TABLE)
            .update(
                resolved
                    ? { resolved_at: new Date().toISOString(), resolved_by: user }
                    : { resolved_at: null, resolved_by: null },
            )
            .eq('id', commentId)
            .select('*')
            .single();
        if (error) {
            throw new Error(`Failed to update the comment: ${error.message}`);
        }
        return this.toComment(data as LibraryCommentRow);
    }

    /**
     * Deletes a comment (and its replies). Only its author can.
     *
     * @param commentId - The comment's ID
     * @param user - Who asks (their email)
     * @returns {Promise<'deleted' | 'not_found' | 'forbidden'>} What happened
     * @throws {Error} When a query fails
     */
    async deleteComment(
        commentId: string,
        user: string,
    ): Promise<'deleted' | 'not_found' | 'forbidden'> {
        const comment = await this.findComment(commentId);
        if (!comment) {
            return 'not_found';
        }
        if (comment.author !== user) {
            return 'forbidden';
        }

        const { error } = await getSupabase().from(COMMENTS_TABLE).delete().eq('id', commentId);
        if (error) {
            throw new Error(`Failed to delete the comment: ${error.message}`);
        }
        return 'deleted';
    }

    /**
     * Whether a value is a workflow status.
     *
     * @param value - Raw value, e.g. from a request
     * @returns {boolean} True for review | approval | ready | live
     */
    isStatus(value: string): value is LibraryAssetStatus {
        return (LIBRARY_STATUSES as readonly string[]).includes(value);
    }

    /**
     * Whether a file format is one the library knows.
     *
     * @param value - Raw value, e.g. from a query string
     * @returns {boolean} True for a known format
     */
    isFileType(value: string): value is LibraryFileType {
        return (LIBRARY_FILE_TYPES as readonly string[]).includes(value);
    }

    /**
     * The filters a listing applies besides the file format: exact column matches for the
     * category / subcategory / topic, and a LIKE pattern for the search.
     *
     * @param query - The listing query
     * @returns {LibraryQueryScope} Column matches and the search pattern (null for none)
     */
    private scopeOf(query: LibraryAssetQuery): LibraryQueryScope {
        const match: Record<string, string> = {};
        if (query.categoryId) {
            match['category_id'] = query.categoryId;
        }
        if (query.subcategoryId) {
            match['subcategory_id'] = query.subcategoryId;
        }
        if (query.topicId) {
            match['topic_id'] = query.topicId;
        }
        if (query.status) {
            match['status'] = query.status;
        }

        const search = query.search?.trim().toLowerCase();
        // Escape LIKE wildcards so the text is matched literally
        const literal = search?.replace(/[\\%_]/g, (character) => `\\${character}`);
        return { match, searchPattern: literal ? `%${literal}%` : null };
    }

    /**
     * Maps a table row to the asset the page shows.
     *
     * @param row - A `library_assets` row
     * @returns {LibraryAsset} The asset
     */
    private toAsset(row: LibraryAssetRow): LibraryAsset {
        return {
            id: row.id,
            title: row.title,
            categoryId: row.category_id as LibraryCategoryId,
            subcategoryId: row.subcategory_id,
            topicId: row.topic_id,
            path: row.path,
            fileType: row.file_type as LibraryFileType,
            version: row.version,
            updatedAt: row.updated_at,
            thumbnailUrl: row.thumbnail_url ?? UPLOADED_VIDEO_THUMBNAIL,
            fileUrl: row.file_url,
            tags: row.tags ?? [],
            status: this.isStatus(row.status ?? '') ? (row.status as LibraryAssetStatus) : null,
            statusUpdatedAt: row.status_updated_at,
            description: row.description ?? '',
            fileSize: row.file_size === null ? null : Number(row.file_size),
            createdBy: row.created_by,
            createdAt: row.created_at,
        };
    }

    /**
     * Maps a comment row to the comment the page shows (no replies yet).
     *
     * @param row - A `library_asset_comments` row
     * @returns {LibraryComment} The comment
     */
    private toComment(row: LibraryCommentRow): LibraryComment {
        return {
            id: row.id,
            assetId: row.asset_id,
            parentId: row.parent_id,
            author: row.author,
            body: row.body,
            createdAt: row.created_at,
            resolvedAt: row.resolved_at,
            resolvedBy: row.resolved_by,
            replies: [],
        };
    }

    /**
     * What an asset's search matches: its title, location, tags and description.
     *
     * @param title - Asset title
     * @param path - Location labels
     * @param tags - Tags
     * @param description - Description
     * @returns {string} The lowercase search text
     */
    private searchText(title: string, path: string[], tags: string[], description: string): string {
        return [title, ...path, ...tags, description].join(' ').trim().toLowerCase();
    }

    /**
     * Whether an asset exists.
     *
     * @param id - The asset's ID
     * @returns {Promise<boolean>} True when it does
     * @throws {Error} When the query fails
     */
    private async assetExists(id: string): Promise<boolean> {
        const { count, error } = await getSupabase()
            .from(ASSETS_TABLE)
            .select('id', { count: 'exact', head: true })
            .eq('id', id);
        if (error) {
            throw new Error(`Failed to find the library asset: ${error.message}`);
        }
        return (count ?? 0) > 0;
    }

    /**
     * One comment row.
     *
     * @param id - The comment's ID
     * @returns {Promise<LibraryCommentRow | null>} The row, or null when there's none
     * @throws {Error} When the query fails
     */
    private async findComment(id: string): Promise<LibraryCommentRow | null> {
        const { data, error } = await getSupabase()
            .from(COMMENTS_TABLE)
            .select('*')
            .eq('id', id)
            .maybeSingle();
        if (error) {
            throw new Error(`Failed to find the comment: ${error.message}`);
        }
        return (data as LibraryCommentRow | null) ?? null;
    }
}

export const libraryService = new LibraryService();
