/** Express Imports */
import { NextFunction, Request, Response } from 'express';

/** Local Imports */
import { sessionService } from '../services/session.service.js';

/**
 * Extends Express's Request with the authenticated user, set by `requireAuth`.
 */
declare module 'express-serve-static-core' {
    interface Request {
        user?: { id: string; email: string | undefined };
    }
}

/**
 * Requires a valid session cookie to access the route.
 *
 * @remarks
 * Verifies the cookie's signature and expiry - a tampered or expired cookie is
 * rejected. Attaches the resolved user to `req.user` for downstream handlers.
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
    const user = sessionService.read(req);

    if (!user) {
        res.status(401).json({
            error: 'unauthorized',
            errorDescription: 'Authentication required',
        });
        return;
    }

    req.user = user;
    next();
};
