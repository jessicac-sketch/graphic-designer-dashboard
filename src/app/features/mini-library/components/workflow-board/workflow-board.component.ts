/** Angular Imports */
import { DatePipe } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    inject,
    input,
    signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

/** Third Party Imports */
import { Button, Card, Input, Skeleton } from '@ntv360/component-pantry';
import { catchError, debounceTime, distinctUntilChanged, map, of, switchMap } from 'rxjs';

/** Local Imports */
import { FilterMenuComponent } from '@shared/components/filter-menu';
import { PageHeaderComponent } from '@shared/components/page-header';
import { SortControlComponent } from '@shared/components/sort-control';
import { StatusMenuComponent } from '@shared/components/status-menu';
import type {
    LibraryAsset,
    LibraryAssetList,
    LibraryAssetQuery,
    LibraryCategoryCount,
    LibraryStatusTile,
    LibrarySubcategoryCount,
    LibraryWorkflowPage,
} from '@shared/interfaces/library';
import type { FilterOption } from '@shared/interfaces/ui';
import {
    LIBRARY_ALL,
    LIBRARY_SORT_OPTIONS,
    LIBRARY_STATUSES,
    type LibraryAssetStatus,
    type LibrarySort,
    type LibraryStatusFilter,
} from '@shared/models/library';
import { CARD_CONFIG } from '@shared/models/ui';
import type { SortDirection } from '@shared/models/ui/sort-direction.type';
import { LibraryService } from '@shared/services/library';
import { apiErrorMessage } from '@shared/utils/api-error-message.util';
import { toLibraryFilterOptions } from '@shared/utils/library-filter-options.util';
import { AssetUploadComponent } from '../asset-upload';

/**
 * A workflow page (Channel, Sponsorship): every asset uploaded to the Mini-Library under one
 * category, with its workflow status (Review → Approval → Ready → Live). Status tiles filter
 * the list; each row's status menu moves the asset along; a row opens the preview; the add
 * button runs the Mini-Library upload with the category preselected.
 */
@Component({
    selector: 'app-workflow-board',
    imports: [
        AssetUploadComponent,
        Button,
        Card,
        DatePipe,
        FilterMenuComponent,
        Input,
        PageHeaderComponent,
        ReactiveFormsModule,
        RouterLink,
        Skeleton,
        SortControlComponent,
        StatusMenuComponent,
    ],
    templateUrl: './workflow-board.component.html',
    styleUrl: './workflow-board.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class WorkflowBoardComponent {
    /**
     * Which category the page lists, and its wording
     * @type {InputSignal<LibraryWorkflowPage>}
     */
    readonly page = input.required<LibraryWorkflowPage>();

    /**
     * Library data from the BFF
     * @type {LibraryService}
     */
    private readonly libraryService = inject(LibraryService);

    /**
     * Flat, outlined card look
     * @type {Partial<CardConfig>}
     */
    protected readonly cardConfig = CARD_CONFIG;

    /**
     * Value of the "All …" filter entries, for the template
     * @type {string}
     */
    protected readonly all = LIBRARY_ALL;

    /**
     * One skeleton row per placeholder while assets load
     * @type {number[]}
     */
    protected readonly skeletonRows = Array.from({ length: 6 }, (_value, index) => index);

    /**
     * Sort choices
     * @type {readonly SelectOption<LibrarySort>[]}
     */
    protected readonly sortOptions = LIBRARY_SORT_OPTIONS;

    /**
     * Selected subcategory (e.g. Extreme Sports, Ribbon), or LIBRARY_ALL
     * @type {WritableSignal<string>}
     */
    protected readonly subcategoryId = signal<string>(LIBRARY_ALL);

    /**
     * Selected topic (e.g. a sport under Extreme Sports), or LIBRARY_ALL
     * @type {WritableSignal<string>}
     */
    protected readonly topicId = signal<string>(LIBRARY_ALL);

    /**
     * Status filter
     * @type {WritableSignal<LibraryStatusFilter>}
     */
    protected readonly status = signal<LibraryStatusFilter>('all');

    /**
     * Order of the list
     * @type {WritableSignal<LibrarySort>}
     */
    protected readonly sort = signal<LibrarySort>('updated');

    /**
     * Direction of the order
     * @type {WritableSignal<SortDirection>}
     */
    protected readonly sortDirection = signal<SortDirection>('desc');

    /**
     * Search box (title, subcategory, topic or tag)
     * @type {FormControl<string>}
     */
    protected readonly searchControl = new FormControl('', { nonNullable: true });

    /**
     * Search text, debounced and trimmed
     * @type {Signal<string>}
     */
    private readonly search = toSignal(
        this.searchControl.valueChanges.pipe(
            debounceTime(300),
            map((value) => value.trim()),
            distinctUntilChanged(),
        ),
        { initialValue: '' },
    );

    /**
     * Whether the upload flow is open
     * @type {WritableSignal<boolean>}
     */
    protected readonly isAdding = signal(false);

    /**
     * IDs of assets whose status change is being saved
     * @type {WritableSignal<ReadonlySet<string>>}
     */
    protected readonly savingIds = signal<ReadonlySet<string>>(new Set());

    /**
     * Why the last status change failed, or null
     * @type {WritableSignal<string | null>}
     */
    protected readonly statusError = signal<string | null>(null);

    /**
     * Why the categories failed to load, or null before any failure
     * @type {WritableSignal<string | null>}
     */
    private readonly taxonomyFailure = signal<string | null>(null);

    /**
     * Why the list failed to load, or null before any failure
     * @type {WritableSignal<string | null>}
     */
    private readonly listFailure = signal<string | null>(null);

    /**
     * Message shown when the categories fail to load
     * @type {Signal<string>}
     */
    protected readonly taxonomyError = computed(
        () => this.taxonomyFailure() ?? `Couldn't load the ${this.page().noun} categories.`,
    );

    /**
     * Message shown when the list fails to load
     * @type {Signal<string>}
     */
    protected readonly listError = computed(
        () => this.listFailure() ?? `Couldn't load the ${this.page().noun} content.`,
    );

    /**
     * Bumped to reload the taxonomy and the list
     * @type {WritableSignal<number>}
     */
    private readonly reloads = signal(0);

    /**
     * Whether the next reload keeps the current rows on screen (after a status change)
     * instead of showing the skeleton
     * @type {boolean}
     */
    private quietReload = false;

    /**
     * Categories with counts: undefined while loading, null on error
     * @type {Signal<LibraryTaxonomy | null | undefined>}
     */
    protected readonly taxonomy = toSignal(
        toObservable(this.reloads).pipe(
            switchMap(() =>
                this.libraryService.getTaxonomy().pipe(
                    catchError((error: unknown) => {
                        console.error(
                            `[${this.page().title}] Failed to load the categories:`,
                            error,
                        );
                        this.taxonomyFailure.set(apiErrorMessage(error, '') || null);
                        return of(null);
                    }),
                ),
            ),
        ),
    );

    /**
     * This page's category entry (its subcategories and their topics, with counts)
     * @type {Signal<LibraryCategoryCount | null>}
     */
    protected readonly category = computed(
        (): LibraryCategoryCount | null =>
            this.taxonomy()?.categories.find((entry) => entry.id === this.page().categoryId) ??
            null,
    );

    /**
     * The selected subcategory's entry, or null for all
     * @type {Signal<LibrarySubcategoryCount | null>}
     */
    protected readonly subcategory = computed(
        (): LibrarySubcategoryCount | null =>
            this.category()?.subcategories.find((entry) => entry.id === this.subcategoryId()) ??
            null,
    );

    /**
     * What the subcategories are called, e.g. "Channel" or "Type"
     * @type {Signal<string>}
     */
    protected readonly subcategoryLabel = computed(
        () => this.category()?.subcategoryLabel ?? 'Subcategory',
    );

    /**
     * Search box placeholder, e.g. "Search title, type or tag…"
     * @type {Signal<string>}
     */
    protected readonly searchPlaceholder = computed(
        () => `Search title, ${this.subcategoryLabel().toLowerCase()} or tag…`,
    );

    /**
     * Subcategory filter entries ("All …" first), empty when the category has none
     * @type {Signal<FilterOption<string>[]>}
     */
    protected readonly subcategoryOptions = computed((): FilterOption<string>[] => {
        const category = this.category();
        if (!category?.subcategories.length) {
            return [];
        }
        return [
            {
                value: LIBRARY_ALL,
                label: `All ${this.subcategoryLabel().toLowerCase()}s`,
                icon: 'layer-group',
                count: category.count,
            },
            ...toLibraryFilterOptions(category.subcategories, this.page().subcategoryIcon),
        ];
    });

    /**
     * Topic filter entries for the selected subcategory ("All …" first), empty when it has none
     * @type {Signal<FilterOption<string>[]>}
     */
    protected readonly topicOptions = computed((): FilterOption<string>[] => {
        const subcategory = this.subcategory();
        if (!subcategory?.topics.length) {
            return [];
        }
        const name = (subcategory.topicLabel ?? 'topic').toLowerCase();
        return [
            {
                value: LIBRARY_ALL,
                label: `All ${name}s`,
                icon: 'layer-group',
                count: subcategory.count,
            },
            ...toLibraryFilterOptions(subcategory.topics, 'folder-open'),
        ];
    });

    /**
     * The current listing query - any change reloads the list
     * @type {Signal<LibraryAssetQuery>}
     */
    private readonly query = computed((): LibraryAssetQuery => {
        const status = this.status();
        return {
            categoryId: this.page().categoryId,
            subcategoryId: this.subcategoryId() === LIBRARY_ALL ? null : this.subcategoryId(),
            topicId: this.topicId() === LIBRARY_ALL ? null : this.topicId(),
            search: this.search(),
            fileType: null,
            status: status === 'all' ? null : status,
            sort: this.sort(),
            direction: this.sortDirection(),
        };
    });

    /**
     * The latest listing: undefined while loading, null on error
     * @type {WritableSignal<LibraryAssetList | null | undefined>}
     */
    protected readonly list = signal<LibraryAssetList | null | undefined>(undefined);

    /**
     * Per-status counts of the last successful listing, kept while the next one loads
     * @type {WritableSignal<LibraryAssetList['statusCounts']>}
     */
    private readonly statusCounts = signal<LibraryAssetList['statusCounts']>(null);

    /**
     * The status tiles: All, then each status in workflow order, with counts
     * @type {Signal<LibraryStatusTile[]>}
     */
    protected readonly statusTiles = computed((): LibraryStatusTile[] => {
        const counts = this.statusCounts();
        return [
            {
                value: 'all',
                label: 'All',
                description: `Every ${this.page().noun} upload`,
                icon: 'layer-group',
                count: counts?.all ?? 0,
            },
            ...LIBRARY_STATUSES.map((entry) => ({ ...entry, count: counts?.[entry.value] ?? 0 })),
        ];
    });

    constructor() {
        // A new query replaces the list; switchMap drops a slower response for an older one
        toObservable(computed(() => ({ query: this.query(), reloads: this.reloads() })))
            .pipe(
                switchMap(({ query }) => {
                    if (!this.quietReload) {
                        this.list.set(undefined);
                    }
                    this.quietReload = false;
                    return this.libraryService.getAssets(query).pipe(
                        catchError((error: unknown) => {
                            console.error(`[${this.page().title}] Failed to load the list:`, error);
                            this.listFailure.set(apiErrorMessage(error, '') || null);
                            return of(null);
                        }),
                    );
                }),
                takeUntilDestroyed(inject(DestroyRef)),
            )
            .subscribe((list) => {
                this.list.set(list);
                if (list) {
                    this.statusCounts.set(list.statusCounts);
                }
            });
    }

    /**
     * Picks a subcategory, clearing the topic.
     *
     * @param subcategoryId - Subcategory, or LIBRARY_ALL
     * @returns {void}
     */
    protected selectSubcategory(subcategoryId: string): void {
        this.subcategoryId.set(subcategoryId);
        this.topicId.set(LIBRARY_ALL);
    }

    /**
     * Moves an asset to another status, then refreshes the list and counts in place.
     *
     * @param asset - The asset
     * @param status - Its new status
     * @returns {void}
     */
    protected changeStatus(asset: LibraryAsset, status: LibraryAssetStatus): void {
        this.statusError.set(null);
        this.savingIds.update((ids) => new Set(ids).add(asset.id));

        const done = (): void =>
            this.savingIds.update((ids) => {
                const next = new Set(ids);
                next.delete(asset.id);
                return next;
            });

        this.libraryService.updateStatus(asset.id, status).subscribe({
            next: () => {
                done();
                this.quietReload = true;
                this.reloads.update((count) => count + 1);
            },
            error: (error: unknown) => {
                console.error(`[${this.page().title}] Failed to change the status:`, error);
                done();
                this.statusError.set(
                    apiErrorMessage(error, `Couldn't change the status of "${asset.title}".`),
                );
            },
        });
    }

    /**
     * Ends the upload flow and shows the new uploads (which start at Review).
     *
     * @returns {void}
     */
    protected onAssetsSaved(): void {
        this.isAdding.set(false);
        this.status.set('all');
        this.sort.set('updated');
        this.sortDirection.set('desc');
        this.searchControl.setValue('');
        this.retry();
    }

    /**
     * Reloads the categories and the list.
     *
     * @returns {void}
     */
    protected retry(): void {
        this.reloads.update((count) => count + 1);
    }

    /**
     * Where an asset is filed within the category, e.g. "Extreme Sports › Skiing".
     *
     * @param asset - The asset
     * @returns {string} The location
     */
    protected location(asset: LibraryAsset): string {
        return asset.path.join(' › ');
    }

    /**
     * Hides a preview image that failed to load, leaving an empty frame.
     *
     * @param event - The image's error event
     * @returns {void}
     */
    protected onThumbnailError(event: Event): void {
        (event.target as HTMLImageElement).style.visibility = 'hidden';
    }
}
