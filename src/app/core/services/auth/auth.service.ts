/** Angular Imports */
import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';

/** Third Party Imports */
import { catchError, firstValueFrom, map, of } from 'rxjs';

/**
 * Authenticated user, as returned by the BFF's /api/auth endpoints.
 */
export interface AuthUser {
    id: string;
    email: string | undefined;
}

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

        this._user.set(user);
        this._isAuthenticated.set(!!user);
        return !!user;
    }

    /**
     * Signs in with email and password.
     *
     * @param email - User's email
     * @param password - User's password
     * @returns Promise resolving to true on success, false on invalid credentials
     */
    public async login(email: string, password: string): Promise<boolean> {
        const user = await firstValueFrom(
            this.http
                .post<{ data: { user: AuthUser } }>(`${this.apiUrl}/login`, { email, password })
                .pipe(
                    map((response) => response.data.user),
                    catchError(() => of(null)),
                ),
        );

        this._user.set(user);
        this._isAuthenticated.set(!!user);
        return !!user;
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
        this._user.set(null);
        this._isAuthenticated.set(false);
    }
}
