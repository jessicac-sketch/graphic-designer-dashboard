-- The asset page: more details per asset, and a comment thread with replies.

-- Details: an editable description (searchable), the file size and who uploaded it.
-- Assets uploaded before this migration have no size or uploader (shown as "—").
alter table public.library_assets
    add column if not exists description text not null default '',
    add column if not exists file_size bigint check (file_size is null or file_size >= 0),
    add column if not exists created_by text;

-- Comments: top-level comments (parent_id null) and one level of replies to them.
-- A top-level comment's thread can be marked resolved (resolved_at / resolved_by).
-- Deleting an asset deletes its comments; deleting a comment deletes its replies.
create table if not exists public.library_asset_comments (
    id uuid primary key default gen_random_uuid(),
    asset_id uuid not null references public.library_assets (id) on delete cascade,
    parent_id uuid references public.library_asset_comments (id) on delete cascade,
    author text not null,
    body text not null check (char_length(body) between 1 and 2000),
    resolved_at timestamptz,
    resolved_by text,
    created_at timestamptz not null default now()
);

create index if not exists library_asset_comments_asset_idx
    on public.library_asset_comments (asset_id, created_at);

-- Only the BFF (service role key) reads and writes comments, like library_assets
alter table public.library_asset_comments enable row level security;
