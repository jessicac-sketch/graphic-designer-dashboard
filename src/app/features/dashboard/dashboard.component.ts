/** Angular Imports */
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Third Party Imports */
import { Skeleton } from '@ntv360/component-pantry';

/** Local Imports */
import { AuthService } from '@core/services/auth';
import { PageHeaderComponent } from '@shared/components/page-header';
import { StatusBadgeComponent } from '@shared/components/status-badge';
import { SummaryCardComponent } from '@shared/components/summary-card';
import type { DashboardBar, DashboardWeekColumn } from '@shared/interfaces/dashboard';
import type { LibraryDashboard } from '@shared/interfaces/library';
import { DASHBOARD_AXIS_LABEL_EVERY } from '@shared/models/dashboard';
import { LIBRARY_FILE_TYPE_LABELS, LIBRARY_STATUSES } from '@shared/models/library';
import { LibraryService } from '@shared/services/library';
import { apiErrorMessage } from '@shared/utils/api-error-message.util';

/**
 * Dashboard: the library and its workflow at a glance - headline numbers, each workflow
 * category's assets per status, uploads per week, what the library holds, what's been
 * waiting longest, the latest uploads and comments, and who uploads most.
 *
 * @remarks
 * Charts are plain HTML in the single brand color (magnitude, one hue); identity comes
 * from labels, never color. Every chart has a visually hidden table for screen readers.
 */
@Component({
    selector: 'app-dashboard',
    imports: [
        DatePipe,
        NgTemplateOutlet,
        PageHeaderComponent,
        RouterLink,
        Skeleton,
        StatusBadgeComponent,
        SummaryCardComponent,
    ],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class DashboardComponent {
    /**
     * Library data from the BFF
     * @type {LibraryService}
     */
    private readonly libraryService = inject(LibraryService);

    /**
     * The signed-in user (for the greeting)
     * @type {AuthService}
     */
    private readonly authService = inject(AuthService);

    /**
     * Workflow statuses, in order, with their names
     * @type {readonly LibraryStatusInfo[]}
     */
    protected readonly statuses = LIBRARY_STATUSES;

    /**
     * The dashboard data: undefined while loading, null on error
     * @type {WritableSignal<LibraryDashboard | null | undefined>}
     */
    protected readonly data = signal<LibraryDashboard | null | undefined>(undefined);

    /**
     * Why the dashboard failed to load
     * @type {WritableSignal<string>}
     */
    protected readonly loadError = signal("Couldn't load the dashboard.");

    /**
     * Whether a refresh is running (keeps the current numbers on screen)
     * @type {WritableSignal<boolean>}
     */
    protected readonly isRefreshing = signal(false);

    /**
     * When the numbers were loaded
     * @type {WritableSignal<Date | null>}
     */
    protected readonly loadedAt = signal<Date | null>(null);

    /**
     * Greeting line, e.g. "Hi Ana - here's where the library stands."
     * @type {Signal<string>}
     */
    protected readonly greeting = computed(() => {
        const name = this.authService.user()?.name?.split(' ')[0];
        return name
            ? `Hi ${name} - here's where the library and its workflow stand.`
            : "Here's where the library and its workflow stand.";
    });

    /**
     * Uploads this week minus last week, or null before loading
     * @type {Signal<number | null>}
     */
    protected readonly weekDelta = computed(() => {
        const totals = this.data()?.totals;
        return totals ? totals.uploadsThisWeek - totals.uploadsLastWeek : null;
    });

    /**
     * Top of the uploads chart's scale: a round number at or above the busiest week
     * @type {Signal<number>}
     */
    protected readonly weekScaleMax = computed(() => {
        const max = Math.max(0, ...(this.data()?.weeklyUploads ?? []).map((week) => week.count));
        return this.niceCeiling(max);
    });

    /**
     * The uploads chart's columns
     * @type {Signal<DashboardWeekColumn[]>}
     */
    protected readonly weekColumns = computed((): DashboardWeekColumn[] => {
        const weeks = this.data()?.weeklyUploads ?? [];
        const top = this.weekScaleMax();
        return weeks.map((week, index) => {
            const isCurrent = index === weeks.length - 1;
            const fromEnd = weeks.length - 1 - index;
            return {
                ...week,
                percent: top ? (week.count / top) * 100 : 0,
                isCurrent,
                axisLabel: isCurrent
                    ? 'This week'
                    : fromEnd % DASHBOARD_AXIS_LABEL_EVERY === 0
                      ? this.shortDate(week.weekStart)
                      : '',
            };
        });
    });

    /**
     * Uploads over the chart's weeks
     * @type {Signal<number>}
     */
    protected readonly weeksTotal = computed(() =>
        (this.data()?.weeklyUploads ?? []).reduce((sum, week) => sum + week.count, 0),
    );

    /**
     * Assets per category, as bars (largest first)
     * @type {Signal<DashboardBar[]>}
     */
    protected readonly categoryBars = computed(() =>
        this.toBars(
            (this.data()?.categories ?? []).map((category) => [category.label, category.count]),
        ),
    );

    /**
     * Assets per file format, as bars (largest first)
     * @type {Signal<DashboardBar[]>}
     */
    protected readonly fileTypeBars = computed(() => {
        const fileTypes = this.data()?.fileTypes;
        return fileTypes
            ? this.toBars(
                  (Object.keys(fileTypes) as (keyof typeof fileTypes)[]).map((type) => [
                      LIBRARY_FILE_TYPE_LABELS[type],
                      fileTypes[type],
                  ]),
              )
            : [];
    });

    /**
     * Top uploaders over the last 30 days, as bars
     * @type {Signal<DashboardBar[]>}
     */
    protected readonly contributorBars = computed(() =>
        this.toBars(
            (this.data()?.contributors ?? []).map((entry) => [
                this.nameOf(entry.email),
                entry.count,
            ]),
        ),
    );

    constructor() {
        this.load();
    }

    /**
     * Loads (or refreshes) the dashboard.
     *
     * @returns {void}
     */
    protected load(): void {
        const hasData = !!this.data();
        if (hasData) {
            this.isRefreshing.set(true);
        } else {
            this.data.set(undefined);
        }
        this.libraryService.getDashboard().subscribe({
            next: (data) => {
                this.data.set(data);
                this.loadedAt.set(new Date());
                this.isRefreshing.set(false);
            },
            error: (error: unknown) => {
                console.error('[Dashboard] Failed to load the dashboard:', error);
                this.loadError.set(apiErrorMessage(error, "Couldn't load the dashboard."));
                this.isRefreshing.set(false);
                if (!hasData) {
                    this.data.set(null);
                }
            },
        });
    }

    /**
     * A status's share of its category, as a percentage.
     *
     * @param count - Assets with the status
     * @param total - Assets in the category
     * @returns {number} 0-100
     */
    protected share(count: number, total: number): number {
        return total ? Math.round((count / total) * 100) : 0;
    }

    /**
     * How long something has been waiting, e.g. "3 days", "5 hours", "under an hour".
     *
     * @param since - UTC ISO timestamp
     * @returns {string} The duration
     */
    protected waitingFor(since: string): string {
        const hours = Math.floor((Date.now() - Date.parse(since)) / 3_600_000);
        if (hours < 1) {
            return 'under an hour';
        }
        if (hours < 48) {
            return `${hours} hour${hours === 1 ? '' : 's'}`;
        }
        return `${Math.floor(hours / 24)} days`;
    }

    /**
     * Name shown for an email: its local part.
     *
     * @param email - The email
     * @returns {string} E.g. "jessica.c"
     */
    protected nameOf(email: string | null): string {
        return (email ?? '').split('@')[0] || 'Someone';
    }

    /**
     * A YYYY-MM-DD date as "Nov 3".
     *
     * @param day - The date
     * @returns {string} Month and day
     */
    protected shortDate(day: string): string {
        const date = new Date(`${day}T00:00:00Z`);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            timeZone: 'UTC',
        });
    }

    /**
     * Bars from label/value pairs, largest first, scaled to the largest.
     *
     * @param entries - [label, value] pairs
     * @returns {DashboardBar[]} The bars
     */
    private toBars(entries: [string, number][]): DashboardBar[] {
        const max = Math.max(0, ...entries.map(([, value]) => value));
        return entries
            .map(([label, value]) => ({ label, value, percent: max ? (value / max) * 100 : 0 }))
            .sort((a, b) => b.value - a.value);
    }

    /**
     * A round number at or above a value (1, 2, 5, 10, 20, 50 …), at least 4.
     *
     * @param value - The value
     * @returns {number} The ceiling
     */
    private niceCeiling(value: number): number {
        if (value <= 4) {
            return 4;
        }
        const magnitude = 10 ** Math.floor(Math.log10(value));
        const step = [1, 2, 5, 10].find((factor) => factor * magnitude >= value) ?? 10;
        return step * magnitude;
    }
}
