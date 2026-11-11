/** Third Party Imports */
import type { Request, Response } from 'express';

/** Local Imports */
import { MIN_PASSWORD_LENGTH } from '../config/user-roles.config.js';
import { resolveSessionUser } from '../middleware/require-auth.middleware.js';
import { sessionService } from '../services/session.service.js';
import { usersService } from '../services/users.service.js';
import { ServiceUnavailableError } from '../utils/service-unavailable.error.js';

/**
 * Controller for authentication endpoints.
 *
 * @remarks
 * Checks credentials against Supabase Auth (or the demo account from the environment,
 * a backup Admin login) and keeps the session in a signed httpOnly cookie
 * (sessionService). The user's role and state are looked up again on every request.
 */
export class AuthController {
    /**
     * Handles POST /api/auth/login
     * Signs in with email/password and sets the session cookie. The user in the response
     * says whether they must change a temporary password first (`mustChangePassword`).
     *
     * @param req - Express request with { email, password } body
     * @param res - Express response
     * @returns {Promise<void>}
     */
    async login(req: Request, res: Response): Promise<void> {
        const { email, password } = (req.body ?? {}) as { email?: unknown; password?: unknown };

        if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
            res.status(400).json({
                error: 'invalid_request',
                errorDescription: 'Email and password are required',
            });
            return;
        }

        try {
            const user = await usersService.signIn(email, password);
            if (!user) {
                res.status(401).json({
                    error: 'invalid_credentials',
                    errorDescription: 'Invalid email or password',
                });
                return;
            }
            sessionService.create(res, { id: user.id, email: user.email });
            res.json({ data: { user } });
        } catch (error) {
            this.serverError(res, error, 'Failed to sign in');
        }
    }

    /**
     * Handles POST /api/auth/logout
     * Signs out and clears the session cookie.
     *
     * @param _req - Express request
     * @param res - Express response
     * @returns {Promise<void>}
     */
    async logout(_req: Request, res: Response): Promise<void> {
        sessionService.clear(res);
        res.json({ data: { success: true } });
    }

    /**
     * Handles GET /api/auth/session
     * The signed-in user (with role and password state), or 401 when signed out, or the
     * account was deleted or disabled.
     *
     * @param req - Express request
     * @param res - Express response
     * @returns {Promise<void>}
     */
    async session(req: Request, res: Response): Promise<void> {
        try {
            const user = await resolveSessionUser(req);
            if (!user) {
                res.status(401).json({
                    error: 'unauthorized',
                    errorDescription: 'Not authenticated',
                });
                return;
            }
            res.json({ data: { user } });
        } catch (error) {
            this.serverError(res, error, 'Failed to check the session');
        }
    }

    /**
     * Handles POST /api/auth/password
     * Replaces the signed-in user's password (also a temporary one, which ends the
     * "must change" state). Body: { currentPassword, newPassword }.
     *
     * @param req - Express request
     * @param res - Express response
     * @returns {Promise<void>}
     */
    async changePassword(req: Request, res: Response): Promise<void> {
        const { currentPassword, newPassword } = (req.body ?? {}) as Record<string, unknown>;

        try {
            const user = await resolveSessionUser(req);
            if (!user) {
                res.status(401).json({
                    error: 'unauthorized',
                    errorDescription: 'Not authenticated',
                });
                return;
            }
            if (user.isDemo) {
                this.badRequest(
                    res,
                    "The demo account's password is set in the server's environment file",
                );
                return;
            }
            if (typeof currentPassword !== 'string' || !currentPassword) {
                this.badRequest(res, 'Enter your current password');
                return;
            }
            if (typeof newPassword !== 'string' || newPassword.length < MIN_PASSWORD_LENGTH) {
                this.badRequest(
                    res,
                    `The new password needs at least ${MIN_PASSWORD_LENGTH} characters`,
                );
                return;
            }
            if (newPassword.length > 72) {
                this.badRequest(res, 'The new password can be at most 72 characters');
                return;
            }
            if (newPassword === currentPassword) {
                this.badRequest(res, 'Choose a password different from the current one');
                return;
            }

            const result = await usersService.changeOwnPassword(user, currentPassword, newPassword);
            if (result === 'wrong_password') {
                this.badRequest(res, 'Your current password is wrong');
                return;
            }
            res.json({ data: { user: result } });
        } catch (error) {
            this.serverError(res, error, 'Failed to change the password');
        }
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
     * Sends a 503 when Supabase isn't configured, a 500 for anything else.
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
        console.error(`[Auth Controller] ${description}:`, error);
        res.status(500).json({ error: 'request_failed', errorDescription: description });
    }
}

/**
 * Singleton instance of the auth controller.
 */
export const authController = new AuthController();
