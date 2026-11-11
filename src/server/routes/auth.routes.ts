/** Third Party Imports */
import express, { type Router } from 'express';

/** Local Imports */
import { authController } from '../controllers/auth.controller.js';

/**
 * Router for authentication endpoints.
 * Delegates request handling to the controller layer.
 *
 * @remarks
 * Deliberately unauthenticated - the login page must work while logged out.
 * See `requireAuth` middleware for the routes that DO need a session.
 */
const router: Router = express.Router();

/**
 * POST /api/auth/login
 * Signs in with email/password, sets the session cookie.
 */
router.post('/login', (req, res) => authController.login(req, res));

/**
 * POST /api/auth/logout
 * Signs out and clears the session cookie.
 */
router.post('/logout', (req, res) => authController.logout(req, res));

/**
 * GET /api/auth/session
 * Returns the current authenticated user, or 401 if not signed in.
 */
router.get('/session', (req, res) => authController.session(req, res));

export default router;
