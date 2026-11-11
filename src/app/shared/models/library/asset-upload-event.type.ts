/**
 * What an upload in progress reports: its progress (0-100), then once done, the uploaded
 * file's CDN URL.
 */
export type AssetUploadEvent =
    { type: 'progress'; percent: number } | { type: 'done'; url: string };
