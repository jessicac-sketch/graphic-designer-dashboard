/** Third Party Imports */
import type { Request, Response } from 'express';

/** Node Imports */
import { timingSafeEqual } from 'crypto';

/** Local Imports */
import { AUTH_CONFIG } from '../config/environment.config.js';
import { sessionService } from '../services/session.service.js';

/**
 * Compares two strings in constant time.
 *
 * @param a - Left value
 * @param b - Right value
 * @returns Whether they are equal
 */
function safeEqual(a: string, b: string): boolean {
    const left = Buffer.from(a);
    const right = Buffer.from(b);
    return left.length === right.length && timingSafeEqual(left, right);
}

/**
 * Controller for authentication endpoints.
 *
 * @remarks
 * Checks credentials against the single demo account (AUTH_CONFIG) and keeps the
 * session in a signed httpOnly cookie (sessionService). To use a real identity
 * provider, verify the credentials with it in `login` and keep the rest as is.
 */
export class AuthController {
    /**
     * Handles POST /api/auth/login
     * Signs in with email/password and sets the session cookie.
     *
     * @param req - Express request with { email, password } body
     * @param res - Express response
     * @returns Promise<void>
     */
    async login(req: Request, res: Response): Promise<void> {
        const { email, password } = req.body as { email?: string; password?: string };

        if (!email || !password) {
            res.status(400).json({
                error: 'invalid_request',
                errorDescription: 'Email and password are required',
            });
            return;
        }

        const valid =
            safeEqual(email.trim().toLowerCase(), AUTH_CONFIG.DEMO_EMAIL.toLowerCase()) &&
            safeEqual(password, AUTH_CONFIG.DEMO_PASSWORD);

        if (!valid) {
            res.status(401).json({
                error: 'invalid_credentials',
                errorDescription: 'Invalid email or password',
            });
            return;
        }

        const user = { id: 'demo-user', email: AUTH_CONFIG.DEMO_EMAIL };
        sessionService.create(res, user);
        res.json({ data: { user } });
    }

    /**
     * Handles POST /api/auth/logout
     * Signs out and clears the session cookie.
     *
     * @param req - Express request
     * @param res - Express response
     * @returns Promise<void>
     */
    async logout(req: Request, res: Response): Promise<void> {
        sessionService.clear(res);
        res.json({ data: { success: true } });
    }

    /**
     * Handles GET /api/auth/session
     * Returns the current authenticated user from the signed session cookie.
     *
     * @param req - Express request
     * @param res - Express response
     * @returns Promise<void>
     */
    async session(req: Request, res: Response): Promise<void> {
        const user = sessionService.read(req);

        if (!user) {
            res.status(401).json({
                error: 'unauthorized',
                errorDescription: 'Not authenticated',
            });
            return;
        }

        res.json({ data: { user } });
    }
}

/**
 * Singleton instance of the auth controller.
 */
export const authController = new AuthController();
