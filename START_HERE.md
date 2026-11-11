# START HERE — for AI assistants working in this repository

You are an AI coding assistant about to work on the **NTV360 Internal Tool boilerplate** (or a project started from it). Read this file first, then the files it points to. A person on the team will usually just say "read START_HERE.md" — this is that briefing.

---

## 1. What this project is

A **starter template** for NTV360 internal tools, forked from the programmatic-ads dashboard. Every page of that dashboard is kept as a working example (Dashboard, Ranking Data, Ads Gallery, Ad Analytics, Venue Profile, Map View, Analytics, Settings) with CSV/XLSX exports, but it runs on **generated dummy data** - no database, no external API, no credentials. A new project keeps the pages it can reuse, reshapes or deletes the rest, and points the BFF's data layer at its real backend. See [`docs/REUSE-AS-TEMPLATE.md`](docs/REUSE-AS-TEMPLATE.md).

- **Frontend:** Angular 21 single-page app (standalone components, signals, zoneless, client-side rendered — no SSR).
- **Backend-for-Frontend (BFF):** Express in `src/server`. It serves the built SPA and every `/api` call. **All data access goes through the BFF**; the browser never talks to a backend directly. Today the data comes from a seeded dummy dataset (`src/server/mock-data`) behind `data-store.service.ts` and `hosts.service.ts` - the two seams to replace with a real backend.
- **UI library:** `@ntv360/component-pantry` (`ntv-*`), plus Tailwind and SCSS (BEM), re-skinned to the shared NTV360 dark theme from `gbp-management-tool-ui`.

## 2. Read these, in this order

| File                                                                                                          | Why                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| [`docs/HISTORY.md`](docs/HISTORY.md)                                                                          | **The project's memory.** Every phase: what was built, the decisions, the hiccups, and where things stand. Read the latest phase.  |
| [`docs/STANDARDS.md`](docs/STANDARDS.md)                                                                      | **The rules.** File structure, BEM + Tailwind, JSDoc, TypeScript, theme tokens, which shared components to use. Follow it exactly. |
| [`docs/COMPONENT_PANTRY_SKILL.md`](docs/COMPONENT_PANTRY_SKILL.md)                                            | Reference for the `ntv-*` components. Read the section for any component before you use it.                                        |
| [`docs/BFF-ARCHITECTURE.md`](docs/BFF-ARCHITECTURE.md)                                                        | How the BFF is built (routes → controllers → services) — read before touching `src/server`.                                        |
| [`docs/REUSE-AS-TEMPLATE.md`](docs/REUSE-AS-TEMPLATE.md) · [`docs/AUTHENTICATION.md`](docs/AUTHENTICATION.md) | How to start a new tool from this repo · the demo sign-in (signed httpOnly cookie) and how to plug in a real provider.             |
| [`README.md`](README.md) · [`CHANGELOG.md`](CHANGELOG.md)                                                     | Setup and scripts · release-level changes.                                                                                         |

## 3. Rules that are never broken

1. **Follow `docs/STANDARDS.md`:** one thing per file (no interfaces, types or constants inside components or services), BEM with Tailwind `@apply`, JSDoc on everything, `ChangeDetectionStrategy.Eager`, signals and the new control flow.
2. **Dark theme only**, shared with every NTV360 tool: theme tokens (`surface-*`, `field-*`, `content-*`, `brand-*`, `status-*`; chart copies in `CHART_COLORS`), sharp corners, outlines not shadows, NTV360 orange as the single accent, **DM Sans** (+ **DM Mono** for small uppercase labels), Font Awesome **Sharp Regular** (`fa-sharp fa-regular fa-<name>`). Pantry fixes go in `src/styles/_pantry-dark-fixes.scss`.
3. **Reuse before building:** `<app-page-header>`, `<app-metric>`, `<app-summary-card>`, `<app-dialog>`, `<app-drill-down-modal>`, `<app-export-button>`, `CARD_CONFIG`.
4. **Security:** all backend access goes through the BFF; the session lives in httpOnly cookies. Never name the backend provider in the UI.
5. **SQL:** once a project has a real database, ask the user for the table schema before writing any SQL. Keep migrations in `migrations/` with a rollback where relevant.
6. **Git:** commit only when the user asks; commitlint accepts only `feat`, `feature`, `fix`, `chore` with a sentence-case subject. New work on a branch from an up-to-date `main`. The user opens and merges pull requests.
7. **Don't start the dev server to check your work** unless the user asks in that message — they run and test the app themselves. `npm run build` is fine.

## 4. Keep HISTORY.md current

- When a new area of work starts, add a phase (next number) with **Status**, **Date**, **Branch** and **Goal**, and add it to the phase table.
- During the work, add to its **Done**, **Decisions** and **Pending**; record hiccups under "Known quirks" so the next reader avoids them.
- When the phase ends, set its status to ✅ Done, refresh "Where things stand", and add a `CHANGELOG.md` entry when releasing.

## 5. Run and verify

```bash
npm install
npm start          # UI on :4200 (proxies /api) + BFF on :4000
npm run build      # must pass with no errors (the pre-commit hook runs it)
```

No `.env` file is needed in development. Sign in with the demo account: **`demo@example.com` / `demo1234`** (BFF defaults; override with `DEMO_EMAIL` / `DEMO_PASSWORD` in `.env.dev`). It is the only account - there is no real identity provider yet (see `docs/AUTHENTICATION.md`).

Report results honestly: say what you verified, what you couldn't, and what the user should check themselves.
