/** Node Imports */
import { randomInt, timingSafeEqual } from 'crypto';

/** Third Party Imports */
import type { User } from '@supabase/supabase-js';

/** Local Imports */
import { AUTH_CONFIG } from '../config/environment.config.js';
import {
    DEFAULT_USER_ROLE,
    DEMO_USER_ID,
    STATUS_TRANSITION_RULES,
    TEMPORARY_PASSWORD_LENGTH,
    USER_CACHE_TTL_MS,
    USER_ROLES,
} from '../config/user-roles.config.js';
import type {
    AppUser,
    NewUserRequest,
    UserRole,
    UserUpdateRequest,
    UserWithPassword,
} from '../types/user.types.js';
import { createSignInClient, getSupabase } from './supabase-client.service.js';

/** Characters of a temporary password: no look-alikes (0/O, 1/l/I). */
const PASSWORD_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';

/** A ban long enough to mean "disabled" (Supabase takes a duration). */
const DISABLED_BAN = '876000h';

/** Most users one listing reads (the page has no paging). */
const LIST_LIMIT = 1000;

/**
 * Compares two strings in constant time.
 *
 * @param a - Left value
 * @param b - Right value
 * @returns {boolean} Whether they are equal
 */
function safeEqual(a: string, b: string): boolean {
    const left = Buffer.from(a);
    const right = Buffer.from(b);
    return left.length === right.length && timingSafeEqual(left, right);
}

/**
 * The app's users: Supabase Auth accounts (role and password state in `app_metadata`,
 * which only the service role can write; name in `user_metadata`), plus the demo account
 * from the environment, which always signs in as an Admin.
 *
 * @remarks
 * Every Supabase call needs SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY and throws
 * ServiceUnavailableError without them; the demo account works regardless.
 */
export class UsersService {
    /**
     * Recently looked-up users by ID, with when each entry expires
     * @type {Map<string, { user: AppUser | null; expires: number }>}
     */
    private readonly cache = new Map<string, { user: AppUser | null; expires: number }>();

    /**
     * Checks an email and password.
     *
     * @param email - Sign-in email
     * @param password - Password
     * @returns {Promise<AppUser | null>} The user, or null for wrong credentials or a
     * disabled account
     * @throws {ServiceUnavailableError} When Supabase isn't configured (and it isn't the demo account)
     */
    async signIn(email: string, password: string): Promise<AppUser | null> {
        const normalized = email.trim().toLowerCase();
        if (
            safeEqual(normalized, AUTH_CONFIG.DEMO_EMAIL.toLowerCase()) &&
            safeEqual(password, AUTH_CONFIG.DEMO_PASSWORD)
        ) {
            return this.demoUser();
        }

        const { data, error } = await createSignInClient().auth.signInWithPassword({
            email: normalized,
            password,
        });
        if (error || !data.user) {
            return null;
        }
        const user = this.toUser(data.user);
        this.remember(user);
        return user.active ? user : null;
    }

    /**
     * Looks a user up by ID (cached for USER_CACHE_TTL_MS).
     *
     * @param id - User ID
     * @returns {Promise<AppUser | null>} The user, or null when there's none
     * @throws {Error} When the lookup fails
     */
    async getUser(id: string): Promise<AppUser | null> {
        if (id === DEMO_USER_ID) {
            return this.demoUser();
        }
        const cached = this.cache.get(id);
        if (cached && cached.expires > Date.now()) {
            return cached.user;
        }

        const { data, error } = await getSupabase().auth.admin.getUserById(id);
        if (error && error.status !== 404) {
            throw new Error(`Failed to look up the user: ${error.message}`);
        }
        const user = data?.user ? this.toUser(data.user) : null;
        this.cache.set(id, { user, expires: Date.now() + USER_CACHE_TTL_MS });
        return user;
    }

    /**
     * Every user (Supabase accounts; not the demo account), by name.
     *
     * @returns {Promise<AppUser[]>} The users
     * @throws {Error} When the listing fails
     */
    async listUsers(): Promise<AppUser[]> {
        const { data, error } = await getSupabase().auth.admin.listUsers({
            page: 1,
            perPage: LIST_LIMIT,
        });
        if (error) {
            throw new Error(`Failed to list the users: ${error.message}`);
        }
        return data.users
            .map((user) => this.toUser(user))
            .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    }

    /**
     * Adds a user with a temporary password they must change on first sign-in.
     *
     * @param request - Name, email and role (already checked)
     * @returns {Promise<UserWithPassword | 'email_taken'>} The user and their temporary
     * password, or 'email_taken' when the email already has an account
     * @throws {Error} When Supabase fails
     */
    async createUser(request: NewUserRequest): Promise<UserWithPassword | 'email_taken'> {
        const email = request.email.trim().toLowerCase();
        if (email === AUTH_CONFIG.DEMO_EMAIL.toLowerCase()) {
            return 'email_taken';
        }
        const temporaryPassword = this.temporaryPassword();

        const { data, error } = await getSupabase().auth.admin.createUser({
            email,
            password: temporaryPassword,
            email_confirm: true,
            user_metadata: { name: request.name },
            app_metadata: { role: request.role, must_change_password: true },
        });
        if (error) {
            if (error.code === 'email_exists' || error.status === 422) {
                return 'email_taken';
            }
            throw new Error(`Failed to add the user: ${error.message}`);
        }
        const user = this.toUser(data.user);
        this.remember(user);
        return { user, temporaryPassword };
    }

    /**
     * Changes a user's name, role or whether they can sign in.
     *
     * @param id - User ID (not the demo account)
     * @param update - The changes
     * @returns {Promise<AppUser | null>} The updated user, or null when there's none
     * @throws {Error} When Supabase fails
     */
    async updateUser(id: string, update: UserUpdateRequest): Promise<AppUser | null> {
        const current = await this.fetchRaw(id);
        if (!current) {
            return null;
        }

        const { data, error } = await getSupabase().auth.admin.updateUserById(id, {
            ...(update.name !== undefined && {
                user_metadata: { ...current.user_metadata, name: update.name },
            }),
            ...(update.role !== undefined && {
                app_metadata: { ...current.app_metadata, role: update.role },
            }),
            ...(update.active !== undefined && {
                ban_duration: update.active ? 'none' : DISABLED_BAN,
            }),
        });
        if (error) {
            throw new Error(`Failed to update the user: ${error.message}`);
        }
        const user = this.toUser(data.user);
        this.remember(user);
        return user;
    }

    /**
     * Gives a user a new temporary password, which they must change on next sign-in.
     *
     * @param id - User ID (not the demo account)
     * @returns {Promise<UserWithPassword | null>} The user and the new password, or null
     * when there's no such user
     * @throws {Error} When Supabase fails
     */
    async resetPassword(id: string): Promise<UserWithPassword | null> {
        const current = await this.fetchRaw(id);
        if (!current) {
            return null;
        }
        const temporaryPassword = this.temporaryPassword();

        const { data, error } = await getSupabase().auth.admin.updateUserById(id, {
            password: temporaryPassword,
            app_metadata: { ...current.app_metadata, must_change_password: true },
        });
        if (error) {
            throw new Error(`Failed to reset the password: ${error.message}`);
        }
        const user = this.toUser(data.user);
        this.remember(user);
        return { user, temporaryPassword };
    }

    /**
     * Replaces the signed-in user's password, after checking their current one.
     *
     * @param user - The signed-in user (not the demo account)
     * @param currentPassword - Their current (or temporary) password
     * @param newPassword - Their new password (already length-checked)
     * @returns {Promise<AppUser | 'wrong_password'>} The updated user, or 'wrong_password'
     * @throws {Error} When Supabase fails
     */
    async changeOwnPassword(
        user: AppUser,
        currentPassword: string,
        newPassword: string,
    ): Promise<AppUser | 'wrong_password'> {
        const { error: signInError } = await createSignInClient().auth.signInWithPassword({
            email: user.email,
            password: currentPassword,
        });
        if (signInError) {
            return 'wrong_password';
        }

        const current = await this.fetchRaw(user.id);
        const { data, error } = await getSupabase().auth.admin.updateUserById(user.id, {
            password: newPassword,
            app_metadata: { ...current?.app_metadata, must_change_password: false },
        });
        if (error) {
            throw new Error(`Failed to change the password: ${error.message}`);
        }
        const updated = this.toUser(data.user);
        this.remember(updated);
        return updated;
    }

    /**
     * Deletes a user's account. Their uploads and comments stay (they're stored by email).
     *
     * @param id - User ID (not the demo account)
     * @returns {Promise<boolean>} False when there was no such user
     * @throws {Error} When Supabase fails
     */
    async deleteUser(id: string): Promise<boolean> {
        if (!(await this.fetchRaw(id))) {
            return false;
        }
        const { error } = await getSupabase().auth.admin.deleteUser(id);
        if (error) {
            throw new Error(`Failed to delete the user: ${error.message}`);
        }
        this.cache.set(id, { user: null, expires: Date.now() + USER_CACHE_TTL_MS });
        return true;
    }

    /**
     * Whether a role may move an asset from one workflow status to another.
     *
     * @param role - The user's role
     * @param from - Current status
     * @param to - New status
     * @returns {boolean} True when allowed
     */
    canChangeStatus(role: UserRole, from: string | null, to: string): boolean {
        return (
            role === 'admin' ||
            STATUS_TRANSITION_RULES.some(
                (rule) => rule.from === from && rule.to === to && rule.roles.includes(role),
            )
        );
    }

    /**
     * Whether a value is a role.
     *
     * @param value - Raw value, e.g. from a request
     * @returns {boolean} True for admin | qc | management | designer
     */
    isRole(value: unknown): value is UserRole {
        return typeof value === 'string' && (USER_ROLES as readonly string[]).includes(value);
    }

    /**
     * The demo account, as a user: always an active Admin.
     *
     * @returns {AppUser} The demo user
     */
    private demoUser(): AppUser {
        return {
            id: DEMO_USER_ID,
            email: AUTH_CONFIG.DEMO_EMAIL,
            name: 'Demo admin',
            role: 'admin',
            mustChangePassword: false,
            active: true,
            isDemo: true,
            createdAt: null,
            lastSignInAt: null,
        };
    }

    /**
     * Reads a Supabase user as it is stored (uncached).
     *
     * @param id - User ID
     * @returns {Promise<User | null>} The user, or null when there's none
     * @throws {Error} When the lookup fails
     */
    private async fetchRaw(id: string): Promise<User | null> {
        const { data, error } = await getSupabase().auth.admin.getUserById(id);
        if (error && error.status !== 404) {
            throw new Error(`Failed to look up the user: ${error.message}`);
        }
        return data?.user ?? null;
    }

    /**
     * Maps a Supabase user to an app user.
     *
     * @param user - Supabase Auth user
     * @returns {AppUser} The app user
     */
    private toUser(user: User): AppUser {
        const role: unknown = user.app_metadata?.['role'];
        const name: unknown = user.user_metadata?.['name'];
        const bannedUntil = (user as User & { banned_until?: string | null }).banned_until;
        const email = user.email ?? '';
        return {
            id: user.id,
            email,
            name: typeof name === 'string' && name.trim() ? name : email.split('@')[0],
            role: this.isRole(role) ? role : DEFAULT_USER_ROLE,
            mustChangePassword: user.app_metadata?.['must_change_password'] === true,
            active: !bannedUntil || new Date(bannedUntil).getTime() <= Date.now(),
            isDemo: false,
            createdAt: user.created_at ?? null,
            lastSignInAt: user.last_sign_in_at ?? null,
        };
    }

    /**
     * Caches a user just read or written.
     *
     * @param user - The user
     * @returns {void}
     */
    private remember(user: AppUser): void {
        this.cache.set(user.id, { user, expires: Date.now() + USER_CACHE_TTL_MS });
    }

    /**
     * A random temporary password from PASSWORD_ALPHABET, with at least one digit.
     *
     * @returns {string} The password
     */
    private temporaryPassword(): string {
        const characters = Array.from(
            { length: TEMPORARY_PASSWORD_LENGTH },
            () => PASSWORD_ALPHABET[randomInt(PASSWORD_ALPHABET.length)],
        );
        if (!characters.some((character) => /\d/.test(character))) {
            characters[randomInt(characters.length)] = String(2 + randomInt(8));
        }
        return characters.join('');
    }
}

export const usersService = new UsersService();
