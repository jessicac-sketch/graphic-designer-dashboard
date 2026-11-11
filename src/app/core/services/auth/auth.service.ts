/** Angular Imports */
import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

/** Third Party Imports */
import { catchError, firstValueFrom, map, of } from 'rxjs';

/** Local Imports */
import type { AppUser } from '@shared/interfaces/users/app-user.interface';
import type { UserRole } from '@shared/models/users/user-role.type';

/**
 * Authenticated user, as returned by the BFF's /api/auth endpoints.
 */
export type AuthUser = AppUser;

/**
 * Authentication service for managing user authentication state.
 *
 * @remarks
 * The actual session lives in an httpOnly cookie set by the BFF - this
 * service never stores a token itself, it only asks the BFF whether the
 * current request is authenticated. Session state is exposed as signals for
 * guards and components to read.
 */
@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private readonly http = inject(HttpClient);

    private readonly apiUrl = '/api/auth';

    /**
     * Signal indicating whether the user is authenticated.
     */
    private readonly _isAuthenticated = signal<boolean>(false);
    public readonly isAuthenticated = this._isAuthenticated.asReadonly();

    /**
     * Signal holding the current authenticated user, or null if signed out.
     */
    private readonly _user = signal<AuthUser | null>(null);
    public readonly user = this._user.asReadonly();

    /**
     * The signed-in user's role, or null when signed out.
     */
    public readonly role = computed((): UserRole | null => this._user()?.role ?? null);

    /**
     * Whether the signed-in user is an admin.
     */
    public readonly isAdmin = computed(() => this.role() === 'admin');

    /**
     * Checks the current session against the BFF, updating the auth signals.
     *
     * @returns Promise resolving to true if authenticated
     */
    public async checkAuthStatus(): Promise<boolean> {
        const user = await firstValueFrom(
            this.http.get<{ data: { user: AuthUser } }>(`${this.apiUrl}/session`).pipe(
                map((response) => response.data.user),
                catchError(() => of(null)),
            ),
        );

        this.setUser(user);
        return !!user;
    }

    /**
     * Signs in with email and password.
     *
     * @param email - User's email
     * @param password - User's password
     * @returns Promise resolving to the user on success (check `mustChangePassword`), or
     * null on invalid credentials
     */
    public async login(email: string, password: string): Promise<AuthUser | null> {
        const user = await firstValueFrom(
            this.http
                .post<{ data: { user: AuthUser } }>(`${this.apiUrl}/login`, { email, password })
                .pipe(
                    map((response) => response.data.user),
                    catchError(() => of(null)),
                ),
        );

        this.setUser(user);
        return user;
    }

    /**
     * Replaces the signed-in user's password (also a temporary one).
     *
     * @param currentPassword - Current (or temporary) password
     * @param newPassword - New password
     * @returns Promise resolving to the updated user
     * @throws The HTTP error (its `error.errorDescription` says what's wrong)
     */
    public async changePassword(currentPassword: string, newPassword: string): Promise<AuthUser> {
        const user = await firstValueFrom(
            this.http
                .post<{
                    data: { user: AuthUser };
                }>(`${this.apiUrl}/password`, { currentPassword, newPassword })
                .pipe(map((response) => response.data.user)),
        );
        this.setUser(user);
        return user;
    }

    /**
     * Signs out and clears authentication state.
     *
     * @returns Promise<void>
     */
    public async logout(): Promise<void> {
        await firstValueFrom(
            this.http.post(`${this.apiUrl}/logout`, {}).pipe(catchError(() => of(null))),
        );
        this.setUser(null);
    }

    /**
     * Updates the auth signals.
     *
     * @param user - The signed-in user, or null
     * @returns {void}
     */
    private setUser(user: AuthUser | null): void {
        this._user.set(user);
        this._isAuthenticated.set(!!user);
    }
}
