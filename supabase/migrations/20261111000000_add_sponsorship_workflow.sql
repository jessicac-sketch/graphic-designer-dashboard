-- Sponsorship assets now go through the same workflow as Channel (the Sponsorship page):
-- review → approval → ready → live. Sponsorship assets uploaded before this migration
-- start at the first step.

update public.library_assets
set status = 'review', status_updated_at = now()
where category_id = 'sponsorship' and status is null;
