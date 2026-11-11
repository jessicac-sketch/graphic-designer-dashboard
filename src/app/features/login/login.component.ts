/** Angular Imports */
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

/** Third Party Imports */
import { Button, Card, Input, Toast } from '@ntv360/component-pantry';

/** Local Imports */
import { AuthService } from '@core/services/auth';
import { BrandComponent } from '@shared/components/brand';
import { APP_CAPTION } from '@shared/models/app';

/**
 * Login page: email/password sign-in against the BFF.
 *
 * @remarks
 * Signs in through the BFF's /api/auth/login endpoint, which sets an httpOnly session
 * cookie - no token is ever handled client-side. On success, navigates to `/`.
 */
@Component({
    selector: 'app-login',
    imports: [ReactiveFormsModule, Button, Card, Input, Toast, BrandComponent],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class LoginComponent {
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
     * Login form
     * @type {FormGroup}
     */
    protected readonly form = inject(NonNullableFormBuilder).group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required]],
    });

    /**
     * True while the login request is in flight
     * @type {WritableSignal<boolean>}
     */
    protected readonly isSubmitting = signal(false);

    /**
     * Error shown in the toast, or null when there is none
     * @type {WritableSignal<string | null>}
     */
    protected readonly errorMessage = signal<string | null>(null);

    /**
     * Returns the validation message for the email field.
     *
     * @returns {string | null} The message, or null when valid or untouched
     */
    protected getEmailError(): string | null {
        const control = this.form.controls.email;
        if (!control.touched || control.valid) {
            return null;
        }
        return control.hasError('required') ? 'Email is required.' : 'Enter a valid email address.';
    }

    /**
     * Returns the validation message for the password field.
     *
     * @returns {string | null} The message, or null when valid or untouched
     */
    protected getPasswordError(): string | null {
        const control = this.form.controls.password;
        return control.touched && control.invalid ? 'Password is required.' : null;
    }

    /**
     * Submits the form: signs in, then navigates to the app root.
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

        const { email, password } = this.form.getRawValue();
        const user = await this.authService.login(email.trim(), password);

        this.isSubmitting.set(false);

        if (!user) {
            this.form.controls.password.reset();
            this.errorMessage.set('Invalid email or password.');
            return;
        }

        // A temporary password (new user, or reset by an admin) is replaced first
        void this.router.navigate([user.mustChangePassword ? '/change-password' : '/']);
    }

    /**
     * Clears the error once the toast closes.
     *
     * @returns {void}
     */
    protected onToastClosed(): void {
        this.errorMessage.set(null);
    }
}
