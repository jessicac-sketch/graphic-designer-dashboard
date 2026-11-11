/** Angular Imports */
import { DecimalPipe } from '@angular/common';
import { Component, computed, DestroyRef, inject, type OnInit, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** Third Party Imports */
import { Card, Modal, Skeleton, Table, type TableColumn, Tabs } from '@ntv360/component-pantry';
import { combineLatest, map, type Subscription } from 'rxjs';

/** Local Imports */
import {
    type LocationData,
    type MediaFileDetailContent,
    MediaFilesService,
    type PlayRecordContent,
} from '@core';
import { SlotGridComponent, SlotStatComponent } from '@features/ad-analytics/components';
import {
    bucketFromMinutes,
    buildCsvBlob,
    dateStampedFilename,
    downloadFile,
    ExportButtonComponent,
    type ExportFormat,
    formatPopDuration as formatPopDurationUtil,
    POP_DURATION_LEGEND,
    type PopDurationBucket,
    popDurationRowColor as popDurationRowColorUtil,
    toCsvValue,
} from '@shared';
import { PageHeaderComponent } from '@shared/components/page-header';
import { RangeControlsComponent } from '@shared/components/range-controls';
import { RangeNoticeComponent } from '@shared/components/range-notice';
import { SectionErrorComponent } from '@shared/components/section-error';
import { ShareListComponent } from '@shared/components/share-list';
import { SummaryCardComponent } from '@shared/components/summary-card';
import type { AdVenueSlot } from '@shared/interfaces/ad-analytics';
import type { ShareItem } from '@shared/interfaces/ui';
import { buildDashboardExportColumns } from '@shared/models/ad-analytics';
import { CARD_CONFIG } from '@shared/models/ui';
import { DashboardRangeService } from '@shared/services/dashboard';
import { TimeDisplayService } from '@shared/services/time-display';
import { STATE_CODE_TO_NAME } from '@shared/utils/us-states.util';
import { formatCalendarDate, formatCalendarRange } from '@shared/utils/utc-calendar-date.util';

/**
 * Ad Analytics page component.
 *
 * @remarks
 * Displays detailed analytics for a single media file (ad creative).
 */
@Component({
    selector: 'app-ad-analytics',
    imports: [
        PageHeaderComponent,
        Card,
        DecimalPipe,
        ExportButtonComponent,
        Modal,
        RangeControlsComponent,
        RangeNoticeComponent,
        SectionErrorComponent,
        ShareListComponent,
        SlotGridComponent,
        SlotStatComponent,
        SummaryCardComponent,
        RouterLink,
        Skeleton,
        Table,
        Tabs,
    ],
    templateUrl: './ad-analytics.component.html',
    styleUrl: './ad-analytics.component.scss',
    standalone: true,
})
export class AdAnalyticsComponent implements OnInit {
    /**
     * Media files service for API calls.
     * @type {MediaFilesService}
     */
    private readonly mediaFilesService = inject(MediaFilesService);

    /**
     * Global "Eastern Time / UTC" display preference, read by the template
     * to format every raw timestamp on this page.
     * @type {TimeDisplayService}
     */
    protected readonly timeDisplayService = inject(TimeDisplayService);

    /**
     * Injected route for accessing route parameters.
     * @type {ActivatedRoute}
     */
    private readonly route = inject(ActivatedRoute);

    /**
     * Injected router for navigation.
     * @type {Router}
     */
    private readonly router = inject(Router);

    /**
     * The page's date range, shared with the Dashboard, Ranking Data and Venue Profile
     * (set by the range controls in the page header; Yesterday by default)
     * @type {DashboardRangeService}
     */
    private readonly rangeService = inject(DashboardRangeService);

    /**
     * Widest date range the export accepts, in days - an unbounded export pulls every
     * play, so the server refuses more than this too
     * @type {number}
     */
    private static readonly MAX_EXPORT_RANGE_DAYS = 31;

    /**
     * Cancels the in-flight venue slots request when the page is left
     * @type {DestroyRef}
     */
    private readonly destroyRef = inject(DestroyRef);

    /**
     * Configuration for content card.
     *
     * @type {object}
     */
    cardConfig = CARD_CONFIG;

    /**
     * Current content data as a signal.
     */
    content = signal<MediaFileDetailContent | null>(null);

    /**
     * Loading state for content as a signal.
     */
    isLoadingContent = signal(true);

    /**
     * Content ID from route parameter.
     * @type {string}
     */
    contentId: string = '';

    /**
     * Tabs configuration.
     * @type {Array}
     */
    tabs = [{ label: 'Play Records' }]; // Locations tab hidden for now: { label: 'Locations' }

    /**
     * Active tab index.
     * @type {number}
     */
    activeTabIndex = 0;

    /**
     * Sum of the per-venue play counts - the denominator for every share in the breakdown
     * @type {Signal<number>}
     */
    protected readonly locationsTotal = computed((): number =>
        this.locationsData().reduce((sum, location) => sum + location.playCount, 0),
    );

    /**
     * Plays in the picked range (all time without one), counted by the play records
     * request; null until it loads
     * @type {WritableSignal<number | null>}
     */
    protected readonly rangePlayTotal = signal<number | null>(null);

    /**
     * Plays with no venue (the range's total minus what the venues add up to), or 0
     * @type {Signal<number>}
     */
    protected readonly withoutVenue = computed((): number =>
        Math.max((this.rangePlayTotal() ?? 0) - this.locationsTotal(), 0),
    );

    /**
     * The picked range as the API's startDate / endDate ("YYYY-MM-DD"), or empty for
     * "All time"
     * @type {Signal<{ startDate?: string; endDate?: string }>}
     */
    protected readonly dateParams = computed((): { startDate?: string; endDate?: string } => {
        const range = this.rangeService.pageRange();
        return range ? { startDate: range.start, endDate: range.end } : {};
    });

    /**
     * Whether a range is picked (not "All time") - the card then shows the range's plays
     * @type {Signal<boolean>}
     */
    protected readonly hasRange = computed((): boolean => this.rangeService.pageRange() !== null);

    /**
     * The shared range as a stream, for reloading when it changes - combined with the
     * "Eastern Time / UTC" display mode, since a quick range like "Yesterday" can resolve
     * to different days (and the BFF turns the days into instants) per mode
     */
    private readonly sharedRange$ = combineLatest([
        toObservable(this.rangeService.pageRange),
        toObservable(this.timeDisplayService.mode),
    ]).pipe(map(([range]) => range));

    /**
     * Two-letter code of the state picked in the States list, or null for all venues
     * @type {WritableSignal<string | null>}
     */
    protected readonly selectedStateId = signal<string | null>(null);

    /**
     * ID of the venue picked in the Venues list to see its playlist slots, or null
     * @type {WritableSignal<string | null>}
     */
    protected readonly selectedVenueId = signal<string | null>(null);

    /**
     * The picked venue's row from the locations data (name, plays), or null
     * @type {Signal<LocationData | null>}
     */
    protected readonly selectedVenue = computed(
        (): LocationData | null =>
            this.locationsData().find((location) => location.venueId === this.selectedVenueId()) ??
            null,
    );

    /**
     * This ad's plays at the picked venue grouped by playlist slot, ascending by position
     * (each with its play count, last play time and newest screenshot)
     * @type {WritableSignal<AdVenueSlot[]>}
     */
    protected readonly venueSlots = signal<AdVenueSlot[]>([]);

    /**
     * True while the picked venue's slots load
     * @type {WritableSignal<boolean>}
     */
    protected readonly isLoadingVenueSlots = signal(false);

    /**
     * True when loading the picked venue's slots failed
     * @type {WritableSignal<boolean>}
     */
    protected readonly hasVenueSlotsError = signal(false);

    /**
     * The in-flight venue slots request, cancelled when another venue is picked
     * @type {Subscription | null}
     */
    private venueSlotsRequest: Subscription | null = null;

    /**
     * The in-flight venue breakdown request, cancelled when the range changes
     * @type {Subscription | null}
     */
    private locationsRequest: Subscription | null = null;

    /**
     * The in-flight play records request, cancelled when the range changes
     * @type {Subscription | null}
     */
    private playRecordsRequest: Subscription | null = null;

    /**
     * Whether the "no plays in the range, show the latest day" check already ran (once per visit)
     * @type {boolean}
     */
    private hasTriedLatestFallback = false;

    /**
     * States this ad was played in, by play count, each with how many venues played it
     * @type {Signal<ShareItem[]>}
     */
    protected readonly stateItems = computed((): ShareItem[] => {
        const byState = new Map<string, { plays: number; venues: number }>();
        for (const location of this.locationsData()) {
            const state = location.state || 'Unknown';
            const entry = byState.get(state) ?? { plays: 0, venues: 0 };
            entry.plays += location.playCount;
            entry.venues += 1;
            byState.set(state, entry);
        }

        return [...byState.entries()]
            .map(([state, { plays, venues }]) => ({
                id: state,
                name: this.stateName(state),
                caption: `${venues} ${venues === 1 ? 'venue' : 'venues'}`,
                value: plays,
            }))
            .sort((left, right) => right.value - left.value);
    });

    /**
     * Venues that played this ad - in the picked state, or everywhere - by play count
     * @type {Signal<ShareItem[]>}
     */
    protected readonly venueItems = computed((): ShareItem[] => {
        const state = this.selectedStateId();

        return this.locationsData()
            .filter((location) => !state || (location.state || 'Unknown') === state)
            .map((location) => ({
                id: location.venueId,
                name: location.name,
                // Venue ID under the name (skipped when the name already is the ID, i.e.
                // the Hosts API doesn't know the venue), then "City, ST"
                caption: [
                    location.name === location.venueId ? '' : location.venueId,
                    [location.city, location.state !== 'Unknown' ? location.state : '']
                        .filter(Boolean)
                        .join(', '),
                ]
                    .filter(Boolean)
                    .join(' · '),
                value: location.playCount,
                route: `/venue/${location.venueId}`,
            }))
            .sort((left, right) => right.value - left.value);
    });

    /**
     * Total the venue shares are taken against: the picked state's plays, or the ad's all venues
     * @type {Signal<number>}
     */
    protected readonly venuesTotal = computed((): number => {
        const state = this.selectedStateId();
        if (!state) {
            return this.locationsTotal();
        }
        return this.stateItems().find((item) => item.id === state)?.value ?? 0;
    });

    /**
     * Display name for a state code.
     *
     * @param {string} code - Two-letter code or "Unknown"
     * @returns {string} e.g. "Texas", "Unknown state"
     */
    protected stateName(code: string): string {
        return code === 'Unknown' ? 'Unknown state' : (STATE_CODE_TO_NAME[code] ?? code);
    }

    /** Rows each breakdown list shows before "Show all" (which then scrolls inside the card) */
    protected readonly topLimit = 5;

    /** Rows the Venues list shows before "Show all" - more than States, as a state has many venues */
    protected readonly venuesLimit = 10;

    /** Whether the locations request failed (the breakdown shows Retry) */
    protected readonly hasLocationsError = signal(false);

    /**
     * Loads the per-venue breakdown again (Retry).
     *
     * @returns {void}
     */
    protected reloadLocations(): void {
        this.loadLocations();
    }

    /**
     * Whether a range is picked and within MAX_EXPORT_RANGE_DAYS - "All time" and very
     * wide ranges can't be exported
     * @type {Signal<boolean>}
     */
    private readonly isExportableRange = computed((): boolean => {
        const range = this.rangeService.pageRange();
        if (!range) {
            return false;
        }

        const spanDays =
            Math.round(
                (Date.parse(`${range.end}T00:00:00Z`) - Date.parse(`${range.start}T00:00:00Z`)) /
                    (24 * 60 * 60 * 1000),
            ) + 1;
        return spanDays <= AdAnalyticsComponent.MAX_EXPORT_RANGE_DAYS;
    });

    /**
     * Whether the play records export is allowed: an exportable range, its play records
     * loaded, and at least one play in it
     * @type {Signal<boolean>}
     */
    protected readonly canExport = computed(
        (): boolean =>
            this.isExportableRange() && !this.isLoadingPlayRecords() && !!this.rangePlayTotal(),
    );

    /**
     * Why the export is disabled (the button's tooltip), or null when it is allowed
     * @type {Signal<string | null>}
     */
    protected readonly exportDisabledReason = computed((): string | null => {
        if (!this.rangeService.pageRange()) {
            return `Pick a date range (up to ${AdAnalyticsComponent.MAX_EXPORT_RANGE_DAYS} days) to export - "All time" can't be exported`;
        }
        if (this.isLoadingPlayRecords()) {
            return 'Loading the selected date range...';
        }
        if (!this.isExportableRange()) {
            return `Date range is too wide - export supports up to ${AdAnalyticsComponent.MAX_EXPORT_RANGE_DAYS} days`;
        }
        if (!this.rangePlayTotal()) {
            return 'No play records to export';
        }
        return null;
    });

    /**
     * True while an export runs
     * @type {WritableSignal<boolean>}
     */
    protected readonly isExporting = signal(false);

    /**
     * Exports every play record of this ad in the picked range. CSV is built here from
     * the records the server returns; XLSX is a styled workbook the server builds, the
     * same as the other tables' exports.
     *
     * @param format - Export file format
     * @returns {void}
     */
    protected exportPlayRecords(format: ExportFormat): void {
        const { startDate, endDate } = this.dateParams();
        if (this.isExporting() || !this.canExport() || !startDate || !endDate) {
            return;
        }

        this.isExporting.set(true);
        const range = { startDate, endDate };
        const onError = (error: unknown): void => {
            console.error('[AdAnalytics] Failed to export play records:', error);
            this.isExporting.set(false);
        };

        if (format === 'xlsx') {
            this.mediaFilesService.getPlayRecordsExportXlsx(this.contentId, range).subscribe({
                next: (file) => {
                    downloadFile(file, dateStampedFilename('play-records', 'xlsx'));
                    this.isExporting.set(false);
                },
                error: onError,
            });
            return;
        }

        this.mediaFilesService.getPlayRecordsExport(this.contentId, range).subscribe({
            next: (records) => {
                const columns = [
                    ...buildDashboardExportColumns(this.timeDisplayService.zoneId()),
                    {
                        header: 'Slot Playlist Content ID',
                        key: 'slotPlaylistContentId' as const,
                        format: (row: PlayRecordContent) => row.slotPlaylistContentId ?? 'N/A',
                    },
                    {
                        header: 'Slot Position',
                        key: 'slotPlaylistContentPosition' as const,
                        format: (row: PlayRecordContent) =>
                            row.slotPlaylistContentPosition ?? 'N/A',
                    },
                ];
                const headers = columns.map((column) => column.header);
                const rows = records.map((record) =>
                    columns.map((column) =>
                        toCsvValue(column.format ? column.format(record) : record[column.key]),
                    ),
                );
                downloadFile(
                    buildCsvBlob(headers, rows),
                    dateStampedFilename('play-records', 'csv'),
                );
                this.isExporting.set(false);
            },
            error: onError,
        });
    }

    /**
     * Column configuration for play records table.
     * @type {TableColumn[]}
     */
    playRecordsColumns: TableColumn[] = [
        {
            field: 'popScreenshot',
            header: 'Proof of Play',
            width: '120px',
            filter: false,
        },
        {
            field: 'venueId',
            header: 'Venue ID',
            width: '200px',
            filter: true,
            filterType: 'text',
        },
        {
            field: 'played',
            header: 'Last Played',
            width: '200px',
            filter: true,
            filterType: 'date',
        },
        {
            field: 'deviceId',
            header: 'Device ID',
            width: '200px',
            filter: true,
            filterType: 'text',
        },
        {
            field: 'fetchedAt',
            header: 'Fetched At',
            width: '200px',
            filter: true,
            filterType: 'date',
        },
        {
            field: 'proofOfPlaySent',
            header: 'Proof of Play Sent',
            width: '200px',
            filter: true,
            filterType: 'date',
        },
        {
            field: 'popDurationMinutes',
            header: 'POP Duration',
            width: '140px',
            filter: false,
        },
        {
            field: 'served',
            header: 'Served',
            width: '100px',
            filter: false,
        },
        {
            field: 'dateServed',
            header: 'Date Served',
            width: '180px',
            filter: true,
            filterType: 'date',
        },
    ];

    /**
     * Legend/filter definitions for proof-of-play duration buckets.
     */
    readonly popDurationLegend = POP_DURATION_LEGEND;

    /**
     * Currently active proof-of-play duration bucket filter, or null for no filter.
     * Applied client-side, since a single creative's play records are already
     * fully loaded (not paginated), unlike Ranking Data's full-table view.
     */
    activeBucketFilter = signal<PopDurationBucket | null>(null);

    /**
     * Current search term for the play records table (creative ID, venue ID,
     * or device ID). Applied client-side, same rationale as activeBucketFilter.
     */
    searchTerm = signal('');

    /**
     * Play records filtered by the active bucket and/or search term, if any.
     *
     * @type {PlayRecordContent[]}
     */
    visiblePlayRecords = computed(() => {
        const bucket = this.activeBucketFilter();
        const search = this.searchTerm().trim().toLowerCase();
        let records = this.playRecordsData();

        if (bucket) {
            records = records.filter(
                (record) => bucketFromMinutes(record.popDurationMinutes) === bucket,
            );
        }

        if (search) {
            records = records.filter(
                (record) =>
                    record.creativeId?.toLowerCase().includes(search) ||
                    record.venueId?.toLowerCase().includes(search) ||
                    record.deviceId?.toLowerCase().includes(search),
            );
        }

        return records;
    });

    /**
     * Handles input on the search field.
     *
     * @param {Event} event - Input event
     * @returns {void}
     */
    onSearchInput(event: Event): void {
        this.searchTerm.set((event.target as HTMLInputElement).value);
    }

    /**
     * Column configuration for locations table.
     * @type {TableColumn[]}
     */
    locationsColumns: TableColumn[] = [
        {
            field: 'venueId',
            header: 'Venue ID',
            width: '150px',
            filter: true,
            filterType: 'text',
        },
        {
            field: 'name',
            header: 'Name',
            width: '250px',
            filter: true,
            filterType: 'text',
        },
        {
            field: 'address',
            header: 'Address',
            width: '200px',
            filter: true,
            filterType: 'text',
        },
        {
            field: 'city',
            header: 'City',
            width: '150px',
            filter: true,
            filterType: 'text',
        },
        {
            field: 'state',
            header: 'State',
            width: '100px',
            filter: true,
            filterType: 'text',
        },
        {
            field: 'category',
            header: 'Category',
            width: '150px',
            filter: true,
            filterType: 'text',
        },
        {
            field: 'playCount',
            header: 'Plays',
            width: '120px',
            filter: true,
            filterType: 'number',
        },
        {
            field: 'totalDuration',
            header: 'Duration',
            width: '150px',
            filter: true,
            filterType: 'number',
        },
        {
            field: 'latestPlay',
            header: 'Latest Play',
            width: '180px',
            filter: true,
            filterType: 'date',
        },
    ];

    /**
     * Locations data as a signal.
     */
    locationsData = signal<LocationData[]>([]);

    /**
     * Loading state for locations as a signal.
     */
    isLoadingLocations = signal(false);

    /**
     * Play records data as a signal.
     */
    playRecordsData = signal<PlayRecordContent[]>([]);

    /**
     * Play record selected for the proof-of-play preview modal.
     */
    selectedPlayRecord = signal<PlayRecordContent | null>(null);

    /**
     * Loading state for play records as a signal.
     */
    isLoadingPlayRecords = signal(false);

    /**
     * Angular lifecycle hook - called after component initialization.
     * Fetches content data based on route parameter.
     *
     * @returns {void}
     */
    /**
     * Picks a state in the States list (venues are then filtered to it) and picks that
     * state's first venue, since the previous venue may not be in it.
     *
     * @param stateId - Two-letter state code, or "Unknown"
     * @returns {void}
     */
    protected selectState(stateId: string): void {
        this.selectedStateId.set(stateId);
        this.clearVenueSelection();
        this.selectFirstVenue();
    }

    /**
     * Picks a venue in the Venues list and loads its playlist slots for this ad. Picking
     * the same venue again does nothing.
     *
     * @param venueId - The venue's ID
     * @returns {void}
     */
    protected selectVenue(venueId: string): void {
        if (venueId === this.selectedVenueId()) {
            return;
        }

        this.selectedVenueId.set(venueId);
        this.loadVenueSlots();
    }

    /**
     * Reloads the picked venue's slots (after a failed load).
     *
     * @returns {void}
     */
    protected reloadVenueSlots(): void {
        this.loadVenueSlots();
    }

    /**
     * Picks the first venue of the Venues list (the one with the most plays, within the
     * picked state if any), so a venue's slots are always showing - the same "top item
     * selected by default" as the Dashboard's breakdowns. Does nothing with no venues.
     *
     * @returns {void}
     */
    private selectFirstVenue(): void {
        const first = this.venueItems()[0];
        if (first) {
            this.selectVenue(first.id);
        }
    }

    /**
     * Clears the picked venue and its slots, cancelling any request still running.
     *
     * @returns {void}
     */
    private clearVenueSelection(): void {
        this.venueSlotsRequest?.unsubscribe();
        this.selectedVenueId.set(null);
        this.venueSlots.set([]);
        this.hasVenueSlotsError.set(false);
        this.isLoadingVenueSlots.set(false);
    }

    /**
     * Fetches this ad's plays at the picked venue grouped by playlist slot. A newer
     * request cancels an older one still running.
     *
     * @returns {void}
     */
    private loadVenueSlots(): void {
        const venueId = this.selectedVenueId();
        if (!this.contentId || !venueId) {
            return;
        }

        this.venueSlotsRequest?.unsubscribe();
        this.venueSlots.set([]);
        this.hasVenueSlotsError.set(false);
        this.isLoadingVenueSlots.set(true);

        this.venueSlotsRequest = this.mediaFilesService
            .getVenueSlots(this.contentId, venueId, this.dateParams())
            .subscribe({
                next: (slots) => {
                    this.venueSlots.set(slots);
                    this.isLoadingVenueSlots.set(false);
                },
                error: (error: unknown) => {
                    console.error('[AdAnalytics] Failed to load venue slots:', error);
                    this.hasVenueSlotsError.set(true);
                    this.isLoadingVenueSlots.set(false);
                },
            });
    }

    ngOnInit(): void {
        this.destroyRef.onDestroy(() => {
            this.venueSlotsRequest?.unsubscribe();
            this.locationsRequest?.unsubscribe();
            this.playRecordsRequest?.unsubscribe();
        });
        this.contentId = this.route.snapshot.paramMap.get('id') || '';
        this.loadContent();

        // The first value (and each range change after it) reloads the range's data; it is
        // a no-op until the ad itself has loaded, which then loads the range's data too
        this.sharedRange$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.loadRangeData());
    }

    /**
     * Loads everything that follows the picked range: the play records, the venue
     * breakdown and (through it) the picked venue's slots. Waits for the ad to load.
     *
     * @returns {void}
     */
    private loadRangeData(): void {
        if (!this.content()) {
            return;
        }

        this.loadPlayRecords();
        this.loadLocations();
    }

    /**
     * Loads content data by ID.
     *
     * @returns {void}
     */
    private loadContent(): void {
        if (!this.contentId) {
            this.router.navigate(['/dashboard']);
            return;
        }

        this.mediaFilesService.getById(this.contentId).subscribe({
            next: (content) => {
                this.content.set(content);
                this.isLoadingContent.set(false);
                this.loadRangeData();
            },
            error: (error) => {
                console.error('[AdAnalytics] Failed to load ad:', error);
                this.isLoadingContent.set(false);
                this.router.navigate(['/dashboard']);
            },
        });
    }

    /**
     * Loads locations data for the current ad.
     * Fetches venue data where this creative has been played - the breakdown card's source.
     *
     * @returns {void}
     */
    private loadLocations(): void {
        if (!this.contentId) {
            return;
        }

        this.isLoadingLocations.set(true);
        this.hasLocationsError.set(false);
        this.locationsRequest?.unsubscribe();
        this.locationsRequest = this.mediaFilesService
            .getLocations(this.contentId, this.dateParams())
            .subscribe({
                next: (locations) => {
                    this.locationsData.set(locations);
                    this.selectedStateId.set(null);
                    this.clearVenueSelection();
                    this.selectFirstVenue();
                    this.isLoadingLocations.set(false);
                },
                error: (error) => {
                    console.error('[AdAnalytics] Failed to load locations:', error);
                    this.hasLocationsError.set(true);
                    this.isLoadingLocations.set(false);
                },
            });
    }

    /**
     * Loads the latest play records of the current ad in the picked range, and the
     * range's total number of plays.
     *
     * @returns {void}
     */
    private loadPlayRecords(): void {
        if (!this.contentId) {
            return;
        }

        this.playRecordsRequest?.unsubscribe();
        this.playRecordsData.set([]);
        this.rangePlayTotal.set(null);
        this.isLoadingPlayRecords.set(true);
        this.playRecordsRequest = this.mediaFilesService
            .getPlayRecords(this.contentId, this.dateParams())
            .subscribe({
                next: ({ records, total }) => {
                    this.playRecordsData.set(records.map((record) => this.withPopDuration(record)));
                    this.rangePlayTotal.set(total);
                    this.isLoadingPlayRecords.set(false);
                    this.showLatestPlaysIfRangeIsEmpty(total);
                },
                error: (error: unknown) => {
                    console.error('[AdAnalytics] Failed to load play records:', error);
                    this.isLoadingPlayRecords.set(false);
                },
            });
    }

    /**
     * The first time the page loads with a range that has none of this ad's plays (the
     * default Yesterday, for an ad not played then), moves the shared range to the day the
     * ad last played, so the page opens on data instead of empty lists. Done once: after
     * that the range is the user's, and an empty one stays empty. The range is shared, so
     * the other pages follow it - a notice says what happened.
     *
     * @param total - Plays of this ad in the range that just loaded
     * @returns {void}
     */
    private showLatestPlaysIfRangeIsEmpty(total: number): void {
        if (this.hasTriedLatestFallback) {
            return;
        }
        this.hasTriedLatestFallback = true;

        const lastPlayed = this.content()?.lastPlayed;
        const range = this.rangeService.pageRange();
        if (total > 0 || !lastPlayed || !range) {
            return;
        }

        // The calendar day the last play falls on in the zone the page is viewing
        const day = new Intl.DateTimeFormat('en-CA', {
            timeZone: this.timeDisplayService.zoneId(),
        }).format(new Date(lastPlayed));
        const [year, month, date] = day.split('-').map(Number);
        const latest = new Date(year, month - 1, date);

        this.rangeService.applyPicked({ start: latest, end: latest });
        this.rangeService.notice.set(
            `No plays of this ad in ${formatCalendarRange(range)}, so this shows ${formatCalendarDate(day)}, the day it last played.`,
        );
    }

    /**
     * Computes how long it took for proof of play to be sent after the ad was
     * fetched, and attaches it to the record as popDurationMinutes. This endpoint
     * doesn't precompute it server-side (unlike Ranking Data's paginated listing),
     * so it's derived here from the record's own timestamps.
     *
     * @param {PlayRecordContent} record - Play record to compute duration for
     * @returns {PlayRecordContent} The record with popDurationMinutes attached
     */
    private withPopDuration(record: PlayRecordContent): PlayRecordContent {
        let minutes: number | null = null;

        if (record.proofOfPlaySent && record.fetchedAt) {
            const diffMs =
                new Date(record.proofOfPlaySent).getTime() - new Date(record.fetchedAt).getTime();

            if (Number.isFinite(diffMs) && diffMs >= 0) {
                minutes = diffMs / (1000 * 60);
            }
        }

        return { ...record, popDurationMinutes: minutes };
    }

    /**
     * Opens a play record in the proof-of-play preview modal.
     *
     * @param rowData - The row data from the play records table
     * @returns {void}
     */
    openPlayRecordPreview(rowData: Record<string, unknown>): void {
        const recordId = rowData['id'];
        if (typeof recordId !== 'string') {
            console.error('No play record ID found in rowData');
            return;
        }

        const record = this.playRecordsData().find(
            (item: PlayRecordContent): boolean => item.id === recordId,
        );
        if (!record) {
            console.error(`No play record found for ID ${recordId}`);
            return;
        }

        this.selectedPlayRecord.set(record);
    }

    /**
     * Closes the proof-of-play preview modal.
     *
     * @returns {void}
     */
    closePlayRecordPreview(): void {
        this.selectedPlayRecord.set(null);
    }

    /**
     * Navigates back to dashboard.
     *
     * @returns {void}
     */
    goBack(): void {
        this.router.navigate(['/dashboard']);
    }

    /**
     * Formats duration in seconds to human-readable format (Xh Ym Zs).
     *
     * @param {number} seconds - Total duration in seconds
     * @returns {string} Formatted duration string
     */
    formatDuration(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        const parts: string[] = [];

        if (hours > 0) {
            parts.push(`${hours}h`);
        }
        if (minutes > 0) {
            parts.push(`${minutes}m`);
        }
        if (secs > 0 || parts.length === 0) {
            parts.push(`${secs}s`);
        }

        return parts.join(' ');
    }

    /**
     * Formats a play record's proof-of-play duration for display.
     *
     * @param {Record<string, unknown>} rowData - Play record row
     * @returns {string} Formatted duration (e.g. "3m", "1h 5m"), or "--" if not computable
     */
    formatPopDuration(rowData: Record<string, unknown>): string {
        return formatPopDurationUtil(rowData['popDurationMinutes'] as number | null);
    }

    /**
     * Gets a play record row's proof-of-play duration bucket color as an
     * "r, g, b" string, for use with the --pop-row-color CSS variable.
     *
     * @param {Record<string, unknown>} rowData - Play record row
     * @returns {string | null} "r, g, b" string, or null if no bucket applies
     */
    popDurationRowColor(rowData: Record<string, unknown>): string | null {
        return popDurationRowColorUtil(rowData['popDurationMinutes'] as number | null);
    }

    /**
     * Toggles the active proof-of-play duration bucket filter.
     * Clicking the currently-active bucket clears the filter.
     *
     * @param {PopDurationBucket} bucket - Bucket to filter by
     * @returns {void}
     */
    toggleBucketFilter(bucket: PopDurationBucket): void {
        this.activeBucketFilter.set(this.activeBucketFilter() === bucket ? null : bucket);
    }
}
