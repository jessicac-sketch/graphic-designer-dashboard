# Database Migrations with the Supabase CLI

A short guide to how we change a database schema: write the change as a SQL file in the repo, then apply it with the Supabase CLI.

## The idea

- Every schema change (new table, new column, index, policy) is a **migration**: a `.sql` file in `supabase/migrations/`.
- Migrations live in git next to the code and go through the usual branch and pull request flow.
- Supabase keeps a **migration history table** in each database that lists which migration versions have been applied.
- `supabase db push` compares the local files with that history and applies only the ones still missing.
- The repo is the source of truth. A change made by hand in the dashboard and never written as a migration is invisible to everyone else and breaks the history.

## 1. Set up the CLI (once per machine)

```bash
npx supabase login
```

This opens a browser to sign in. No database keys or `.env` files are needed.

## 2. Write the migration

Create the file:

```bash
npx supabase migration new add_company_overview_to_customers
```

This makes `supabase/migrations/<timestamp>_add_company_overview_to_customers.sql`. The timestamp prefix (`YYYYMMDDHHMMSS`) is the migration's **version** and sets the order migrations run in.

Write the SQL:

```sql
-- =============================================================================
-- Customers: company_overview, stats
-- =============================================================================
-- Both optional: nullable, no default, so existing rows and writes keep working.
-- Re-runnable.
-- =============================================================================

ALTER TABLE public.customers
    ADD COLUMN IF NOT EXISTS company_overview text;

ALTER TABLE public.customers
    ADD COLUMN IF NOT EXISTS stats jsonb;

COMMENT ON COLUMN public.customers.stats IS
    'Optional array of { label, value } pairs.';
```

### Rules for writing migrations

- **Make them re-runnable.** Use `IF NOT EXISTS` / `IF EXISTS`, and `DROP CONSTRAINT IF EXISTS` before `ADD CONSTRAINT`. Running the file twice should change nothing.
- **Prefer additive changes.** New nullable columns and new tables never break existing code. Renames, drops and `NOT NULL` on existing data need a plan, such as copying data first.
- **Never edit a migration that has been applied** anywhere. To change it, add a new migration. Databases that already ran the old file won't run it again.
- **One change per file**, with a short header comment explaining what changed and why.
- **Commit the file** with the code that uses it.

## 3. Apply it

Link the CLI to the target database. The project ref is in the dashboard URL (`/project/<ref>`).

```bash
npx supabase link --project-ref <dev-project-ref>
```

Check what's pending:

```bash
npx supabase migration list
```

| Local | Remote | Meaning |
|---|---|---|
| ✓ | ✓ | Applied |
| ✓ | (empty) | Pending: `db push` will apply it |
| (empty) | ✓ | Applied to the database but missing from your repo: see Troubleshooting |

Push:

```bash
npx supabase db push
```

This applies **every** pending migration, not only yours, so read the list before you push.

### Dev first, production last

1. Push to **dev / staging** and test the app against it.
2. Merge the pull request.
3. Push to **production**: link to the production ref, run `migration list`, then `db push`.
4. **Link back to dev** right away, so a later `db push` can't reach production by accident:

```bash
npx supabase link --project-ref <dev-project-ref>
```

Tip: wrap steps 1 to 4 in a small script (`npm run db:push:dev` / `db:push:prod`) that links, lists, asks for confirmation (for production, typing `production`), pushes, and always links back to dev.

## Troubleshooting

### "Remote migration versions not found in local migrations directory"

The database has a migration that isn't in your repo, usually because someone applied it from a branch that isn't pushed yet. `db push` refuses to continue until this is fixed.

1. **Best fix:** find who applied it and get the file into the repo (`git fetch`, merge their branch), then push again.
2. **If you can't wait**, apply your SQL without `db push`:
   - Paste your migration's SQL into the dashboard **SQL Editor** and run it. This is safe because the file is re-runnable.
   - Record it as applied so the history matches:

     ```bash
     npx supabase migration repair --status applied <your-version>
     ```

3. **Don't** run `migration repair --status reverted <their-version>` unless you know that migration really is gone. It marks someone else's migration as undone in the history.

### Check that a column exists

```sql
select column_name, data_type, is_nullable
from information_schema.columns
where table_name = 'customers'
  and column_name in ('company_overview', 'stats');
```

## Quick reference

| Command | What it does |
|---|---|
| `npx supabase login` | Sign the CLI in (once per machine) |
| `npx supabase migration new <name>` | Create a timestamped migration file |
| `npx supabase link --project-ref <ref>` | Point the CLI at a database |
| `npx supabase migration list` | Compare local files with the database's history |
| `npx supabase db push` | Apply all pending migrations to the linked database |
| `npx supabase migration repair --status applied <version>` | Mark a migration as applied without running it |
| `npx supabase db pull` | Write the remote schema into a new local migration |
 