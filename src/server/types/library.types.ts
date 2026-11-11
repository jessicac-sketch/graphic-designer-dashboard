/**
 * Type definitions for the Mini-Library: creative assets filed under a content category
 * and, where the category is split further, a subcategory (e.g. a sport for Channel) and
 * a topic within it.
 */

/** A top-level content category of the library. */
export type LibraryCategoryId =
    'ad-content' | 'channel' | 'sponsorship' | 'reels' | 'statics' | 'menu-board';

/** File format of an asset. */
export type LibraryFileType = 'png' | 'jpg' | 'mp4';

/**
 * Workflow status of a Channel asset: Graphics QC review → upper management approval →
 * ready to upload to the other system's dashboard → live there.
 */
export type LibraryAssetStatus = 'review' | 'approval' | 'ready' | 'live';

/** Order of an asset listing. */
export type LibrarySort = 'updated' | 'title';

/** Direction of an asset listing's order. */
export type LibrarySortDirection = 'asc' | 'desc';

/** A labelled entry of the library taxonomy (category, subcategory or topic). */
export interface LibraryTaxonomyEntry<T extends string = string> {
    /** Stable identifier, used in URLs and queries */
    id: T;

    /** Visible label */
    label: string;
}

/** A subcategory and the topics it is split into (empty when it isn't). */
export interface LibrarySubcategoryConfig extends LibraryTaxonomyEntry {
    /** What this subcategory's topics are called, e.g. "Sport"; null without any */
    topicLabel: string | null;

    /** Topics, in display order */
    topics: readonly LibraryTaxonomyEntry[];
}

/** A category and how it is split (no subcategories when it isn't). */
export interface LibraryCategoryConfig extends LibraryTaxonomyEntry<LibraryCategoryId> {
    /** What the category's subcategories are called, e.g. "Channel"; null without any */
    subcategoryLabel: string | null;

    /** Subcategories, in display order */
    subcategories: readonly LibrarySubcategoryConfig[];
}

/** One creative asset in the library. */
export interface LibraryAsset {
    /** Asset identifier */
    id: string;

    /** Asset title */
    title: string;

    /** Category the asset is filed under */
    categoryId: LibraryCategoryId;

    /** Subcategory within the category, or null when the category isn't split */
    subcategoryId: string | null;

    /** Topic within the subcategory, or null when the subcategory isn't split */
    topicId: string | null;

    /** Where the asset sits, as labels: e.g. [subcategory, topic], or [category] */
    path: string[];

    /** File format */
    fileType: LibraryFileType;

    /** Version number, starting at 1 */
    version: number;

    /** Last update, as a UTC ISO timestamp */
    updatedAt: string;

    /** Preview image URL */
    thumbnailUrl: string;

    /** The uploaded file (Filestack CDN URL) */
    fileUrl: string;

    /** Tags for search, e.g. ["Buyer", "dog lover"] (may be empty) */
    tags: string[];

    /** Workflow status (Channel assets), or null for categories without a workflow */
    status: LibraryAssetStatus | null;

    /** When the status last changed (UTC ISO timestamp), or null */
    statusUpdatedAt: string | null;

    /** Free-text description (may be empty) */
    description: string;

    /** File size in bytes, or null when unknown (uploaded before sizes were kept) */
    fileSize: number | null;

    /** Who uploaded it (their email), or null when unknown */
    createdBy: string | null;

    /** When it was added to the library, as a UTC ISO timestamp */
    createdAt: string;
}

/** A row of the `library_assets` table (supabase/migrations). */
export interface LibraryAssetRow {
    id: string;
    title: string;
    category_id: string;
    subcategory_id: string | null;
    topic_id: string | null;
    path: string[];
    file_type: string;
    version: number;
    file_url: string;
    filestack_handle: string;
    thumbnail_url: string | null;
    tags: string[];
    status: string | null;
    status_updated_at: string | null;
    description: string | null;
    file_size: number | null;
    created_by: string | null;
    search_text: string;
    created_at: string;
    updated_at: string;
}

/** A row of the `library_asset_counts` view. */
export interface LibraryAssetCountRow {
    category_id: string;
    subcategory_id: string | null;
    topic_id: string | null;
    asset_count: number;
}

/** A taxonomy entry with how many assets it holds. */
export interface LibraryCount<T extends string = string> extends LibraryTaxonomyEntry<T> {
    /** Number of assets filed under it */
    count: number;
}

/** A subcategory with its asset count and its topics' counts. */
export interface LibrarySubcategoryCount extends LibraryCount {
    /** What this subcategory's topics are called, e.g. "Sport"; null without any */
    topicLabel: string | null;

    /** Topics, in display order (empty when the subcategory isn't split) */
    topics: LibraryCount[];
}

/** A category with its asset count and its subcategories' counts. */
export interface LibraryCategoryCount extends LibraryCount<LibraryCategoryId> {
    /** What the subcategories are called, e.g. "Channel"; null without any */
    subcategoryLabel: string | null;

    /** Subcategories, in display order (empty when the category isn't split) */
    subcategories: LibrarySubcategoryCount[];
}

/** The library's navigation tree with asset counts. */
export interface LibraryTaxonomy {
    /** Every category, in display order */
    categories: LibraryCategoryCount[];
}

/** Filters and order for an asset listing. */
export interface LibraryAssetQuery {
    /** Only assets of this category (optional) */
    categoryId?: LibraryCategoryId;

    /** Only assets of this subcategory (optional) */
    subcategoryId?: string;

    /** Only assets of this topic (optional) */
    topicId?: string;

    /** Case-insensitive match on the title or path (optional) */
    search?: string;

    /** Only assets of this file format (optional) */
    fileType?: LibraryFileType;

    /** Only assets with this workflow status (optional) */
    status?: LibraryAssetStatus;

    /** Order */
    sort: LibrarySort;

    /** Order direction */
    direction: LibrarySortDirection;
}

/** How the browser uploads files. */
export interface LibraryUploadConfig {
    /** Filestack API key (public), or null when uploads aren't configured */
    filestackApiKey: string | null;
}

/** One uploaded file to add to the library. */
export interface LibraryNewAsset {
    /** Asset title */
    title: string;

    /** File format */
    fileType: LibraryFileType;

    /** Uploaded file URL: https://cdn.filestackcontent.com/<handle> */
    url: string;

    /** File size in bytes, or null when unknown */
    size: number | null;
}

/** Uploaded files to file under one category / subcategory / topic. */
export interface LibraryCreateAssetsRequest {
    /** Category to file the assets under */
    categoryId: LibraryCategoryId;

    /** Subcategory (required when the category has subcategories), or null */
    subcategoryId: string | null;

    /** Topic (required when the subcategory has topics), or null */
    topicId: string | null;

    /** The files, at least one */
    assets: LibraryNewAsset[];

    /** Tags for every file in the batch (optional; cleaned by the controller) */
    tags: string[];
}

/** The database filters of a listing, besides the file format. */
export interface LibraryQueryScope {
    /** Exact column matches (category_id / subcategory_id / topic_id) */
    match: Record<string, string>;

    /** LIKE pattern on search_text, or null for no search */
    searchPattern: string | null;
}

/** An asset listing with per-format counts. */
export interface LibraryAssetList {
    /** The matching assets, in the requested order */
    assets: LibraryAsset[];

    /** Assets matching every filter except the file format, all and per format */
    fileTypeCounts: Record<LibraryFileType | 'all', number>;

    /**
     * For a category with a workflow (Channel): assets matching every filter except the
     * status, all and per status. Null for other categories.
     */
    statusCounts: Record<LibraryAssetStatus | 'all', number> | null;
}

/** Editable details of an asset (PATCH /api/library/assets/:id); only the fields given change. */
export interface LibraryAssetDetailsUpdate {
    /** New title, i.e. the file name without its extension (1 to 200 characters) */
    title?: string;

    /** New description (may be empty) */
    description?: string;
}

/** A row of the `library_asset_comments` table (supabase/migrations). */
export interface LibraryCommentRow {
    id: string;
    asset_id: string;
    parent_id: string | null;
    author: string;
    body: string;
    resolved_at: string | null;
    resolved_by: string | null;
    created_at: string;
}

/** A comment on an asset; a top-level one carries its replies (one level deep). */
export interface LibraryComment {
    /** Comment identifier */
    id: string;

    /** The asset it is about */
    assetId: string;

    /** The comment it replies to, or null for a top-level comment */
    parentId: string | null;

    /** Who wrote it (their email) */
    author: string;

    /** The text */
    body: string;

    /** When it was written, as a UTC ISO timestamp */
    createdAt: string;

    /** When its thread was marked resolved (top-level only), or null */
    resolvedAt: string | null;

    /** Who marked it resolved, or null */
    resolvedBy: string | null;

    /** Replies, oldest first (always empty on a reply) */
    replies: LibraryComment[];
}

/** Headline numbers of the library dashboard. */
export interface LibraryDashboardTotals {
    /** Assets in the library */
    assets: number;

    /** Assets added since Monday (UTC) */
    uploadsThisWeek: number;

    /** Assets added the week before */
    uploadsLastWeek: number;

    /** Workflow assets waiting on someone: in Review or Approval */
    waiting: number;

    /** Workflow assets Live */
    live: number;

    /** Comment threads not resolved */
    openThreads: number;
}

/** A workflow category's assets per status. */
export interface LibraryWorkflowSummary {
    /** Category, e.g. "channel" */
    categoryId: LibraryCategoryId;

    /** Its label, e.g. "Channel" */
    label: string;

    /** Assets in the category */
    total: number;

    /** Assets per status */
    counts: Record<LibraryAssetStatus, number>;
}

/** Assets added in one week. */
export interface LibraryWeekCount {
    /** The week's Monday, as YYYY-MM-DD (UTC) */
    weekStart: string;

    /** Assets added that week */
    count: number;
}

/** An asset waiting in Review or Approval. */
export interface LibraryWaitingAsset {
    /** Asset ID */
    id: string;

    /** Title */
    title: string;

    /** Where it's filed, e.g. "Channel › Extreme Sports › Skiing" */
    location: string;

    /** Its status (review or approval) */
    status: LibraryAssetStatus;

    /** Since when, as a UTC ISO timestamp */
    since: string;
}

/** A recently added asset. */
export interface LibraryRecentUpload {
    /** Asset ID */
    id: string;

    /** Title */
    title: string;

    /** Where it's filed */
    location: string;

    /** File format */
    fileType: LibraryFileType;

    /** Preview image URL */
    thumbnailUrl: string;

    /** The file (for a video's first frame) */
    fileUrl: string;

    /** When it was added, as a UTC ISO timestamp */
    createdAt: string;

    /** Who added it (email), or null when unknown */
    createdBy: string | null;
}

/** A recent comment, with the asset it's on. */
export interface LibraryRecentComment {
    /** Comment ID */
    id: string;

    /** The asset */
    assetId: string;

    /** The asset's title */
    assetTitle: string;

    /** Who wrote it (email) */
    author: string;

    /** The text */
    body: string;

    /** When it was written, as a UTC ISO timestamp */
    createdAt: string;

    /** Whether it's a reply */
    isReply: boolean;
}

/** How many assets someone added. */
export interface LibraryContributor {
    /** Their email */
    email: string;

    /** Assets they added */
    count: number;
}

/** Everything the dashboard shows. */
export interface LibraryDashboard {
    /** Headline numbers */
    totals: LibraryDashboardTotals;

    /** Per workflow category, assets per status */
    workflow: LibraryWorkflowSummary[];

    /** Assets per category, in taxonomy order */
    categories: LibraryCount[];

    /** Assets per file format */
    fileTypes: Record<LibraryFileType, number>;

    /** Assets added per week, oldest first, the current week last */
    weeklyUploads: LibraryWeekCount[];

    /** Workflow assets waiting longest in Review or Approval, oldest first */
    waitingLongest: LibraryWaitingAsset[];

    /** Latest uploads, newest first */
    recentUploads: LibraryRecentUpload[];

    /** Latest comments, newest first */
    recentComments: LibraryRecentComment[];

    /** Who added the most assets in the last CONTRIBUTOR_DAYS days, most first */
    contributors: LibraryContributor[];
}
