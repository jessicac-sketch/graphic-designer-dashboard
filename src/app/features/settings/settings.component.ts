/** Angular Imports */
import { Component } from '@angular/core';

/**
 * Settings page component.
 *
 * @remarks
 * Application settings and configuration page.
 */
/** Local Imports */
import { PageHeaderComponent } from '@shared/components/page-header';

@Component({
    selector: 'app-settings',
    imports: [PageHeaderComponent],
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.scss',
    standalone: true,
})
export class SettingsComponent {}
