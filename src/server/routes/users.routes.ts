/** Third Party Imports */
import express, { type Router } from 'express';

/** Local Imports */
import { usersController } from '../controllers/users.controller.js';

/**
 * Router for user management. Mounted behind requireAuth + requireRole('admin').
 * Delegates request handling to the controller layer.
 */
const router: Router = express.Router();

/**
 * GET /api/users
 * Every user (Supabase accounts), by name.
 */
router.get('/', (req, res) => usersController.list(req, res));

/**
 * POST /api/users
 * Adds a user; the response holds their temporary password (shown once).
 *
 * @body name - Display name
 * @body email - Sign-in email
 * @body role - admin | qc | management | designer
 */
router.post('/', (req, res) => usersController.create(req, res));

/**
 * PATCH /api/users/:id
 * Changes a user's name, role or whether they can sign in.
 *
 * @body name - Display name (optional)
 * @body role - admin | qc | management | designer (optional)
 * @body active - false disables sign-in, true enables it (optional)
 */
router.patch('/:id', (req, res) => usersController.update(req, res));

/**
 * POST /api/users/:id/reset-password
 * Sets a new temporary password; the response holds it (shown once).
 */
router.post('/:id/reset-password', (req, res) => usersController.resetPassword(req, res));

/**
 * DELETE /api/users/:id
 * Deletes the account (their uploads and comments stay).
 */
router.delete('/:id', (req, res) => usersController.remove(req, res));

export default router;
