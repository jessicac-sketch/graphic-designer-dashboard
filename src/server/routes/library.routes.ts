/** Third Party Imports */
import express, { type Router } from 'express';

/** Local Imports */
import { libraryController } from '../controllers/library.controller.js';

/**
 * Router for the Mini-Library endpoints.
 * Delegates request handling to the controller layer.
 */
const router: Router = express.Router();

/**
 * GET /api/library/taxonomy
 * The categories with their subcategories and topics, with asset counts.
 */
router.get('/taxonomy', (req, res) => libraryController.getTaxonomy(req, res));

/**
 * GET /api/library/assets
 * Lists assets, filtered and sorted, with per-file-type counts.
 *
 * @query category - Category ID, e.g. "channel" (optional)
 * @query subcategory - Subcategory ID, e.g. "badminton" under Channel (optional)
 * @query topic - Topic ID, e.g. "tips" (optional)
 * @query search - Matches the title or path, case-insensitive (optional)
 * @query fileType - png | jpg | mp4 (optional)
 * @query status - review | approval | ready | live (optional; Channel assets only have one)
 * @query sort - updated (default) | title
 * @query direction - desc (default) | asc
 */
router.get('/assets', (req, res) => libraryController.getAssets(req, res));

/**
 * POST /api/library/assets
 * Files uploaded files under a category (and its subcategory / topic, where it has them).
 * In memory until the library has a database.
 *
 * @body categoryId - Category ID
 * @body subcategoryId - Subcategory ID, or null when the category has none
 * @body topicId - Topic ID, or null when the subcategory has none
 * @body assets - [{ title, fileType (png | jpg | mp4), url (Filestack CDN URL) }]
 * @body tags - Tags for every file in the batch (optional, at most 20, 30 characters each)
 */
router.post('/assets', (req, res) => libraryController.createAssets(req, res));

/**
 * PATCH /api/library/assets/:id/status
 * Moves a Channel asset to another workflow status.
 *
 * @param id - The asset's ID
 * @body status - review | approval | ready | live
 */
router.patch('/assets/:id/status', (req, res) => libraryController.updateStatus(req, res));

/**
 * GET /api/library/assets/:id
 * One asset, for its page.
 */
router.get('/assets/:id', (req, res) => libraryController.getAsset(req, res));

/**
 * PATCH /api/library/assets/:id
 * Changes an asset's editable details.
 *
 * @body description - Free text, at most 1000 characters (may be empty)
 */
router.patch('/assets/:id', (req, res) => libraryController.updateDetails(req, res));

/**
 * GET /api/library/assets/:id/comments
 * The asset's comment threads (top-level comments with their replies), oldest first.
 */
router.get('/assets/:id/comments', (req, res) => libraryController.getComments(req, res));

/**
 * POST /api/library/assets/:id/comments
 * Adds a comment by the signed-in user.
 *
 * @body body - The text, 1 to 2000 characters
 * @body parentId - The top-level comment replied to (optional; omit for a new thread)
 */
router.post('/assets/:id/comments', (req, res) => libraryController.createComment(req, res));

/**
 * PATCH /api/library/comments/:commentId
 * Marks a thread (top-level comment) resolved, or open again.
 *
 * @body resolved - true | false
 */
router.patch('/comments/:commentId', (req, res) => libraryController.updateComment(req, res));

/**
 * DELETE /api/library/comments/:commentId
 * Deletes the signed-in user's own comment, with its replies.
 */
router.delete('/comments/:commentId', (req, res) => libraryController.deleteComment(req, res));

/**
 * GET /api/library/upload-config
 * How the browser should upload files: Filestack with its API key, or simulated.
 */
router.get('/upload-config', (req, res) => libraryController.getUploadConfig(req, res));

export default router;
