/** Angular Imports */
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

/** Third Party Imports */
import { Observable, map } from 'rxjs';

/** Local Imports */
import type {
    AppUser,
    NewUserRequest,
    UserUpdateRequest,
    UserWithPassword,
} from '@shared/interfaces/users';

/**
 * User management through the BFF (`/api/users`, admins only).
 */
@Injectable({
    providedIn: 'root',
})
export class UsersService {
    /**
     * HTTP client for BFF calls
     * @type {HttpClient}
     */
    private readonly http = inject(HttpClient);

    /**
     * Base URL of the user endpoints
     * @type {string}
     */
    private readonly apiUrl = '/api/users';

    /**
     * Fetches every user, by name.
     *
     * @returns {Observable<AppUser[]>} The users
     */
    public list(): Observable<AppUser[]> {
        return this.http
            .get<{ data: AppUser[] }>(this.apiUrl)
            .pipe(map((response) => response.data));
    }

    /**
     * Adds a user with a temporary password.
     *
     * @param request - Name, email and role
     * @returns {Observable<UserWithPassword>} The user and their temporary password
     *
     * @example
     * this.usersService.create({ name: 'Ana Cruz', email: 'ana@example.com', role: 'qc' })
     *     .subscribe(({ temporaryPassword }) => …);
     */
    public create(request: NewUserRequest): Observable<UserWithPassword> {
        return this.http
            .post<{ data: UserWithPassword }>(this.apiUrl, request)
            .pipe(map((response) => response.data));
    }

    /**
     * Changes a user's name, role or whether they can sign in.
     *
     * @param id - User ID
     * @param update - The changes
     * @returns {Observable<AppUser>} The updated user
     */
    public update(id: string, update: UserUpdateRequest): Observable<AppUser> {
        return this.http
            .patch<{ data: AppUser }>(`${this.apiUrl}/${encodeURIComponent(id)}`, update)
            .pipe(map((response) => response.data));
    }

    /**
     * Sets a new temporary password for a user.
     *
     * @param id - User ID
     * @returns {Observable<UserWithPassword>} The user and the new temporary password
     */
    public resetPassword(id: string): Observable<UserWithPassword> {
        return this.http
            .post<{
                data: UserWithPassword;
            }>(`${this.apiUrl}/${encodeURIComponent(id)}/reset-password`, {})
            .pipe(map((response) => response.data));
    }

    /**
     * Deletes a user's account.
     *
     * @param id - User ID
     * @returns {Observable<void>} Completes once deleted
     */
    public remove(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${encodeURIComponent(id)}`);
    }
}
