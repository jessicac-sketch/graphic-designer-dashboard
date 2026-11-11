/** Angular Imports */
import { DatePipe } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    effect,
    ElementRef,
    inject,
    signal,
    viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';

/** Third Party Imports */
import { Button, Card, Skeleton } from '@ntv360/component-pantry';
import { catchError, map, of, switchMap } from 'rxjs';

/** Local Imports */
import { PageHeaderComponent } from '@shared/components/page-header';
import { StatusMenuComponent } from '@shared/components/status-menu';
import type { LibraryAsset } from '@shared/interfaces/library';
import { APP_NAME } from '@shared/models/app';
import {
    LIBRARY_FILE_TYPE_LABELS,
    LIBRARY_TEXT_LIMITS,
    type LibraryAssetStatus,
} from '@shared/models/library';
import { CARD_CONFIG } from '@shared/models/ui';
import { LibraryService } from '@shared/services/library';
import { apiErrorMessage } from '@shared/utils/api-error-message.util';
import { formatFileSize } from '@shared/utils/file-size.util';
import { formatMediaDuration } from '@shared/utils/media-duration.util';
import { AssetCommentsComponent } from './components/asset-comments';

/**
 * One Mini-Library asset on its own page (opened in a new tab from the Mini-Library,
 * Channel and Sponsorship lists): the image or video player, the file (shareable link,
 * copy, download), its details with an editable description, its workflow status where
 * it has one, and the comment threads.
 */
@Component({
    selector: 'app-asset-detail',
    imports: [
        AssetCommentsComponent,
        Button,
        Card,
        DatePipe,
        PageHeaderComponent,
        ReactiveFormsModule,
        RouterLink,
        Skeleton,
        StatusMenuComponent,
    ],
    templateUrl: './asset-detail.component.html',
    styleUrl: './asset-detail.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class AssetDetailComponent {
    /**
     * Library data from the BFF
     * @type {LibraryService}
     */
    private readonly libraryService = inject(LibraryService);

    /**
     * Browser tab title
     * @type {Title}
     */
    private readonly title = inject(Title);

    /**
     * Flat, outlined card look
     * @type {Partial<CardConfig>}
     */
    protected readonly cardConfig = CARD_CONFIG;

    /**
     * Longest description, in characters
     * @type {number}
     */
    protected readonly maxDescription = LIBRARY_TEXT_LIMITS.maxDescription;

    /**
     * The asset ID from the URL
     * @type {Signal<string>}
     */
    private readonly id = toSignal(
        inject(ActivatedRoute).paramMap.pipe(map((params) => params.get('id') ?? '')),
        { initialValue: '' },
    );

    /**
     * Bumped to reload the asset
     * @type {WritableSignal<number>}
     */
    private readonly reloads = signal(0);

    /**
     * The asset: undefined while loading, null when it couldn't be loaded
     * @type {WritableSignal<LibraryAsset | null | undefined>}
     */
    protected readonly asset = signal<LibraryAsset | null | undefined>(undefined);

    /**
     * Why the asset couldn't be loaded
     * @type {WritableSignal<string>}
     */
    protected readonly loadError = signal("Couldn't load this asset.");

    /**
     * Whether the asset doesn't exist (deleted, or a wrong link)
     * @type {WritableSignal<boolean>}
     */
    protected readonly notFound = signal(false);

    /**
     * Category labels by ID, from the taxonomy (empty until it loads)
     * @type {Signal<ReadonlyMap<string, string>>}
     */
    private readonly categoryLabels = toSignal(
        this.libraryService.getTaxonomy().pipe(
            map(
                (taxonomy) =>
                    new Map(taxonomy.categories.map((category) => [category.id, category.label])),
            ),
            catchError(() => of(new Map<string, string>())),
        ),
        { initialValue: new Map<string, string>() },
    );

    /**
     * The asset's category name, e.g. "Channel"
     * @type {Signal<string>}
     */
    protected readonly categoryLabel = computed(() => {
        const asset = this.asset();
        return asset ? (this.categoryLabels().get(asset.categoryId) ?? asset.categoryId) : '';
    });

    /**
     * Where the asset is filed, e.g. "Channel › Extreme Sports › Skiing"
     * @type {Signal<string>}
     */
    protected readonly location = computed(() => {
        const asset = this.asset();
        if (!asset) {
            return '';
        }
        // A category that isn't split already has its own label as the path
        const parts = asset.subcategoryId ? [this.categoryLabel(), ...asset.path] : asset.path;
        return parts.filter(Boolean).join(' › ');
    });

    /**
     * The file's name, e.g. "Rollercoaster POV.png"
     * @type {Signal<string>}
     */
    protected readonly fileName = computed(() => {
        const asset = this.asset();
        return asset ? `${asset.title}.${asset.fileType}` : '';
    });

    /**
     * The file format's name, e.g. "PNG image"
     * @type {Signal<string>}
     */
    protected readonly fileTypeLabel = computed(() => {
        const asset = this.asset();
        return asset ? LIBRARY_FILE_TYPE_LABELS[asset.fileType] : '';
    });

    /**
     * The file size, e.g. "1.7 MB", or "—" when unknown
     * @type {Signal<string>}
     */
    protected readonly fileSize = computed(() => {
        const size = this.asset()?.fileSize;
        return size === null || size === undefined ? '—' : formatFileSize(size);
    });

    /**
     * Width × height, read from the media once it loads, or null before
     * @type {WritableSignal<string | null>}
     */
    protected readonly dimensions = signal<string | null>(null);

    /**
     * A video's length, read from the player once it loads, or null (images, or before)
     * @type {WritableSignal<string | null>}
     */
    protected readonly duration = signal<string | null>(null);

    /**
     * Whether the video is playing (hides the big play button)
     * @type {WritableSignal<boolean>}
     */
    protected readonly isPlaying = signal(false);

    /**
     * Whether the link was just copied (shows "Copied")
     * @type {WritableSignal<boolean>}
     */
    protected readonly copied = signal(false);

    /**
     * Whether a status change is being saved
     * @type {WritableSignal<boolean>}
     */
    protected readonly savingStatus = signal(false);

    /**
     * Whether the name is being edited
     * @type {WritableSignal<boolean>}
     */
    protected readonly renaming = signal(false);

    /**
     * Name editor (the title, without the file extension)
     * @type {FormControl<string>}
     */
    protected readonly titleControl = new FormControl('', { nonNullable: true });

    /**
     * Whether the new name is being saved
     * @type {WritableSignal<boolean>}
     */
    protected readonly savingTitle = signal(false);

    /**
     * The name field, to select its text when it opens
     * @type {Signal<ElementRef<HTMLInputElement> | undefined>}
     */
    private readonly titleInput = viewChild<ElementRef<HTMLInputElement>>('titleInput');

    /**
     * Whether the description is being edited
     * @type {WritableSignal<boolean>}
     */
    protected readonly editingDescription = signal(false);

    /**
     * Description editor
     * @type {FormControl<string>}
     */
    protected readonly descriptionControl = new FormControl('', { nonNullable: true });

    /**
     * Whether the description is being saved
     * @type {WritableSignal<boolean>}
     */
    protected readonly savingDescription = signal(false);

    /**
     * Why the last change (status, description, copy) failed, or null
     * @type {WritableSignal<string | null>}
     */
    protected readonly actionError = signal<string | null>(null);

    /**
     * Timer that hides "Copied"
     * @type {ReturnType<typeof setTimeout> | undefined}
     */
    private copiedTimer: ReturnType<typeof setTimeout> | undefined;

    constructor() {
        toObservable(computed(() => ({ id: this.id(), reloads: this.reloads() })))
            .pipe(
                switchMap(({ id }) => {
                    this.asset.set(undefined);
                    this.notFound.set(false);
                    this.dimensions.set(null);
                    this.duration.set(null);
                    this.isPlaying.set(false);
                    return this.libraryService.getAsset(id).pipe(
                        catchError((error: unknown) => {
                            console.error('[AssetDetail] Failed to load the asset:', error);
                            this.notFound.set(
                                (error as { status?: number } | null)?.status === 404,
                            );
                            this.loadError.set(apiErrorMessage(error, "Couldn't load this asset."));
                            return of(null);
                        }),
                    );
                }),
                takeUntilDestroyed(inject(DestroyRef)),
            )
            .subscribe((asset) => this.asset.set(asset));

        // The tab shows the asset's title
        effect(() => {
            const asset = this.asset();
            if (asset) {
                this.title.setTitle(`${asset.title} · ${APP_NAME}`);
            }
        });

        inject(DestroyRef).onDestroy(() => clearTimeout(this.copiedTimer));
    }

    /**
     * Reads an image's size once it loads.
     *
     * @param event - The image's load event
     * @returns {void}
     */
    protected onImageLoad(event: Event): void {
        const image = event.target as HTMLImageElement;
        this.dimensions.set(`${image.naturalWidth} × ${image.naturalHeight}`);
    }

    /**
     * Reads a video's size and length once its metadata loads.
     *
     * @param event - The video's loadedmetadata event
     * @returns {void}
     */
    protected onVideoMetadata(event: Event): void {
        const video = event.target as HTMLVideoElement;
        if (video.videoWidth) {
            this.dimensions.set(`${video.videoWidth} × ${video.videoHeight}`);
        }
        if (Number.isFinite(video.duration)) {
            this.duration.set(formatMediaDuration(video.duration));
        }
    }

    /**
     * Copies the file's shareable link.
     *
     * @returns {void}
     */
    protected copyLink(): void {
        const asset = this.asset();
        if (!asset) {
            return;
        }
        navigator.clipboard.writeText(asset.fileUrl).then(
            () => {
                this.copied.set(true);
                clearTimeout(this.copiedTimer);
                this.copiedTimer = setTimeout(() => this.copied.set(false), 2000);
            },
            () => this.actionError.set("Couldn't copy the link. Select it and copy it instead."),
        );
    }

    /**
     * Downloads the original file (Filestack serves it as an attachment with `dl=true`).
     *
     * @returns {void}
     */
    protected download(): void {
        const asset = this.asset();
        if (asset) {
            window.open(`${asset.fileUrl}?dl=true`, '_blank', 'noopener');
        }
    }

    /**
     * Moves the asset to another workflow status.
     *
     * @param status - Its new status
     * @returns {void}
     */
    protected changeStatus(status: LibraryAssetStatus): void {
        const asset = this.asset();
        if (!asset) {
            return;
        }
        this.savingStatus.set(true);
        this.actionError.set(null);
        this.libraryService.updateStatus(asset.id, status).subscribe({
            next: (updated) => {
                this.savingStatus.set(false);
                this.asset.set(updated);
            },
            error: (error: unknown) => {
                console.error('[AssetDetail] Failed to change the status:', error);
                this.savingStatus.set(false);
                this.actionError.set(apiErrorMessage(error, "Couldn't change the status."));
            },
        });
    }

    /**
     * Opens the rename field with the current name, selected.
     *
     * @returns {void}
     */
    protected startRename(): void {
        this.titleControl.setValue(this.asset()?.title ?? '');
        this.renaming.set(true);
        // Once the field is rendered
        setTimeout(() => this.titleInput()?.nativeElement.select());
    }

    /**
     * Saves the new name (the browser tab and header follow).
     *
     * @returns {void}
     */
    protected saveTitle(): void {
        const asset = this.asset();
        const title = this.titleControl.value.trim();
        if (!asset || !title || this.savingTitle()) {
            return;
        }
        if (title === asset.title) {
            this.renaming.set(false);
            return;
        }
        this.savingTitle.set(true);
        this.actionError.set(null);
        this.libraryService.renameAsset(asset.id, title).subscribe({
            next: (updated) => {
                this.savingTitle.set(false);
                this.renaming.set(false);
                this.asset.set(updated);
            },
            error: (error: unknown) => {
                console.error('[AssetDetail] Failed to rename the asset:', error);
                this.savingTitle.set(false);
                this.actionError.set(apiErrorMessage(error, "Couldn't rename the asset."));
            },
        });
    }

    /**
     * Opens the description editor with the current description.
     *
     * @returns {void}
     */
    protected editDescription(): void {
        this.descriptionControl.setValue(this.asset()?.description ?? '');
        this.editingDescription.set(true);
    }

    /**
     * Saves the edited description.
     *
     * @returns {void}
     */
    protected saveDescription(): void {
        const asset = this.asset();
        if (!asset || this.savingDescription()) {
            return;
        }
        this.savingDescription.set(true);
        this.actionError.set(null);
        this.libraryService
            .updateDescription(asset.id, this.descriptionControl.value.trim())
            .subscribe({
                next: (updated) => {
                    this.savingDescription.set(false);
                    this.editingDescription.set(false);
                    this.asset.set(updated);
                },
                error: (error: unknown) => {
                    console.error('[AssetDetail] Failed to save the description:', error);
                    this.savingDescription.set(false);
                    this.actionError.set(apiErrorMessage(error, "Couldn't save the description."));
                },
            });
    }

    /**
     * Reloads the asset.
     *
     * @returns {void}
     */
    protected retry(): void {
        this.reloads.update((count) => count + 1);
    }

    /**
     * Name shown for an uploader: their email's local part.
     *
     * @param email - The uploader's email
     * @returns {string} E.g. "jessica.c"
     */
    protected nameOf(email: string): string {
        return email.split('@')[0] || email;
    }
}
