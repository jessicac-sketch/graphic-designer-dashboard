/** Angular Imports */
import { DecimalPipe } from '@angular/common';
import {
    Component,
    computed,
    DestroyRef,
    inject,
    type OnInit,
    signal,
    viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';

/** Third Party Imports */
import {
    Card,
    Skeleton,
    Table,
    type TableColumn,
    type TableStateEvent,
} from '@ntv360/component-pantry';
import { combineLatest, map } from 'rxjs';

/** Local Imports */
import {
    type DailyAdsSummaryEntry,
    MediaFilesService,
    type PlayRecordContent,
    type ProgrammaticAdsColumnFilters,
    type ProgrammaticAdsSortBy,
    type ProgrammaticAdsStats,
    type VenueProfile,
} from '@core';
import {
    CopyButtonComponent,
    formatPopDuration as formatPopDurationUtil,
    type PopDurationBucket,
    popDurationRowColor as popDurationRowColorUtil,
    truncateMiddle,
} from '@shared';
import { PageHeaderComponent } from '@shared/components/page-header';
import { RangeControlsComponent } from '@shared/components/range-controls';
import { RangeNoticeComponent } from '@shared/components/range-notice';
import { CARD_CONFIG } from '@shared/models/ui';
import { DashboardRangeService } from '@shared/services/dashboard';
import { TimeDisplayService } from '@shared/services/time-display';
import { toLocalDateRange } from '@shared/utils/utc-calendar-date.util';
// Direct subpath, not the '@shared'/'@shared/components' barrel - this
// component pulls in the full `echarts` package, and this page is
// lazy-loaded (loadComponent in authenticated.routes.ts) specifically to
// keep echarts out of the eager bundle - see the same note on Map View's
// own use of this component.
import { DailyAdsBarChartComponent } from '@shared/components/daily-ads-bar-chart/daily-ads-bar-chart.component';

/**
 * Standalone Venue Profile page - one venue's full Hosts API details
 * (address, contact, business hours) plus its ad activity (stats + a
 * paginated, sortable/filterable ad-records table), reached at `/venue/:venueId`.
 *
 * @remarks
 * The ads section deliberately mirrors RankingDataComponent's own
 * venue-ads-modal machinery (openVenueAdsModalForVenue and friends) almost
 * line for line - same reusable `getProgrammaticAdsStats`/
 * `getProgrammaticAdsList` calls, just venueId-fixed instead of
 * modal-scoped, and rendered as a real page section instead of inside
 * app-drill-down-modal. This mirrors how State/Category Ranking already
 * duplicate Venue Ranking's own tab logic elsewhere in this app, rather
 * than factoring out a shared service.
 */
@Component({
    selector: 'app-venue-profile',
    standalone: true,
    imports: [
        PageHeaderComponent,
        RangeControlsComponent,
        RangeNoticeComponent,
        Card,
        CopyButtonComponent,
        DailyAdsBarChartComponent,
        DecimalPipe,
        Skeleton,
        Table,
    ],
    templateUrl: './venue-profile.component.html',
    styleUrl: './venue-profile.component.scss',
})
export class VenueProfileComponent implements OnInit {
    private readonly mediaFilesService = inject(MediaFilesService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    /**
     * Global "Eastern Time / UTC" display preference, read by the template
     * to format this page's raw timestamp columns.
     * @type {TimeDisplayService}
     */
    protected readonly timeDisplayService = inject(TimeDisplayService);

    /**
     * The page header's subtitle, naming whichever zone is currently active
     * - the underlying day boundaries (and so this page's numbers) actually
     * shift with this, not just the label.
     * @type {Signal<string>}
     */
    protected readonly subtitle = computed(
        () =>
            `Venue profile and ad activity (${
                this.timeDisplayService.mode() === 'eastern' ? 'Eastern Time' : 'UTC'
            } days)`,
    );

    /** Venue identifier read from the route - fixed for the lifetime of this page. */
    private venueId = '';

    /**
     * The page's date range, shared with the Dashboard, Ranking Data and the top bar's
     * totals (set by the range controls in the page header; Yesterday by default)
     * @type {DashboardRangeService}
     */
    private readonly rangeService = inject(DashboardRangeService);

    /** The selected range as local dates (how this page reads and sends it), or null for "All time". */
    range = computed((): { start: Date; end: Date } | null => {
        const shared = this.rangeService.pageRange();
        return shared ? toLocalDateRange(shared) : null;
    });

    /**
     * The shared range as a stream, for reloading when it changes - combined with the
     * "Eastern Time / UTC" display mode, since a quick range like "Yesterday" can resolve
     * to the exact same calendar-date label in both zones for most of the day while still
     * meaning a genuinely different UTC instant window underneath that label
     * (resolve-date-zone.middleware.ts) - reacting to the range alone would silently skip
     * reloading whenever the label happens to match.
     */
    private readonly sharedRange$ = combineLatest([
        toObservable(this.rangeService.pageRange),
        toObservable(this.timeDisplayService.mode),
    ]).pipe(map(([range]) => range));

    /** For unsubscribing from the range stream when the page is left. */
    private readonly destroyRef = inject(DestroyRef);

    /** Same card chrome (flat, outlined - CARD_CONFIG) Ranking Data wraps its own tables in. */
    tableCardConfig = CARD_CONFIG;

    /** The venue's profile - name, address, category, business hours, expected requests. */
    profile = signal<VenueProfile | null>(null);
    isLoadingProfile = signal(false);

    /** Per-day totals (total ads, unique venues - always 0, unused here) for this venue - derived from the per-device breakdown below, so the two stay date-aligned. */
    dailyAdsSummary = signal<DailyAdsSummaryEntry[]>([]);
    isLoadingDailyAdsSummary = signal(false);

    /**
     * Sum of the navy "Total" line's own points, currently plotted in the
     * chart - always the total for whatever range is loaded, not a fixed
     * all-time figure, so it stays correct as the date range changes.
     */
    totalAdsSum = computed(() =>
        this.dailyAdsSummary().reduce((sum, day) => sum + day.totalAds, 0),
    );

    /** Per-device daily ad counts, one line per device - passed to the chart's device breakdown. */
    deviceSeries = signal<{ deviceId: string; data: number[] }[]>([]);

    ngOnInit(): void {
        this.venueId = this.route.snapshot.paramMap.get('venueId') || '';

        if (!this.venueId) {
            this.router.navigate(['/dashboard']);
            return;
        }

        // Loads now (the first value) and again whenever the shared range changes
        this.sharedRange$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.load());
    }

    /**
     * Loads the venue's profile and ad activity for the current range.
     *
     * @returns {void}
     */
    private load(): void {
        this.isLoadingProfile.set(true);

        const dateParams = this.dateParamsFor(this.range());

        this.mediaFilesService.getVenueProfile(this.venueId, dateParams).subscribe({
            next: (profile) => {
                this.profile.set(profile);
                this.isLoadingProfile.set(false);
            },
            error: (error: unknown) => {
                console.error('[VenueProfile] Failed to load venue profile:', error);
                this.isLoadingProfile.set(false);
                this.router.navigate(['/dashboard']);
            },
        });

        this.loadAdsStats();
        this.loadAds();
        this.loadDailyAdsSummary(dateParams.startDate, dateParams.endDate);
    }

    /**
     * Whether the chart is currently showing the hour-of-day breakdown
     * instead of the day-by-day view - true only when the picked range is
     * exactly one calendar day (start === end), regardless of which day.
     */
    isHourlyView = computed(() => {
        const range = this.range();
        if (!range) {
            return false;
        }
        return this.formatCalendarDate(range.start) === this.formatCalendarDate(range.end);
    });

    /**
     * Loads the bar chart's data for this venue: the hour-of-day breakdown
     * for a single picked day, or the day-by-day view otherwise (defaults
     * to the last 30 days server-side if no range is given). Derives both
     * dailyAdsSummary (x-axis labels + total, either calendar dates or
     * "HH:00" hour labels) and deviceSeries (one line per device) from the
     * same response, so the two are always index-aligned.
     *
     * @param {string} [startDate] - "YYYY-MM-DD", or undefined for the server's default
     * @param {string} [endDate] - "YYYY-MM-DD", or undefined for the server's default
     * @returns {void}
     */
    private loadDailyAdsSummary(startDate: string | undefined, endDate: string | undefined): void {
        this.isLoadingDailyAdsSummary.set(true);

        const source$ =
            startDate && startDate === endDate
                ? this.mediaFilesService.getHourlyDeviceAdsSummary(this.venueId, startDate)
                : this.mediaFilesService.getDailyDeviceAdsSummary(this.venueId, {
                      startDate,
                      endDate,
                  });

        source$.subscribe({
            next: (days) => {
                this.dailyAdsSummary.set(
                    days.map((day) => ({
                        date: day.date,
                        totalAds: Object.values(day.byDevice).reduce((sum, n) => sum + n, 0),
                        uniqueVenues: 0,
                        uniqueAds: 0,
                    })),
                );

                const deviceIds = [
                    ...new Set(days.flatMap((day) => Object.keys(day.byDevice))),
                ].sort();
                this.deviceSeries.set(
                    deviceIds.map((deviceId) => ({
                        deviceId,
                        data: days.map((day) => day.byDevice[deviceId] ?? 0),
                    })),
                );

                this.isLoadingDailyAdsSummary.set(false);
            },
            error: (error: unknown) => {
                console.error('[VenueProfile] Failed to load daily device ads summary:', error);
                this.isLoadingDailyAdsSummary.set(false);
            },
        });
    }

    /**
     * Converts a date range into startDate/endDate query params as
     * "YYYY-MM-DD" calendar dates.
     *
     * @param {{ start: Date; end: Date } | null} range - Date range, or null for all-time
     * @returns {{ startDate?: string; endDate?: string }} Date params, empty if no range is given
     */
    private dateParamsFor(range: { start: Date; end: Date } | null): {
        startDate?: string;
        endDate?: string;
    } {
        if (!range) {
            return {};
        }

        return {
            startDate: this.formatCalendarDate(range.start),
            endDate: this.formatCalendarDate(range.end),
        };
    }

    /**
     * Formats a Date's own local calendar components as "YYYY-MM-DD" -
     * deliberately not toISOString(), which converts to UTC and can shift
     * the date backward or forward a day depending on the browser's offset.
     *
     * @param {Date} date - Date to format
     * @returns {string} "YYYY-MM-DD"
     */
    private formatCalendarDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // ---------------------------------------------------------------------
    // Ads activity - mirrors RankingDataComponent's venue-ads-modal machinery
    // (openVenueAdsModalForVenue/loadVenueAdsModalStats/loadVenueAdsModal/
    // loadMoreVenueAdsModal/onVenueAdsModalStateChange/
    // toggleVenueAdsModalBucketFilter), just venueId-fixed and page-scoped.
    // ---------------------------------------------------------------------

    /**
     * Column definitions for the ads table - identical to Ranking Data's
     * venueAdsModalColumns (same PlayRecordContent row shape, no Venue ID
     * column since the whole page is already scoped to one venue).
     */
    adsColumns: TableColumn[] = [
        { field: 'creative', header: 'Creative', width: '70px', filter: false },
        { field: 'screenshot', header: 'Screenshot', width: '70px', filter: false },
        {
            field: 'creativeId',
            header: 'Creative ID',
            width: '160px',
            filter: true,
            filterType: 'text',
        },
        {
            field: 'trackerId',
            header: 'Tracking ID',
            width: '160px',
            filter: true,
            filterType: 'text',
        },
        {
            field: 'creativeSource',
            header: 'Creative Source',
            width: '150px',
            filter: true,
            filterType: 'text',
        },
        {
            field: 'deviceId',
            header: 'Device ID',
            width: '160px',
            filter: true,
            filterType: 'text',
        },
        {
            field: 'fetchedAt',
            header: 'Fetched At',
            width: '180px',
            filter: true,
            filterType: 'date',
        },
        {
            field: 'proofOfPlaySent',
            header: 'Proof of Play Sent',
            width: '180px',
            filter: true,
            filterType: 'date',
        },
        {
            field: 'popDurationMinutes',
            header: 'POP Duration',
            width: '140px',
            filter: true,
            filterType: 'date',
        },
        { field: 'served', header: 'Served', width: '100px', filter: true, filterType: 'date' },
        {
            field: 'dateServed',
            header: 'Date Served',
            width: '180px',
            filter: true,
            filterType: 'date',
        },
        {
            // Optional - not every player-ui report includes these, and
            // older rows predate the columns entirely. Cell rendering below
            // shows "N/A" when null.
            field: 'slotPlaylistContentId',
            header: 'Slot Playlist Content ID',
            width: '180px',
            filter: false,
        },
        {
            field: 'slotPlaylistContentPosition',
            header: 'Slot Position',
            width: '120px',
            filter: false,
        },
    ];

    private readonly adsTable = viewChild<Table>('adsTable');

    adsData = signal<PlayRecordContent[]>([]);
    adsTotalCount = signal(0);
    isLoadingAds = signal(false);
    isLoadingMoreAds = signal(false);
    private adsOffset = 0;
    private readonly adsPageSize = 20;

    /** Total/green/yellow/red proof-of-play duration counts for this venue. */
    adsStats = signal<ProgrammaticAdsStats | null>(null);
    activeBucketFilter = signal<PopDurationBucket | null>(null);

    private activeSortBy: ProgrammaticAdsSortBy = 'fetched_at';
    private activeSortDir: 'asc' | 'desc' = 'desc';
    private activeColumnFilters: ProgrammaticAdsColumnFilters = {};
    private columnFilterDebounce: ReturnType<typeof setTimeout> | undefined;

    private static readonly SORT_FIELD_MAP: Partial<Record<string, ProgrammaticAdsSortBy>> = {
        fetchedAt: 'fetched_at',
        popDurationMinutes: 'pop_duration',
        proofOfPlaySent: 'proof_of_play_sent',
        dateServed: 'date_served',
        creativeId: 'creative_id',
        creativeSource: 'creative_source',
        deviceId: 'device_id',
        served: 'served',
    };

    /**
     * Loads the mini stat row (total/green/yellow/red) for this venue,
     * scoped to the current range.
     *
     * @returns {void}
     */
    private loadAdsStats(): void {
        this.mediaFilesService
            .getProgrammaticAdsStats({
                venueIds: [this.venueId],
                ...this.dateParamsFor(this.range()),
            })
            .subscribe({
                next: (stats) => this.adsStats.set(stats),
                error: (error: unknown) => {
                    console.error('[VenueProfile] Failed to load ads stats:', error);
                    this.adsStats.set(null);
                },
            });
    }

    /**
     * Loads the first page of this venue's play records, applying the
     * active bucket/sort/column-filter state.
     *
     * @returns {void}
     */
    private loadAds(): void {
        this.isLoadingAds.set(true);
        this.adsOffset = 0;
        this.adsTable()?.showLoadingOverlay('Loading...');

        this.mediaFilesService
            .getProgrammaticAdsList({
                venueIds: [this.venueId],
                limit: this.adsPageSize,
                offset: 0,
                bucket: this.activeBucketFilter() ?? undefined,
                sortBy: this.activeSortBy,
                sortDir: this.activeSortDir,
                columnFilters: this.activeColumnFilters,
                ...this.dateParamsFor(this.range()),
            })
            .subscribe({
                next: ({ data, count }) => {
                    this.adsData.set(data);
                    this.adsOffset = data.length;
                    this.adsTotalCount.set(count);
                    this.isLoadingAds.set(false);
                    this.adsTable()?.hideLoadingOverlay();
                },
                error: (error: unknown) => {
                    console.error('[VenueProfile] Failed to load play records:', error);
                    this.isLoadingAds.set(false);
                    this.adsTable()?.hideLoadingOverlay();
                },
            });
    }

    /**
     * Loads the next page of this venue's play records. Bound to
     * ntv-table's native showMoreRequested output.
     *
     * @returns {void}
     */
    loadMoreAds(): void {
        if (this.isLoadingMoreAds() || this.adsOffset >= this.adsTotalCount()) {
            return;
        }

        this.isLoadingMoreAds.set(true);

        this.mediaFilesService
            .getProgrammaticAdsList({
                venueIds: [this.venueId],
                limit: this.adsPageSize,
                offset: this.adsOffset,
                bucket: this.activeBucketFilter() ?? undefined,
                sortBy: this.activeSortBy,
                sortDir: this.activeSortDir,
                columnFilters: this.activeColumnFilters,
                ...this.dateParamsFor(this.range()),
            })
            .subscribe({
                next: ({ data, count }) => {
                    this.adsData.set([...this.adsData(), ...data]);
                    this.adsOffset += data.length;
                    this.adsTotalCount.set(count);
                    this.isLoadingMoreAds.set(false);
                },
                error: (error: unknown) => {
                    console.error('[VenueProfile] Failed to load more play records:', error);
                    this.isLoadingMoreAds.set(false);
                },
            });
    }

    /**
     * Handles sort/filter state changes from the ads table.
     *
     * @param {TableStateEvent} event - Table state change event
     * @returns {void}
     */
    onAdsStateChange(event: TableStateEvent): void {
        const mappedSortBy = event.sortField
            ? VenueProfileComponent.SORT_FIELD_MAP[event.sortField]
            : undefined;
        const nextSortBy = mappedSortBy ?? 'fetched_at';
        const nextSortDir = mappedSortBy ? event.sortOrder : 'desc';
        const nextColumnFilters = this.extractColumnFilters(event.filters);

        const sortChanged = nextSortBy !== this.activeSortBy || nextSortDir !== this.activeSortDir;
        const filtersChanged =
            JSON.stringify(nextColumnFilters) !== JSON.stringify(this.activeColumnFilters);

        if (!sortChanged && !filtersChanged) {
            return;
        }

        this.activeSortBy = nextSortBy;
        this.activeSortDir = nextSortDir;
        this.activeColumnFilters = nextColumnFilters;

        if (this.columnFilterDebounce) {
            clearTimeout(this.columnFilterDebounce);
        }

        if (filtersChanged) {
            this.columnFilterDebounce = setTimeout(() => this.loadAds(), 400);
        } else {
            this.loadAds();
        }
    }

    /**
     * Picks the supported column filters out of a table state event.
     *
     * @param {Record<string, unknown>} filters - Raw filters from a TableStateEvent
     * @returns {ProgrammaticAdsColumnFilters} Supported, non-empty column filters
     */
    private extractColumnFilters(filters: Record<string, unknown>): ProgrammaticAdsColumnFilters {
        const result: ProgrammaticAdsColumnFilters = {};
        const fields: (keyof ProgrammaticAdsColumnFilters)[] = [
            'creativeId',
            'creativeSource',
            'deviceId',
            'trackerId',
        ];

        for (const field of fields) {
            const value = filters[field];
            if (typeof value === 'string' && value.trim()) {
                result[field] = value.trim();
            }
        }

        return result;
    }

    /**
     * Toggles the active duration-bucket filter. Clicking the
     * currently-active filter clears it.
     *
     * @param {PopDurationBucket} filter - Filter to apply
     * @returns {void}
     */
    toggleBucketFilter(filter: PopDurationBucket): void {
        this.activeBucketFilter.set(this.activeBucketFilter() === filter ? null : filter);
        this.loadAds();
    }

    /**
     * Clears the active duration-bucket filter - bound to the "Total" mini stat.
     *
     * @returns {void}
     */
    clearBucketFilter(): void {
        this.activeBucketFilter.set(null);
        this.loadAds();
    }

    /**
     * Opens a media asset URL in a new tab.
     *
     * @param {Event} event - Click event, stopped from bubbling to the row
     * @param {string | null | undefined} url - Media asset URL to open
     * @returns {void}
     */
    openMedia(event: Event, url: string | null | undefined): void {
        event.stopPropagation();

        if (!url) {
            return;
        }

        try {
            const mediaUrl = new URL(url);
            if (mediaUrl.protocol !== 'http:' && mediaUrl.protocol !== 'https:') {
                return;
            }

            const link = document.createElement('a');
            link.href = mediaUrl.href;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.click();
        } catch {
            console.error('[VenueProfile] Ignored invalid media URL.');
        }
    }

    /**
     * Truncates a string to a maximum length, appending an ellipsis if cut short.
     *
     * @param {string | null | undefined} value - Value to truncate
     * @param {number} maxLength - Maximum number of characters to keep
     * @returns {string} Truncated string
     */
    truncate(value: string | null | undefined, maxLength: number = 15): string {
        if (!value) {
            return '';
        }

        return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
    }

    /**
     * Shortens a device ID (a full UUID) to its first/last 5 characters -
     * used for the device chip list, which otherwise gets unreadably wide
     * with more than a couple of devices.
     *
     * @param {string} deviceId - Device ID to shorten
     * @returns {string} Shortened device ID
     */
    truncateDeviceId(deviceId: string): string {
        return truncateMiddle(deviceId);
    }

    /**
     * Formats the proof-of-play duration for display.
     *
     * @param {Record<string, unknown>} rowData - Raw play record row
     * @returns {string} Formatted duration (e.g. "3m", "1h 5m"), or "--" if not computable
     */
    formatPopDuration(rowData: Record<string, unknown>): string {
        return formatPopDurationUtil(rowData['popDurationMinutes'] as number | null);
    }

    /**
     * Gets the row's proof-of-play duration bucket color as an "r, g, b"
     * string, for use with the --pop-row-color CSS variable.
     *
     * @param {Record<string, unknown>} rowData - Raw play record row
     * @returns {string | null} "r, g, b" string, or null if no bucket applies
     */
    popDurationRowColor(rowData: Record<string, unknown>): string | null {
        return popDurationRowColorUtil(rowData['popDurationMinutes'] as number | null);
    }
}
