/** Angular Imports */
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
    type AbstractControl,
    NonNullableFormBuilder,
    ReactiveFormsModule,
    type ValidationErrors,
    Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

/** Third Party Imports */
import { Button, Card, Input } from '@ntv360/component-pantry';

/** Local Imports */
import { AuthService } from '@core/services/auth';
import { BrandComponent } from '@shared/components/brand';
import { APP_CAPTION } from '@shared/models/app';
import { PASSWORD_RULES } from '@shared/models/users';
import { apiErrorMessage } from '@shared/utils/api-error-message.util';

/**
 * Change-password page, full screen like the login page. Required after signing in with
 * a temporary password (a new account, or one an admin reset) - the rest of the app stays
 * closed until it's done - and open any time from the user menu.
 */
@Component({
    selector: 'app-change-password',
    imports: [BrandComponent, Button, Card, Input, ReactiveFormsModule, RouterLink],
    templateUrl: './change-password.component.html',
    styleUrl: './change-password.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class ChangePasswordComponent {
    /**
     * Authentication service instance
     * @type {AuthService}
     */
    private readonly authService = inject(AuthService);

    /**
     * Router service for navigation
     * @type {Router}
     */
    private readonly router = inject(Router);

    /**
     * Tagline under the wordmark
     * @type {string}
     */
    protected readonly caption = APP_CAPTION;

    /**
     * Shortest password allowed
     * @type {number}
     */
    protected readonly minLength = PASSWORD_RULES.minLength;

    /**
     * Whether the user must change a temporary password (no way back into the app)
     * @type {Signal<boolean>}
     */
    protected readonly isRequired = computed(
        () => this.authService.user()?.mustChangePassword ?? false,
    );

    /**
     * Whether this is the demo account, whose password lives in the server's environment
     * @type {Signal<boolean>}
     */
    protected readonly isDemo = computed(() => this.authService.user()?.isDemo ?? false);

    /**
     * Who is signed in
     * @type {Signal<string>}
     */
    protected readonly email = computed(() => this.authService.user()?.email ?? '');

    /**
     * Password form
     * @type {FormGroup}
     */
    protected readonly form = inject(NonNullableFormBuilder).group(
        {
            currentPassword: ['', [Validators.required]],
            newPassword: [
                '',
                [
                    Validators.required,
                    Validators.minLength(PASSWORD_RULES.minLength),
                    Validators.maxLength(PASSWORD_RULES.maxLength),
                ],
            ],
            confirmPassword: ['', [Validators.required]],
        },
        { validators: (group: AbstractControl) => this.passwordsMatch(group) },
    );

    /**
     * True while the request is in flight
     * @type {WritableSignal<boolean>}
     */
    protected readonly isSubmitting = signal(false);

    /**
     * Why the change failed, or null
     * @type {WritableSignal<string | null>}
     */
    protected readonly errorMessage = signal<string | null>(null);

    /**
     * Validation message for the current password, or null
     *
     * @returns {string | null} The message
     */
    protected currentError(): string | null {
        const control = this.form.controls.currentPassword;
        return control.touched && control.invalid
            ? this.isRequired()
                ? 'Enter the temporary password you signed in with.'
                : 'Enter your current password.'
            : null;
    }

    /**
     * Validation message for the new password, or null
     *
     * @returns {string | null} The message
     */
    protected newError(): string | null {
        const control = this.form.controls.newPassword;
        if (!control.touched || control.valid) {
            return null;
        }
        if (control.hasError('required')) {
            return 'Choose a new password.';
        }
        return control.hasError('maxlength')
            ? `Use at most ${PASSWORD_RULES.maxLength} characters.`
            : `Use at least ${PASSWORD_RULES.minLength} characters.`;
    }

    /**
     * Validation message for the confirmation, or null
     *
     * @returns {string | null} The message
     */
    protected confirmError(): string | null {
        const control = this.form.controls.confirmPassword;
        if (!control.touched) {
            return null;
        }
        if (control.hasError('required')) {
            return 'Type the new password again.';
        }
        return this.form.hasError('mismatch') ? "The passwords don't match." : null;
    }

    /**
     * Changes the password, then opens the app.
     *
     * @returns {Promise<void>}
     */
    protected async onSubmit(): Promise<void> {
        if (this.isSubmitting()) {
            return;
        }
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.isSubmitting.set(true);
        this.errorMessage.set(null);
        const { currentPassword, newPassword } = this.form.getRawValue();

        try {
            await this.authService.changePassword(currentPassword, newPassword);
            void this.router.navigate(['/']);
        } catch (error) {
            this.errorMessage.set(apiErrorMessage(error, "Couldn't change the password."));
            this.form.controls.currentPassword.reset();
        } finally {
            this.isSubmitting.set(false);
        }
    }

    /**
     * Signs out (the way out while a password change is required).
     *
     * @returns {Promise<void>}
     */
    protected async logout(): Promise<void> {
        await this.authService.logout();
        void this.router.navigate(['/login']);
    }

    /**
     * Form-level check that the new password and its confirmation match.
     *
     * @param group - The form
     * @returns {ValidationErrors | null} { mismatch: true } when they differ
     */
    private passwordsMatch(group: AbstractControl): ValidationErrors | null {
        const next = group.get('newPassword')?.value as string | undefined;
        const confirm = group.get('confirmPassword')?.value as string | undefined;
        return next && confirm && next !== confirm ? { mismatch: true } : null;
    }
}
