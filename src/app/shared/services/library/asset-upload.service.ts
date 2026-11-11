/** Angular Imports */
import { Injectable } from '@angular/core';

/** Third Party Imports */
import { Observable } from 'rxjs';

/** Local Imports */
import type { AssetUploadEvent } from '@shared/models/library/asset-upload-event.type';

/**
 * Uploads Mini-Library files to Filestack and reports progress.
 *
 * @remarks
 * `filestack-js` is imported on first upload, so it stays out of the page's bundle until
 * someone actually uploads.
 */
@Injectable({
    providedIn: 'root',
})
export class AssetUploadService {
    /**
     * Uploads one file to Filestack. Unsubscribing cancels it.
     *
     * @param file - The browser file
     * @param apiKey - Filestack API key, from LibraryService.getUploadConfig()
     * @returns {Observable<AssetUploadEvent>} Progress events, then one "done" event with
     * the file's CDN URL
     * @throws {Error} Through the observable, when the upload fails
     *
     * @example
     * this.assetUploadService.upload(file, apiKey).subscribe((event) => {
     *     if (event.type === 'done') console.log(event.url);
     * });
     */
    public upload(file: File, apiKey: string): Observable<AssetUploadEvent> {
        return new Observable<AssetUploadEvent>((subscriber) => {
            // filestack-js cancels through a token object it adds cancel() to
            const token: { cancel?: () => void } = {};
            let finished = false;

            import('filestack-js')
                .then(({ init }) =>
                    init(apiKey).upload(
                        file,
                        {
                            onProgress: (event: { totalPercent: number }) =>
                                subscriber.next({
                                    type: 'progress',
                                    percent: Math.min(99, Math.round(event.totalPercent)),
                                }),
                        },
                        { filename: file.name },
                        token,
                    ),
                )
                .then((result: { url?: unknown; status?: unknown }) => {
                    finished = true;
                    if (typeof result.url !== 'string') {
                        throw new Error(
                            `Filestack didn't return a file URL (${String(result.status)})`,
                        );
                    }
                    subscriber.next({ type: 'done', url: result.url });
                    subscriber.complete();
                })
                .catch((error: unknown) => {
                    finished = true;
                    subscriber.error(error instanceof Error ? error : new Error('Upload failed'));
                });

            return () => {
                if (!finished) {
                    token.cancel?.();
                }
            };
        });
    }
}
