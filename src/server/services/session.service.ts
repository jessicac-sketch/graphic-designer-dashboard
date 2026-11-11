/** Node Imports */
import { createHmac, timingSafeEqual } from 'crypto';

/** Third Party Imports */
import { parseCookie, stringifySetCookie } from 'cookie';
import type { Request, Response } from 'express';

/** Local Imports */
import { AUTH_CONFIG, SERVER_CONFIG } from '../config/environment.config.js';

/** Name of the session cookie. */
const SESSION_COOKIE = 'app_session';

/**
 * The signed-in user, as stored in the session cookie.
 */
export interface SessionUser {
    /** User ID */
    id: string;

    /** User email */
    email: string;
}

/**
 * Stateless cookie sessions: the user and an expiry, signed with SESSION_SECRET (HMAC
 * SHA-256) and kept in an httpOnly cookie the browser can't read.
 *
 * @remarks
 * Enough for the demo account. When you plug in a real identity provider, either keep
 * this (issue the cookie once the provider confirms the user) or let the provider's own
 * SDK manage the cookie and drop this service.
 */
export class SessionService {
    /**
     * Signs a payload.
     *
     * @param payload - Base64url payload
     * @returns Base64url signature
     */
    private sign(payload: string): string {
        return createHmac('sha256', AUTH_CONFIG.SESSION_SECRET).update(payload).digest('base64url');
    }

    /**
     * Sets the session cookie for a user.
     *
     * @param res - Express response
     * @param user - The signed-in user
     */
    create(res: Response, user: SessionUser): void {
        const maxAge = AUTH_CONFIG.SESSION_TTL_HOURS * 3600;
        const payload = Buffer.from(
            JSON.stringify({ ...user, exp: Date.now() + maxAge * 1000 }),
        ).toString('base64url');

        res.appendHeader(
            'Set-Cookie',
            stringifySetCookie({
                name: SESSION_COOKIE,
                value: `${payload}.${this.sign(payload)}`,
                httpOnly: true,
                sameSite: 'lax',
                secure: SERVER_CONFIG.NODE_ENV === 'production',
                path: '/',
                maxAge,
            }),
        );
    }

    /**
     * Reads and verifies the session cookie.
     *
     * @param req - Express request
     * @returns The user, or null when there is no valid, unexpired session
     */
    read(req: Request): SessionUser | null {
        const token = req.headers.cookie
            ? parseCookie(req.headers.cookie)[SESSION_COOKIE]
            : undefined;
        const [payload, signature] = token?.split('.') ?? [];
        if (!payload || !signature) {
            return null;
        }

        const expected = Buffer.from(this.sign(payload));
        const actual = Buffer.from(signature);
        if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
            return null;
        }

        try {
            const { id, email, exp } = JSON.parse(
                Buffer.from(payload, 'base64url').toString(),
            ) as SessionUser & {
                exp: number;
            };
            return exp > Date.now() ? { id, email } : null;
        } catch {
            return null;
        }
    }

    /**
     * Clears the session cookie.
     *
     * @param res - Express response
     */
    clear(res: Response): void {
        res.appendHeader(
            'Set-Cookie',
            stringifySetCookie({
                name: SESSION_COOKIE,
                value: '',
                httpOnly: true,
                path: '/',
                maxAge: 0,
            }),
        );
    }
}

/**
 * Singleton instance of the session service.
 */
export const sessionService = new SessionService();
