/** Angular Imports */
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    inject,
    input,
    signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

/** Third Party Imports */
import { Button, Skeleton } from '@ntv360/component-pantry';
import { catchError, type Observable, of, switchMap } from 'rxjs';

/** Local Imports */
import { AuthService } from '@core/services/auth/auth.service';
import type { LibraryComment } from '@shared/interfaces/library';
import { LIBRARY_TEXT_LIMITS } from '@shared/models/library';
import { InitialsPipe } from '@shared/pipes/initials';
import { LibraryService } from '@shared/services/library';
import { apiErrorMessage } from '@shared/utils/api-error-message.util';

/**
 * An asset's comments: threads (top-level comments) with one level of replies. Anyone can
 * comment, reply, and resolve or reopen a thread; authors can delete their own comments.
 * Resolved threads are folded away behind "Show resolved".
 *
 * @example
 * <app-asset-comments [assetId]="asset.id" />
 */
@Component({
    selector: 'app-asset-comments',
    imports: [Button, DatePipe, InitialsPipe, NgTemplateOutlet, ReactiveFormsModule, Skeleton],
    templateUrl: './asset-comments.component.html',
    styleUrl: './asset-comments.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
})
export class AssetCommentsComponent {
    /**
     * The asset whose comments are shown
     * @type {InputSignal<string>}
     */
    public readonly assetId = input.required<string>();

    /**
     * Library data from the BFF
     * @type {LibraryService}
     */
    private readonly libraryService = inject(LibraryService);

    /**
     * The signed-in user (to know which comments are theirs)
     * @type {AuthService}
     */
    private readonly authService = inject(AuthService);

    /**
     * Longest comment, in characters
     * @type {number}
     */
    protected readonly maxLength = LIBRARY_TEXT_LIMITS.maxComment;

    /**
     * New comment box
     * @type {FormControl<string>}
     */
    protected readonly draft = new FormControl('', { nonNullable: true });

    /**
     * Reply box (of the thread in `replyingTo`)
     * @type {FormControl<string>}
     */
    protected readonly replyDraft = new FormControl('', { nonNullable: true });

    /**
     * The thread whose reply box is open, or null
     * @type {WritableSignal<string | null>}
     */
    protected readonly replyingTo = signal<string | null>(null);

    /**
     * The comment waiting for its delete to be confirmed, or null
     * @type {WritableSignal<string | null>}
     */
    protected readonly confirmingDelete = signal<string | null>(null);

    /**
     * Whether resolved threads are shown
     * @type {WritableSignal<boolean>}
     */
    protected readonly showResolved = signal(false);

    /**
     * What's being saved: "new", a thread ID (reply / resolve) or a comment ID (delete)
     * @type {WritableSignal<string | null>}
     */
    protected readonly busy = signal<string | null>(null);

    /**
     * Why the last action failed, or null
     * @type {WritableSignal<string | null>}
     */
    protected readonly actionError = signal<string | null>(null);

    /**
     * Why the comments failed to load
     * @type {WritableSignal<string>}
     */
    protected readonly loadError = signal("Couldn't load the comments.");

    /**
     * Bumped to reload the comments
     * @type {WritableSignal<number>}
     */
    private readonly reloads = signal(0);

    /**
     * The threads: undefined while loading, null on error
     * @type {WritableSignal<LibraryComment[] | null | undefined>}
     */
    protected readonly threads = signal<LibraryComment[] | null | undefined>(undefined);

    /**
     * The signed-in user's email
     * @type {Signal<string>}
     */
    protected readonly me = computed(() => this.authService.user()?.email ?? '');

    /**
     * Comments and replies in all
     * @type {Signal<number>}
     */
    protected readonly total = computed(() =>
        (this.threads() ?? []).reduce((sum, thread) => sum + 1 + thread.replies.length, 0),
    );

    /**
     * Threads still open
     * @type {Signal<LibraryComment[]>}
     */
    protected readonly openThreads = computed(() =>
        (this.threads() ?? []).filter((thread) => !thread.resolvedAt),
    );

    /**
     * Resolved threads
     * @type {Signal<LibraryComment[]>}
     */
    protected readonly resolvedThreads = computed(() =>
        (this.threads() ?? []).filter((thread) => !!thread.resolvedAt),
    );

    constructor() {
        toObservable(computed(() => ({ id: this.assetId(), reloads: this.reloads() })))
            .pipe(
                switchMap(({ id }) => {
                    this.threads.set(undefined);
                    return this.libraryService.getComments(id).pipe(
                        catchError((error: unknown) => {
                            console.error('[AssetComments] Failed to load the comments:', error);
                            this.loadError.set(
                                apiErrorMessage(error, "Couldn't load the comments."),
                            );
                            return of(null);
                        }),
                    );
                }),
                takeUntilDestroyed(inject(DestroyRef)),
            )
            .subscribe((threads) => this.threads.set(threads));
    }

    /**
     * Posts the new comment as a new thread.
     *
     * @returns {void}
     */
    protected post(): void {
        const body = this.draft.value.trim();
        if (!body || this.busy()) {
            return;
        }
        this.run('new', this.libraryService.addComment(this.assetId(), body, null), (comment) => {
            this.threads.update((threads) => [...(threads ?? []), comment]);
            this.draft.setValue('');
        });
    }

    /**
     * Opens a thread's reply box (closing any other).
     *
     * @param thread - The thread
     * @returns {void}
     */
    protected startReply(thread: LibraryComment): void {
        this.replyingTo.set(thread.id);
        this.replyDraft.setValue('');
    }

    /**
     * Posts the reply to the thread whose reply box is open.
     *
     * @param thread - The thread
     * @returns {void}
     */
    protected reply(thread: LibraryComment): void {
        const body = this.replyDraft.value.trim();
        if (!body || this.busy()) {
            return;
        }
        this.run(
            thread.id,
            this.libraryService.addComment(this.assetId(), body, thread.id),
            (reply) => {
                this.updateThread(thread.id, (entry) => ({
                    ...entry,
                    replies: [...entry.replies, reply],
                }));
                this.replyingTo.set(null);
                this.replyDraft.setValue('');
            },
        );
    }

    /**
     * Resolves an open thread, or reopens a resolved one.
     *
     * @param thread - The thread
     * @returns {void}
     */
    protected toggleResolved(thread: LibraryComment): void {
        if (this.busy()) {
            return;
        }
        this.run(
            thread.id,
            this.libraryService.setCommentResolved(thread.id, !thread.resolvedAt),
            (updated) => {
                this.updateThread(thread.id, (entry) => ({
                    ...entry,
                    resolvedAt: updated.resolvedAt,
                    resolvedBy: updated.resolvedBy,
                }));
                if (this.replyingTo() === thread.id) {
                    this.replyingTo.set(null);
                }
            },
        );
    }

    /**
     * Deletes one of the user's comments (a thread goes with its replies), once confirmed.
     *
     * @param comment - The comment
     * @returns {void}
     */
    protected remove(comment: LibraryComment): void {
        if (this.busy()) {
            return;
        }
        this.run(comment.id, this.libraryService.deleteComment(comment.id), () => {
            this.confirmingDelete.set(null);
            this.threads.update((threads) =>
                (threads ?? [])
                    .filter((thread) => thread.id !== comment.id)
                    .map((thread) => ({
                        ...thread,
                        replies: thread.replies.filter((reply) => reply.id !== comment.id),
                    })),
            );
        });
    }

    /**
     * Posts with Ctrl/⌘ + Enter from a comment box.
     *
     * @param event - The key event
     * @param thread - The thread replied to, or null for the new comment box
     * @returns {void}
     */
    protected onKeydown(event: KeyboardEvent, thread: LibraryComment | null): void {
        if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            if (thread) {
                this.reply(thread);
            } else {
                this.post();
            }
        }
    }

    /**
     * Name shown for an author: their email's local part.
     *
     * @param email - The author's email
     * @returns {string} E.g. "jessica.c"
     */
    protected nameOf(email: string | null): string {
        return (email ?? '').split('@')[0] || 'Someone';
    }

    /**
     * Reloads the comments.
     *
     * @returns {void}
     */
    protected retry(): void {
        this.reloads.update((count) => count + 1);
    }

    /**
     * Runs a comment request, marking `key` busy until it settles.
     *
     * @param key - What is busy (see `busy`)
     * @param request - The request
     * @param onDone - What to do with its result
     * @returns {void}
     */
    private run<T>(key: string, request: Observable<T>, onDone: (result: T) => void): void {
        this.busy.set(key);
        this.actionError.set(null);
        request.subscribe({
            next: (result) => {
                this.busy.set(null);
                onDone(result);
            },
            complete: () => this.busy.set(null),
            error: (error: unknown) => {
                console.error('[AssetComments] Request failed:', error);
                this.busy.set(null);
                this.actionError.set(apiErrorMessage(error, 'Something went wrong. Try again.'));
            },
        });
    }

    /**
     * Replaces one thread in the list.
     *
     * @param id - The thread's ID
     * @param change - Builds the new thread from the old one
     * @returns {void}
     */
    private updateThread(id: string, change: (thread: LibraryComment) => LibraryComment): void {
        this.threads.update((threads) =>
            (threads ?? []).map((thread) => (thread.id === id ? change(thread) : thread)),
        );
    }
}
