/** Angular Imports */
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    inject,
    signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    NavigationCancel,
    NavigationEnd,
    NavigationError,
    NavigationStart,
    Router,
    RouterOutlet,
} from '@angular/router';

/** Third Party Imports */
import { OffcanvasComponent } from '@ntv360/component-pantry';

/** Local Imports */
import { SidebarComponent } from '@layouts/authenticated/sidebar';
import { TopbarComponent } from '@layouts/authenticated/topbar';

/**
 * Shell for signed-in pages: the sidebar, the top bar, and the page content.
 *
 * @remarks
 * From 992px the sidebar is full width and can be folded to an icon rail (remembered per
 * browser) with the button on the left of the top bar. Below 992px the sidebar is always
 * the icon rail; that same button opens the full navigation as a slide-in drawer instead
 * of squeezing the page.
 */
@Component({
    selector: 'app-authenticated-layout',
    imports: [RouterOutlet, OffcanvasComponent, SidebarComponent, TopbarComponent],
    templateUrl: './authenticated-layout.component.html',
    styleUrl: './authenticated-layout.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class AuthenticatedLayoutComponent {
    /**
     * Router, for navigation events
     * @type {Router}
     */
    private readonly router = inject(Router);

    /**
     * Below this width the sidebar is always the icon rail
     * @type {string}
     */
    private static readonly NARROW_QUERY = '(max-width: 991.98px)';

    /**
     * localStorage key for the folded state chosen on wide screens
     * @type {string}
     */
    private static readonly COLLAPSED_KEY = 'sidebar-collapsed';

    /**
     * Whether the mobile navigation drawer is open
     * @type {WritableSignal<boolean>}
     */
    protected readonly isMobileNavOpen = signal(false);

    /**
     * Whether the viewport is under 992px
     * @type {WritableSignal<boolean>}
     */
    private readonly isNarrow = signal(false);

    /**
     * Whether the user folded the sidebar on a wide screen
     * @type {WritableSignal<boolean>}
     */
    private readonly isFolded = signal(this.readFolded());

    /**
     * Whether the sidebar shows as the icon rail
     * @type {Signal<boolean>}
     */
    protected readonly isSidebarCollapsed = computed(() => this.isNarrow() || this.isFolded());

    /**
     * Whether the navigation is shown in full: the drawer is open (narrow screens), or
     * the sidebar isn't folded (wide screens)
     * @type {Signal<boolean>}
     */
    protected readonly isNavExpanded = computed(() =>
        this.isNarrow() ? this.isMobileNavOpen() : !this.isFolded(),
    );

    /**
     * Label (and tooltip) of the top bar's fold button for the current state
     * @type {Signal<string>}
     */
    protected readonly sidebarToggleLabel = computed(() => {
        if (this.isNarrow()) {
            return 'Open navigation menu';
        }
        return this.isFolded() ? 'Expand navigation' : 'Collapse navigation';
    });

    /**
     * Shows a "Please wait" overlay for the duration of a route navigation - most
     * noticeable on lazy-loaded routes (Map View, Venue Profile), which download their
     * own JS chunk on click before the page appears, and otherwise look like the click
     * did nothing.
     * @type {WritableSignal<boolean>}
     */
    protected readonly isNavigating = signal(false);

    /**
     * Tracks route navigation to toggle the overlay.
     */
    constructor() {
        const media = window.matchMedia(AuthenticatedLayoutComponent.NARROW_QUERY);
        this.isNarrow.set(media.matches);
        const onChange = (event: MediaQueryListEvent): void => {
            this.isNarrow.set(event.matches);
            // Back to a wide screen: the full sidebar is visible again, close the drawer
            if (!event.matches) {
                this.isMobileNavOpen.set(false);
            }
        };
        media.addEventListener('change', onChange);
        inject(DestroyRef).onDestroy(() => media.removeEventListener('change', onChange));

        this.router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
            if (event instanceof NavigationStart) {
                this.isNavigating.set(true);
            } else if (
                event instanceof NavigationEnd ||
                event instanceof NavigationCancel ||
                event instanceof NavigationError
            ) {
                this.isNavigating.set(false);
            }
        });
    }

    /**
     * The top bar's fold button: opens the full navigation drawer on narrow screens,
     * otherwise folds / unfolds the sidebar and remembers it.
     *
     * @returns {void}
     */
    protected onSidebarToggle(): void {
        if (this.isNarrow()) {
            this.isMobileNavOpen.set(true);
            return;
        }

        const folded = !this.isFolded();
        this.isFolded.set(folded);
        try {
            localStorage.setItem(AuthenticatedLayoutComponent.COLLAPSED_KEY, String(folded));
        } catch {
            // Storage unavailable (e.g. private mode): the choice just isn't remembered
        }
    }

    /**
     * Reads the remembered folded state.
     *
     * @returns {boolean} Whether the user last folded the sidebar
     */
    private readFolded(): boolean {
        try {
            return localStorage.getItem(AuthenticatedLayoutComponent.COLLAPSED_KEY) === 'true';
        } catch {
            return false;
        }
    }
}
