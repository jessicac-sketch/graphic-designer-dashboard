-- Mini-Library: one row per creative asset uploaded through Filestack.
-- Run once in the Supabase SQL editor (or `supabase db push`).
--
-- The category / subcategory / topic IDs come from the BFF's taxonomy config
-- (src/server/config/library-taxonomy.config.ts), which validates them on insert.

create table if not exists public.library_assets (
    id               uuid primary key default gen_random_uuid(),
    title            text not null check (char_length(btrim(title)) between 1 and 200),
    category_id      text not null,
    subcategory_id   text,
    topic_id         text,
    -- Labels shown on the card, e.g. {Badminton,Tips}; kept so renamed taxonomy entries
    -- don't rewrite history
    path             text[] not null,
    file_type        text not null check (file_type in ('png', 'jpg', 'mp4')),
    version          integer not null default 1 check (version >= 1),
    file_url         text not null,
    filestack_handle text not null,
    thumbnail_url    text,
    -- Lower-cased title + path, for the page's search box
    search_text      text not null,
    created_at       timestamptz not null default now(),
    updated_at       timestamptz not null default now()
);

create index if not exists library_assets_location_idx
    on public.library_assets (category_id, subcategory_id, topic_id);

create index if not exists library_assets_updated_at_idx
    on public.library_assets (updated_at desc);

-- Only the BFF (service role, which bypasses RLS) reads and writes this table. With RLS
-- on and no policies, the public anon key can't touch it.
alter table public.library_assets enable row level security;

-- Asset counts per category / subcategory / topic, for the page's tabs and filters.
create or replace view public.library_asset_counts
with (security_invoker = true) as
select category_id, subcategory_id, topic_id, count(*)::integer as asset_count
from public.library_assets
group by category_id, subcategory_id, topic_id;
