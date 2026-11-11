/** Angular Imports */
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Root application component.
 *
 * @remarks
 * Authentication state is resolved per-route by `authGuard`/`guestGuard`,
 * not here.
 */
@Component({
    selector: 'app-root',
    imports: [RouterOutlet],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent {
    /**
     * Application title
     * @type {string}
     */
    title = 'Welcome to internal-tool-boilerplate!';
}
