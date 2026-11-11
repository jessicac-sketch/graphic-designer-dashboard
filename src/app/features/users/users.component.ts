/** Angular Imports */
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
    FormControl,
    NonNullableFormBuilder,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';

/** Third Party Imports */
import { Button, Card, Input, Skeleton } from '@ntv360/component-pantry';
import { debounceTime, map, type Observable } from 'rxjs';

/** Local Imports */
import { AuthService } from '@core/services/auth';
import { DialogComponent } from '@shared/components/dialog';
import { PageHeaderComponent } from '@shared/components/page-header';
import type { AppUser, UserUpdateRequest } from '@shared/interfaces/users';
import { CARD_CONFIG } from '@shared/models/ui';
import { USER_ROLES, type UserRole, type UsersDialog } from '@shared/models/users';
import { InitialsPipe } from '@shared/pipes/initials';
import { UsersService } from '@shared/services/users';
import { apiErrorMessage } from '@shared/utils/api-error-message.util';

/**
 * User management (admins only): every account with its role and state. Admins add users
 * (who get a temporary password to change on first sign-in), change roles, disable or
 * enable sign-in, reset passwords and delete accounts.
 *
 * @remarks
 * The demo login from the server's environment is a backup Admin and isn't listed.
 */
@Component({
    selector: 'app-users',
    imports: [
        Button,
        Card,
        DatePipe,
        DialogComponent,
        InitialsPipe,
        Input,
        PageHeaderComponent,
        ReactiveFormsModule,
        Skeleton,
    ],
    templateUrl: './users.component.html',
    styleUrl: './users.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class UsersComponent {
    /**
     * User management through the BFF
     * @type {UsersService}
     */
    private readonly usersService = inject(UsersService);

    /**
     * The signed-in admin (who can't change their own role or disable themselves)
     * @type {AuthService}
     */
    private readonly authService = inject(AuthService);

    /**
     * Flat, outlined card look
     * @type {Partial<CardConfig>}
     */
    protected readonly cardConfig = CARD_CONFIG;

    /**
     * Every role, with its name and description
     * @type {readonly UserRoleInfo[]}
     */
    protected readonly roles = USER_ROLES;

    /**
     * One skeleton row per placeholder while users load
     * @type {number[]}
     */
    protected readonly skeletonRows = [0, 1, 2, 3];

    /**
     * The signed-in user's ID
     * @type {Signal<string | null>}
     */
    protected readonly myId = computed(() => this.authService.user()?.id ?? null);

    /**
     * The users: undefined while loading, null on error
     * @type {WritableSignal<AppUser[] | null | undefined>}
     */
    protected readonly users = signal<AppUser[] | null | undefined>(undefined);

    /**
     * Why the users failed to load
     * @type {WritableSignal<string>}
     */
    protected readonly loadError = signal("Couldn't load the users.");

    /**
     * Search box (name or email)
     * @type {FormControl<string>}
     */
    protected readonly searchControl = new FormControl('', { nonNullable: true });

    /**
     * Search text, debounced, trimmed and lowercased
     * @type {Signal<string>}
     */
    private readonly search = toSignal(
        this.searchControl.valueChanges.pipe(
            debounceTime(200),
            map((value) => value.trim().toLowerCase()),
        ),
        { initialValue: '' },
    );

    /**
     * The users matching the search
     * @type {Signal<AppUser[]>}
     */
    protected readonly visibleUsers = computed(() => {
        const search = this.search();
        const users = this.users() ?? [];
        return search
            ? users.filter((user) => `${user.name} ${user.email}`.toLowerCase().includes(search))
            : users;
    });

    /**
     * The open dialog, or null
     * @type {WritableSignal<UsersDialog | null>}
     */
    protected readonly dialog = signal<UsersDialog | null>(null);

    /**
     * Add-user form
     * @type {FormGroup}
     */
    protected readonly addForm = inject(NonNullableFormBuilder).group({
        name: ['', [Validators.required, Validators.maxLength(80)]],
        email: ['', [Validators.required, Validators.email]],
        role: ['designer' as UserRole, [Validators.required]],
    });

    /**
     * IDs of users with a change being saved (or "dialog" while a dialog's action runs)
     * @type {WritableSignal<ReadonlySet<string>>}
     */
    protected readonly busy = signal<ReadonlySet<string>>(new Set());

    /**
     * Why the last action failed, or null (shown in the open dialog, or above the list)
     * @type {WritableSignal<string | null>}
     */
    protected readonly actionError = signal<string | null>(null);

    /**
     * Whether the temporary password was just copied
     * @type {WritableSignal<boolean>}
     */
    protected readonly copied = signal(false);

    constructor() {
        this.load();
    }

    /**
     * Loads the users.
     *
     * @returns {void}
     */
    protected load(): void {
        this.users.set(undefined);
        this.usersService.list().subscribe({
            next: (users) => this.users.set(users),
            error: (error: unknown) => {
                console.error('[Users] Failed to load the users:', error);
                this.loadError.set(apiErrorMessage(error, "Couldn't load the users."));
                this.users.set(null);
            },
        });
    }

    /**
     * Opens the add-user dialog with an empty form.
     *
     * @returns {void}
     */
    protected openAdd(): void {
        this.addForm.reset({ name: '', email: '', role: 'designer' });
        this.actionError.set(null);
        this.dialog.set({ kind: 'add' });
    }

    /**
     * Adds the user from the form, then shows their temporary password.
     *
     * @returns {void}
     */
    protected add(): void {
        if (this.addForm.invalid) {
            this.addForm.markAllAsTouched();
            return;
        }
        const { name, email, role } = this.addForm.getRawValue();
        this.runDialog(this.usersService.create({ name, email: email.trim(), role }), (result) => {
            this.users.update((users) => this.sorted([...(users ?? []), result.user]));
            this.showPassword(result.user, result.temporaryPassword, true);
        });
    }

    /**
     * Sets a new temporary password for the user in the reset dialog, then shows it.
     *
     * @returns {void}
     */
    protected confirmReset(): void {
        const dialog = this.dialog();
        if (dialog?.kind !== 'reset') {
            return;
        }
        this.runDialog(this.usersService.resetPassword(dialog.user.id), (result) => {
            this.replace(result.user);
            this.showPassword(result.user, result.temporaryPassword, false);
        });
    }

    /**
     * Deletes the user in the delete dialog.
     *
     * @returns {void}
     */
    protected confirmDelete(): void {
        const dialog = this.dialog();
        if (dialog?.kind !== 'delete') {
            return;
        }
        const id = dialog.user.id;
        this.runDialog(this.usersService.remove(id), () => {
            this.users.update((users) => (users ?? []).filter((user) => user.id !== id));
            this.dialog.set(null);
        });
    }

    /**
     * Changes a user's role.
     *
     * @param user - The user
     * @param event - The role select's change event
     * @returns {void}
     */
    protected changeRole(user: AppUser, event: Event): void {
        const select = event.target as HTMLSelectElement;
        const role = select.value as UserRole;
        if (role === user.role) {
            return;
        }
        // Show the saved value until the change is confirmed
        select.value = user.role;
        this.updateUser(user, { role });
    }

    /**
     * Disables or re-enables a user's sign-in.
     *
     * @param user - The user
     * @returns {void}
     */
    protected toggleActive(user: AppUser): void {
        this.updateUser(user, { active: !user.active });
    }

    /**
     * Copies the temporary password shown in the dialog.
     *
     * @returns {void}
     */
    protected copyPassword(): void {
        const dialog = this.dialog();
        if (dialog?.kind !== 'password') {
            return;
        }
        navigator.clipboard.writeText(dialog.password).then(
            () => this.copied.set(true),
            () => this.actionError.set("Couldn't copy. Select the password and copy it instead."),
        );
    }

    /**
     * Clears the dialog once it closes - only if it's still the one that closed (ntv-modal
     * also reports a close when one dialog replaces another).
     *
     * @param kind - The kind of dialog that closed
     * @returns {void}
     */
    protected onDialogClosed(kind: UsersDialog['kind']): void {
        if (this.dialog()?.kind === kind) {
            this.dialog.set(null);
            this.actionError.set(null);
        }
    }

    /**
     * A role's name, e.g. "Graphics QC".
     *
     * @param role - The role
     * @returns {string} Its name
     */
    protected roleLabel(role: UserRole): string {
        return this.roles.find((entry) => entry.value === role)?.label ?? role;
    }

    /**
     * Validation message for an add-form field, or null.
     *
     * @param field - "name" or "email"
     * @returns {string | null} The message
     */
    protected fieldError(field: 'name' | 'email'): string | null {
        const control = this.addForm.controls[field];
        if (!control.touched || control.valid) {
            return null;
        }
        if (field === 'name') {
            return control.hasError('maxlength') ? 'Use at most 80 characters.' : 'Enter a name.';
        }
        return control.hasError('required') ? 'Enter an email.' : 'Enter a valid email address.';
    }

    /**
     * Whether a user's row has a change being saved.
     *
     * @param user - The user
     * @returns {boolean} True while saving
     */
    protected isBusy(user: AppUser): boolean {
        return this.busy().has(user.id);
    }

    /**
     * Saves a change to a user from their row.
     *
     * @param user - The user
     * @param update - The change
     * @returns {void}
     */
    private updateUser(user: AppUser, update: UserUpdateRequest): void {
        this.actionError.set(null);
        this.busy.update((ids) => new Set(ids).add(user.id));
        const done = (): void =>
            this.busy.update((ids) => {
                const next = new Set(ids);
                next.delete(user.id);
                return next;
            });

        this.usersService.update(user.id, update).subscribe({
            next: (updated) => {
                done();
                this.replace(updated);
            },
            error: (error: unknown) => {
                console.error('[Users] Failed to update the user:', error);
                done();
                this.actionError.set(apiErrorMessage(error, `Couldn't update ${user.name}.`));
            },
        });
    }

    /**
     * Runs a dialog's action, keeping the dialog busy until it settles.
     *
     * @param request - The request
     * @param onDone - What to do with its result
     * @returns {void}
     */
    private runDialog<T>(request: Observable<T>, onDone: (result: T) => void): void {
        this.actionError.set(null);
        this.busy.update((ids) => new Set(ids).add('dialog'));
        const done = (): void =>
            this.busy.update((ids) => {
                const next = new Set(ids);
                next.delete('dialog');
                return next;
            });

        request.subscribe({
            next: (result) => {
                done();
                onDone(result);
            },
            error: (error: unknown) => {
                console.error('[Users] Request failed:', error);
                done();
                this.actionError.set(apiErrorMessage(error, 'Something went wrong. Try again.'));
            },
        });
    }

    /**
     * Opens the dialog that hands over a temporary password.
     *
     * @param user - Whose password it is
     * @param password - The temporary password
     * @param isNew - Whether the user was just added (vs. a reset)
     * @returns {void}
     */
    private showPassword(user: AppUser, password: string, isNew: boolean): void {
        this.copied.set(false);
        this.dialog.set({ kind: 'password', user, password, isNew });
    }

    /**
     * Replaces a user in the list.
     *
     * @param updated - The updated user
     * @returns {void}
     */
    private replace(updated: AppUser): void {
        this.users.update((users) =>
            (users ?? []).map((user) => (user.id === updated.id ? updated : user)),
        );
    }

    /**
     * Users sorted by name.
     *
     * @param users - The users
     * @returns {AppUser[]} A sorted copy
     */
    private sorted(users: AppUser[]): AppUser[] {
        return [...users].sort((a, b) =>
            a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
        );
    }
}
