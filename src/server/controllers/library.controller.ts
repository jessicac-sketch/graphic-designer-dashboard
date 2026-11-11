/** Third Party Imports */
import type { Request, Response } from 'express';

/** Local Imports */
import {
    LIBRARY_CATEGORIES,
    LIBRARY_MAX_COMMENT_LENGTH,
    LIBRARY_MAX_DESCRIPTION_LENGTH,
    LIBRARY_MAX_TAG_LENGTH,
    LIBRARY_MAX_TAGS,
} from '../config/library-taxonomy.config.js';
import { libraryService } from '../services/library.service.js';
import type {
    LibraryAssetQuery,
    LibraryCategoryId,
    LibraryCreateAssetsRequest,
} from '../types/library.types.js';
import { ServiceUnavailableError } from '../utils/service-unavailable.error.js';

/** An asset ID (a UUID from the library_assets table). */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Controller for the Mini-Library endpoints.
 * Handles HTTP requests and delegates business logic to the service layer.
 */
export class LibraryController {
    /**
     * Handles GET /api/library/taxonomy
     * The categories with their subcategories and topics, with asset counts.
     *
     * @param _req - Express request
     * @param res - Express response
     * @returns {void}
     */
    async getTaxonomy(_req: Request, res: Response): Promise<void> {
        try {
            res.json({ data: await libraryService.getTaxonomy() });
        } catch (error) {
            this.serverError(res, error, 'Failed to load the library categories');
        }
    }

    /**
     * Handles GET /api/library/assets
     * Query: category, subcategory, topic, search, status (review | approval | ready | live), fileType (png | jpg | mp4), sort
     * (updated (default) | title), direction (desc (default) | asc).
     *
     * @param req - Express request
     * @param res - Express response
     * @returns {Promise<void>}
     */
    async getAssets(req: Request, res: Response): Promise<void> {
        const category = this.queryString(req, 'category');
        const fileType = this.queryString(req, 'fileType');
        const status = this.queryString(req, 'status');
        const sort = this.queryString(req, 'sort') ?? 'updated';
        const direction = this.queryString(req, 'direction') ?? 'desc';

        if (category && !LIBRARY_CATEGORIES.some((entry) => entry.id === category)) {
            this.badRequest(res, `Unknown category "${category}"`);
            return;
        }
        if (fileType && !libraryService.isFileType(fileType)) {
            this.badRequest(res, `Unknown file type "${fileType}"`);
            return;
        }
        if (status && !libraryService.isStatus(status)) {
            this.badRequest(res, `Unknown status "${status}"`);
            return;
        }
        if (sort !== 'updated' && sort !== 'title') {
            this.badRequest(res, 'sort must be "updated" or "title"');
            return;
        }
        if (direction !== 'asc' && direction !== 'desc') {
            this.badRequest(res, 'direction must be "asc" or "desc"');
            return;
        }

        const query: LibraryAssetQuery = {
            categoryId: category as LibraryCategoryId | undefined,
            subcategoryId: this.queryString(req, 'subcategory'),
            topicId: this.queryString(req, 'topic'),
            search: this.queryString(req, 'search'),
            fileType: fileType as LibraryAssetQuery['fileType'],
            status: status as LibraryAssetQuery['status'],
            sort,
            direction,
        };

        try {
            res.json({ data: await libraryService.listAssets(query) });
        } catch (error) {
            this.serverError(res, error, 'Failed to load the library assets');
        }
    }

    /**
     * Handles GET /api/library/upload-config
     * How the browser uploads files: the Filestack API key, or null when not configured.
     *
     * @param _req - Express request
     * @param res - Express response
     * @returns {void}
     */
    getUploadConfig(_req: Request, res: Response): void {
        res.json({ data: libraryService.getUploadConfig() });
    }

    /**
     * Handles POST /api/library/assets
     * Files uploaded files under a category (and subcategory / topic where it has them).
     * Body: categoryId, subcategoryId, topicId, assets: [{ title, fileType, url }], tags
     * (optional).
     *
     * @param req - Express request
     * @param res - Express response
     * @returns {Promise<void>}
     */
    async createAssets(req: Request, res: Response): Promise<void> {
        const body: unknown = req.body;
        const request = this.parseCreateRequest(body);
        if (typeof request === 'string') {
            this.badRequest(res, request);
            return;
        }

        const filingError = libraryService.filingError(request);
        if (filingError) {
            this.badRequest(res, filingError);
            return;
        }

        try {
            res.status(201).json({
                data: await libraryService.addAssets(request, req.user?.email ?? null),
            });
        } catch (error) {
            this.serverError(res, error, 'Failed to add the assets');
        }
    }

    /**
     * Handles PATCH /api/library/assets/:id/status
     * Moves a Channel or Sponsorship asset to another workflow status. Body: { status }.
     *
     * @param req - Express request
     * @param res - Express response
     * @returns {Promise<void>}
     */
    async updateStatus(req: Request, res: Response): Promise<void> {
        const id = req.params['id'];
        const status: unknown = (req.body as Record<string, unknown> | undefined)?.['status'];

        if (typeof id !== 'string' || !UUID.test(id)) {
            this.badRequest(res, 'Unknown asset');
            return;
        }
        if (typeof status !== 'string' || !libraryService.isStatus(status)) {
            this.badRequest(res, 'status must be review, approval, ready or live');
            return;
        }

        try {
            const result = await libraryService.updateStatus(id, status);
            if (result === 'not_found') {
                res.status(404).json({ error: 'not_found', errorDescription: 'Asset not found' });
            } else if (result === 'no_workflow') {
                this.badRequest(res, 'Only Channel and Sponsorship assets have a status');
            } else {
                res.json({ data: result });
            }
        } catch (error) {
            this.serverError(res, error, 'Failed to update the status');
        }
    }

    /**
     * Handles GET /api/library/assets/:id
     * One asset, for its page.
     *
     * @param req - Express request
     * @param res - Express response
     * @returns {Promise<void>}
     */
    async getAsset(req: Request, res: Response): Promise<void> {
        const id = this.idParam(req, 'id');
        if (!id) {
            this.notFound(res, 'Asset not found');
            return;
        }
        try {
            const asset = await libraryService.getAsset(id);
            if (asset) {
                res.json({ data: asset });
            } else {
                this.notFound(res, 'Asset not found');
            }
        } catch (error) {
            this.serverError(res, error, 'Failed to load the asset');
        }
    }

    /**
     * Handles PATCH /api/library/assets/:id
     * Changes an asset's editable details. Body: { description }.
     *
     * @param req - Express request
     * @param res - Express response
     * @returns {Promise<void>}
     */
    async updateDetails(req: Request, res: Response): Promise<void> {
        const id = this.idParam(req, 'id');
        const description: unknown = (req.body as Record<string, unknown> | undefined)?.[
            'description'
        ];
        if (!id) {
            this.notFound(res, 'Asset not found');
            return;
        }
        if (typeof description !== 'string') {
            this.badRequest(res, 'description must be a string');
            return;
        }
        const clean = description.trim();
        if (clean.length > LIBRARY_MAX_DESCRIPTION_LENGTH) {
            this.badRequest(
                res,
                `The description can be at most ${LIBRARY_MAX_DESCRIPTION_LENGTH} characters`,
            );
            return;
        }

        try {
            const asset = await libraryService.updateDetails(id, { description: clean });
            if (asset) {
                res.json({ data: asset });
            } else {
                this.notFound(res, 'Asset not found');
            }
        } catch (error) {
            this.serverError(res, error, 'Failed to update the asset');
        }
    }

    /**
     * Handles GET /api/library/assets/:id/comments
     * The asset's comment threads, each with its replies.
     *
     * @param req - Express request
     * @param res - Express response
     * @returns {Promise<void>}
     */
    async getComments(req: Request, res: Response): Promise<void> {
        const id = this.idParam(req, 'id');
        if (!id) {
            this.notFound(res, 'Asset not found');
            return;
        }
        try {
            const threads = await libraryService.listComments(id);
            if (threads) {
                res.json({ data: threads });
            } else {
                this.notFound(res, 'Asset not found');
            }
        } catch (error) {
            this.serverError(res, error, 'Failed to load the comments');
        }
    }

    /**
     * Handles POST /api/library/assets/:id/comments
     * Adds a comment, or a reply to a top-level comment. Body: { body, parentId? }.
     *
     * @param req - Express request
     * @param res - Express response
     * @returns {Promise<void>}
     */
    async createComment(req: Request, res: Response): Promise<void> {
        const id = this.idParam(req, 'id');
        const { body, parentId } = (req.body ?? {}) as Record<string, unknown>;
        if (!id) {
            this.notFound(res, 'Asset not found');
            return;
        }
        if (typeof body !== 'string' || !body.trim()) {
            this.badRequest(res, 'Write a comment first');
            return;
        }
        const text = body.trim();
        if (text.length > LIBRARY_MAX_COMMENT_LENGTH) {
            this.badRequest(
                res,
                `A comment can be at most ${LIBRARY_MAX_COMMENT_LENGTH} characters`,
            );
            return;
        }
        if (
            parentId !== undefined &&
            parentId !== null &&
            (typeof parentId !== 'string' || !UUID.test(parentId))
        ) {
            this.badRequest(res, 'parentId must be a comment ID, or null');
            return;
        }

        try {
            const result = await libraryService.addComment(
                id,
                typeof parentId === 'string' ? parentId : null,
                this.userOf(req),
                text,
            );
            if (result === 'not_found') {
                this.notFound(res, 'Asset not found');
            } else if (result === 'bad_parent') {
                this.badRequest(res, 'You can only reply to a top-level comment on this asset');
            } else {
                res.status(201).json({ data: result });
            }
        } catch (error) {
            this.serverError(res, error, 'Failed to save the comment');
        }
    }

    /**
     * Handles PATCH /api/library/comments/:commentId
     * Marks a thread resolved or open again. Body: { resolved }.
     *
     * @param req - Express request
     * @param res - Express response
     * @returns {Promise<void>}
     */
    async updateComment(req: Request, res: Response): Promise<void> {
        const commentId = this.idParam(req, 'commentId');
        const resolved: unknown = (req.body as Record<string, unknown> | undefined)?.['resolved'];
        if (!commentId) {
            this.notFound(res, 'Comment not found');
            return;
        }
        if (typeof resolved !== 'boolean') {
            this.badRequest(res, 'resolved must be true or false');
            return;
        }

        try {
            const result = await libraryService.setResolved(commentId, resolved, this.userOf(req));
            if (result === 'not_found') {
                this.notFound(res, 'Comment not found');
            } else if (result === 'not_thread') {
                this.badRequest(res, 'Only a top-level comment can be resolved');
            } else {
                res.json({ data: result });
            }
        } catch (error) {
            this.serverError(res, error, 'Failed to update the comment');
        }
    }

    /**
     * Handles DELETE /api/library/comments/:commentId
     * Deletes the signed-in user's own comment (and its replies).
     *
     * @param req - Express request
     * @param res - Express response
     * @returns {Promise<void>}
     */
    async deleteComment(req: Request, res: Response): Promise<void> {
        const commentId = this.idParam(req, 'commentId');
        if (!commentId) {
            this.notFound(res, 'Comment not found');
            return;
        }

        try {
            const result = await libraryService.deleteComment(commentId, this.userOf(req));
            if (result === 'not_found') {
                this.notFound(res, 'Comment not found');
            } else if (result === 'forbidden') {
                res.status(403).json({
                    error: 'forbidden',
                    errorDescription: 'You can only delete your own comments',
                });
            } else {
                res.status(204).end();
            }
        } catch (error) {
            this.serverError(res, error, 'Failed to delete the comment');
        }
    }

    /**
     * Reads a UUID route parameter.
     *
     * @param req - Express request
     * @param name - Parameter name
     * @returns {string | null} The ID, or null when it isn't a UUID
     */
    private idParam(req: Request, name: string): string | null {
        const value = req.params[name];
        return typeof value === 'string' && UUID.test(value) ? value : null;
    }

    /**
     * Who is signed in, as stored on comments: their email (or user ID without one).
     *
     * @param req - Express request (after requireAuth)
     * @returns {string} The user
     */
    private userOf(req: Request): string {
        return req.user?.email ?? req.user?.id ?? 'unknown';
    }

    /**
     * Sends a 404 response.
     *
     * @param res - Express response
     * @param description - What wasn't found
     * @returns {void}
     */
    private notFound(res: Response, description: string): void {
        res.status(404).json({ error: 'not_found', errorDescription: description });
    }

    /**
     * Checks the shape of a POST /api/library/assets body.
     *
     * @param body - Parsed JSON body
     * @returns {LibraryCreateAssetsRequest | string} The request, or what's wrong with it
     */
    private parseCreateRequest(body: unknown): LibraryCreateAssetsRequest | string {
        if (!body || typeof body !== 'object') {
            return 'Expected a JSON body';
        }
        const { categoryId, subcategoryId, topicId, assets, tags } = body as Record<
            string,
            unknown
        >;

        const isOptionalId = (value: unknown): value is string | null =>
            value === null || value === undefined || typeof value === 'string';
        if (
            typeof categoryId !== 'string' ||
            !isOptionalId(subcategoryId) ||
            !isOptionalId(topicId)
        ) {
            return 'categoryId must be a string; subcategoryId and topicId strings or null';
        }
        if (!Array.isArray(assets) || assets.length === 0 || assets.length > 50) {
            return 'assets must list 1 to 50 files';
        }

        const parsed: LibraryCreateAssetsRequest['assets'] = [];
        for (const asset of assets as unknown[]) {
            const { title, fileType, url, size } = (asset ?? {}) as Record<string, unknown>;
            if (typeof title !== 'string' || !title.trim() || title.length > 200) {
                return 'Every asset needs a title of 1 to 200 characters';
            }
            if (typeof fileType !== 'string' || !libraryService.isFileType(fileType)) {
                return `Unsupported file type "${String(fileType)}"`;
            }
            if (typeof url !== 'string' || !libraryService.isFilestackUrl(url)) {
                return 'url must be a Filestack file URL (https://cdn.filestackcontent.com/…)';
            }
            if (
                size !== undefined &&
                size !== null &&
                (typeof size !== 'number' || !Number.isSafeInteger(size) || size < 0)
            ) {
                return 'size must be a whole number of bytes, or null';
            }
            parsed.push({ title, fileType, url, size: typeof size === 'number' ? size : null });
        }

        const cleanTags = this.parseTags(tags);
        if (typeof cleanTags === 'string') {
            return cleanTags;
        }

        return {
            categoryId: categoryId as LibraryCategoryId,
            subcategoryId: subcategoryId || null,
            topicId: topicId || null,
            assets: parsed,
            tags: cleanTags,
        };
    }

    /**
     * Checks and cleans the optional `tags` of a POST /api/library/assets body: trimmed,
     * inner spaces collapsed, empty ones dropped, duplicates (ignoring case) removed.
     *
     * @param tags - Raw value (missing = no tags)
     * @returns {string[] | string} The clean tags, or what's wrong with them
     */
    private parseTags(tags: unknown): string[] | string {
        if (tags === undefined || tags === null) {
            return [];
        }
        if (!Array.isArray(tags) || tags.some((tag) => typeof tag !== 'string')) {
            return 'tags must be a list of strings';
        }

        const clean: string[] = [];
        const seen = new Set<string>();
        for (const raw of tags as string[]) {
            const tag = raw.trim().replace(/\s+/g, ' ');
            if (!tag || seen.has(tag.toLowerCase())) {
                continue;
            }
            if (tag.length > LIBRARY_MAX_TAG_LENGTH) {
                return `Tags can be at most ${LIBRARY_MAX_TAG_LENGTH} characters ("${tag}")`;
            }
            seen.add(tag.toLowerCase());
            clean.push(tag);
        }

        return clean.length > LIBRARY_MAX_TAGS
            ? `An asset can have at most ${LIBRARY_MAX_TAGS} tags`
            : clean;
    }

    /**
     * Reads a single, non-empty string query parameter.
     *
     * @param req - Express request
     * @param name - Parameter name
     * @returns {string | undefined} The value, or undefined when missing, empty or repeated
     */
    private queryString(req: Request, name: string): string | undefined {
        const value = req.query[name];
        return typeof value === 'string' && value !== '' ? value : undefined;
    }

    /**
     * Sends a 400 response.
     *
     * @param res - Express response
     * @param description - What was wrong with the request
     * @returns {void}
     */
    private badRequest(res: Response, description: string): void {
        res.status(400).json({ error: 'invalid_request', errorDescription: description });
    }

    /**
     * Sends a 503 when the database isn't configured, a 500 for anything else.
     *
     * @param res - Express response
     * @param error - What went wrong
     * @param description - Message for a 500
     * @returns {void}
     */
    private serverError(res: Response, error: unknown, description: string): void {
        if (error instanceof ServiceUnavailableError) {
            res.status(503).json({ error: 'not_configured', errorDescription: error.message });
            return;
        }
        console.error(`[Library Controller] ${description}:`, error);
        res.status(500).json({ error: 'request_failed', errorDescription: description });
    }
}

export const libraryController = new LibraryController();
