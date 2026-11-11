/** Angular Imports */
import { DatePipe } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    inject,
    signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

/** Third Party Imports */
import { Button, Card, Input, Skeleton, type TabHeader, Tabs } from '@ntv360/component-pantry';
import { catchError, debounceTime, distinctUntilChanged, map, of, switchMap } from 'rxjs';

/** Local Imports */
import { AssetUploadComponent } from '@features/mini-library/components';
import { FilterMenuComponent } from '@shared/components/filter-menu';
import { PageHeaderComponent } from '@shared/components/page-header';
import { SortControlComponent } from '@shared/components/sort-control';
import { StatusBadgeComponent } from '@shared/components/status-badge';
import type {
    LibraryAsset,
    LibraryAssetList,
    LibraryAssetQuery,
    LibraryCategoryCount,
    LibraryCreateAssetsRequest,
    LibrarySubcategoryCount,
    LibraryTaxonomy,
} from '@shared/interfaces/library';
import type { FilterOption } from '@shared/interfaces/ui';
import {
    LIBRARY_ALL,
    LIBRARY_FILE_TYPE_ICONS,
    LIBRARY_SORT_OPTIONS,
    LIBRARY_VIEW_OPTIONS,
    type LibraryCategoryId,
    type LibraryFileTypeFilter,
    type LibrarySort,
    type LibraryView,
} from '@shared/models/library';
import { CARD_CONFIG } from '@shared/models/ui';
import type { SortDirection } from '@shared/models/ui/sort-direction.type';
import { LibraryService } from '@shared/services/library';
import { apiErrorMessage } from '@shared/utils/api-error-message.util';

/**
 * Mini-Library page: one searchable home for creative assets.
 *
 * @remarks
 * Category tabs on top, then one filter bar: search, the category's own subcategory and
 * topic filters (named per category, e.g. Sport / Topic for Channel - none for a category
 * that isn't split), file type, sort and layout. Runs on the BFF's dummy library
 * (`/api/library`); filtering, search and sorting happen in the BFF, so the page works
 * unchanged once it is backed by a database.
 */
@Component({
    selector: 'app-mini-library',
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
        StatusBadgeComponent,
        Tabs,
    ],
    templateUrl: './mini-library.component.html',
    styleUrl: './mini-library.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class MiniLibraryComponent {
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
     * One skeleton card per placeholder while assets load
     * @type {number[]}
     */
    protected readonly skeletonPlaceholders = Array.from({ length: 12 }, (_value, index) => index);

    /**
     * Value of the "All …" subcategory / topic entries, for the template
     * @type {string}
     */
    protected readonly all = LIBRARY_ALL;

    /**
     * Whether the "Add assets" flow (where, then upload) is open
     * @type {WritableSignal<boolean>}
     */
    protected readonly isAdding = signal(false);

    /**
     * Sort choices
     * @type {readonly SelectOption<LibrarySort>[]}
     */
    protected readonly sortOptions = LIBRARY_SORT_OPTIONS;

    /**
     * Layout choices
     * @type {readonly SelectOption<LibraryView>[]}
     */
    protected readonly viewOptions = LIBRARY_VIEW_OPTIONS;

    /**
     * Selected category
     * @type {WritableSignal<LibraryCategoryId>}
     */
    protected readonly categoryId = signal<LibraryCategoryId>('channel');

    /**
     * Selected subcategory, or LIBRARY_ALL
     * @type {WritableSignal<string>}
     */
    protected readonly subcategoryId = signal<string>(LIBRARY_ALL);

    /**
     * Selected topic of the subcategory, or LIBRARY_ALL
     * @type {WritableSignal<string>}
     */
    protected readonly topicId = signal<string>(LIBRARY_ALL);

    /**
     * File-format filter
     * @type {WritableSignal<LibraryFileTypeFilter>}
     */
    protected readonly fileType = signal<LibraryFileTypeFilter>('all');

    /**
     * Order of the assets
     * @type {WritableSignal<LibrarySort>}
     */
    protected readonly sort = signal<LibrarySort>('updated');

    /**
     * Direction of the order (clicking the active sort again reverses it)
     * @type {WritableSignal<SortDirection>}
     */
    protected readonly sortDirection = signal<SortDirection>('desc');

    /**
     * Card grid or compact list
     * @type {WritableSignal<LibraryView>}
     */
    protected readonly view = signal<LibraryView>('grid');

    /**
     * Search box (title or path), sent to the BFF after a short pause in typing
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
     * Why the categories failed to load (the BFF's message when it sent one)
     * @type {WritableSignal<string>}
     */
    protected readonly taxonomyError = signal("Couldn't load the categories.");

    /**
     * Why the assets failed to load (the BFF's message when it sent one)
     * @type {WritableSignal<string>}
     */
    protected readonly listError = signal('Failed to load assets.');

    /**
     * Bumped by retry() to reload the taxonomy and the assets
     * @type {WritableSignal<number>}
     */
    private readonly reloads = signal(0);

    /**
     * Categories, subcategories and topics with counts: undefined while loading, null on
     * error
     * @type {Signal<LibraryTaxonomy | null | undefined>}
     */
    protected readonly taxonomy = toSignal(
        toObservable(this.reloads).pipe(
            switchMap(() =>
                this.libraryService.getTaxonomy().pipe(
                    catchError((error: unknown) => {
                        console.error('[MiniLibrary] Failed to load the categories:', error);
                        this.taxonomyError.set(
                            apiErrorMessage(error, "Couldn't load the categories."),
                        );
                        return of(null);
                    }),
                ),
            ),
        ),
    );

    /**
     * The selected category's entry (counts, subcategories), once loaded
     * @type {Signal<LibraryCategoryCount | null>}
     */
    protected readonly category = computed(
        (): LibraryCategoryCount | null =>
            this.taxonomy()?.categories.find((entry) => entry.id === this.categoryId()) ?? null,
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
     * One tab per category, with its asset count
     * @type {Signal<TabHeader[]>}
     */
    protected readonly categoryTabs = computed((): TabHeader[] =>
        (this.taxonomy()?.categories ?? []).map((category) => ({
            label: `${category.label} (${category.count})`,
        })),
    );

    /**
     * Index of the selected category's tab
     * @type {Signal<number>}
     */
    protected readonly categoryIndex = computed(() =>
        Math.max(
            0,
            (this.taxonomy()?.categories ?? []).findIndex(
                (entry) => entry.id === this.categoryId(),
            ),
        ),
    );

    /**
     * The category's subcategory filter entries ("All …" first), empty when it isn't split
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
                label: `All ${this.plural(category.subcategoryLabel)}`,
                icon: 'layer-group',
                count: category.count,
            },
            ...category.subcategories.map((entry) => ({
                value: entry.id,
                label: entry.label,
                icon: 'folder',
                count: entry.count,
            })),
        ];
    });

    /**
     * The selected subcategory's topic filter entries ("All …" first), empty when no
     * subcategory is selected or it isn't split
     * @type {Signal<FilterOption<string>[]>}
     */
    protected readonly topicOptions = computed((): FilterOption<string>[] => {
        const subcategory = this.subcategory();
        if (!subcategory?.topics.length) {
            return [];
        }
        return [
            {
                value: LIBRARY_ALL,
                label: `All ${this.plural(subcategory.topicLabel)}`,
                icon: 'layer-group',
                count: subcategory.count,
            },
            ...subcategory.topics.map((entry) => ({
                value: entry.id,
                label: entry.label,
                icon: 'folder-open',
                count: entry.count,
            })),
        ];
    });

    /**
     * The current listing query - any change reloads the assets
     * @type {Signal<LibraryAssetQuery>}
     */
    private readonly query = computed((): LibraryAssetQuery => {
        const fileType = this.fileType();
        return {
            categoryId: this.categoryId(),
            subcategoryId: this.subcategoryId() === LIBRARY_ALL ? null : this.subcategoryId(),
            topicId: this.topicId() === LIBRARY_ALL ? null : this.topicId(),
            search: this.search(),
            fileType: fileType === 'all' ? null : fileType,
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
     * Per-format counts of the last successful listing, kept while the next one loads so
     * the filter doesn't flash to zero
     * @type {WritableSignal<LibraryAssetList['fileTypeCounts'] | null>}
     */
    private readonly fileTypeCounts = signal<LibraryAssetList['fileTypeCounts'] | null>(null);

    /**
     * File-format filter entries with their counts in the current selection
     * @type {Signal<FilterOption<LibraryFileTypeFilter>[]>}
     */
    protected readonly fileTypeOptions = computed((): FilterOption<LibraryFileTypeFilter>[] => {
        const counts = this.fileTypeCounts();
        const entries: [LibraryFileTypeFilter, string][] = [
            ['all', 'All formats'],
            ['png', 'PNG'],
            ['jpg', 'JPG'],
            ['mp4', 'MP4'],
        ];
        return entries.map(([value, label]) => ({
            value,
            label,
            icon: LIBRARY_FILE_TYPE_ICONS[value],
            count: counts?.[value] ?? 0,
        }));
    });

    /**
     * Labels of the current selection, e.g. ["Channel", "Badminton", "Tips"]
     * @type {Signal<string[]>}
     */
    protected readonly breadcrumb = computed((): string[] => {
        const subcategory = this.subcategory();
        const topic = subcategory?.topics.find((entry) => entry.id === this.topicId());
        return [this.category()?.label, subcategory?.label, topic?.label].filter(
            (label): label is string => !!label,
        );
    });

    constructor() {
        // A new query replaces the list; switchMap drops a slower response for an older one
        toObservable(computed(() => ({ query: this.query(), reloads: this.reloads() })))
            .pipe(
                switchMap(({ query }) => {
                    this.list.set(undefined);
                    return this.libraryService.getAssets(query).pipe(
                        catchError((error: unknown) => {
                            console.error('[MiniLibrary] Failed to load assets:', error);
                            this.listError.set(apiErrorMessage(error, 'Failed to load assets.'));
                            return of(null);
                        }),
                    );
                }),
                takeUntilDestroyed(inject(DestroyRef)),
            )
            .subscribe((list) => {
                this.list.set(list);
                if (list) {
                    this.fileTypeCounts.set(list.fileTypeCounts);
                }
            });
    }

    /**
     * Switches to the category of a clicked tab, clearing its subcategory and topic.
     *
     * @param index - The tab's index
     * @returns {void}
     */
    protected selectCategoryAt(index: number): void {
        const category = this.taxonomy()?.categories[index];
        if (!category) {
            return;
        }
        this.categoryId.set(category.id);
        this.subcategoryId.set(LIBRARY_ALL);
        this.topicId.set(LIBRARY_ALL);
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
     * Ends the "Add assets" flow and shows where the new assets were filed, newest first.
     *
     * @param filing - Where the assets went
     * @returns {void}
     */
    protected onAssetsSaved(filing: LibraryCreateAssetsRequest): void {
        this.isAdding.set(false);
        this.categoryId.set(filing.categoryId);
        this.subcategoryId.set(filing.subcategoryId ?? LIBRARY_ALL);
        this.topicId.set(filing.topicId ?? LIBRARY_ALL);
        this.searchControl.setValue('');
        this.fileType.set('all');
        this.sort.set('updated');
        this.sortDirection.set('desc');
        this.retry();
    }

    /**
     * Reloads the categories and the assets after an error.
     *
     * @returns {void}
     */
    protected retry(): void {
        this.reloads.update((count) => count + 1);
    }

    /**
     * Hides a preview that failed to load, leaving an empty frame.
     *
     * @param event - The image's error event
     * @returns {void}
     */
    protected onThumbnailError(event: Event): void {
        (event.target as HTMLImageElement).style.visibility = 'hidden';
    }

    /**
     * The asset's location and version, e.g. "Badminton › Tips · v2".
     *
     * @param asset - Asset to describe
     * @returns {string} The label
     */
    protected assetLocation(asset: LibraryAsset): string {
        return `${asset.path.join(' › ')} · v${asset.version}`;
    }

    /**
     * Lower-case plural of a filter name for its "All …" entry, e.g. "Sport" → "sports".
     *
     * @param label - The filter name, or null
     * @returns {string} The plural
     */
    private plural(label: string | null): string {
        if (!label) {
            return 'items';
        }
        const lower = label.toLowerCase();
        return lower.endsWith('y') ? `${lower.slice(0, -1)}ies` : `${lower}s`;
    }
}
