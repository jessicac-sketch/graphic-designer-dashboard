/** Angular Imports */
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

/** Third Party Imports */
import { Observable, map } from 'rxjs';

/** Local Imports */
import type {
    LibraryAsset,
    LibraryAssetList,
    LibraryAssetQuery,
    LibraryComment,
    LibraryCreateAssetsRequest,
    LibraryDashboard,
    LibraryTaxonomy,
    LibraryUploadConfig,
} from '@shared/interfaces/library';
import type { LibraryAssetStatus } from '@shared/models/library/library-asset-status.type';

/**
 * Loads the Mini-Library's categories and assets from the BFF (`/api/library`).
 */
@Injectable({
    providedIn: 'root',
})
export class LibraryService {
    /**
     * HTTP client for BFF calls
     * @type {HttpClient}
     */
    private readonly http = inject(HttpClient);

    /**
     * Base URL of the library endpoints
     * @type {string}
     */
    private readonly apiUrl = '/api/library';

    /**
     * Fetches the categories with their subcategories and topics, with counts.
     *
     * @returns {Observable<LibraryTaxonomy>} The taxonomy
     *
     * @example
     * this.libraryService.getTaxonomy().subscribe((taxonomy) => console.log(taxonomy.categories));
     */
    public getTaxonomy(): Observable<LibraryTaxonomy> {
        return this.http
            .get<{ data: LibraryTaxonomy }>(`${this.apiUrl}/taxonomy`)
            .pipe(map((response) => response.data));
    }

    /**
     * Fetches the assets matching a query, with per-format counts.
     *
     * @param query - Category, sport, topic, search, format and order
     * @returns {Observable<LibraryAssetList>} The assets and counts
     *
     * @example
     * this.libraryService
     *     .getAssets({ categoryId: 'channel', subcategoryId: 'badminton', topicId: null, search: '',
     *         fileType: null, sort: 'updated', direction: 'desc' })
     *     .subscribe((list) => console.log(list.assets.length));
     */
    public getAssets(query: LibraryAssetQuery): Observable<LibraryAssetList> {
        let params = new HttpParams()
            .set('category', query.categoryId)
            .set('sort', query.sort)
            .set('direction', query.direction);
        if (query.subcategoryId) {
            params = params.set('subcategory', query.subcategoryId);
        }
        if (query.topicId) {
            params = params.set('topic', query.topicId);
        }
        if (query.search) {
            params = params.set('search', query.search);
        }
        if (query.fileType) {
            params = params.set('fileType', query.fileType);
        }
        if (query.status) {
            params = params.set('status', query.status);
        }

        return this.http
            .get<{ data: LibraryAssetList }>(`${this.apiUrl}/assets`, { params })
            .pipe(map((response) => response.data));
    }

    /**
     * Moves a Channel or Sponsorship asset to another workflow status.
     *
     * @param id - The asset's ID
     * @param status - The new status
     * @returns {Observable<LibraryAsset>} The updated asset
     *
     * @example
     * this.libraryService.updateStatus(asset.id, 'approval').subscribe((updated) => …);
     */
    public updateStatus(id: string, status: LibraryAssetStatus): Observable<LibraryAsset> {
        return this.http
            .patch<{ data: LibraryAsset }>(
                `${this.apiUrl}/assets/${encodeURIComponent(id)}/status`,
                { status },
            )
            .pipe(map((response) => response.data));
    }

    /**
     * Fetches the Dashboard's numbers.
     *
     * @returns {Observable<LibraryDashboard>} Totals, workflow, uploads per week, lists
     */
    public getDashboard(): Observable<LibraryDashboard> {
        return this.http
            .get<{ data: LibraryDashboard }>(`${this.apiUrl}/dashboard`)
            .pipe(map((response) => response.data));
    }

    /**
     * Fetches one asset, for its page.
     *
     * @param id - The asset's ID
     * @returns {Observable<LibraryAsset>} The asset (errors with 404 when there's none)
     */
    public getAsset(id: string): Observable<LibraryAsset> {
        return this.http
            .get<{ data: LibraryAsset }>(`${this.apiUrl}/assets/${encodeURIComponent(id)}`)
            .pipe(map((response) => response.data));
    }

    /**
     * Changes an asset's description.
     *
     * @param id - The asset's ID
     * @param description - The new description (may be empty)
     * @returns {Observable<LibraryAsset>} The updated asset
     */
    public updateDescription(id: string, description: string): Observable<LibraryAsset> {
        return this.http
            .patch<{ data: LibraryAsset }>(`${this.apiUrl}/assets/${encodeURIComponent(id)}`, {
                description,
            })
            .pipe(map((response) => response.data));
    }

    /**
     * Renames an asset (its title, which is also its file name without the extension).
     * The file's link stays the same.
     *
     * @param id - The asset's ID
     * @param title - The new name
     * @returns {Observable<LibraryAsset>} The updated asset
     */
    public renameAsset(id: string, title: string): Observable<LibraryAsset> {
        return this.http
            .patch<{ data: LibraryAsset }>(`${this.apiUrl}/assets/${encodeURIComponent(id)}`, {
                title,
            })
            .pipe(map((response) => response.data));
    }

    /**
     * Fetches an asset's comment threads, each with its replies, oldest first.
     *
     * @param assetId - The asset's ID
     * @returns {Observable<LibraryComment[]>} The threads
     */
    public getComments(assetId: string): Observable<LibraryComment[]> {
        return this.http
            .get<{
                data: LibraryComment[];
            }>(`${this.apiUrl}/assets/${encodeURIComponent(assetId)}/comments`)
            .pipe(map((response) => response.data));
    }

    /**
     * Adds a comment by the signed-in user, or a reply to a top-level comment.
     *
     * @param assetId - The asset's ID
     * @param body - The text
     * @param parentId - The top-level comment replied to, or null for a new thread
     * @returns {Observable<LibraryComment>} The new comment
     */
    public addComment(
        assetId: string,
        body: string,
        parentId: string | null,
    ): Observable<LibraryComment> {
        return this.http
            .post<{
                data: LibraryComment;
            }>(`${this.apiUrl}/assets/${encodeURIComponent(assetId)}/comments`, { body, parentId })
            .pipe(map((response) => response.data));
    }

    /**
     * Marks a thread resolved, or open again.
     *
     * @param commentId - The top-level comment's ID
     * @param resolved - True to resolve, false to reopen
     * @returns {Observable<LibraryComment>} The updated comment (without replies)
     */
    public setCommentResolved(commentId: string, resolved: boolean): Observable<LibraryComment> {
        return this.http
            .patch<{
                data: LibraryComment;
            }>(`${this.apiUrl}/comments/${encodeURIComponent(commentId)}`, { resolved })
            .pipe(map((response) => response.data));
    }

    /**
     * Deletes one of the signed-in user's comments (and its replies).
     *
     * @param commentId - The comment's ID
     * @returns {Observable<void>} Completes once deleted
     */
    public deleteComment(commentId: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/comments/${encodeURIComponent(commentId)}`);
    }

    /**
     * Fetches how files are uploaded: the Filestack key, or null when not configured.
     *
     * @returns {Observable<LibraryUploadConfig>} The upload configuration
     */
    public getUploadConfig(): Observable<LibraryUploadConfig> {
        return this.http
            .get<{ data: LibraryUploadConfig }>(`${this.apiUrl}/upload-config`)
            .pipe(map((response) => response.data));
    }

    /**
     * Files uploaded files under a category (and its subcategory / topic, where it has
     * them).
     *
     * @param request - Where to file them, and the files
     * @returns {Observable<LibraryAsset[]>} The new assets
     *
     * @example
     * this.libraryService
     *     .createAssets({ categoryId: 'reels', subcategoryId: null, topicId: null,
     *         assets: [{ title: 'Venue Tour', fileType: 'mp4', url: null }] })
     *     .subscribe((assets) => console.log(assets.length));
     */
    public createAssets(request: LibraryCreateAssetsRequest): Observable<LibraryAsset[]> {
        return this.http
            .post<{ data: LibraryAsset[] }>(`${this.apiUrl}/assets`, request)
            .pipe(map((response) => response.data));
    }
}
