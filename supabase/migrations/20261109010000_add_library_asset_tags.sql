-- Mini-Library: optional tags on assets, for search (e.g. {Buyer,Friend,"dog lover"}).
-- The BFF trims, de-duplicates (case-insensitively) and caps them before insert, and adds
-- them to search_text so the page's search box finds them.

alter table public.library_assets
    add column if not exists tags text[] not null default '{}';

-- For a future "filter by tag" (tags @> array['dog lover'])
create index if not exists library_assets_tags_idx
    on public.library_assets using gin (tags);
