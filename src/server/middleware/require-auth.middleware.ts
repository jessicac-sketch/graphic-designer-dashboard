/** Express Imports */
import { NextFunction, Request, Response } from 'express';

/** Local Imports */
import { sessionService } from '../services/session.service.js';
import { usersService } from '../services/users.service.js';
import type { AppUser } from '../types/user.types.js';
import { ServiceUnavailableError } from '../utils/service-unavailable.error.js';

/**
 * Extends Express's Request with the authenticated user, set by `requireAuth`.
 */
declare module 'express-serve-static-core' {
    interface Request {
        user?: AppUser;
    }
}

/**
 * Resolves the signed-in user from the session cookie: the current account (role,
 * active, password state - cached briefly by usersService), or null when the cookie is
 * missing, invalid or expired, or the account was deleted or disabled.
 *
 * @param req - Express request
 * @returns {Promise<AppUser | null>} The user, or null
 * @throws {ServiceUnavailableError} When Supabase isn't configured (and it isn't the demo account)
 */
export async function resolveSessionUser(req: Request): Promise<AppUser | null> {
    const session = sessionService.read(req);
    if (!session) {
        return null;
    }
    const user = await usersService.getUser(session.id);
    return user?.active ? user : null;
}

/**
 * Requires a signed-in, active user whose password isn't temporary.
 *
 * @remarks
 * Verifies the session cookie (signature and expiry), then looks the account up again so
 * a disabled user or a role change applies within seconds. A user who still has a
 * temporary password gets 403 `password_change_required` until they change it
 * (POST /api/auth/password). Attaches the user to `req.user` for downstream handlers.
 */
export const requireAuth = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    let user: AppUser | null;
    try {
        user = await resolveSessionUser(req);
    } catch (error) {
        if (error instanceof ServiceUnavailableError) {
            res.status(503).json({ error: 'not_configured', errorDescription: error.message });
        } else {
            console.error('[Auth] Failed to resolve the session user:', error);
            res.status(500).json({
                error: 'request_failed',
                errorDescription: 'Failed to check the session',
            });
        }
        return;
    }

    if (!user) {
        res.status(401).json({
            error: 'unauthorized',
            errorDescription: 'Authentication required',
        });
        return;
    }
    if (user.mustChangePassword) {
        res.status(403).json({
            error: 'password_change_required',
            errorDescription: 'Change your temporary password first',
        });
        return;
    }

    req.user = user;
    next();
};
