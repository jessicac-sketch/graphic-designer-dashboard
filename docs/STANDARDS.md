# Coding Standards & Best Practices

This document outlines the mandatory coding standards for **Programmatic Reports** (`programmatic-reports` repository). They follow the NTV360 tool standards set by `gbp-management-tool-ui`, so every NTV360 tool shares one look and one way of building UI. All contributors must adhere to these guidelines to ensure code quality, maintainability, and consistency.

> **Migration in progress.** New and touched code follows every rule below. Older code under `src/app/core/models`, `src/app/core/services` and the large page components (Ranking Data) predates §4.1; it moves to `src/app/shared` in Phase 3 (see `docs/HISTORY.md`). Don't copy its patterns into new code.

## 1. CSS/SASS Architecture

**Rule:** Always use **SASS (SCSS)** and the **BEM (Block Element Modifier)** naming convention.

### 1.1 SASS (SCSS)

- All style files must use the `.scss` extension.
- Use SASS features like nesting, variables, and mixins responsibly.
- Avoid deep nesting (maximum 3 levels deep).

### 1.2 BEM Naming Convention

We strictly follow the **BEM** methodology for naming CSS classes.

- **Block**: The main component (e.g., `card`, `menu`, `button`).
- **Element**: A child of the block, denoted by two underscores `__` (e.g., `card__title`, `menu__item`).
- **Modifier**: A variation of the block or element, denoted by two hyphens `--` (e.g., `button--primary`, `menu__item--active`).

**Example:**

```scss
// Good
.card {
    &__header {
        @apply border-b border-surface-border;
    }

    &__content {
        @apply p-5;
    }

    &__button {
        @apply text-brand;

        &--disabled {
            @apply cursor-not-allowed opacity-50;
        }
    }
}
```

```html
<!-- Good -->
<div class="card">
    <div class="card__header">Title</div>
    <div class="card__content">
        <button class="card__button card__button--disabled">Submit</button>
    </div>
</div>
```

**Bad:**

```css
/* Avoid ID selectors and generic class names */
#myCard { ... }
.header { ... }
.active { ... } /* Too generic, use modifier like .card--active */
```

### 1.3 Tailwind CSS Integration

We integrate Tailwind CSS to speed up styling while maintaining BEM structure.

- **Use `@apply`**: Do not clutter HTML with extensive Tailwind utility classes. Instead, use Tailwind's `@apply` directive within your SASS/BEM classes.
- **Mix**: It is acceptable to mix standard SASS properties with `@apply` where appropriate.
- **Theme colors only**: use the theme tokens (§4.3), never Tailwind's palette (`gray-*`, `blue-*`, ...) or hex values.
- **No opacity modifiers on tokens**: the tokens are CSS variables, so `bg-surface-base/80` does not compile. Use `color-mix(in srgb, var(--app-surface-base) 80%, transparent)`.

**Example:**

```scss
// Good
.button {
    @apply border border-surface-border px-4 py-2 text-content-secondary;

    &:hover {
        @apply bg-surface-hover text-content-primary;
    }
}
```

```html
<!-- Good -->
<button class="button">Click Me</button>

<!-- Bad -->
<button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">Click me</button>
```

## 2. Documentation (JSDocs)

**Rule:** Mandatory **JSDoc** comments for all classes, methods, functions, and interfaces — and on every component input, output and signal.

Documentation serves as the single source of truth for code intent and usage.

### 2.1 Requirements

- **Description**: A clear summary of what the symbol does.
- **@param**: Document every parameter, its type, and purpose.
- **@returns**: Document the return value and its type (if not void).
- **@throws**: Document any errors that might be thrown.
- **@example**: Provide a usage example for complex logic and for shared components.

### 2.2 Example

```typescript
/**
 * Calculates the total price of a cart including tax.
 *
 * @param {number} subtotal - The sum of item prices.
 * @param {number} taxRate - The tax rate as a decimal (e.g., 0.1 for 10%).
 * @returns {number} The total price formatted to 2 decimal places.
 * @throws {Error} If the subtotal is negative.
 *
 * @example
 * const total = calculateTotal(100, 0.2); // Returns 120
 */
function calculateTotal(subtotal: number, taxRate: number): number {
    if (subtotal < 0) {
        throw new Error('Subtotal cannot be negative');
    }
    return subtotal * (1 + taxRate);
}
```

## 3. TypeScript & Angular

- **Strict Mode**: `strict: true` is enabled in `tsconfig.json`. Do not bypass strict type checks.
- **Explicit Types**: Use explicit return types for functions.
- **No Any**: Avoid `any`. Use `unknown` or define a proper interface/type.
- **Imports**: Use path aliases (`@core`, `@shared/*`, `@features/*`, `@layouts/*`) instead of relative paths, grouped under `/** Angular Imports */`, `/** Third Party Imports */` and `/** Local Imports */`.
- **Components**: standalone, `changeDetection: ChangeDetectionStrategy.Eager`, `templateUrl` + `styleUrl` files (no inline templates or styles in new components).
- **State**: signals (`input`, `output`, `computed`, `signal`, `linkedSignal`) and the built-in control flow (`@if`, `@for`, `@switch`, `@let`). The app is zoneless and client-side rendered (no SSR) — see `docs/ZONELESS_ANGULAR_SIGNALS.md`.

## 4. File Structure

Follow the established project structure:

- **`src/app/core`**: App-wide infrastructure — guards and interceptors (plus, until Phase 3, the older models and services).
- **`src/app/shared`**: Everything reusable — `services/`, `interfaces/`, `models/` (types, enums, constants), `components/`, `directives/`, `pipes/`, `utils/`.
- **`src/app/features`**: Feature pages (smart components), e.g. `login/`, `dashboard/`. Components used by only one page go in `features/<page>/components/`.
- **`src/app/layout`**: Layout shells and their route lists (`public/`, `authenticated/` with its sidebar, topbar and user menu).
- **`src/styles`**: Theme tokens, typography, sharp corners, scrollbars and the component-pantry dark-mode fixes.
- **`src/server`**: The Express BFF (routes → controllers → services). All backend/data access happens here — see `docs/BFF-ARCHITECTURE.md`.

### 4.1 One thing per file, one folder per thing

- Every service, interface, model, component, directive and pipe lives in **its own file**, inside **its own folder**, with an `index.ts` barrel that re-exports it.
- Each level up (`shared/interfaces/index.ts`, `shared/index.ts`, ...) re-exports the folders below it.
- **Never declare an interface inside a service or component file.** Interfaces go in `shared/interfaces/<area>/<name>.interface.ts`.
- **Never declare a constant, type or validator inside a component or service file** either: constants and types go in `shared/models/<area>/` (`.constant.ts`, `.type.ts`), form validators in `shared/validators/<name>/<name>.validator.ts`. The BFF keeps its constants in `src/server/config/`.
- File suffixes: `.service.ts`, `.interface.ts`, `.type.ts`, `.constant.ts`, `.component.ts`, `.validator.ts`, `.guard.ts`, `.interceptor.ts`, `.pipe.ts`, `.util.ts`.

```
shared/
├── interfaces/
│   ├── navigation/
│   │   ├── nav-item.interface.ts
│   │   └── index.ts
│   └── index.ts
├── models/
│   ├── chart/chart-colors.constant.ts (+ index.ts)
│   ├── ui/card-config.constant.ts, metric-tone.type.ts (+ index.ts)
│   └── index.ts
├── components/
│   ├── page-header/page-header.component.{ts,html,scss} (+ index.ts)
│   └── index.ts
└── index.ts
```

### 4.2 Imports on the startup path

Code that loads at startup (guards, interceptors, `app.config.ts`, layouts, the sidebar/topbar) must import from the specific folder barrel, not the top-level one:

```typescript
// Good: only the brand component is bundled where it's used
import { BrandComponent } from '@shared/components/brand';

// Bad: pulls every shared component (and their dependencies) into the bundle
import { BrandComponent } from '@shared/components';
```

Top-level barrels re-export everything. Never re-export a component that imports `echarts` (`UsStatesMapComponent`, `DailyAdsBarChartComponent`) from a barrel: import it from its own file so `echarts` stays in the lazy-loaded Map View / Venue Profile chunks. Type-only imports (interfaces) are erased at build time and are fine either way.

### 4.3 UI components

- Build UI with `@ntv360/component-pantry` components (`ntv-button`, `ntv-input`, `ntv-card`, `ntv-table`, ...). See `docs/COMPONENT_PANTRY_SKILL.md`.
- **Theme & fonts (dark only):**
    - Colors only through the theme tokens — `surface-*`, `field-*`, `content-*`, `brand-*`, `status-*` — defined in `src/styles/_theme.scss` and exposed to Tailwind in `tailwind.config.js`. Never hex values in components. In inline/legacy styles use the CSS variables (`var(--app-surface-border)`).
    - Charts (ECharts, ApexCharts) need literal colors: use `CHART_COLORS` and `CHART_FONT` (`@shared/models/chart`), kept in step with `_theme.scss`. The proof-of-play bucket colors in `pop-duration.util.ts` follow the status tokens the same way.
    - Sharp corners everywhere (enforced globally by `_sharp-corners.scss`), outlines rather than shadows, NTV360 orange (`brand`) as the single accent; primary buttons use the magenta-to-red brand gradient.
    - Text is **DM Sans**; small uppercase labels add **DM Mono** with `!font-mono` in the same `@apply` as `uppercase`. Icons are Font Awesome **Sharp Regular**: `fa-sharp fa-regular fa-<name>`.
    - **Font sizes are rem, never px,** so text follows the user's browser / OS text size: Tailwind's `text-xs` / `text-sm` / ..., or the small-size tokens `text-label` (11px, the mono labels) and `text-micro` (10px, tags and badges) from `tailwind.config.js`. No `text-[Npx]` and no `font-size: Npx` (use `text-[0.8125rem]` if a one-off size is unavoidable). Chart option sizes (ECharts / ApexCharts `fontSize`) are drawn inside the chart, not CSS, and stay numeric.
    - Re-theming of pantry components goes in `src/styles/_pantry-dark-fixes.scss` (never in a page): the shared section matches gbp-management-tool-ui; the second section covers components only this app uses (`ntv-skeleton`, the date pickers).
- **Responsive card layouts:** inside the authenticated shell the content area is the window minus the sidebar (256px from 992px) and padding, so window breakpoints (`lg:` / `xl:`) overstate the room. Switch card grids on the content's own width with `@container` (`container: <name> / inline-size` on the page root, as the Dashboard does).
- **Page header:** every page starts with `<app-page-header eyebrow="…" title="…" subtitle="…">`, with the page's main action or search projected on the right.
- **Shares of a total:** `<app-share-list>` — ranked rows with their % of a total, a bar, optional thumbnails and "Show all" (Dashboard breakdowns).
- **Numbers:** `<app-metric>` for a labelled number. Ranking Data's clickable stat cards keep their own markup (they are filters) but share its look (`.stat-card`).
- **Cards:** `ntv-card` with `[config]="cardConfig"` where `cardConfig = CARD_CONFIG` (`@shared/models/ui`): flat, outlined, no shadow or hover lift. For a dashboard-style card with an icon, title and actions, use `<app-summary-card>`.
- **Modals:** use the shared `<app-dialog>` (`@shared/components/dialog`) — title and × in the header, content in the body, Cancel and one action in the footer. Drill-down tables use `<app-drill-down-modal>`. Do not use `ntv-modal` directly: it renders no title or close button.
- **Tables:** `ntv-table` (its frame, borders and header are re-themed globally). Wide tables sit in a `display: block; overflow-x: auto` host. Exports use `<app-export-button>`.
- **Dates:** `ntv-date-range-picker` is dark-fixed in this app (gbp uses native `type="date"` inputs instead; both are acceptable).
- **Startup bundle:** keep heavy pages (`echarts`, `us-atlas`) lazy-loaded in `authenticated.routes.ts`.

## 5. Commit Message Standards

**Rule:** Follow **Conventional Commits**, validated by commitlint (`commitlint.config.js`) in the commit-msg hook.

- **Format:** `<type>: <Subject>`, with a sentence-case subject (`feat: Add …`, not `feat: add …`), at most 100 characters.
- **Valid types:** `feat`, `feature`, `fix`, `chore` — the hook rejects anything else (use `chore:` for refactors and docs).
- **Body:** each line under 100 characters; bullet points (`-`) for multiple changes.
- **Footer:** end with the co-author line the contributor's tooling asks for.
- The pre-commit hook formats staged files with Prettier and runs a full `npm run build`.

```bash
# ✅ Good
git commit -m "feat: Add venue export to the State Ranking modal"

# ❌ Bad
git commit -m "feat: add venue export"   # Subject not capitalized
git commit -m "refactor: Split dashboard" # Type not allowed by commitlint
```

## 6. Summary Checklist

Before submitting a PR, ensure:

- [ ] Styles use SCSS and BEM, with Tailwind `@apply` and theme tokens only (no hex, no Tailwind palette colors).
- [ ] No interfaces, types or constants inside components or services; barrels updated.
- [ ] All functions, classes, inputs, outputs and signals have JSDoc.
- [ ] Reused shared or pantry components; anything new and reusable is in `shared/components` and listed in §4.3.
- [ ] Code is formatted (`npm run pretty`).
- [ ] `npm run build` passes and tests pass (`npm test`).
- [ ] Commit messages follow §5.
