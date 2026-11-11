/** Third Party Imports */
import type { Request, Response } from 'express';

/** Local Imports */
import { DEMO_USER_ID } from '../config/user-roles.config.js';
import { usersService } from '../services/users.service.js';
import type { UserUpdateRequest } from '../types/user.types.js';
import { ServiceUnavailableError } from '../utils/service-unavailable.error.js';

/** A Supabase Auth user ID (UUID). */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** A plausible email address (Supabase checks it properly). */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Longest display name, in characters. */
const MAX_NAME_LENGTH = 80;

/**
 * Controller for user management (admins only - see main.ts).
 * Handles HTTP requests and delegates business logic to the users service.
 */
export class UsersController {
    /**
     * Handles GET /api/users
     * Every user, by name.
     *
     * @param _req - Express request
     * @param res - Express response
     * @returns {Promise<void>}
     */
    async list(_req: Request, res: Response): Promise<void> {
        try {
            res.json({ data: await usersService.listUsers() });
        } catch (error) {
            this.serverError(res, error, 'Failed to load the users');
        }
    }

    /**
     * Handles POST /api/users
     * Adds a user with a temporary password (returned once, to hand to them).
     * Body: { name, email, role }.
     *
     * @param req - Express request
     * @param res - Express response
     * @returns {Promise<void>}
     */
    async create(req: Request, res: Response): Promise<void> {
        const { name, email, role } = (req.body ?? {}) as Record<string, unknown>;
        const cleanName = this.cleanName(name);
        if (typeof cleanName !== 'string' || !cleanName) {
            this.badRequest(res, typeof cleanName === 'string' ? 'Enter a name' : cleanName.error);
            return;
        }
        if (typeof email !== 'string' || !EMAIL.test(email.trim())) {
            this.badRequest(res, 'Enter a valid email address');
            return;
        }
        if (!usersService.isRole(role)) {
            this.badRequest(res, 'Pick a role');
            return;
        }

        try {
            const result = await usersService.createUser({ name: cleanName, email, role });
            if (result === 'email_taken') {
                res.status(409).json({
                    error: 'email_taken',
                    errorDescription: 'Someone already has an account with this email',
                });
                return;
            }
            res.status(201).json({ data: result });
        } catch (error) {
            this.serverError(res, error, 'Failed to add the user');
        }
    }

    /**
     * Handles PATCH /api/users/:id
     * Changes a user's name, role or whether they can sign in. Body: any of
     * { name, role, active }. Admins can't change their own role or disable themselves.
     *
     * @param req - Express request
     * @param res - Express response
     * @returns {Promise<void>}
     */
    async update(req: Request, res: Response): Promise<void> {
        const id = this.idParam(req, res);
        if (!id) {
            return;
        }
        const { name, role, active } = (req.body ?? {}) as Record<string, unknown>;
        const update: UserUpdateRequest = {};

        if (name !== undefined) {
            const cleanName = this.cleanName(name);
            if (typeof cleanName !== 'string' || !cleanName) {
                this.badRequest(
                    res,
                    typeof cleanName === 'string' ? 'Enter a name' : cleanName.error,
                );
                return;
            }
            update.name = cleanName;
        }
        if (role !== undefined) {
            if (!usersService.isRole(role)) {
                this.badRequest(res, 'Unknown role');
                return;
            }
            update.role = role;
        }
        if (active !== undefined) {
            if (typeof active !== 'boolean') {
                this.badRequest(res, 'active must be true or false');
                return;
            }
            update.active = active;
        }
        if (Object.keys(update).length === 0) {
            this.badRequest(res, 'Nothing to change');
            return;
        }
        if (id === req.user?.id && (update.role !== undefined || update.active === false)) {
            this.badRequest(res, "You can't change your own role or disable yourself");
            return;
        }

        try {
            const user = await usersService.updateUser(id, update);
            if (user) {
                res.json({ data: user });
            } else {
                this.notFound(res);
            }
        } catch (error) {
            this.serverError(res, error, 'Failed to update the user');
        }
    }

    /**
     * Handles POST /api/users/:id/reset-password
     * Sets a new temporary password (returned once); the user must change it on next
     * sign-in.
     *
     * @param req - Express request
     * @param res - Express response
     * @returns {Promise<void>}
     */
    async resetPassword(req: Request, res: Response): Promise<void> {
        const id = this.idParam(req, res);
        if (!id) {
            return;
        }
        if (id === req.user?.id) {
            this.badRequest(res, 'Change your own password from the user menu instead');
            return;
        }
        try {
            const result = await usersService.resetPassword(id);
            if (result) {
                res.json({ data: result });
            } else {
                this.notFound(res);
            }
        } catch (error) {
            this.serverError(res, error, 'Failed to reset the password');
        }
    }

    /**
     * Handles DELETE /api/users/:id
     * Deletes a user's account (not your own). Their uploads and comments stay.
     *
     * @param req - Express request
     * @param res - Express response
     * @returns {Promise<void>}
     */
    async remove(req: Request, res: Response): Promise<void> {
        const id = this.idParam(req, res);
        if (!id) {
            return;
        }
        if (id === req.user?.id) {
            this.badRequest(res, "You can't delete your own account");
            return;
        }
        try {
            if (await usersService.deleteUser(id)) {
                res.status(204).end();
            } else {
                this.notFound(res);
            }
        } catch (error) {
            this.serverError(res, error, 'Failed to delete the user');
        }
    }

    /**
     * Reads the :id parameter, answering 400 / 404 itself when it isn't a Supabase user ID.
     *
     * @param req - Express request
     * @param res - Express response
     * @returns {string | null} The ID, or null when a response was sent
     */
    private idParam(req: Request, res: Response): string | null {
        const id = req.params['id'];
        if (id === DEMO_USER_ID) {
            this.badRequest(res, "The demo account is set in the server's environment file");
            return null;
        }
        if (typeof id !== 'string' || !UUID.test(id)) {
            this.notFound(res);
            return null;
        }
        return id;
    }

    /**
     * Trims a display name and collapses its spaces.
     *
     * @param value - Raw value
     * @returns {string | { error: string }} The name (empty when blank), or what's wrong
     */
    private cleanName(value: unknown): string | { error: string } {
        if (typeof value !== 'string') {
            return { error: 'Enter a name' };
        }
        const name = value.trim().replace(/\s+/g, ' ');
        return name.length > MAX_NAME_LENGTH
            ? { error: `A name can be at most ${MAX_NAME_LENGTH} characters` }
            : name;
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
     * Sends a 404 response.
     *
     * @param res - Express response
     * @returns {void}
     */
    private notFound(res: Response): void {
        res.status(404).json({ error: 'not_found', errorDescription: 'User not found' });
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
        console.error(`[Users Controller] ${description}:`, error);
        res.status(500).json({ error: 'request_failed', errorDescription: description });
    }
}

export const usersController = new UsersController();
