/** Angular Imports */
import { DecimalPipe } from '@angular/common';
import {
    afterNextRender,
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    ElementRef,
    inject,
    signal,
    viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';

/** Third Party Imports */
import { Skeleton } from '@ntv360/component-pantry';
import { catchError, of, switchMap, tap } from 'rxjs';

/** Local Imports */
import { MediaFilesService } from '@core';
import type { CategoryRankingEntry, StateRankingEntry } from '@core/models';
import { CopyButtonComponent } from '@shared/components/copy-button/copy-button.component';
// Imported from its own file, not a barrel: it pulls in echarts (see shared/components/index.ts)
import { SlotGridComponent, SlotStatComponent } from '@features/ad-analytics/components';
import { DailyAdsBarChartComponent } from '@shared/components/daily-ads-bar-chart/daily-ads-bar-chart.component';
import { DailyLineChartComponent } from '@shared/components/daily-line-chart';
import { DialogComponent } from '@shared/components/dialog';
import { MetricComponent } from '@shared/components/metric';
import { PageHeaderComponent } from '@shared/components/page-header';
import { RangeControlsComponent } from '@shared/components/range-controls';
import { RangeNoticeComponent } from '@shared/components/range-notice';
import { SearchFieldComponent } from '@shared/components/search-field';
import { SectionErrorComponent } from '@shared/components/section-error';
import { ShareListComponent } from '@shared/components/share-list';
import { SortControlComponent } from '@shared/components/sort-control';
import { SummaryCardComponent } from '@shared/components/summary-card';
import type { AdVenueSlot } from '@shared/interfaces/ad-analytics';
import type {
    DashboardAds,
    DashboardAdShare,
    DashboardAdStateShare,
    DashboardAdWithStates,
    DashboardGeography,
    DashboardOverview,
    DashboardPopBucket,
    DashboardRange,
    DashboardSection,
    DashboardVenue,
} from '@shared/interfaces/dashboard';
import type { SelectOption, ShareItem } from '@shared/interfaces/ui';
import {
    DASHBOARD_AD_SORT_OPTIONS,
    DASHBOARD_BREAKDOWN_VIEW_OPTIONS,
    DASHBOARD_CATEGORY_SORT_OPTIONS,
    DASHBOARD_STATE_SORT_OPTIONS,
    DASHBOARD_TOP_LIMIT,
    DASHBOARD_VENUE_SORT_OPTIONS,
    type DashboardAdSort,
    type DashboardBreakdownView,
    type DashboardCategorySort,
    type DashboardJumpTarget,
    type DashboardStateSort,
    type DashboardUnknownKind,
    type DashboardVenueSort,
} from '@shared/models/dashboard';
import type { SortDirection } from '@shared/models/ui/sort-direction.type';
import {
    DashboardRangeService,
    DashboardSummaryService,
    DashboardTotalsService,
    DashboardViewStateService,
} from '@shared/services/dashboard';
import { TimeDisplayService } from '@shared/services/time-display';
import { loadDashboardSection } from '@shared/utils/load-dashboard-section.util';
import { POP_DURATION_LEGEND } from '@shared/utils/pop-duration.util';
import { truncateMiddle } from '@shared/utils/truncate-middle.util';
import { STATE_CODE_TO_NAME } from '@shared/utils/us-states.util';

/**
 * Dashboard: received playables for a date range - yesterday by default, the most
 * recent complete day - with the unique ads, states, categories and venues that received them,
 * each with its share of everything received, and the received timeline (per hour for
 * a single day, per day for a range).
 *
 * @remarks
 * Days are UTC calendar days, like every other range in the app. "Yesterday" is the
 * previous UTC day, so it is always complete (a local "yesterday" can still be in
 * progress in UTC+ time zones). The data comes from three independent requests fired in
 * parallel (overview, geography, ads), so each card renders as soon as its own request
 * returns instead of waiting for the slowest; all three read the same rows, so the
 * numbers agree. The range and the overview / geography totals are shared app-wide
 * (DashboardRangeService, DashboardTotalsService) with the totals in the top bar, which
 * hide while this page's stat tiles are on screen.
 */
@Component({
    selector: 'app-dashboard',
    imports: [
        DecimalPipe,
        Skeleton,
        CopyButtonComponent,
        DailyAdsBarChartComponent,
        DailyLineChartComponent,
        DialogComponent,
        MetricComponent,
        PageHeaderComponent,
        RangeControlsComponent,
        RangeNoticeComponent,
        SearchFieldComponent,
        SectionErrorComponent,
        ShareListComponent,
        SlotGridComponent,
        SlotStatComponent,
        SortControlComponent,
        SummaryCardComponent,
    ],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class DashboardComponent {
    /**
     * Loads the ads section (overview and geography come from DashboardTotalsService)
     * @type {DashboardSummaryService}
     */
    private readonly dashboardSummaryService = inject(DashboardSummaryService);

    /**
     * The shared date range (also used by the totals in the top bar)
     * @type {DashboardRangeService}
     */
    private readonly rangeService = inject(DashboardRangeService);

    /**
     * Media files API, for the Venue breakdown's playlist slots
     * @type {MediaFilesService}
     */
    private readonly mediaFilesService = inject(MediaFilesService);

    /**
     * Global "Eastern Time / UTC" display preference - read here only for
     * the page subtitle's "Days are …" line, which should say whichever
     * zone the days (and the stats computed from them) actually are.
     * @type {TimeDisplayService}
     */
    protected readonly timeDisplayService = inject(TimeDisplayService);

    /**
     * The page header's subtitle, naming whichever zone is currently active
     * - the underlying day boundaries (and so the stats) actually shift with
     * this, not just the label (see TimeDisplayService/resolveDateZone).
     * @type {Signal<string>}
     */
    protected readonly subtitle = computed(
        () =>
            `What was received, and how it splits across ads, states, categories and venues. Days are ${
                this.timeDisplayService.mode() === 'eastern' ? 'Eastern Time' : 'UTC'
            }.`,
    );

    /**
     * The totals for this page's range
     * @type {DashboardTotalsService}
     */
    private readonly totals = inject(DashboardTotalsService);

    /**
     * Tells the top bar's totals whether this page is open and its tiles are on screen,
     * and passes their jump requests
     * @type {DashboardViewStateService}
     */
    private readonly viewState = inject(DashboardViewStateService);

    /**
     * The row of stat tiles - watched so the top bar's copy of the totals hides while
     * they're on screen
     * @type {Signal<ElementRef<HTMLElement> | undefined>}
     */
    private readonly metricsRow = viewChild<ElementRef<HTMLElement>>('metricsRow');

    /**
     * Selected range (UTC calendar dates), shared with the top bar
     * @type {Signal<DashboardRange>}
     */
    protected readonly range = this.rangeService.range;

    /**
     * Headline totals, proof-of-play buckets and the received timeline (the fast call)
     * @type {DashboardSection<DashboardOverview>}
     */
    protected readonly overview = this.totals.overview;

    /**
     * The unique-ads chart's points: the distinct ads received per hour (one day) or per
     * day (a range) - the same buckets as the timeline beside it
     * @type {Signal<{ date: string; value: number }[]>}
     */
    protected readonly uniqueAdsSeries = computed(() =>
        (this.overview.data()?.timeline ?? []).map((bucket) => ({
            date: bucket.date,
            value: bucket.uniqueAds,
        })),
    );

    /**
     * Unique ads of all time - the media files, one per creative (creative ID + source) -
     * the right-hand figure of "range / all time" on the unique-ads card; null until it
     * loads (or if it fails: the card then shows a dash)
     * @type {WritableSignal<number | null>}
     */
    protected readonly allTimeUniqueAds = signal<number | null>(null);

    /**
     * Unique-ads card title, matching the timeline's buckets (and zone)
     * @type {Signal<string>}
     */
    protected readonly uniqueAdsTitle = computed(() => {
        if ((this.overview.data()?.granularity ?? 'hour') !== 'hour') {
            return 'Unique ads per day';
        }
        const zoneLabel = this.timeDisplayService.mode() === 'eastern' ? 'Eastern Time' : 'UTC';
        return `Unique ads per hour (${zoneLabel})`;
    });

    /**
     * Venues, states and categories that received playables (needs the Hosts API)
     * @type {DashboardSection<DashboardGeography>}
     */
    protected readonly geography = this.totals.geography;

    /**
     * Every distinct ad received, with its venues (needs the media files) - only the
     * Dashboard needs it, so it loads here
     * @type {DashboardSection<DashboardAds>}
     */
    protected readonly adsSection = loadDashboardSection('ads', this.range, (range) =>
        this.dashboardSummaryService.getAds(range),
    );

    /**
     * Choices for the breakdown switcher above the Categories/States/Ads cards
     * @type {readonly SelectOption<DashboardBreakdownView>[]}
     */
    protected readonly breakdownViewOptions = DASHBOARD_BREAKDOWN_VIEW_OPTIONS;

    /**
     * Which breakdown card is currently shown - only one renders at a time (switched by
     * breakdownViewOptions above), so the user doesn't have to scroll past the other two
     * to reach the one they want. jumpTo() also sets this when a stat tile targets one of
     * these three cards.
     * @type {WritableSignal<DashboardBreakdownView>}
     */
    protected readonly activeBreakdown = signal<DashboardBreakdownView>('states');

    /**
     * Sort choices for the Ads list
     * @type {readonly SelectOption<DashboardAdSort>[]}
     */
    protected readonly adSortOptions = DASHBOARD_AD_SORT_OPTIONS;

    /**
     * Order of the Ads list
     * @type {WritableSignal<DashboardAdSort>}
     */
    protected readonly adSort = signal<DashboardAdSort>('received');

    /**
     * Direction of the Ads list's sort (click the active option to reverse)
     * @type {WritableSignal<SortDirection>}
     */
    protected readonly adSortDirection = signal<SortDirection>('desc');

    /**
     * Text typed in each breakdown's search box (a view's own: switching views keeps
     * what was typed in each)
     * @type {WritableSignal<string>}
     */
    protected readonly categorySearch = signal('');
    protected readonly stateSearch = signal('');
    protected readonly adSearch = signal('');
    protected readonly venueSearch = signal('');

    /**
     * Whether a search text matches any of the given fields (case-insensitive,
     * substring; an empty search matches everything).
     *
     * @param query - The typed text
     * @param fields - What it is looked for in
     * @returns {boolean} True if it matches
     */
    private matchesSearch(query: string, ...fields: (string | null | undefined)[]): boolean {
        const needle = query.trim().toLowerCase();
        return !needle || fields.some((field) => !!field && field.toLowerCase().includes(needle));
    }

    /**
     * Ads in the chosen order and direction: by received, states or venues (ties by
     * received, in the same direction)
     * @type {Signal<DashboardAdWithStates[]>}
     */
    protected readonly sortedAds = computed((): DashboardAdWithStates[] => {
        const ads = this.adsWithStates();
        const sort = this.adSort();
        const sign = this.adSortDirection() === 'desc' ? 1 : -1;

        const key = (ad: DashboardAdWithStates): number =>
            sort === 'received'
                ? ad.received
                : sort === 'states'
                  ? this.stateCount(ad)
                  : ad.venueCount;
        const query = this.adSearch();
        return ads
            .filter((ad) => this.matchesSearch(query, ad.title, ad.creativeId))
            .sort(
                (left, right) => sign * (key(right) - key(left) || right.received - left.received),
            );
    });

    /**
     * ID of the ad picked in the Ads list to see its states, or null for the top ad
     * @type {WritableSignal<string | null>}
     */
    protected readonly selectedAdId = signal<string | null>(null);

    /**
     * Rows the switchable Categories/States/Ads breakdown shows before "Show all"
     * @type {number}
     */
    protected readonly topLimit = DASHBOARD_TOP_LIMIT;

    /**
     * Overview metric tiles before the geography ones (Received, Unique venues) shown as
     * skeletons during the first load (Unique ads, after them, has its own)
     * @type {number[]}
     */
    protected readonly overviewPlaceholders = [0, 1];

    /**
     * Geography metric tiles (Unique states, Unique categories) shown as skeletons until
     * the geography call lands
     * @type {number[]}
     */
    protected readonly geographyPlaceholders = [0, 1];

    /**
     * Proof-of-play duration buckets for the Received tile: green / yellow / red (same
     * numbers and ranges as Ranking Data's mini stats)
     * @type {Signal<DashboardPopBucket[]>}
     */
    protected readonly popBuckets = computed((): DashboardPopBucket[] => {
        const pop = this.overview.data()?.pop;
        if (!pop) {
            return [];
        }

        const counts = { green: pop.green, yellow: pop.yellow, red: pop.red };
        return POP_DURATION_LEGEND.filter((entry) => entry.bucket !== 'gray').map((entry) => ({
            bucket: entry.bucket,
            label: entry.range,
            value: counts[entry.bucket as keyof typeof counts],
        }));
    });

    /**
     * Timeline card title, matching the summary's buckets - names whichever zone the
     * hour buckets actually fall in (see TimeDisplayService/resolveDateZone), not
     * always "UTC".
     * @type {Signal<string>}
     */
    protected readonly timelineTitle = computed(() => {
        if ((this.overview.data()?.granularity ?? 'hour') !== 'hour') {
            return 'Received per day';
        }
        const zoneLabel = this.timeDisplayService.mode() === 'eastern' ? 'Eastern Time' : 'UTC';
        return `Received per hour (${zoneLabel})`;
    });

    /**
     * Every venue that received playables, by ID - the lookup behind "which state is this
     * venue in", built once per geography load
     * @type {Signal<Map<string, DashboardVenue>>}
     */
    protected readonly venuesById = computed(
        () => new Map((this.geography.data()?.venues ?? []).map((venue) => [venue.venueId, venue])),
    );

    /**
     * The ads with where each was received by state, derived from the ad's venues and the
     * geography call's venue -> state map (the ads call doesn't wait for the Hosts API).
     * Venues the Hosts API has no state for count as "Unknown" and rows with no venue as
     * "No venue", so an ad's states add up to its received. Empty `states` until the
     * geography call lands.
     * @type {Signal<DashboardAdWithStates[]>}
     */
    protected readonly adsWithStates = computed((): DashboardAdWithStates[] => {
        const ads = this.adsSection.data()?.ads ?? [];
        const hasGeography = this.geography.data() !== null;
        const venuesById = this.venuesById();

        return ads.map((ad): DashboardAdWithStates => {
            if (!hasGeography) {
                return { ...ad, states: [] };
            }

            const byState = new Map<string, number>();
            for (const slice of ad.venues) {
                const state = venuesById.get(slice.venueId)?.state ?? 'Unknown';
                byState.set(state, (byState.get(state) ?? 0) + slice.received);
            }
            if (ad.withoutVenue > 0) {
                byState.set('No venue', ad.withoutVenue);
            }

            return {
                ...ad,
                states: [...byState.entries()]
                    .map(([state, received]) => ({ state, received }))
                    .sort((left, right) => right.received - left.received),
            };
        });
    });

    /**
     * Ads breakdown rows: title, source and venue reach, thumbnail, link to Ad Analytics
     * @type {Signal<ShareItem[]>}
     */
    protected readonly adItems = computed((): ShareItem[] =>
        this.sortedAds().map((ad) => ({
            id: this.adId(ad),
            name: this.shortTitle(ad.title),
            fullName: ad.title,
            caption: `${ad.source} · ${this.pluralVenues(ad.venueCount)} · ${this.pluralStates(this.stateCount(ad))}`,
            value: ad.received,
            imageUrl: ad.mediaUrl,
            isVideo: ad.creativeType === 'video',
            route: ad.contentId ? `/ad/${ad.contentId}` : null,
        })),
    );

    /**
     * Code of the state picked in the States list to see its ads, or null for the top state
     * @type {WritableSignal<string | null>}
     */
    protected readonly selectedStateId = signal<string | null>(null);

    /**
     * The ad whose states are shown: the picked one, or the top ad when none is picked
     * (or the picked one isn't in the current range)
     * @type {Signal<DashboardAdWithStates | null>}
     */
    protected readonly selectedAd = computed((): DashboardAdWithStates | null => {
        const ads = this.sortedAds();
        const id = this.selectedAdId();
        return ads.find((ad) => this.adId(ad) === id) ?? ads[0] ?? null;
    });

    /**
     * State picked in the selected ad's "States for" list to see its venues, or null
     * for the ad's top state
     * @type {WritableSignal<string | null>}
     */
    protected readonly selectedAdStateId = signal<string | null>(null);

    /**
     * The selected ad's state whose venues are shown: the picked one, or the ad's top
     * state (also when the picked state isn't one of this ad's)
     * @type {Signal<DashboardAdStateShare | null>}
     */
    protected readonly selectedAdState = computed((): DashboardAdStateShare | null => {
        const states = this.selectedAd()?.states ?? [];
        const code = this.selectedAdStateId();
        return states.find((slice) => slice.state === code) ?? states[0] ?? null;
    });

    /**
     * Venues that received the selected ad in the selected state (by fetched_at, played
     * or not), most received first - each shown as a share of the ad's total received
     * @type {Signal<ShareItem[]>}
     */
    protected readonly adStateVenueItems = computed((): ShareItem[] => {
        const ad = this.selectedAd();
        const code = this.selectedAdState()?.state;
        return ad && code ? this.adVenueItemsInState(ad, code) : [];
    });

    /**
     * Row ID of the ad whose states are shown, for highlighting it in the Ads list
     * (always the same ad as `selectedAd`)
     * @type {Signal<string | null>}
     */
    protected readonly selectedAdRowId = computed((): string | null => {
        const ad = this.selectedAd();
        return ad ? this.adId(ad) : null;
    });

    /**
     * The selected ad's states, each with its share of that ad's received and how many
     * of the ad's venues are in that state
     * @type {Signal<ShareItem[]>}
     */
    protected readonly adStateItems = computed((): ShareItem[] => {
        const ad = this.selectedAd();
        if (!ad) {
            return [];
        }

        // How many of this ad's venues are in each state, for the caption (same layout
        // as the States card's rows: name, then "N venues")
        const venuesById = this.venuesById();
        const venuesByState = new Map<string, number>();
        for (const slice of ad.venues) {
            const state = venuesById.get(slice.venueId)?.state ?? 'Unknown';
            venuesByState.set(state, (venuesByState.get(state) ?? 0) + 1);
        }

        return ad.states.map((slice) => {
            const venueCount = venuesByState.get(slice.state) ?? 0;
            return {
                id: slice.state,
                name: this.stateName(slice.state),
                caption:
                    slice.state === 'No venue'
                        ? 'Received with no venue'
                        : `${venueCount} ${venueCount === 1 ? 'venue' : 'venues'}`,
                value: slice.received,
            };
        });
    });

    /**
     * The "Unknown" state bucket (received at venues the Hosts API has no state for), or
     * null. It stays in the States list (users should see it), and the Unique states
     * tile shows it as "36 / 1 unknown" so the tile and the list's count agree
     * @type {Signal<StateRankingEntry | null>}
     */
    protected readonly unknownState = computed(
        (): StateRankingEntry | null =>
            (this.geography.data()?.states ?? []).find((state) => state.state === 'Unknown') ??
            null,
    );

    /**
     * The "Unknown" category bucket (received at venues with no known category), or null
     * - shown in the Categories list and on the tile, like `unknownState`
     * @type {Signal<CategoryRankingEntry | null>}
     */
    protected readonly unknownCategory = computed(
        (): CategoryRankingEntry | null =>
            (this.geography.data()?.categories ?? []).find(
                (category) => category.category === 'Unknown',
            ) ?? null,
    );

    /**
     * Which unknown bucket's venues the dialog lists, or null when it's closed
     * @type {WritableSignal<DashboardUnknownKind | null>}
     */
    protected readonly unknownDialog = signal<DashboardUnknownKind | null>(null);

    /**
     * True for a moment after "Copy venue IDs", to confirm the copy
     * @type {WritableSignal<boolean>}
     */
    protected readonly unknownIdsCopied = signal(false);

    /**
     * Venues in the open unknown bucket (no state, or no category, in the Hosts API),
     * most received first - for the tech team to fix
     * @type {Signal<DashboardVenue[]>}
     */
    protected readonly unknownVenues = computed((): DashboardVenue[] => {
        const kind = this.unknownDialog();
        if (!kind) {
            return [];
        }
        return (this.geography.data()?.venues ?? []).filter((venue) =>
            kind === 'state' ? !venue.state : !venue.category,
        );
    });

    /**
     * Sort choices for the States list
     * @type {readonly SelectOption<DashboardStateSort>[]}
     */
    protected readonly stateSortOptions = DASHBOARD_STATE_SORT_OPTIONS;

    /**
     * Order of the States list
     * @type {WritableSignal<DashboardStateSort>}
     */
    protected readonly stateSort = signal<DashboardStateSort>('received');

    /**
     * Direction of the States list's sort (click the active option to reverse)
     * @type {WritableSignal<SortDirection>}
     */
    protected readonly stateSortDirection = signal<SortDirection>('desc');

    /**
     * States in the chosen order and direction: by received, unique ads or venues (ties
     * by received, in the same direction)
     * @type {Signal<StateRankingEntry[]>}
     */
    protected readonly sortedStates = computed((): StateRankingEntry[] => {
        const states = this.geography.data()?.states ?? [];
        const sort = this.stateSort();
        const sign = this.stateSortDirection() === 'desc' ? 1 : -1;

        const key = (state: StateRankingEntry): number =>
            sort === 'received'
                ? state.totalAds
                : sort === 'ads'
                  ? state.uniqueAdsPlayed
                  : state.venueCount;
        const query = this.stateSearch();
        return states
            .filter((state) => this.matchesSearch(query, state.state, this.stateName(state.state)))
            .sort(
                (left, right) => sign * (key(right) - key(left) || right.totalAds - left.totalAds),
            );
    });

    /**
     * The state whose ads are shown: the picked one, or the top state when none is
     * picked (or the picked one isn't in the current range)
     * @type {Signal<StateRankingEntry | null>}
     */
    protected readonly selectedState = computed((): StateRankingEntry | null => {
        const states = this.sortedStates();
        const code = this.selectedStateId();
        return states.find((state) => state.state === code) ?? states[0] ?? null;
    });

    /**
     * The selected state's ads, each with its share of that state's received - regrouped
     * from every ad's per-state counts, so no extra request
     * @type {Signal<ShareItem[]>}
     */
    protected readonly stateAdItems = computed((): ShareItem[] => {
        const code = this.selectedState()?.state;
        if (!code) {
            return [];
        }

        return this.adsWithStates()
            .map((ad) => ({
                ad,
                received: ad.states.find((slice) => slice.state === code)?.received ?? 0,
            }))
            .filter(({ received }) => received > 0)
            .sort((left, right) => right.received - left.received)
            .map(({ ad, received }) => ({
                id: this.adId(ad),
                name: this.shortTitle(ad.title),
                fullName: ad.title,
                caption: `${ad.source} · ${this.pluralVenues(this.adVenueItemsInState(ad, code).length)} · ${this.pluralStates(this.stateCount(ad))}`,
                value: received,
                imageUrl: ad.mediaUrl,
                isVideo: ad.creativeType === 'video',
                route: ad.contentId ? `/ad/${ad.contentId}` : null,
            }));
    });

    /**
     * Ad picked in the selected state's "Ads in" list to see its venues there, or null
     * for that state's top ad
     * @type {WritableSignal<string | null>}
     */
    protected readonly selectedStateAdId = signal<string | null>(null);

    /**
     * The selected state's ad whose venues are shown: the picked one, or the state's
     * top ad (also when the picked ad wasn't received in this state)
     * @type {Signal<DashboardAdWithStates | null>}
     */
    protected readonly selectedStateAd = computed((): DashboardAdWithStates | null => {
        const rows = this.stateAdItems();
        const id = rows.find((row) => row.id === this.selectedStateAdId())?.id ?? rows[0]?.id;
        return this.adsWithStates().find((ad) => this.adId(ad) === id) ?? null;
    });

    /**
     * Row ID of the selected state's selected ad, for highlighting it in the list
     * @type {Signal<string | null>}
     */
    protected readonly selectedStateAdRowId = computed((): string | null => {
        const ad = this.selectedStateAd();
        return ad ? this.adId(ad) : null;
    });

    /**
     * Venues in the selected state that received the selected ad, each shown as a share
     * of the ad's total received
     * @type {Signal<ShareItem[]>}
     */
    protected readonly stateAdVenueItems = computed((): ShareItem[] => {
        const ad = this.selectedStateAd();
        const code = this.selectedState()?.state;
        return ad && code ? this.adVenueItemsInState(ad, code) : [];
    });

    /**
     * States breakdown rows: full state name, venue count and unique ads
     * @type {Signal<ShareItem[]>}
     */
    protected readonly stateItems = computed((): ShareItem[] =>
        this.sortedStates().map((state) => ({
            id: state.state,
            name: this.stateName(state.state),
            caption: `${state.venueCount} ${state.venueCount === 1 ? 'venue' : 'venues'} · ${state.uniqueAdsPlayed} unique ads`,
            value: state.totalAds,
        })),
    );

    /**
     * Sort choices for the Categories breakdown
     * @type {readonly SelectOption<DashboardCategorySort>[]}
     */
    protected readonly categorySortOptions = DASHBOARD_CATEGORY_SORT_OPTIONS;

    /**
     * Order of the Categories breakdown
     * @type {WritableSignal<DashboardCategorySort>}
     */
    protected readonly categorySort = signal<DashboardCategorySort>('received');

    /**
     * Direction of the Categories breakdown's sort (click the active option to reverse)
     * @type {WritableSignal<SortDirection>}
     */
    protected readonly categorySortDirection = signal<SortDirection>('desc');

    /**
     * How many known states each category's venues are in (venues with no state in the
     * Hosts API aren't a state, same as the Unique states tile) - for the Categories
     * card's captions and its States sort
     * @type {Signal<Map<string, number>>}
     */
    private readonly categoryStateCounts = computed((): Map<string, number> => {
        const statesByCategory = new Map<string, Set<string>>();
        for (const venue of this.geography.data()?.venues ?? []) {
            if (!venue.state) {
                continue;
            }
            const category = venue.category ?? 'Unknown';
            const states = statesByCategory.get(category) ?? new Set<string>();
            states.add(venue.state);
            statesByCategory.set(category, states);
        }
        return new Map([...statesByCategory].map(([category, states]) => [category, states.size]));
    });

    /**
     * Categories in the chosen order and direction: by received, unique ads, venues or
     * states (ties by received, in the same direction)
     * @type {Signal<CategoryRankingEntry[]>}
     */
    protected readonly sortedCategories = computed((): CategoryRankingEntry[] => {
        const categories = this.geography.data()?.categories ?? [];
        const sort = this.categorySort();
        const sign = this.categorySortDirection() === 'desc' ? 1 : -1;

        const stateCounts = this.categoryStateCounts();
        const key = (category: CategoryRankingEntry): number => {
            switch (sort) {
                case 'received':
                    return category.totalAds;
                case 'ads':
                    return category.uniqueAdsPlayed;
                case 'venues':
                    return category.venueCount;
                case 'states':
                    return stateCounts.get(category.category) ?? 0;
            }
        };
        const query = this.categorySearch();
        return categories
            .filter((category) => this.matchesSearch(query, category.category))
            .sort(
                (left, right) => sign * (key(right) - key(left) || right.totalAds - left.totalAds),
            );
    });

    /**
     * Categories breakdown rows (sorted): name, then venue count, unique ads and how many
     * states its venues are in
     * @type {Signal<ShareItem[]>}
     */
    protected readonly categoryBreakdownItems = computed((): ShareItem[] => {
        const stateCounts = this.categoryStateCounts();
        return this.sortedCategories().map((category) => ({
            id: category.category,
            name: this.categoryName(category.category),
            caption: `${this.pluralVenues(category.venueCount)} · ${category.uniqueAdsPlayed} unique ads · ${this.pluralStates(stateCounts.get(category.category) ?? 0)}`,
            value: category.totalAds,
        }));
    });

    /**
     * Category picked in the Categories breakdown to see its states, or null for the top
     * category
     * @type {WritableSignal<string | null>}
     */
    protected readonly selectedCategoryId = signal<string | null>(null);

    /**
     * The category whose states are shown: the picked one, or the top category when none
     * is picked (or the picked one isn't in the current range)
     * @type {Signal<CategoryRankingEntry | null>}
     */
    protected readonly selectedCategory = computed((): CategoryRankingEntry | null => {
        const categories = this.sortedCategories();
        const id = this.selectedCategoryId();
        return categories.find((category) => category.category === id) ?? categories[0] ?? null;
    });

    /**
     * The selected category's venues (venues with no known category count as "Unknown",
     * as in the category list)
     * @type {Signal<DashboardVenue[]>}
     */
    private readonly selectedCategoryVenues = computed((): DashboardVenue[] => {
        const category = this.selectedCategory()?.category;
        if (!category) {
            return [];
        }
        return (this.geography.data()?.venues ?? []).filter(
            (venue) => (venue.category ?? 'Unknown') === category,
        );
    });

    /**
     * The selected category's states, each with its share of the category's received and
     * how many of the category's venues are there, most received first
     * @type {Signal<ShareItem[]>}
     */
    protected readonly categoryStateItems = computed((): ShareItem[] => {
        const byState = new Map<string, { received: number; venues: number }>();
        for (const venue of this.selectedCategoryVenues()) {
            const state = venue.state ?? 'Unknown';
            const entry = byState.get(state) ?? { received: 0, venues: 0 };
            entry.received += venue.totalAds;
            entry.venues += 1;
            byState.set(state, entry);
        }

        return [...byState.entries()]
            .map(([state, { received, venues }]) => ({
                id: state,
                name: this.stateName(state),
                caption: this.pluralVenues(venues),
                value: received,
            }))
            .sort((left, right) => right.value - left.value);
    });

    /**
     * State picked in the selected category's states to see its venues, or null for the
     * category's top state
     * @type {WritableSignal<string | null>}
     */
    protected readonly selectedCategoryStateId = signal<string | null>(null);

    /**
     * The selected category's state whose venues are shown: the picked one, or the
     * category's top state (also when the picked state isn't one of this category's)
     * @type {Signal<ShareItem | null>}
     */
    protected readonly selectedCategoryState = computed((): ShareItem | null => {
        const states = this.categoryStateItems();
        const id = this.selectedCategoryStateId();
        return states.find((state) => state.id === id) ?? states[0] ?? null;
    });

    /**
     * Venues of the selected category in the selected state, most received first, each
     * shown as a share of that state's received for the category
     * @type {Signal<ShareItem[]>}
     */
    protected readonly categoryStateVenueItems = computed((): ShareItem[] => {
        const state = this.selectedCategoryState()?.id;
        if (!state) {
            return [];
        }

        return this.selectedCategoryVenues()
            .filter((venue) => (venue.state ?? 'Unknown') === state)
            .sort((left, right) => right.totalAds - left.totalAds)
            .map((venue) => ({
                id: venue.venueId,
                name: venue.hostName ?? venue.venueId,
                caption: [venue.venueId, venue.city].filter(Boolean).join(' · '),
                value: venue.totalAds,
                route: `/venue/${venue.venueId}`,
            }));
    });

    /**
     * Venue picked in the Categories card's venues to see its ads, or null for the top
     * venue there
     * @type {WritableSignal<string | null>}
     */
    protected readonly selectedCategoryVenueId = signal<string | null>(null);

    /**
     * The Categories card's venue whose ads are shown: the picked one, or the top venue in
     * the selected category and state (also when the picked one isn't among them)
     * @type {Signal<ShareItem | null>}
     */
    protected readonly selectedCategoryVenue = computed((): ShareItem | null => {
        const venues = this.categoryStateVenueItems();
        const id = this.selectedCategoryVenueId();
        return venues.find((venue) => venue.id === id) ?? venues[0] ?? null;
    });

    /**
     * Ads received at the Categories card's selected venue, each as a share of what that
     * venue received
     * @type {Signal<ShareItem[]>}
     */
    protected readonly categoryVenueAdItems = computed((): ShareItem[] =>
        this.adItemsForVenue(this.selectedCategoryVenue()?.id),
    );

    /**
     * Sort choices for the Venue breakdown
     * @type {readonly SelectOption<DashboardVenueSort>[]}
     */
    protected readonly venueSortOptions = DASHBOARD_VENUE_SORT_OPTIONS;

    /**
     * Order of the Venue breakdown's venues
     * @type {WritableSignal<DashboardVenueSort>}
     */
    protected readonly venueSort = signal<DashboardVenueSort>('received');

    /**
     * Direction of the Venue breakdown's sort (click the active option to reverse)
     * @type {WritableSignal<SortDirection>}
     */
    protected readonly venueSortDirection = signal<SortDirection>('desc');

    /**
     * How many distinct ads each venue received in the range (from the ads call; empty
     * until it loads)
     * @type {Signal<Map<string, number>>}
     */
    private readonly adCountByVenue = computed((): Map<string, number> => {
        const counts = new Map<string, number>();
        for (const ad of this.adsSection.data()?.ads ?? []) {
            for (const slice of ad.venues) {
                counts.set(slice.venueId, (counts.get(slice.venueId) ?? 0) + 1);
            }
        }
        return counts;
    });

    /**
     * Venues in the chosen order and direction: by received, unique ads or configured
     * slots (ties by received, in the same direction; venues with no slot count last)
     * @type {Signal<DashboardVenue[]>}
     */
    protected readonly sortedVenues = computed((): DashboardVenue[] => {
        const venues = this.geography.data()?.venues ?? [];
        const sort = this.venueSort();
        const sign = this.venueSortDirection() === 'desc' ? 1 : -1;
        const adCounts = this.adCountByVenue();

        const key = (venue: DashboardVenue): number =>
            sort === 'received'
                ? venue.totalAds
                : sort === 'ads'
                  ? (adCounts.get(venue.venueId) ?? 0)
                  : (venue.slotCount ?? -1);
        const query = this.venueSearch();
        return venues
            .filter((venue) => this.matchesSearch(query, venue.venueId, venue.hostName))
            .sort(
                (left, right) => sign * (key(right) - key(left) || right.totalAds - left.totalAds),
            );
    });

    /**
     * The Venue breakdown's first column: venue name, ID and city / state, with "all / uniq /
     * slot" as the figure (received, unique ads, configured slots) - in the chosen order
     * @type {Signal<ShareItem[]>}
     */
    protected readonly slotVenueItems = computed((): ShareItem[] => {
        const adCounts = this.adCountByVenue();

        return this.sortedVenues().map((venue) => {
            // Unique ads come from the ads call, so they show once it has loaded
            const uniqueAds = adCounts.get(venue.venueId);
            return {
                id: venue.venueId,
                name: venue.hostName ?? venue.venueId,
                caption: [venue.venueId, [venue.city, venue.state].filter(Boolean).join(', ')]
                    .filter(Boolean)
                    .join(' · '),
                value: venue.totalAds,
                // "496 all / 11 uniq / 12 slot": every figure the sorter orders by, always
                figure: [
                    `${venue.totalAds.toLocaleString('en-US')} all`,
                    uniqueAds ? `${uniqueAds.toLocaleString('en-US')} uniq` : '',
                    venue.slotCount !== null
                        ? `${venue.slotCount.toLocaleString('en-US')} slot`
                        : '',
                ]
                    .filter(Boolean)
                    .join(' / '),
                route: `/venue/${venue.venueId}`,
            };
        });
    });

    /**
     * Venue picked in the Venue breakdown (first column), or null for the top venue
     * @type {WritableSignal<string | null>}
     */
    protected readonly slotVenueId = signal<string | null>(null);

    /**
     * The Venue breakdown's venue: the picked one, or the top venue (also when the picked
     * one wasn't received in this range)
     * @type {Signal<DashboardVenue | null>}
     */
    protected readonly slotVenue = computed((): DashboardVenue | null => {
        const venues = this.sortedVenues();
        const id = this.slotVenueId();
        return venues.find((venue) => venue.venueId === id) ?? venues[0] ?? null;
    });

    /**
     * Ad picked in the Venue breakdown's "Ads in" column, or null for the venue's top ad
     * @type {WritableSignal<string | null>}
     */
    protected readonly slotAdId = signal<string | null>(null);

    /**
     * The Venue breakdown venue's ads, most received first, as shares of what it received
     * @type {Signal<ShareItem[]>}
     */
    protected readonly slotVenueAdItems = computed((): ShareItem[] =>
        this.adItemsForVenue(this.slotVenue()?.venueId),
    );

    /**
     * The Venue breakdown's ad whose slots are shown: the picked one, or the venue's top ad
     * @type {Signal<DashboardAdShare | null>}
     */
    protected readonly slotAd = computed((): DashboardAdShare | null => {
        const rows = this.slotVenueAdItems();
        const id = rows.find((row) => row.id === this.slotAdId())?.id ?? rows[0]?.id;
        return (this.adsSection.data()?.ads ?? []).find((ad) => this.adId(ad) === id) ?? null;
    });

    /**
     * Row ID of the Venue breakdown's selected ad, for highlighting it in the list
     * @type {Signal<string | null>}
     */
    protected readonly slotAdRowId = computed((): string | null => {
        const ad = this.slotAd();
        return ad ? this.adId(ad) : null;
    });

    /**
     * The selected ad's plays at the selected venue grouped by playlist slot, ascending by
     * slot position
     * @type {WritableSignal<AdVenueSlot[]>}
     */
    protected readonly venueSlots = signal<AdVenueSlot[]>([]);

    /**
     * True while the selected ad's slots at the selected venue load
     * @type {WritableSignal<boolean>}
     */
    protected readonly isLoadingSlots = signal(false);

    /**
     * True when loading the slots failed
     * @type {WritableSignal<boolean>}
     */
    protected readonly hasSlotsError = signal(false);

    /**
     * Bumped by Retry, to load the slots again
     * @type {WritableSignal<number>}
     */
    private readonly slotsReloads = signal(0);

    /**
     * What the slots request needs, or null while there is nothing to load (another
     * breakdown is showing, or the ad has no media file to look its plays up by). The
     * range, the Eastern/UTC mode and Retry are part of it, so any of them reloads.
     * @type {Signal<object | null>}
     */
    private readonly slotsRequest = computed(() => {
        const ad = this.slotAd();
        const venue = this.slotVenue();
        if (this.activeBreakdown() !== 'venues' || !ad?.contentId || !venue) {
            return null;
        }

        const { start, end } = this.range();
        return {
            contentId: ad.contentId,
            venueId: venue.venueId,
            startDate: start,
            endDate: end,
            mode: this.timeDisplayService.mode(),
            reloads: this.slotsReloads(),
        };
    });

    /**
     * Loads the slots again (Retry).
     *
     * @returns {void}
     */
    protected reloadSlots(): void {
        this.slotsReloads.update((count) => count + 1);
    }

    /**
     * Tells the top bar while the stat tiles are on screen (its copy of the totals hides
     * then and appears once they scroll away) and while this page is open (its numbers
     * then jump to the breakdowns here).
     */
    constructor() {
        const destroyRef = inject(DestroyRef);
        // The Dashboard shows dated ranges only: coming from "All time" on another page,
        // go back to the dated range kept underneath
        this.rangeService.leaveAllTime();
        this.viewState.tilesInView.set(true);
        this.viewState.dashboardActive.set(true);
        destroyRef.onDestroy(() => {
            this.viewState.tilesInView.set(false);
            this.viewState.dashboardActive.set(false);
        });

        // All-time unique ads: not range-dependent, so loaded once
        this.mediaFilesService
            .getTypeCounts()
            .pipe(
                catchError((error: unknown) => {
                    console.error('[Dashboard] Failed to load the all-time ad count:', error);
                    return of(null);
                }),
                takeUntilDestroyed(destroyRef),
            )
            .subscribe((counts) => this.allTimeUniqueAds.set(counts?.all ?? null));

        // The Venue breakdown's slots: a newer request cancels an older one still running
        toObservable(this.slotsRequest)
            .pipe(
                tap((request) => {
                    this.venueSlots.set([]);
                    this.hasSlotsError.set(false);
                    this.isLoadingSlots.set(request !== null);
                }),
                switchMap((request) => {
                    const current = request as {
                        contentId: string;
                        venueId: string;
                        startDate: string;
                        endDate: string;
                    } | null;
                    return current
                        ? this.mediaFilesService
                              .getVenueSlots(current.contentId, current.venueId, {
                                  startDate: current.startDate,
                                  endDate: current.endDate,
                              })
                              .pipe(
                                  catchError((error: unknown) => {
                                      console.error('[Dashboard] Failed to load slots:', error);
                                      return of(null);
                                  }),
                              )
                        : of([] as AdVenueSlot[]);
                }),
                takeUntilDestroyed(destroyRef),
            )
            .subscribe((slots) => {
                this.isLoadingSlots.set(false);
                this.hasSlotsError.set(slots === null);
                this.venueSlots.set(slots ?? []);
            });

        // The top bar's totals jump to this page's breakdowns
        this.viewState.jumpRequests
            .pipe(takeUntilDestroyed(destroyRef))
            .subscribe((target) => this.jumpTo(target));

        afterNextRender(() => {
            const row = this.metricsRow()?.nativeElement;
            if (!row) {
                return;
            }

            // The page scrolls inside the shell's content area, not the window: measure
            // against that box. The tiles count as out of view only once they're entirely
            // above its top edge (scrolled past - not when they're below the fold).
            const scroller = this.findScrollParent(row);
            const update = (): void => {
                const top = scroller ? scroller.getBoundingClientRect().top : 0;
                this.viewState.tilesInView.set(row.getBoundingClientRect().bottom > top);
            };

            update();
            const target: HTMLElement | Window = scroller ?? window;
            target.addEventListener('scroll', update, { passive: true });
            window.addEventListener('resize', update);
            // Loading data changes the page's height (and so where the tiles are) without
            // a scroll event
            const resizeObserver =
                typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
            resizeObserver?.observe(row);

            destroyRef.onDestroy(() => {
                target.removeEventListener('scroll', update);
                window.removeEventListener('resize', update);
                resizeObserver?.disconnect();
            });
        });
    }

    /**
     * The nearest ancestor that scrolls vertically (the shell's content area), or null
     * when the window itself scrolls.
     *
     * @param element - Where to start
     * @returns {HTMLElement | null} The scrolling ancestor
     */
    private findScrollParent(element: HTMLElement): HTMLElement | null {
        for (let parent = element.parentElement; parent; parent = parent.parentElement) {
            const overflowY = getComputedStyle(parent).overflowY;
            if (overflowY === 'auto' || overflowY === 'scroll') {
                return parent;
            }
        }
        return null;
    }

    /**
     * Smoothly scrolls to a headline number's breakdown (a stat tile or the top bar's
     * totals was clicked): Received → the timeline, the others → their card. For
     * Categories/States/Ads/Venues, also switches the breakdown switcher to that card first -
     * otherwise the scroll would land on whichever of the three happens to be showing.
     *
     * @param target - The breakdown to show
     * @returns {void}
     */
    protected jumpTo(target: DashboardJumpTarget): void {
        if (
            target === 'categories' ||
            target === 'states' ||
            target === 'ads' ||
            target === 'venues'
        ) {
            this.activeBreakdown.set(target);
        }
        document
            .getElementById(`dashboard-${target}`)
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /**
     * Opens the list of venues in an unknown bucket.
     *
     * @param kind - `state` or `category`
     * @returns {void}
     */
    protected openUnknownVenues(kind: DashboardUnknownKind): void {
        this.unknownIdsCopied.set(false);
        this.unknownDialog.set(kind);
    }

    /**
     * Copies the unknown venues' IDs, one per line, for the tech team.
     *
     * @returns {void}
     */
    protected copyUnknownVenueIds(): void {
        const ids = this.unknownVenues()
            .map((venue) => venue.venueId)
            .join('\n');

        navigator.clipboard
            .writeText(ids)
            .then(() => {
                this.unknownIdsCopied.set(true);
                setTimeout(() => this.unknownIdsCopied.set(false), 2000);
            })
            .catch((error: unknown) =>
                console.error('[Dashboard] Failed to copy venue IDs:', error),
            );
    }

    /**
     * Stable ID for an ad row: its creative identity.
     *
     * @param ad - The ad
     * @returns {string} "creativeId:source"
     */
    private adId(ad: DashboardAdShare): string {
        return `${ad.creativeId}:${ad.source}`;
    }

    /**
     * The ads received at one venue, most received first, each as a share of what the
     * venue received (the Venues card's and the Categories card's "Ads in" columns).
     *
     * @param venueId - The venue, or undefined for none
     * @returns {ShareItem[]} One row per ad, with its thumbnail and a link to Ad Analytics
     */
    private adItemsForVenue(venueId: string | undefined): ShareItem[] {
        if (!venueId) {
            return [];
        }

        return (this.adsSection.data()?.ads ?? [])
            .map((ad) => ({
                ad,
                received: ad.venues.find((slice) => slice.venueId === venueId)?.received ?? 0,
            }))
            .filter(({ received }) => received > 0)
            .sort((left, right) => right.received - left.received)
            .map(({ ad, received }) => ({
                id: this.adId(ad),
                name: this.shortTitle(ad.title),
                fullName: ad.title,
                caption: ad.source,
                value: received,
                imageUrl: ad.mediaUrl,
                isVideo: ad.creativeType === 'video',
                route: ad.contentId ? `/ad/${ad.contentId}` : null,
            }));
    }

    /**
     * The venues in one state that received an ad, most received first, each shown as a
     * share of the ad's total received (Ads card → third column, States card → third
     * column).
     *
     * @param ad - The ad
     * @param stateCode - Two-letter code, "Unknown" or "No venue"
     * @returns {ShareItem[]} One row per venue, linking to its Venue Profile
     */
    private adVenueItemsInState(ad: DashboardAdShare, stateCode: string): ShareItem[] {
        const venuesById = this.venuesById();

        return ad.venues
            .filter((slice) => (venuesById.get(slice.venueId)?.state ?? 'Unknown') === stateCode)
            .map((slice) => {
                const venue = venuesById.get(slice.venueId);
                return {
                    id: slice.venueId,
                    name: venue?.hostName ?? slice.venueId,
                    caption: [slice.venueId, venue?.city].filter(Boolean).join(' · '),
                    value: slice.received,
                    route: `/venue/${slice.venueId}`,
                };
            });
    }

    /**
     * How many real states an ad was received in - "Unknown" (venue with no known state)
     * and "No venue" aren't states, same as the Unique states tile.
     *
     * @param ad - The ad, with its states
     * @returns {number} Distinct known states
     */
    private stateCount(ad: DashboardAdWithStates): number {
        return ad.states.filter((slice) => slice.state !== 'Unknown' && slice.state !== 'No venue')
            .length;
    }

    /**
     * Formats a state count, e.g. "1 state" / "3 states".
     *
     * @param count - Number of states
     * @returns {string} The count with its unit
     */
    private pluralStates(count: number): string {
        return `${count} ${count === 1 ? 'state' : 'states'}`;
    }

    /**
     * Formats a venue count, e.g. "1 venue" / "11 venues".
     *
     * @param count - Number of venues
     * @returns {string} The count with its unit
     */
    private pluralVenues(count: number): string {
        return `${count} ${count === 1 ? 'venue' : 'venues'}`;
    }

    /**
     * Shortens a long ad title (usually a file name, e.g. a UUID + extension) in the
     * middle, keeping its start and its extension.
     *
     * @param title - The full title
     * @returns {string} e.g. "b3e49f9a-b...885d9.jpg"
     */
    protected shortTitle(title: string): string {
        return truncateMiddle(title, 10, 8);
    }

    /**
     * Display name for a state code from the summary.
     *
     * @param code - Two-letter code, "Unknown" or "No venue"
     * @returns {string} e.g. "Texas", "Unknown state", "No venue"
     */
    protected stateName(code: string): string {
        if (code === 'Unknown') {
            return 'Unknown state';
        }
        return STATE_CODE_TO_NAME[code] ?? code;
    }

    /**
     * Display name for a category from the summary.
     *
     * @param category - Category name, or "Unknown"
     * @returns {string} e.g. "Restaurant", "Unknown category"
     */
    protected categoryName(category: string): string {
        return category === 'Unknown' ? 'Unknown category' : category;
    }
}
