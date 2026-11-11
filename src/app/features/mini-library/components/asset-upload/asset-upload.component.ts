/** Angular Imports */
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    inject,
    input,
    OnInit,
    output,
    signal,
    viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

/** Third Party Imports */
import { type UploadConfig, Uploader, type UploadFile } from '@ntv360/component-pantry';
import { catchError, of, type Subscription } from 'rxjs';

/** Local Imports */
import { DialogComponent } from '@shared/components/dialog';
import { FilterMenuComponent } from '@shared/components/filter-menu';
import { TagInputComponent } from '@shared/components/tag-input';
import type {
    LibraryCategoryCount,
    LibraryCreateAssetsRequest,
    LibrarySubcategoryCount,
    LibraryTaxonomy,
    LibraryUploadedFile,
} from '@shared/interfaces/library';
import { CHART_COLORS } from '@shared/models/chart';
import {
    LIBRARY_TAG_LIMITS,
    LIBRARY_UPLOAD_FILE_TYPES,
    type LibraryCategoryId,
    type LibraryFileType,
} from '@shared/models/library';
import { AssetUploadService, LibraryService } from '@shared/services/library';
import { apiErrorMessage } from '@shared/utils/api-error-message.util';
import { toLibraryFilterOptions } from '@shared/utils/library-filter-options.util';

/**
 * The Mini-Library's "Add assets" flow:
 * 1. "Where do these assets go?": the category and its own levels (e.g. Channel ›
 *    Extreme Sports › Skiing), starting from what the page shows, plus optional tags for
 *    every file in the batch.
 * 2. The design system's uploader (`ntv-uploader`), with the destination above it. Each
 *    file's name (renamed in the uploader if needed) becomes its title.
 * 3. Once a batch finishes uploading to Filestack, its files are saved to the library
 *    automatically and `saved` emits.
 *
 * @remarks
 * Render it with `@if` while adding assets: it starts at step 1 every time it is shown.
 *
 * @example
 * @if (isAdding()) {
 *     <app-asset-upload [taxonomy]="taxonomy" [defaultCategoryId]="categoryId()"
 *         (saved)="onSaved($event)" (closed)="isAdding.set(false)" />
 * }
 */
@Component({
    selector: 'app-asset-upload',
    imports: [DialogComponent, FilterMenuComponent, TagInputComponent, Uploader],
    templateUrl: './asset-upload.component.html',
    styleUrl: './asset-upload.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class AssetUploadComponent implements OnInit {
    /**
     * Library data from the BFF
     * @type {LibraryService}
     */
    private readonly libraryService = inject(LibraryService);

    /**
     * Sends files to Filestack
     * @type {AssetUploadService}
     */
    private readonly assetUploadService = inject(AssetUploadService);

    /**
     * Categories with their subcategories and topics
     * @type {InputSignal<LibraryTaxonomy>}
     */
    public readonly taxonomy = input.required<LibraryTaxonomy>();

    /**
     * Category preselected (the one the page shows)
     * @type {InputSignal<LibraryCategoryId | null>}
     */
    public readonly defaultCategoryId = input<LibraryCategoryId | null>(null);

    /**
     * Subcategory preselected, or null
     * @type {InputSignal<string | null>}
     */
    public readonly defaultSubcategoryId = input<string | null>(null);

    /**
     * Topic preselected, or null
     * @type {InputSignal<string | null>}
     */
    public readonly defaultTopicId = input<string | null>(null);

    /**
     * Emits where the assets were filed, once they are saved
     * @type {OutputEmitterRef<LibraryCreateAssetsRequest>}
     */
    public readonly saved = output<LibraryCreateAssetsRequest>();

    /**
     * Emits when the flow ends without saving (closed or cancelled)
     * @type {OutputEmitterRef<void>}
     */
    public readonly closed = output<void>();

    /**
     * Accepted extensions
     * @type {typeof LIBRARY_UPLOAD_FILE_TYPES}
     */
    protected readonly fileTypes = LIBRARY_UPLOAD_FILE_TYPES;

    /**
     * Accent color of the uploader (a literal: it sets a CSS custom property)
     * @type {string}
     */
    protected readonly accentColor = CHART_COLORS.brand;

    /**
     * Current step: choosing where the assets go, then uploading them
     * @type {WritableSignal<'where' | 'upload'>}
     */
    protected readonly step = signal<'where' | 'upload'>('where');

    /**
     * How files are uploaded: undefined while loading, null if it failed to load
     * @type {Signal<LibraryUploadConfig | null | undefined>}
     */
    protected readonly uploadConfig = toSignal(
        this.libraryService.getUploadConfig().pipe(
            catchError((error: unknown) => {
                console.error('[AssetUpload] Failed to load the upload configuration:', error);
                return of(null);
            }),
        ),
    );

    /**
     * The uploader's provider settings: Filestack with the BFF's key, or null (the
     * uploader then shows "No Upload Provider Configured" and disables Upload)
     * @type {Signal<UploadConfig | null>}
     */
    protected readonly pantryUploadConfig = computed((): UploadConfig | null => {
        const apiKey = this.uploadConfig()?.filestackApiKey;
        return apiKey ? { provider: 'filestack', filestack: { apiKey } } : null;
    });

    /**
     * The uploader, fed progress and results
     * @type {Signal<Uploader | undefined>}
     */
    private readonly uploader = viewChild(Uploader);

    /**
     * In-flight uploads by uploader file ID, cancelled on cancel / close
     * @type {Map<string, Subscription>}
     */
    private readonly uploads = new Map<string, Subscription>();

    /**
     * Whether files are uploading (locks the destination)
     * @type {WritableSignal<boolean>}
     */
    protected readonly isUploading = signal(false);

    /**
     * Files uploaded to Filestack in this batch, waiting to be saved
     * @type {WritableSignal<LibraryUploadedFile[]>}
     */
    private readonly uploaded = signal<LibraryUploadedFile[]>([]);

    /**
     * Whether the uploaded files are being saved to the library
     * @type {WritableSignal<boolean>}
     */
    protected readonly isSaving = signal(false);

    /**
     * Why the last save failed, or null
     * @type {WritableSignal<string | null>}
     */
    protected readonly saveError = signal<string | null>(null);

    /**
     * Category the assets go under
     * @type {WritableSignal<LibraryCategoryId | null>}
     */
    protected readonly categoryId = signal<LibraryCategoryId | null>(null);

    /**
     * Subcategory the assets go under (when the category has any)
     * @type {WritableSignal<string | null>}
     */
    protected readonly subcategoryId = signal<string | null>(null);

    /**
     * Topic the assets go under (when the subcategory has any)
     * @type {WritableSignal<string | null>}
     */
    protected readonly topicId = signal<string | null>(null);

    /**
     * Optional tags for every file in the batch, for search
     * @type {WritableSignal<string[]>}
     */
    protected readonly tags = signal<string[]>([]);

    /**
     * Tag count and length limits
     * @type {typeof LIBRARY_TAG_LIMITS}
     */
    protected readonly tagLimits = LIBRARY_TAG_LIMITS;

    /**
     * The selected category's entry
     * @type {Signal<LibraryCategoryCount | null>}
     */
    protected readonly category = computed(
        (): LibraryCategoryCount | null =>
            this.taxonomy().categories.find((entry) => entry.id === this.categoryId()) ?? null,
    );

    /**
     * The selected subcategory's entry
     * @type {Signal<LibrarySubcategoryCount | null>}
     */
    protected readonly subcategory = computed(
        (): LibrarySubcategoryCount | null =>
            this.category()?.subcategories.find((entry) => entry.id === this.subcategoryId()) ??
            null,
    );

    /**
     * Category choices
     * @type {Signal<FilterOption<string>[]>}
     */
    protected readonly categoryOptions = computed(() =>
        toLibraryFilterOptions(this.taxonomy().categories, 'folder'),
    );

    /**
     * The category's subcategory choices (empty when it isn't split)
     * @type {Signal<FilterOption<string>[]>}
     */
    protected readonly subcategoryOptions = computed(() =>
        toLibraryFilterOptions(this.category()?.subcategories ?? [], 'folder'),
    );

    /**
     * The subcategory's topic choices (empty when none is picked or it isn't split)
     * @type {Signal<FilterOption<string>[]>}
     */
    protected readonly topicOptions = computed(() =>
        toLibraryFilterOptions(this.subcategory()?.topics ?? [], 'folder-open'),
    );

    /**
     * Whether every level the choice needs is picked
     * @type {Signal<boolean>}
     */
    protected readonly isComplete = computed(() => {
        const category = this.category();
        const subcategory = this.subcategory();
        return (
            !!category &&
            (category.subcategories.length === 0 || !!subcategory) &&
            (!subcategory || subcategory.topics.length === 0 || !!this.topicId())
        );
    });

    /**
     * Where the assets go, e.g. "Channel › Extreme Sports › Skiing"
     * @type {Signal<string>}
     */
    protected readonly destination = computed(() => {
        const subcategory = this.subcategory();
        const topic = subcategory?.topics.find((entry) => entry.id === this.topicId());
        return [this.category()?.label, subcategory?.label, topic?.label]
            .filter((label): label is string => !!label)
            .join(' › ');
    });

    /**
     * Under the choices: what's still missing, or where the batch goes
     * @type {Signal<string>}
     */
    protected readonly whereHint = computed(() => {
        if (this.isComplete()) {
            return `Every file in this batch goes to ${this.destination()}.`;
        }
        const category = this.category();
        const subcategory = this.subcategory();
        const missing = !category
            ? 'category'
            : !subcategory
              ? (category.subcategoryLabel ?? 'subcategory')
              : (subcategory.topicLabel ?? 'topic');
        return `Pick a ${missing.toLowerCase()} to continue.`;
    });

    constructor() {
        inject(DestroyRef).onDestroy(() => this.cancelUploads());
    }

    ngOnInit(): void {
        this.categoryId.set(this.defaultCategoryId());
        this.subcategoryId.set(this.defaultSubcategoryId());
        this.topicId.set(this.defaultTopicId());
    }

    /**
     * Picks the category, clearing the levels below it.
     *
     * @param categoryId - The category
     * @returns {void}
     */
    protected selectCategory(categoryId: string): void {
        this.categoryId.set(categoryId as LibraryCategoryId);
        this.subcategoryId.set(null);
        this.topicId.set(null);
    }

    /**
     * Picks the subcategory, clearing the topic.
     *
     * @param subcategoryId - The subcategory
     * @returns {void}
     */
    protected selectSubcategory(subcategoryId: string): void {
        this.subcategoryId.set(subcategoryId);
        this.topicId.set(null);
    }

    /**
     * Moves on to the uploader once the destination is complete.
     *
     * @returns {void}
     */
    protected continueToUpload(): void {
        if (this.isComplete()) {
            this.step.set('upload');
        }
    }

    /**
     * Ends the flow when the "where" dialog is closed (×, Cancel, Escape) - but not when it
     * closes because we moved on to the uploader: ntv-modal also emits its close event
     * when its `isVisible` turns false, which would otherwise end the flow right after
     * "Continue to files".
     *
     * @returns {void}
     */
    protected onWhereClosed(): void {
        if (this.step() === 'where') {
            this.closed.emit();
        }
    }

    /**
     * Back to the destination choice (only while nothing is uploading or saved).
     *
     * @returns {void}
     */
    protected changeDestination(): void {
        if (!this.isUploading() && !this.isSaving()) {
            this.step.set('where');
        }
    }

    /**
     * Uploads the batch the user confirmed, feeding progress back to the uploader, then
     * saves the uploaded files once every upload in the batch has finished.
     *
     * @param batch - Files to upload
     * @returns {void}
     */
    protected onUploadConfirmed(batch: UploadFile[]): void {
        const apiKey = this.uploadConfig()?.filestackApiKey;
        const uploader = this.uploader();
        if (!apiKey || !uploader) {
            return;
        }

        this.saveError.set(null);
        this.isUploading.set(true);

        for (const file of batch) {
            const fileType = this.toFileType(file.extension);
            if (!fileType) {
                uploader.markFileError(file.id, `.${file.extension} files aren't supported`);
                continue;
            }

            const subscription = this.assetUploadService.upload(file.file, apiKey).subscribe({
                next: (event) => {
                    if (event.type === 'progress') {
                        uploader.updateProgress(file.id, event.percent);
                        return;
                    }
                    uploader.markFileUploaded(file.id, event.url);
                    this.uploaded.update((files) => [
                        ...files,
                        {
                            id: file.id,
                            name: file.currentName,
                            fileType,
                            url: event.url,
                            size: file.file.size,
                        },
                    ]);
                    this.settle(file.id);
                },
                error: (error: unknown) => {
                    console.error('[AssetUpload] Upload failed:', error);
                    uploader.markFileError(
                        file.id,
                        error instanceof Error ? error.message : 'Upload failed',
                    );
                    this.settle(file.id);
                },
            });
            this.uploads.set(file.id, subscription);
        }

        this.settle(null);
    }

    /**
     * Stops every upload in flight (the uploader resets those files itself).
     *
     * @returns {void}
     */
    protected cancelUploads(): void {
        for (const subscription of this.uploads.values()) {
            subscription.unsubscribe();
        }
        this.uploads.clear();
        this.isUploading.set(false);
    }

    /**
     * Leaves the uploader without saving.
     *
     * @returns {void}
     */
    protected onUploaderClosed(): void {
        this.cancelUploads();
        this.closed.emit();
    }

    /**
     * Saves the uploaded files to the library under the chosen destination, each titled
     * by its (possibly renamed) file name.
     *
     * @returns {void}
     */
    protected save(): void {
        const categoryId = this.categoryId();
        const files = this.uploaded();
        if (!categoryId || files.length === 0 || this.isSaving()) {
            return;
        }

        const subcategory = this.subcategory();
        const request: LibraryCreateAssetsRequest = {
            categoryId,
            subcategoryId: subcategory?.id ?? null,
            topicId: subcategory?.topics.length ? this.topicId() : null,
            assets: files.map((file) => ({
                title: file.name.trim() || 'Untitled',
                fileType: file.fileType,
                url: file.url,
                size: file.size,
            })),
            tags: this.tags(),
        };

        this.isSaving.set(true);
        this.saveError.set(null);
        this.libraryService.createAssets(request).subscribe({
            next: () => {
                this.isSaving.set(false);
                this.saved.emit(request);
            },
            error: (error: unknown) => {
                console.error('[AssetUpload] Failed to save the assets:', error);
                this.isSaving.set(false);
                this.saveError.set(
                    apiErrorMessage(error, "Uploaded, but couldn't add the files to the library."),
                );
            },
        });
    }

    /**
     * Marks one upload as finished (or none, after starting a batch); once nothing is in
     * flight, saves what was uploaded.
     *
     * @param fileId - The finished file, or null
     * @returns {void}
     */
    private settle(fileId: string | null): void {
        if (fileId) {
            this.uploads.delete(fileId);
        }
        if (this.uploads.size > 0) {
            return;
        }
        this.isUploading.set(false);
        this.save();
    }

    /**
     * Maps an uploaded file's extension to a library file format.
     *
     * @param extension - Lower-case extension without the dot
     * @returns {LibraryFileType | null} The format, or null when unsupported
     */
    private toFileType(extension: string): LibraryFileType | null {
        switch (extension) {
            case 'png':
                return 'png';
            case 'jpg':
            case 'jpeg':
                return 'jpg';
            case 'mp4':
                return 'mp4';
            default:
                return null;
        }
    }
}
