# internal-tool-boilerplate

Starter template for NTV360 internal tools: an Angular 21 client-side SPA with an Express BFF
(no server-side rendering), the shared NTV360 dark theme, sign-in, and a full set of example
dashboard pages (Dashboard, Ranking Data, Ads Gallery, Ad Analytics, Venue Profile, Map View)
running on **generated dummy data** - no database, external API or credentials needed.

Starting a new tool? Read [docs/REUSE-AS-TEMPLATE.md](./docs/REUSE-AS-TEMPLATE.md).

## Quick Start

```bash
npm install
npm start          # dev: Angular on :4200 + BFF on :4000 (/api proxied)
npm run build      # SPA + BFF bundle -> dist/internal-tool-boilerplate/{browser,server}
npm run serve      # production: BFF serves the API and the built SPA
```

No `.env` file is needed for development - sign in with the [demo account](#demo-account)
below. Production (`NODE_ENV=production`, loads `.env.production`) requires
`SESSION_SECRET`.

## Demo account

The template has no real user accounts. Sign in with:

| Email              | Password   |
| ------------------ | ---------- |
| `demo@example.com` | `demo1234` |

These are the BFF's built-in defaults (`DEMO_EMAIL` / `DEMO_PASSWORD` in
`src/server/config/environment.config.ts`), so they work with no `.env` file. To change
them, copy `.env.example` to `.env.dev` and edit the two values, then restart `npm start`.
See [docs/AUTHENTICATION.md](./docs/AUTHENTICATION.md) for swapping in a real provider.

## Dummy data

The BFF generates a deterministic dataset on startup (`src/server/mock-data/`): 32 fictional
venues across the US, 36 creatives (placeholder images in `public/mock-media/`) and ~34k
play records over the last 45 days, ending "now". Every endpoint reads it through two
services - `src/server/services/data-store.service.ts` and `hosts.service.ts` - which are the
only files to change to connect a real backend.

## Path Aliases

- `@core` - Services, guards, models
- `@features/*` - Feature modules
- `@shared/*` - Shared components
- `@layouts/*` - Layout shells

## Commit Message Format

This project uses [Commitlint](https://commitlint.js.org/) with conventional commits. Pre-commit hooks will automatically validate your commit messages.

### Valid Commit Types

- `feat` - New feature
- `feature` - New feature (alias)
- `fix` - Bug fix
- `chore` - Build, tooling, or maintenance

### Format

```

<type>: <subject>

```

### Examples

```bash
feat: Add user authentication
feature: Implement dashboard page
fix: Resolve navigation bug
chore: Update dependencies
```

### Rules

- Type must be one of the valid types listed above
- Subject must use sentence case (capitalize first letter)
- Subject is required

The pre-commit hook will reject commits that don't follow these rules.

See [START_HERE.md](./START_HERE.md) and [docs/BFF-ARCHITECTURE.md](./docs/BFF-ARCHITECTURE.md) for architecture details.
