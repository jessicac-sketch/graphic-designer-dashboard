-- Workflow status for Channel assets (the Channel page):
--   review   - waiting for Graphics QC
--   approval - waiting for upper management
--   ready    - approved, waiting to be uploaded to the other system's dashboard
--   live     - in that dashboard now
-- Assets of categories without a workflow (everything but Channel) keep status null.

alter table public.library_assets
    add column if not exists status text
        check (status in ('review', 'approval', 'ready', 'live')),
    add column if not exists status_updated_at timestamptz;

-- Channel assets uploaded before this migration start at the first step
update public.library_assets
set status = 'review', status_updated_at = now()
where category_id = 'channel' and status is null;

create index if not exists library_assets_status_idx
    on public.library_assets (category_id, status);
