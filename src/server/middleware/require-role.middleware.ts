/** Express Imports */
import type { NextFunction, Request, RequestHandler, Response } from 'express';

/** Local Imports */
import type { UserRole } from '../types/user.types.js';

/**
 * Allows only users with one of the given roles. Use after `requireAuth`.
 *
 * @param roles - Roles allowed through
 * @returns {RequestHandler} Middleware answering 403 for any other role
 *
 * @example
 * app.use('/api/users', requireAuth, requireRole('admin'), usersRoutes);
 */
export function requireRole(...roles: UserRole[]): RequestHandler {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({
                error: 'forbidden',
                errorDescription: "You don't have access to this",
            });
            return;
        }
        next();
    };
}
