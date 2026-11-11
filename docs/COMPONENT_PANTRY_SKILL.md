# @ntv360/component-pantry — AI Developer Reference

> **Version:** 0.7.9 · **Angular:** 21–22 · **Live Showcase:** https://strapi-xi-smoky.vercel.app/
>
> **⚠️ Brand color changed since 0.6.6:** the accent color rebranded from green (`#8DCB2C`) to red/orange (`#D10334`, "accent-action"). Any `#8DCB2C` hex you see in an older example elsewhere in this doc is illustrative of the _pattern_, not the current color — see [§3 Global Design Tokens](#3-global-design-tokens) and [§0 What's Changed Since v0.6.6](#0-whats-changed-since-v066-through-v079) for the current tokens and a full delta of everything added/fixed since this doc's last full pass.

## For AI Assistants — Read This First

This document is the complete reference for the `@ntv360/component-pantry` Angular component library. When a developer provides you this file as context, treat it as your source of truth for the library. You should be able to:

- Generate any component with the correct selector, inputs, outputs, and Angular signals syntax
- Answer questions about component configuration without asking for clarification
- Identify common mistakes before they happen (see the gotchas in each section)
- Produce copy-paste ready code that works without modification

**How to use this document — by tool:**

| Tool                                    | How to load this file                                                                                           |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Any AI chat** (ChatGPT, Gemini, etc.) | Paste the file contents before asking component questions                                                       |
| **AI API**                              | Send as a system message: `{ role: "system", content: "<file contents>" }`                                      |
| **Claude Code**                         | Auto-installed to `.claude/skills/ntv360.md` on `npm install` — type `/ntv360` to activate                      |
| **Cursor**                              | Add to `.cursorrules`: `See @node_modules/@ntv360/component-pantry/COMPONENT_PANTRY_SKILL.md`                   |
| **Windsurf**                            | Add to `.windsurfrules`: `See node_modules/@ntv360/component-pantry/COMPONENT_PANTRY_SKILL.md`                  |
| **GitHub Copilot**                      | Add to `.github/copilot-instructions.md`: `See node_modules/@ntv360/component-pantry/COMPONENT_PANTRY_SKILL.md` |
| **Cody**                                | Reference path in your Cody config: `node_modules/@ntv360/component-pantry/COMPONENT_PANTRY_SKILL.md`           |

> The `postinstall` script detects which tools are active in your project and prints the right setup instruction automatically after `npm install`.

**Ground rules for your responses:**

- All components use Angular signals API: `input<T>()`, `output<T>()`, `model<T>()` — never `@Input()` / `@Output()` decorators
- All components are standalone unless noted — import directly, no NgModule needed (exception: `CarouselModule`)
- `ntv-tag` is the correct selector for the thumbnail tag — never `ntv-thumbnail-tag`
- `app-horizontal-graph` is the correct selector — never `ntv-horizontal-graph`
- Use `disabledInput` on `ntv-input` and `ntv-textarea` — not `disabled`
- `donut-graph[data]`, `graph[config]`, and `thumbnail-item[item]` are required inputs — always include them
- `logo-loader[svg]` is also required — omitting it is a compile-time error, not a silent default
- Accent color is `#D10334` (red/orange) as of 0.7.1 — never suggest the old `#8DCB2C` green unless the user is explicitly targeting the fixed `success-legacy` token
- `nativeAutocomplete` defaults `false` on Autocomplete/Searchbar but `true` on Input — don't assume one default applies to all three

---

---

## Table of Contents

0. [What's Changed Since v0.6.6 (through v0.7.9)](#0-whats-changed-since-v066-through-v079)
1. [Library Overview](#1-library-overview)
2. [Installation & Setup](#2-installation--setup)
3. [Global Design Tokens](#3-global-design-tokens)
4. [Component: Button](#4-button-ntv-button)
5. [Component: Input](#5-input-ntv-input)
6. [Component: Textarea](#6-textarea-ntv-textarea)
7. [Component: Checkbox](#7-checkbox-ntv-checkbox)
8. [Component: Toggle Button](#8-toggle-button-ntv-toggle-button)
9. [Component: Dropdown](#9-dropdown-ntv-dropdown)
10. [Component: Autocomplete](#10-autocomplete-ntv-autocomplete)
11. [Component: Searchbar](#11-searchbar-ntv-searchbar)
12. [Component: Tabs](#12-tabs-ntv-tabs)
13. [Component: Accordion](#13-accordion-ntv-accordion)
14. [Component: Card](#14-card-ntv-card)
15. [Component: Modal](#15-modal-ntv-modal)
16. [Component: Offcanvas](#16-offcanvas-ntv-offcanvas)
17. [Component: Popover](#17-popover-ntv-popover)
18. [Component: Toast](#18-toast-ntv-toast)
19. [Component: Stepper](#19-stepper-ntv-stepper)
20. [Component: Breadcrumbs](#20-breadcrumbs-ntv-breadcrumbs)
21. [Component: Skeleton](#21-skeleton-ntv-skeleton)
22. [Component: Progress](#22-progress-ntv-progress)
23. [Component: Date Picker](#23-date-picker-ntv-date-picker)
24. [Component: Date Range Picker](#24-date-range-picker-ntv-date-range-picker)
25. [Component: Timepicker](#25-timepicker-ntv-timepicker)
26. [Component: Table](#26-table-ntv-table)
27. [Component: Uploader](#27-uploader-ntv-uploader)
28. [Component: Thumbnail Gallery](#28-thumbnail-gallery-ntv-thumbnail-gallery)
29. [Component: Thumbnail Item](#29-thumbnail-item-ntv-thumbnail-item)
30. [Component: Thumbnail Preview](#30-thumbnail-preview-ntv-thumbnail-preview)
31. [Component: Thumbnail Tag](#31-thumbnail-tag-ntv-tag)
32. [Component: Video Preview](#32-video-preview-ntv-video-preview)
33. [Component: Carousel](#33-carousel-ntv-carousel)
34. [Component: Content View](#34-content-view-ntv-content-view)
35. [Component: Calendar](#35-calendar-ntv-calendar-base)
36. [Component: Graph](#36-graph-ntv-graph)
37. [Component: Donut Graph](#37-donut-graph-ntv-donut-graph)
38. [Component: Radial Graph](#38-radial-graph-ntv-radial-graph)
39. [Component: Horizontal Graph](#39-horizontal-graph-app-horizontal-graph)
40. [Component: Error States](#40-error-states-ntv-error-states)
41. [Component: Stack](#41-stack-ntv-stack)
42. [Component: Grid](#42-grid-ntv-grid)
43. [Component: Template](#43-template-ntv-template)
44. [Component: Zone](#44-zone-ntv-zone)
45. [Strapi Integration](#45-strapi-showcase-integration)
46. [Component: Kanban](#46-kanban-ntv-kanban)
47. [Component: Empty State](#47-empty-state-ntv-empty-state)
48. [Component: Logo Loader](#48-logo-loader-ntv-logo-loader)
49. [Component: Filter By](#49-filter-by-ntv-filter-by)

---

## 0. What's Changed Since v0.6.6 (through v0.7.9)

This section summarizes everything meaningfully added, changed, or fixed across the library between the version this document previously covered (0.6.6) and the current 0.7.9. It exists so an AI assistant reading this doc doesn't need to re-derive the delta from `CHANGELOG.md` — read this section first for anything touching the components below, then fall back to that component's full section (§4–§44, §46–§49) for baseline API details. Where a component gained new inputs/outputs not yet reflected in its full section below, they're documented here.

**Four brand-new components** (full sections at the end of this doc, §46–§49): **Kanban** (`ntv-kanban`, drag-and-drop board), **Empty State** (`ntv-empty-state`, placeholder for empty lists/tables), **Logo Loader** (`ntv-logo-loader`, animated-draw-in logo loader), **Filter By** (`ntv-filter-by`, grouped collapsible filter dropdown with active-filter chips).

**Brand rebrand (0.7.1):** accent color changed from green `#8DCB2C` to red/orange `#D10334` ("accent-action") across Button, Card, Dropdown, Autocomplete, Input, Checkbox, Calendar, Tabs, Breadcrumbs, Table, Searchbar, and Uploader. Hover uses `#FD7902` (accent-color-400), persistent "active" chrome uses navy `#091635`. See §3 for the corrected token list.

### Input, Autocomplete, Searchbar, Dropdown, Textarea (form-field family)

- **New inputs (0.7.8):** `textColor` / `borderColor` / `backgroundColor` (`string | null`, default `null`) on Dropdown and Autocomplete for the rest/default state; `backgroundColor` on Input; `inputBackgroundColor` on Searchbar (passes through to its internal `ntv-input`).
- **New input (0.7.7):** `nativeAutocomplete` (`boolean`) on Input (default `true`), Autocomplete and Searchbar (default `false` on both — the browser's own autofill popup otherwise visually overlaps the component's own dropdown).
- **State-color system corrected (0.7.6–0.7.8), applies to Input, Autocomplete, Searchbar, Textarea, Dropdown:** Default border/text `#586176` (primary-600), Hover `#D10334` (accent-main), Active/Focus `#091635` (primary-main) — as of 0.7.8 the _border_ also switches to `#091635` on focus (previously only the text did), Disabled `#C9CCD2` (primary-300) on white. Border radius `4px`. An explicit `focusBorderColor` on Input still overrides this.
- **Fixed (0.7.8):** Input and Autocomplete had double horizontal padding (the native `<input>` and its wrapper both applied padding). Now a flat **14px** on the wrapper only, for every size — previously an inconsistent 8/12/16/20px depending on size. Searchbar inherits the fix automatically (delegates to `ntv-input`).
- Dropdown: chevron icon unified with Autocomplete's; a selected value no longer permanently forces accent-red on the trigger at rest; single-select input is no longer `readonly` once a value is picked (freely re-editable, matching standard text-input focus/select-all behavior).

### Table

- **New input (0.7.8):** `stickyHeader` (`boolean`, default `true`) — set `false` for a header that scrolls away with the body. (Fixed in the same release: the header previously never actually stuck due to `overflow: hidden` on `<table>` breaking the sticky containing-block chain, and missing `position: sticky` on `<th>`.)
- **New input (0.7.7):** `showLessEnabled` (`boolean`, default `false`) — renders a "Show Less" control once every item is loaded, collapsing back to page 1; paired with a new `showLessRequested` output for server-side pagination.
- **New inputs (0.7.7):** `loadingOverlayEnabled` (default `true`) and `loadingOverlayColor` (default `#D10334`) — an append-fetch loading overlay (progress-bar sweep + dimmed backdrop + spinner) shown during "Show More"/search without blanking existing rows. Public API: `isProcessing()`, `showLoadingOverlay()`, `hideLoadingOverlay()`.
- **New inputs (0.7.1):** `tableTags` (`TableTag[]`) — status legend beside the title; `rowAccentField` (`string`) + `rowAccentColors` (`Record<string, string>`) — colored 4px rail on a row's leading edge driven by any field value; `sortable` and `sortValue` on `TableColumn` — sorting is now independent of `filterType`/`columnDraggable`.
- **New public methods:** `setAllColumnsVisible(visible)`, `clearFilters()` (backs a new reset-filters button next to the column-visibility gear, shown when `filterEnabled` is true), `rowAccentColor(item)`.
- **Fixed (0.7.7):** `checkbox`/`index`/`actions` columns are now pinned — always rendered, excluded from the column-visibility panel regardless of whether they're the built-in `hasCheckBox`/`hasIndex` columns or defined in a consumer's own `columns` array. "Show More" (server-side pagination) no longer scrolls the page to top.
- Column-visibility gear button restyled to the exact Figma spec (32×32px, 4px radius); `settingButtonColor` input removed (was unused). Scrollbar restyled thin/transparent with Firefox support (0.7.8).

### Button

- **New input (0.7.3):** `textColor` — overrides the auto-computed contrast text color on `color="custom"`.
- **Primary gradient corrected (0.7.8)** to Figma's exact angle/stop-offsets (was a rounded `90deg` approximation): default direction crimson→orange (`linear-gradient(50.43deg, #C41E5C 4.31%, #E8342A 72.15%, #FF6B00 122.85%)`); hover flips those same stops end-to-end rather than using a separate gradient (the dedicated hover gradient banded badly on wide buttons since its percentages were tuned for the Small size only).
- **Secondary variant corrected (0.7.7):** Default/Hover states were swapped relative to spec — now Default: white bg, gray-200 border, `#586176` text; Hover: white bg, accent-action border/text; Active: `#03235D` navy-indigo.
- `Primary` + `color="custom"` now builds and renders a real 3-stop gradient from the single custom hex (previously the fixed brand gradient always painted over it); new `gradient` input (default `true`) set `false` for a flat solid fill instead.

### Thumbnail Gallery / Thumbnail Item

- **New genre tag (0.7.8):** `showGenreTag`, `genreTagText`, `genreTagTextColor` (default `#FFFFFF`), `genreTagBackgroundColor` (default `#0854E3`), `genreTagBorderRadius` — renders top-left alongside the existing type tag; item-level values (`item.genreTagText` etc.) override the gallery-level default, same precedence pattern as the existing info tag.

### Date Picker / Date Range Picker

- **Fixed (0.7.7):** Default (`triggerHeight="md"`) trigger height is now a fixed 40px (previously padding-only, ~35px) — matches Input/Dropdown/Autocomplete/Searchbar's default height. `width` now also accepts size tokens (`'sm'` 180px / `'md'` 250px / `'lg'` 320px) alongside a pixel number (0.7.5).
- **Fixed (0.7.8):** `date-range-single` variant now allows a single-day range (start === end) by clicking the same date twice — a CSS rule was silently swallowing the second click.

### Card

- **New (0.7.2):** `variant="template"` — renders `templateData` as a thumbnail + title + meta row + Preview/Download/Replace Template/Delete actions in place of `ng-content`; each action independently toggleable (`showPreview`/`showDownload`/`showReplace`/`showDelete`).
- **New (0.7.2):** `size` input (`'sm' | 'md' | 'lg' | 'custom'`, default `'md'`) plus `customWidth`/`customHeight` for `size="custom"`, applied as `max-width` so the card still shrinks in a narrow container.

### Tabs

- **New (0.7.7):** `customWidth`/`customHeight` inputs (also settable via `config`) — previously the tab bar had no way to override width (hardcoded 100%) or height (auto) at all.

### Modal

- **New (0.7.5):** `alertAnimationLoop` input (default `true`) — set `false` to play the success/error alert's Lottie animation once instead of looping. Fixed the animation disappearing entirely when set `false` before this (its final frames faded to opacity 0 for a loop-crossfade that never resolved when non-looping).

### Graph / Donut Graph

- **New (0.7.2):** `dataPoints` config option — a sparse, API-shaped alternative to `series`/`graphData` (`{ year?, month?, week?, day?, ...seriesValues }`); takes priority over `series` when both are set. Enables real day-level detail and scopes the Year/Month dropdowns to years actually present in the data.
- **New (0.7.1):** `showLegend` (default `true`), `showLegendCount` (default `true`), `barGap` (default `2`) on Graph; `legendValueType` (`'percentage' | 'value' | 'both'`, default `'percentage'`) on Donut Graph.

### Uploader

- **Security fix (0.7.6):** file-type validation could be bypassed by renaming a disallowed file (extension/MIME are both read from the filename). Added `verifyFileContents` — reads each file's real leading bytes and verifies them against the signature expected for its claimed extension (images, PDFs, Office docs, video containers); rejects a mismatch.
- **New (0.7.2):** Google Drive / Dropbox provider cards have real Sign in/Sign out, extracted into two new injectable services `GoogleDriveAuthService` and `DropboxAuthService` (both `providedIn: 'root'`, exported from the package) — swappable via standard Angular DI override.
- **New (0.6.7):** `fileRenamed` output, emitted after a manual rename is confirmed — re-run an async/server-side duplicate check for the new name.
- **Fixed (0.7.8):** validation-error messages no longer echo the raw detected MIME type/extension back to the user — a generic `"Unsupported File type: Please use PNG, JPG, JPEG, MP4, WEBM"` regardless of what was rejected. Long filenames in the error banner are now middle-truncated (new `truncateFilenameMiddle()`) so the extension stays visible instead of being cut off. Footer/rename-toggle labels changed from "Close" to "Cancel" where the action discards staged files rather than dismissing a finished state.

### Popover (internal fix, affects every consumer)

- **Fixed (0.7.8):** `:host { display: contents }` — the host element was an unstyled custom element (default `display: inline`), so it counted as a real flex/grid item in whatever container hosted its trigger even though its content is always `position: fixed`. That phantom item ate a `gap` next to the trigger, producing dead space beside it (e.g. Table's column-settings gear button) with nothing visibly there. If you've ever seen unexplained spacing next to a popover trigger in an older build, this is why — no consumer-facing API change, just correct spacing everywhere `ntv-popover` is used.

---

## 1. Library Overview

`@ntv360/component-pantry` is NCompassTV's internal Angular component library — a curated set of 39+ UI components built on **Angular 22**, **Tailwind CSS v3**, and the **Angular Signals API**. All components use `input()`, `output()`, and `model()` (not legacy `@Input()` / `@Output()` decorators).

**Key facts:**

- All components are **standalone** (importable directly, no NgModule required except `CarouselModule`)
- Design token accent: `#8DCB2C` (NCompassTV green)
- Typography: **Nunito** (all components)
- Peer deps: Angular CDK, Tailwind CSS v3, ApexCharts (charts only), Lottie (animations only)
- Live showcase: https://strapi-xi-smoky.vercel.app/
- Strapi CMS backend: https://nctv-strapi-core.onrender.com

---

## 2. Installation & Setup

### .npmrc (project root)

```ini
@ntv360:registry=https://npm-dev.n-compass.online/
//npm-dev.n-compass.online/:_authToken=<YOUR_BASE64_TOKEN>
```

The auth token is the base64 encoding of `username:password` for the private npm registry.

### Install

```bash
npm install @ntv360/component-pantry
```

### Peer dependencies

```bash
npm install @angular/cdk apexcharts ng-apexcharts lottie-web ngx-lottie @lottiefiles/lottie-player
```

### Tailwind config

```js
// tailwind.config.js
const ntvPreset = require('@ntv360/component-pantry/tailwind-preset');

module.exports = {
    presets: [ntvPreset],
    content: ['./src/**/*.{html,ts}', './node_modules/@ntv360/component-pantry/**/*.{js,mjs}'],
};
```

### Global styles

```json
// angular.json — add to styles array
"styles": [
  "node_modules/@ntv360/component-pantry/styles.css",
  "src/styles.css"
]
```

### Import in a standalone component

```typescript
import { ButtonComponent } from '@ntv360/component-pantry';

@Component({
    standalone: true,
    imports: [ButtonComponent],
    template: `<ntv-button>Click me</ntv-button>`,
})
export class MyComponent {}
```

### Import in an NgModule

```typescript
import { ButtonComponent, InputComponent } from '@ntv360/component-pantry';

@NgModule({
    imports: [ButtonComponent, InputComponent],
    declarations: [MyComponent],
})
export class MyModule {}
```

---

## 3. Global Design Tokens

```css
/* Brand colors — rebranded in 0.7.1: green (#8DCB2C) → red/orange (#D10334) */
--accent-main: #d10334; /* accent-action — Default/selected state (was #8DCB2C green) */
--accent-color-400: #fd7902; /* Hover state */
--primary-main: #091635; /* Navy — persistent "active" chrome */
--danger-main: #e83e3e;
--information-main: #095af3;
--success-main: #3adb30;
--warning-main: #f59e0b;

/* State-color system (Input, Autocomplete, Searchbar, Textarea, Dropdown — 0.7.6–0.7.8) */
--state-default: #586176; /* primary-600 — default border/text */
--state-hover: #d10334; /* accent-main */
--state-active: #091635; /* primary-main — border + text as of 0.7.8 */
--state-disabled: #c9ccd2; /* primary-300, on white */

/* success-legacy ramp (0.7.2) — fixed green independent of the new red/orange accent,
   for signals that shouldn't shift with a consumer's branding (e.g. Uploader's rename
   success state). Not the same token as `success` (#3ADB30). */
--success-legacy-main: #8dcb2c;

/* Typography */
font-family: 'Nunito', ui-sans-serif, system-ui, sans-serif;

/* Common radii */
--radius-sm: 4px;
--radius-md: 8px; /* NOTE: Button's own `rounded="md"` resolves to an explicit 4px, not Tailwind's default 6px */
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px;

/* Shadows */
box-shadow: 2px 2px 32px 0 rgba(208, 210, 218, 0.25); /* standard card shadow */

/* Transitions */
transition: all 0.2s ease-in-out;

/* Component-scoped CSS vars (set on :host) */
--uploader-accent-color: #d10334; /* was #8DCB2C green pre-0.7.1 */
--dropdown-accent: #d10334; /* was #8DCB2C green pre-0.7.1 */
--content-view-accent: #3b82f6;

/* Brand gradient ("gradient-sunset" in tailwind.config.js) — Button primary default,
   Table's column-filter apply button, Progress/Stepper's own hardcoded copies.
   Exact Figma "Button Gradient" fill style (node 13714:5054): */
--gradient-sunset: linear-gradient(50.43deg, #c41e5c 4.31%, #e8342a 72.15%, #ff6b00 122.85%);
```

**Tailwind color tokens available:**

- `accent.main` → `#D10334` (was `#8DCB2C` pre-0.7.1)
- `primary.main` → `#091635`
- `danger.main` → `#E83E3E`
- `information.main` → `#095AF3`
- `success.main` → `#3ADB30`
- `success-legacy.main` → `#8DCB2C` (0.7.2+ — the old brand green, kept as a distinct fixed-green token)

---

## 4. Button (`ntv-button`)

**Purpose:** General-purpose action button with 14 visual variants, 6 sizes, loading/disabled states, and an optional split-button dropdown.

**Import:** `import { Button } from '@ntv360/component-pantry';`

### Variants

| `variant`         | Appearance                                            |
| ----------------- | ----------------------------------------------------- |
| `primary`         | Solid accent fill (default)                           |
| `secondary`       | Muted/secondary fill                                  |
| `success`         | Green fill                                            |
| `warning`         | Yellow/amber fill                                     |
| `danger`          | Red fill                                              |
| `outline`         | Transparent with border                               |
| `accent`          | Accent-colored outline fill                           |
| `description`     | Subtle text-like button                               |
| `info`            | Blue info fill                                        |
| `ghost`           | No border, no background                              |
| `outline-to-fill` | Outline that fills on hover                           |
| `fill-to-outline` | Filled that outlines on hover                         |
| `gradient`        | Gradient background                                   |
| `split`           | Button + dropdown arrow — use with `showSplitOptions` |

### Inputs

| Input                   | Type                                                                                                       | Default     | Description                                      |
| ----------------------- | ---------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------ |
| `variant`               | `ButtonVariant`                                                                                            | `'primary'` | Visual style (see table above)                   |
| `size`                  | `ButtonSize` (`'xs'\|'sm'\|'md'\|'lg'\|'xl'\|'xxl'`)                                                       | `'md'`      | Button size                                      |
| `color`                 | `ButtonColor \| ''` (`'blue'\|'green'\|'red'\|'yellow'\|'purple'\|'gray'\|'indigo'\|'pink'\|'custom'\|''`) | `''`        | Color override                                   |
| `customColor`           | `string`                                                                                                   | `''`        | Hex/rgb color when `color='custom'`              |
| `disabled`              | `boolean`                                                                                                  | `false`     | Disabled state                                   |
| `loading`               | `boolean`                                                                                                  | `false`     | Shows spinner, disables clicks                   |
| `fullWidth`             | `boolean`                                                                                                  | `false`     | `width: 100%`                                    |
| `rounded`               | `ButtonRounded` (`'none'\|'sm'\|'md'\|'lg'\|'xl'\|'full'`)                                                 | `'md'`      | Border radius                                    |
| `shadow`                | `boolean`                                                                                                  | `true`      | Drop shadow                                      |
| `type`                  | `ButtonType` (`'button'\|'submit'\|'reset'\|'fab'\|'fabRoundedFull'\|'fabInteractive'`)                    | `'button'`  | HTML type / FAB mode                             |
| `fontSize`              | `string`                                                                                                   | `'14px'`    | Font size override                               |
| `contentAlignment`      | `ButtonContentAlignment` (`'center'\|'start'\|'between'`)                                                  | `'center'`  | Outer alignment                                  |
| `innerContentAlignment` | `ButtonInnerContentAlignment` (`'center'\|'start'\|'end'\|'between'`)                                      | `'center'`  | Inner icon/text alignment                        |
| `customHeight`          | `string`                                                                                                   | `''`        | Height override                                  |
| `noFocusRing`           | `boolean`                                                                                                  | `true`      | Remove focus ring                                |
| `hoverColor`            | `string`                                                                                                   | `''`        | Hover text/icon color                            |
| `backgroundColor`       | `string`                                                                                                   | `''`        | Custom background color                          |
| `showSplitOptions`      | `boolean`                                                                                                  | `false`     | Show dropdown options (split variant)            |
| `config`                | `Partial<ButtonConfig>`                                                                                    | `{}`        | Config object (alternative to individual inputs) |

### Outputs

| Output        | Type    | When                                             |
| ------------- | ------- | ------------------------------------------------ |
| `buttonClick` | `Event` | Button clicked (not fired when disabled/loading) |

### Usage Examples

```html
<!-- Primary -->
<ntv-button (buttonClick)="save()">Save</ntv-button>

<!-- Loading state -->
<ntv-button [loading]="isSaving" variant="primary">Save Changes</ntv-button>

<!-- Danger outline -->
<ntv-button variant="outline" color="red" (buttonClick)="delete()">Delete</ntv-button>

<!-- Ghost full-width -->
<ntv-button variant="ghost" [fullWidth]="true">Cancel</ntv-button>

<!-- Success -->
<ntv-button variant="success" (buttonClick)="approve()">Approve</ntv-button>

<!-- Warning -->
<ntv-button variant="warning" (buttonClick)="flag()">Flag</ntv-button>

<!-- Gradient pill -->
<ntv-button variant="gradient" rounded="full" size="lg">Get Started</ntv-button>

<!-- FAB (floating action button) -->
<ntv-button type="fab" size="lg"><svg>...</svg></ntv-button>

<!-- Split button with dropdown -->
<ntv-button variant="split" [showSplitOptions]="open" (buttonClick)="open = !open">
    Actions
</ntv-button>

<!-- Disabled -->
<ntv-button [disabled]="!form.valid" (buttonClick)="submit()">Submit</ntv-button>
```

**Common mistakes:**

- Content (label text, icons) goes inside `<ntv-button>...</ntv-button>` as projected content, not as an input.
- `loading` and `disabled` are independent — set both when needed.
- FAB is set via `type="fab"`, NOT `variant="fab"`. `variant` controls the visual style; `type` controls the button's role/shape.
- `split` variant requires `showSplitOptions` to open/close the dropdown panel.
- Ensure you import `Button` from `@ntv360/component-pantry` (not `ButtonComponent`).

---

## 5. Input (`ntv-input`)

**Purpose:** Text/number/email/password input field with labels, validation, icons, clearable, and multiline support. Implements `ControlValueAccessor` — use with `ngModel` or reactive forms.

**Import:** `import { Input } from '@ntv360/component-pantry';`

### Inputs

| Input              | Type                                                  | Default                | Description                                                            |
| ------------------ | ----------------------------------------------------- | ---------------------- | ---------------------------------------------------------------------- |
| `type`             | `InputType` (`'text'\|'password'\|'email'\|'number'`) | `'text'`               | HTML input type                                                        |
| `id`               | `string`                                              | `''`                   | HTML id                                                                |
| `placeholder`      | `string`                                              | `'Enter your text...'` | Placeholder text                                                       |
| `required`         | `boolean`                                             | `false`                | Required validation                                                    |
| `disabledInput`    | `boolean`                                             | `false`                | Disabled state                                                         |
| `size`             | `InputSize` (`'xs'\|'sm'\|'md'\|'lg'\|'xl'`)          | `'md'`                 | Height/padding size                                                    |
| `borderRadius`     | `string`                                              | `'md'`                 | Tailwind radius token                                                  |
| `clearable`        | `boolean`                                             | `false`                | Show × clear button                                                    |
| `readonly`         | `boolean`                                             | `false`                | Read-only state                                                        |
| `variant`          | `string`                                              | `'default'`            | Visual variant or custom color (e.g., `'default'\|'error'\|'success'`) |
| `borderColor`      | `string\|null`                                        | `null`                 | Custom border color                                                    |
| `hoverBorderColor` | `string\|null`                                        | `null`                 | Hover border color                                                     |
| `focusBorderColor` | `string\|null`                                        | `null`                 | Focus border color                                                     |
| `textColor`        | `string\|null`                                        | `null`                 | Text color override                                                    |
| `placeholderColor` | `string\|null`                                        | `null`                 | Placeholder color override                                             |
| `label`            | `string\|null`                                        | `null`                 | Label above input                                                      |
| `info`             | `string\|null`                                        | `null`                 | Helper text below                                                      |
| `error`            | `string\|null`                                        | `null`                 | Error message below                                                    |
| `showError`        | `boolean`                                             | `true`                 | Show error message                                                     |
| `minValue`         | `number\|null`                                        | `null`                 | Min (number type)                                                      |
| `maxValue`         | `number\|null`                                        | `null`                 | Max (number type)                                                      |
| `maxLength`        | `number\|null`                                        | `null`                 | Max character length                                                   |
| `multiline`        | `boolean`                                             | `false`                | Renders `<textarea>`                                                   |
| `showCharCount`    | `boolean`                                             | `false`                | Character count display                                                |
| `config`           | `Partial<InputConfig>`                                | —                      | Config object                                                          |

### Outputs

| Output         | Type      | When                             |
| -------------- | --------- | -------------------------------- |
| `inputCleared` | `boolean` | User clicks the clear (×) button |

### Usage Examples

```html
<!-- Basic with label -->
<ntv-input label="Full Name" placeholder="John Doe" [(ngModel)]="name" />

<!-- With reactive forms -->
<ntv-input
    [formControl]="emailControl"
    type="email"
    label="Email"
    variant="primary"
    [clearable]="true" />

<!-- Error state -->
<ntv-input label="Username" [error]="usernameError" variant="error" [(ngModel)]="username" />

<!-- Number with bounds -->
<ntv-input type="number" label="Age" [minValue]="0" [maxValue]="120" [(ngModel)]="age" />

<!-- Multiline (textarea) -->
<ntv-input
    label="Bio"
    [multiline]="true"
    [maxLength]="500"
    [showCharCount]="true"
    [(ngModel)]="bio" />

<!-- Clearable with custom colors -->
<ntv-input
    [clearable]="true"
    focusBorderColor="#8DCB2C"
    (inputCleared)="onClear()"
    [(ngModel)]="search" />
```

**Common mistakes:**

- Use `disabledInput` (not `disabled`) to disable the input.
- For multiline, prefer `ntv-textarea` for dedicated styling.
- `variant` controls border color; combine with `error` for validation UI.
- Import `Input` from `@ntv360/component-pantry` (not `InputComponent`).

---

## 6. Textarea (`ntv-textarea`)

**Purpose:** Multi-line text input with label, validation, char count, and clear button. Implements `ControlValueAccessor`.

**Import:** `import { Textarea } from '@ntv360/component-pantry';`

### Inputs

| Input                | Type                                       | Default                | Description                   |
| -------------------- | ------------------------------------------ | ---------------------- | ----------------------------- |
| `id`                 | `string`                                   | `''`                   | HTML id                       |
| `placeholder`        | `string`                                   | `'Enter your text...'` | Placeholder                   |
| `required`           | `boolean`                                  | `false`                | Required                      |
| `disabledInput`      | `boolean`                                  | `false`                | Disabled                      |
| `size`               | `'xs'\|'sm'\|'md'\|'lg'\|'xl'`             | `'md'`                 | Text size (xs=12px → xl=18px) |
| `borderRadius`       | `string`                                   | `'md'`                 | Radius token                  |
| `clearable`          | `boolean`                                  | `false`                | Show × button                 |
| `variant`            | `'default'\|'primary'\|'success'\|'error'` | `'default'`            | Border variant                |
| `label`              | `string\|null`                             | `null`                 | Label                         |
| `info`               | `string\|null`                             | `null`                 | Helper text                   |
| `error`              | `string\|null`                             | `null`                 | Error message                 |
| `showError`          | `boolean`                                  | `true`                 | Show error                    |
| `maxlength`          | `number\|null`                             | `null`                 | Max chars                     |
| `showCharacterCount` | `boolean`                                  | `false`                | Char count                    |
| `config`             | `Partial<TextareaConfig>`                  | —                      | Config object                 |

### Outputs

| Output         | Type      | When                 |
| -------------- | --------- | -------------------- |
| `inputCleared` | `boolean` | Clear button clicked |

### Usage Example

```html
<ntv-textarea
    label="Description"
    placeholder="Describe your content..."
    [maxlength]="1000"
    [showCharacterCount]="true"
    variant="primary"
    [(ngModel)]="description" />
```

---

## 7. Checkbox (`ntv-checkbox`)

**Purpose:** Styled checkbox with indeterminate state, color variants, and size options.

**Import:** `import { CheckboxComponent } from '@ntv360/component-pantry';`

### Inputs

| Input                | Type                                                                    | Default     | Description               |
| -------------------- | ----------------------------------------------------------------------- | ----------- | ------------------------- |
| `label`              | `string`                                                                | `''`        | Label text                |
| `checked`            | `boolean`                                                               | `true`      | Checked state             |
| `disabled`           | `boolean`                                                               | `false`     | Disabled                  |
| `indeterminate`      | `boolean`                                                               | `false`     | Indeterminate (−) state   |
| `size`               | `'xs'\|'sm'\|'md'\|'lg'\|'xl'`                                          | `'md'`      | Size                      |
| `color`              | `'accent'\|'primary'\|'danger'\|'success'\|'warning'\|'info'\|'custom'` | `'accent'`  | Checked color             |
| `customColor`        | `string`                                                                | `''`        | Hex when `color='custom'` |
| `indeterminateColor` | `CheckboxColor\|undefined`                                              | `undefined` | Indeterminate color       |
| `required`           | `boolean`                                                               | `false`     | Required                  |
| `config`             | `Partial<CheckboxConfig>`                                               | `{}`        | Config object             |

### Outputs

| Output          | Type                                         | When                |
| --------------- | -------------------------------------------- | ------------------- |
| `checkedChange` | `boolean`                                    | Check state changes |
| `stateChange`   | `{checked: boolean; indeterminate: boolean}` | Any state change    |

### Usage Example

```html
<!-- Simple checkbox -->
<ntv-checkbox label="Accept terms" [checked]="agreed" (checkedChange)="agreed = $event" />

<!-- Select-all with indeterminate -->
<ntv-checkbox
    label="Select All"
    [checked]="allSelected"
    [indeterminate]="someSelected"
    (checkedChange)="toggleAll($event)" />

<!-- Danger color -->
<ntv-checkbox label="Delete all" color="danger" [(ngModel)]="confirmDelete" />
```

---

## 8. Toggle Button (`ntv-toggle-button`)

**Purpose:** iOS-style toggle switch with label positioning and color variants.

**Import:** `import { ToggleButton } from '@ntv360/component-pantry';`

### Inputs

| Input           | Type                                                                  | Default          | Description               |
| --------------- | --------------------------------------------------------------------- | ---------------- | ------------------------- |
| `checked`       | `boolean`                                                             | `false`          | On/off state              |
| `disabled`      | `boolean`                                                             | `false`          | Disabled                  |
| `size`          | `'xs'\|'sm'\|'md'\|'lg'\|'xl'`                                        | `'md'`           | Toggle size               |
| `color`         | `'accent_color'\|'primary'\|'danger'\|'success'\|'warning'\|'custom'` | `'accent_color'` | Track color when on       |
| `customColor`   | `string`                                                              | `''`             | Hex when `color='custom'` |
| `label`         | `string`                                                              | `''`             | Label text                |
| `labelPosition` | `'left'\|'right'`                                                     | `'right'`        | Label position            |
| `config`        | `ToggleButtonConfig`                                                  | —                | Config object             |

### Outputs

| Output          | Type      | When                     |
| --------------- | --------- | ------------------------ |
| `toggled`       | `boolean` | Toggle state changes     |
| `checkedChange` | `boolean` | Same — alias for ngModel |

### Usage Example

```html
<ntv-toggle-button
    label="Enable notifications"
    [checked]="notifications"
    (toggled)="notifications = $event" />

<!-- Video optimization toggle (custom color) -->
<ntv-toggle-button
    [checked]="optimizeVideo"
    color="custom"
    customColor="#8DCB2C"
    labelPosition="left"
    label="Optimize"
    (toggled)="file.optimizeVideo = $event" />
```

---

## 9. Dropdown (`ntv-dropdown`)

**Purpose:** Single-select dropdown with configurable variants, sizes, icons, badges, and custom theming. Built on top of `ntv-button`. **Does not implement `ControlValueAccessor`** — use the `value` input and `valueChange` output for form integration.

**Import:** `import { Dropdown } from '@ntv360/component-pantry';`

### Variants & Theming

- **Visual Variant (`variant`):** Supports `'default' | 'ghost' | 'soft'` OR any valid custom hex color string (e.g., `'#6366f1'`). The hex color sets a CSS `--dropdown-accent` custom property that themes the trigger.
- **Size (`size`):** Aliases `InputSize` — `'xs' | 'sm' | 'md' | 'lg' | 'xl'` with fixed heights (28/32/40/48/56px).
- **Hover colors:** `hoverColor` (text/border) and `hoverBgColor` (background) are applied as CSS custom properties on the host element for option-level theming.

### Inputs

| Input           | Type                                                     | Default              | Description                                                       |
| --------------- | -------------------------------------------------------- | -------------------- | ----------------------------------------------------------------- |
| `options`       | `DropdownOption[]`                                       | `[]`                 | Array of selectable options                                       |
| `label`         | `string\|null`                                           | `null`               | Field label above trigger                                         |
| `placeholder`   | `string`                                                 | `'Select an option'` | Placeholder when no value selected                                |
| `size`          | `DropdownSize` (`'xs'\|'sm'\|'md'\|'lg'\|'xl'`)          | `'md'`               | Trigger height (28/32/40/48/56px)                                 |
| `variant`       | `DropdownVariant` (`'default'\|'ghost'\|'soft'\|string`) | `'default'`          | Visual style or custom hex color                                  |
| `disabled`      | `boolean`                                                | `false`              | Disabled state                                                    |
| `fullWidth`     | `boolean`                                                | `true`               | Stretch trigger to container width                                |
| `showCheckmark` | `boolean`                                                | `true`               | Checkmark icon on selected option                                 |
| `closeOnSelect` | `boolean`                                                | `true`               | Close panel on selection                                          |
| `borderRadius`  | `string`                                                 | `'md'`               | Trigger border radius token                                       |
| `defaultOpen`   | `boolean`                                                | `false`              | Open panel on mount                                               |
| `value`         | `string\|number\|null`                                   | `null`               | Pre-selected value (matches `option.value`)                       |
| `zIndex`        | `number`                                                 | `50`                 | Panel z-index (note: `DEFAULT_DROPDOWN_CONFIG.zIndex` is `10000`) |
| `minWidth`      | `string`                                                 | `'200px'`            | Host element min-width                                            |
| `maxWidth`      | `string`                                                 | `'320px'`            | Host element max-width                                            |
| `hoverColor`    | `string`                                                 | `''`                 | Trigger/option hover text color                                   |
| `hoverBgColor`  | `string`                                                 | `''`                 | Option hover background color                                     |
| `config`        | `Partial<DropdownConfig>`                                | —                    | DRY config object (merged with individual inputs)                 |

### Outputs

| Output            | Type                   | When                                     |
| ----------------- | ---------------------- | ---------------------------------------- |
| `selectionChange` | `DropdownOption\|null` | Option selected or cleared               |
| `valueChange`     | `string\|number\|null` | Selected value field changes             |
| `openChange`      | `boolean`              | Panel opens (`true`) or closes (`false`) |

### Types

```typescript
export type DropdownSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'; // aligned with InputSize

export type DropdownVariant = 'default' | 'ghost' | 'soft' | string; // string = custom hex

export interface DropdownOption {
    readonly label: string;
    readonly value: string | number;
    readonly description?: string; // Secondary text shown below label
    readonly icon?: string; // SVG string
    readonly disabled?: boolean;
    readonly badge?: string; // Badge label text
    readonly badgeColor?: string; // Badge background color (hex)
}

export interface DropdownConfig {
    readonly options?: DropdownOption[];
    readonly label?: string | null;
    readonly placeholder?: string;
    readonly size?: DropdownSize;
    readonly variant?: DropdownVariant;
    readonly disabled?: boolean;
    readonly fullWidth?: boolean;
    readonly minWidth?: string;
    readonly maxWidth?: string;
    readonly showCheckmark?: boolean;
    readonly closeOnSelect?: boolean;
    readonly borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | string;
    readonly defaultOpen?: boolean;
    readonly value?: string | number | null;
    readonly zIndex?: number;
    readonly hoverColor?: string;
    readonly hoverBgColor?: string;
}
```

### Public Methods

Available via `@ViewChild(Dropdown)`:

| Method               | Description                                    |
| -------------------- | ---------------------------------------------- |
| `open()`             | Opens the panel                                |
| `close()`            | Closes the panel                               |
| `toggleOpen()`       | Toggles panel open/closed                      |
| `clearSelection()`   | Clears selection, emits `null`                 |
| `isSelected(option)` | Returns `true` if option is currently selected |

### Usage Examples

#### 1. Basic

```html
<ntv-dropdown
    label="Status"
    [options]="statusOptions"
    [value]="selectedStatus"
    (selectionChange)="onStatus($event)" />
```

#### 2. DRY Config Pattern

```html
<ntv-dropdown [config]="dropdownConfig" (selectionChange)="onTimezoneSelected($event)" />
```

```typescript
dropdownConfig: DropdownConfig = {
    options: this.timezoneOptions,
    placeholder: 'Timezone',
    size: 'md',
    variant: 'default',
    fullWidth: true,
};
```

#### 3. Variants

```html
<!-- Default outline -->
<ntv-dropdown [options]="options" variant="default" />

<!-- Soft filled background -->
<ntv-dropdown [options]="options" variant="soft" />

<!-- Ghost (no background/border) -->
<ntv-dropdown [options]="options" variant="ghost" />

<!-- Custom accent color -->
<ntv-dropdown [options]="options" variant="#6366f1" />
```

#### 4. Options with Icons and Badges

```typescript
options: DropdownOption[] = [
  { label: 'Published', value: 'published', badge: 'Live', badgeColor: '#22c55e' },
  { label: 'Draft', value: 'draft', description: 'Not visible to users', badge: 'Draft', badgeColor: '#f59e0b' },
  { label: 'Archived', value: 'archived', disabled: true },
];
```

**Common mistakes:**

- Import `Dropdown` from `@ntv360/component-pantry` (not `DropdownComponent`).
- `Dropdown` does NOT implement `ControlValueAccessor` — it is **not** compatible with `ngModel` or `formControlName`. Use `[value]` + `(valueChange)` for two-way binding instead.
- `selectionChange` emits `null` when the user clears the selection.
- `variant` accepts `'default' | 'ghost' | 'soft'` or a **hex color string** — not `'primary'` or `'outline'`.
- `minWidth`/`maxWidth` apply to the **host element**, not the panel. The panel inherits these dimensions.

---

## 10. Autocomplete (`ntv-autocomplete`)

**Purpose:** Multi-select tag-input with search, custom filtering, checkbox options, and color theming. Implements `ControlValueAccessor` for seamless integration with Angular forms.

**Import:** `import { Autocomplete } from '@ntv360/component-pantry';`

### Variants & Theming

- **Size (`size`):** Supports `'xs' | 'sm' | 'md' | 'lg' | 'xl'` (default: `'md'`).
- **Visual Variant (`variant`):** Supports standard semantic strings `'default' | 'primary' | 'success' | 'danger'` OR any valid custom hex color string (e.g., `'#6366f1'`).
- **Chip Color (`chipColor`):** Controls selected tag colors in multiple selection mode. Supports `'primary' | 'success' | 'warning' | 'error' | 'purple' | 'pink' | 'indigo' | 'gray'` (default: `'primary'`).
- **Custom Chip Colors (`customChipColors`):** Fine-grained override object with shape `{ bg?, text?, border?, bgHover? }`.
- **Option Colors (`optionColors`):** Fine-grained dropdown option states override object with shape `{ hover?, selected?, hoverText?, selectedText? }`.
- **Checkbox Colors (`checkboxColors`):** Checkbox states override object (used when `checkbox: true` in config) with shape `{ border?, borderChecked?, background?, backgroundChecked?, checkmark?, hover? }`.

### Inputs

| Input                     | Type                                                                             | Default     | Description                                                 |
| ------------------------- | -------------------------------------------------------------------------------- | ----------- | ----------------------------------------------------------- |
| `options`                 | `AutocompleteData`                                                               | `[]`        | Option list (`AutocompleteOption[] \| AutocompleteGroup[]`) |
| `config`                  | `Partial<AutocompleteConfig>`                                                    | `{}`        | Configuration object (merges with defaults)                 |
| `customFilter`            | `AutocompleteFilterFn\|null`                                                     | `null`      | Override built-in search filter                             |
| `customDropdownPlacement` | `'below'\|'above'\|null`                                                         | `null`      | Force panel position                                        |
| `loading`                 | `boolean`                                                                        | `false`     | Loading state (displays `loadingText`)                      |
| `disabled`                | `boolean`                                                                        | `false`     | Disabled state                                              |
| `deletable`               | `boolean`                                                                        | `false`     | Show delete icon on deletable options                       |
| `size`                    | `InputSize` (`'xs'\|'sm'\|'md'\|'lg'\|'xl'`)                                     | `'md'`      | Input field size                                            |
| `variant`                 | `string`                                                                         | `'default'` | Visual variant or custom hex color                          |
| `label`                   | `string\|null`                                                                   | `null`      | Field label                                                 |
| `showLabel`               | `boolean`                                                                        | `true`      | Show label                                                  |
| `error`                   | `string\|null`                                                                   | `null`      | Error message                                               |
| `info`                    | `string\|null`                                                                   | `null`      | Helper text                                                 |
| `id`                      | `string`                                                                         | `''`        | HTML id                                                     |
| `maxDisplayChips`         | `number`                                                                         | `5`         | Max visible chips before "+N more"                          |
| `mainHoverColor`          | `string`                                                                         | `''`        | Custom hover color CSS variable                             |
| `hoverBgColor`            | `string`                                                                         | `''`        | Custom hover background color CSS variable                  |
| `chipColor`               | `string`                                                                         | `'primary'` | Chip color scheme                                           |
| `customChipColors`        | `{bg?; text?; border?; bgHover?}`                                                | `{}`        | Custom chip styling overrides                               |
| `optionColors`            | `{hover?; selected?; hoverText?; selectedText?}`                                 | `{}`        | Option state color overrides                                |
| `checkboxColors`          | `{border?; borderChecked?; background?; backgroundChecked?; checkmark?; hover?}` | `{}`        | Checkbox color overrides                                    |

### Outputs

| Output            | Type                      | When                                        |
| ----------------- | ------------------------- | ------------------------------------------- |
| `selectionChange` | `AutocompleteChangeEvent` | Selection changes                           |
| `searchChange`    | `string`                  | Search text changes (debounced)             |
| `dropdownToggle`  | `boolean`                 | Panel opens/closes                          |
| `deleteOption`    | `AutocompleteOption`      | Option deleted (when `deletable` is active) |

### Types

```typescript
export interface AutocompleteOption {
    value: unknown;
    label: string;
    disabled?: boolean;
    group?: string;
    selected?: boolean;
    status?: string; // 'new' or 'draft' are deletable by default
    deletable?: boolean; // Explicit per-option override for delete action
}

export interface AutocompleteGroup {
    label: string;
    options: AutocompleteOption[];
}

export type AutocompleteData = AutocompleteOption[] | AutocompleteGroup[];

export type AutocompleteFilterFn = (option: AutocompleteOption, searchTerm: string) => boolean;

export interface AutocompleteChangeEvent {
    value: unknown; // Single value (e.g. string/number) or array (if multiple is true)
    option: AutocompleteOption | AutocompleteOption[] | null;
}

export interface AutocompleteConfig {
    placeholder?: string;
    searchable?: boolean;
    clearable?: boolean;
    multiple?: boolean;
    checkbox?: boolean;
    maxSelections?: number;
    minSearchLength?: number;
    debounceTime?: number;
    noResultsText?: string;
    loadingText?: string;
    maxDisplayItems?: number;
    optionColors?: {
        hover?: string;
        selected?: string;
        hoverText?: string;
        selectedText?: string;
    };
    checkboxColors?: {
        border?: string;
        borderChecked?: string;
        background?: string;
        backgroundChecked?: string;
        checkmark?: string;
        hover?: string;
    };
}
```

### Usage Examples

#### 1. DRY Config Pattern (Single Selection)

```html
<ntv-autocomplete [options]="countries" [config]="countryConfig" [(ngModel)]="selectedCountry" />
```

```typescript
countryConfig: AutocompleteConfig = {
  placeholder: 'Search countries...',
  searchable: true,
  clearable: true
};

countries: AutocompleteOption[] = [
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' }
];
selectedCountry = 'us';
```

#### 2. Multiple Selection with Chips

```html
<ntv-autocomplete
    label="Technologies"
    [options]="techOptions"
    [config]="{ multiple: true, maxSelections: 5 }"
    chipColor="success"
    [maxDisplayChips]="3"
    [(ngModel)]="selectedTechs" />
```

#### 3. Checkbox Multi-Select Dropdown

```html
<ntv-autocomplete
    label="Select Roles"
    [options]="roleOptions"
    [config]="{ multiple: true, checkbox: true, searchable: true }"
    [(ngModel)]="selectedRoles" />
```

#### 4. Custom Colors and Themes

```html
<ntv-autocomplete
    [options]="options"
    [config]="{ multiple: true }"
    chipColor="purple"
    [customChipColors]="{ bg: '#ede9fe', text: '#6d28d9', border: '#c4b5fd' }"
    [optionColors]="{ hover: '#f5f3ff', selected: '#ede9fe', selectedText: '#6d28d9' }" />
```

**Common mistakes:**

- Import `Autocomplete` from `@ntv360/component-pantry` (not `AutocompleteComponent`).
- The `selectionChange` event payload is an `AutocompleteChangeEvent` containing both `{ value, option }`.
- Ensure options match the `AutocompleteOption[]` or `AutocompleteGroup[]` format.
- Pre-select checkbox/multiple items by setting `selected: true` on the option objects during initialization.

---

## 11. Searchbar (`ntv-searchbar`)

**Purpose:** Search input with optional outer search button, clear button, icon positioning, autocomplete dropdown, and per-field color overrides.

**Import:** `import { Searchbar } from '@ntv360/component-pantry';`

### Variants & Theming

- **Visual Variant (`variant`):** Inherits from `InputVariant = 'default' | 'error' | 'success' | string`. The `string` form accepts a custom hex color applied as the input border. There is **no `'pill'` variant** — use `borderRadius="full"` to achieve a pill shape.
- **Size (`size`):** `'xs' | 'sm' | 'md' | 'lg' | 'xl'` (default: `'md'`). Controls both the input field height and the outer search button height via `BUTTON_SIZE_MAP`.
- **Border Radius (`borderRadius`):** `'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'` (default: `'md'`). Applied to both the input and the search button via `BORDER_RADIUS_MAP`.
- **Button color:** Use `buttonBgColor` to set the search button background (default: `'#8DCB2C'`). This sets the `--header-bg-color` CSS custom property on the host.

### Icon Placement

Icon placement is controlled by `searchIconPosition`:

- **`'left'`** (default): Search icon is injected via `left-icon` slot of `ntv-input`, appearing inside the input on the left.
- **`'right'`** (any value other than `'left'`): Search icon is injected via `right-addon` slot, appearing on the right side of the input.

When `hideOuterSearchButton` is `true`, the icon inside the input becomes **clickable** and acts as the search trigger — no outer button is rendered.

You can also inject **custom icons** via template refs:

```html
<!-- Custom left icon via template -->
<ntv-searchbar [leftIconTemplate]="myLeftIcon" />
<ng-template #myLeftIcon>
    <svg>...</svg>
</ng-template>

<!-- Custom right icon via template -->
<ntv-searchbar [rightIconTemplate]="myRightIcon" />
<ng-template #myRightIcon>
    <svg>...</svg>
</ng-template>
```

### Inputs

| Input                      | Type                                             | Default       | Description                                                     |
| -------------------------- | ------------------------------------------------ | ------------- | --------------------------------------------------------------- |
| `label`                    | `string`                                         | `''`          | Field label                                                     |
| `showLabel`                | `boolean`                                        | `true`        | Show label                                                      |
| `placeholder`              | `string`                                         | `'Search...'` | Input placeholder                                               |
| `variant`                  | `SearchbarVariant` (= `InputVariant`)            | `'default'`   | Visual variant (`'default'\|'error'\|'success'\|string` hex)    |
| `size`                     | `SearchbarSize` (`'xs'\|'sm'\|'md'\|'lg'\|'xl'`) | `'md'`        | Input + button height                                           |
| `borderRadius`             | `'none'\|'sm'\|'md'\|'lg'\|'xl'\|'full'`         | `'md'`        | Input + button radius                                           |
| `disabled`                 | `boolean`                                        | `false`       | Disabled state                                                  |
| `isLoading`                | `boolean`                                        | `false`       | Shows loading spinner in results                                |
| `showClearButton`          | `boolean`                                        | `false`       | Shows × clear button (only when input has value)                |
| `hideOuterSearchButton`    | `boolean`                                        | `false`       | Hides the outer "Search" button; icon becomes clickable trigger |
| `searchIconPosition`       | `'left'\|'right'`                                | `'left'`      | Search icon position inside the input                           |
| `leftIconTemplate`         | `TemplateRef<void>\|null`                        | `null`        | Custom left icon template                                       |
| `rightIconTemplate`        | `TemplateRef<void>\|null`                        | `null`        | Custom right icon template                                      |
| `enableAutoComplete`       | `boolean`                                        | `false`       | Show autocomplete dropdown as user types                        |
| `data`                     | `Location[]`                                     | `[]`          | Autocomplete data `{id, title, description}`                    |
| `showNoResults`            | `boolean`                                        | `false`       | Show "No results found" when empty                              |
| `skipFiltering`            | `boolean`                                        | `false`       | Disable built-in filtering (use for API-driven search)          |
| `minCharacters`            | `number`                                         | `3`           | Min chars to enable search button / trigger autocomplete        |
| `showMinCharacters`        | `boolean`                                        | `false`       | Append `(min N characters)` hint to placeholder                 |
| `minCharactersPlaceholder` | `string`                                         | `''`          | Override the min-char hint text                                 |
| `searchValue`              | `string`                                         | `''`          | Controlled search value                                         |
| `buttonBgColor`            | `string`                                         | `'#8DCB2C'`   | Search button background (CSS var `--header-bg-color`)          |
| `inputBorderColor`         | `string\|null`                                   | `null`        | Input border color override                                     |
| `inputHoverBorderColor`    | `string\|null`                                   | `null`        | Input hover border color                                        |
| `inputFocusBorderColor`    | `string\|null`                                   | `null`        | Input focus border color                                        |
| `inputTextColor`           | `string\|null`                                   | `null`        | Input text color                                                |
| `inputPlaceholderColor`    | `string\|null`                                   | `null`        | Input placeholder color                                         |

### Types

```typescript
export type SearchbarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Inherits InputVariant: 'default' | 'error' | 'success' | string (custom hex)
export type SearchbarVariant = InputVariant;

export interface SearchbarConfig {
    placeholder?: string;
    minCharacters?: number;
    size?: SearchbarSize;
    variant?: SearchbarVariant;
    disabled?: boolean;
}

// Internal Location type used by autocomplete data
interface Location {
    id: string;
    title: string;
    description: string;
}
```

### Outputs

| Output          | Type       | When                                                             |
| --------------- | ---------- | ---------------------------------------------------------------- |
| `buttonClick`   | `void`     | Outer button (or icon when `hideOuterSearchButton=true`) clicked |
| `selectedValue` | `Location` | User selects an autocomplete result item                         |

### Usage Examples

#### 1. Basic with outer search button

```html
<ntv-searchbar placeholder="Search..." [minCharacters]="2" (buttonClick)="onSearch()" />
```

#### 2. Icon-only (no outer button), icon on left

```html
<ntv-searchbar
    [hideOuterSearchButton]="true"
    searchIconPosition="left"
    [minCharacters]="1"
    (buttonClick)="onSearch()" />
```

#### 3. Icon on right side

```html
<ntv-searchbar
    searchIconPosition="right"
    placeholder="Search users..."
    (buttonClick)="onSearch()" />
```

#### 4. Pill shape with clear button

```html
<!-- borderRadius="full" produces a pill shape — there is NO variant="pill" -->
<ntv-searchbar
    borderRadius="full"
    [showClearButton]="true"
    placeholder="Search content..."
    [searchValue]="query"
    (buttonClick)="search()" />
```

#### 5. Autocomplete with API-driven search

```html
<ntv-searchbar
    [enableAutoComplete]="true"
    [data]="suggestions"
    [isLoading]="isSearching"
    [skipFiltering]="true"
    [showNoResults]="true"
    [minCharacters]="2"
    (buttonClick)="fetchResults()"
    (selectedValue)="onSelect($event)" />
```

#### 6. Full color customization

```html
<ntv-searchbar
    inputBorderColor="#6366f1"
    inputFocusBorderColor="#4f46e5"
    buttonBgColor="#6366f1"
    borderRadius="lg"
    size="lg" />
```

**Common mistakes:**

- There is **no `variant="pill"`** — use `borderRadius="full"` instead.
- `variant` accepts `'default' | 'error' | 'success'` or a custom hex string. It controls the **input border color** only, not the button style.
- `buttonClick` emits `void`. Read the current term from a bound `[searchValue]` signal or local variable.
- `selectedValue` fires only when clicking an **autocomplete result item** — not on button click.
- When `skipFiltering="true"`, you must update `[data]` reactively in `(buttonClick)`. The component will not filter the array for you.

---

## 12. Tabs (`ntv-tabs`)

**Purpose:** Horizontal tab navigation bar with active state and disabled tab support.

**Import:** `import { Tabs } from '@ntv360/component-pantry';`

### Inputs

| Input         | Type                  | Default | Description                                  |
| ------------- | --------------------- | ------- | -------------------------------------------- |
| `tabs`        | `TabHeader[]`         | `[]`    | Tab config array `{label, disabled?, icon?}` |
| `activeIndex` | `number`              | `0`     | Currently active tab index                   |
| `config`      | `Partial<TabsConfig>` | —       | Config object                                |

### Outputs

| Output      | Type     | When                                |
| ----------- | -------- | ----------------------------------- |
| `tabChange` | `number` | User clicks a tab (emits new index) |

### Usage Example

```html
<ntv-tabs [tabs]="tabs" [activeIndex]="activeTab" (tabChange)="activeTab = $event" />

@switch (activeTab) { @case (0) { <app-overview /> } @case (1) { <app-details /> } @case (2) {
<app-settings /> } }
```

```typescript
tabs: TabHeader[] = [
  { label: 'Overview' },
  { label: 'Details' },
  { label: 'Settings', disabled: true }
];
```

---

## 13. Accordion (`ntv-accordion`)

**Purpose:** Expandable/collapsible content panel with icon, animation, and group-sync support.

**Import:** `import { Accordion } from '@ntv360/component-pantry';`

### Inputs

| Input         | Type                                                  | Default     | Description                                   |
| ------------- | ----------------------------------------------------- | ----------- | --------------------------------------------- |
| `variant`     | `AccordionVariant` (`'default'\|'bordered'\|'flush'`) | `'default'` | Visual style                                  |
| `size`        | `AccordionSize` (`'sm'\|'md'\|'lg'`)                  | `'md'`      | Padding/text size                             |
| `animated`    | `boolean`                                             | `true`      | Animate open/close                            |
| `showIcons`   | `boolean`                                             | `true`      | Show chevron icon                             |
| `initialOpen` | `boolean`                                             | `false`     | Open by default                               |
| `disabled`    | `boolean`                                             | `false`     | Disabled                                      |
| `group`       | `string\|undefined`                                   | `undefined` | Group key — only one open at a time per group |
| `config`      | `AccordionConfig`                                     | —           | Config object                                 |

### Outputs

| Output            | Type      | When                                     |
| ----------------- | --------- | ---------------------------------------- |
| `accordionToggle` | `boolean` | Panel opens (`true`) or closes (`false`) |

### Usage Example

```html
<!-- Header goes in slot="header", content/body goes in slot="body" -->
<ntv-accordion variant="bordered" group="settings">
    <span slot="header">General Settings</span>
    <p slot="body">Content goes here...</p>
</ntv-accordion>

<ntv-accordion variant="bordered" group="settings">
    <span slot="header">Advanced Settings</span>
    <p slot="body">More content...</p>
</ntv-accordion>
```

**Common mistakes:**

- `group` enables accordion-group behavior (only one open). All accordions in a group must share the same `group` string.
- Header content is projected via `slot="header"`.
- Body content is projected via `slot="body"`. Using default (unnamed) slot for body content is incorrect and will not be displayed.
- Import `Accordion` from `@ntv360/component-pantry` (not `AccordionComponent`).

---

## 14. Card (`ntv-card`)

**Purpose:** Container card with variant styles, shadows, border radius, hover effects, and click handler.

**Import:** `import { CardComponent } from '@ntv360/component-pantry';`

### Inputs

| Input             | Type                                                   | Default     | Description            |
| ----------------- | ------------------------------------------------------ | ----------- | ---------------------- |
| `variant`         | `'default'\|'filled'\|'outlined'\|'elevated'\|'ghost'` | `'default'` | Visual style           |
| `rounded`         | `'none'\|'sm'\|'md'\|'lg'\|'xl'\|'full'`               | `'md'`      | Border radius          |
| `shadow`          | `'none'\|'xs'\|'sm'\|'md'\|'lg'\|'xl'`                 | `'sm'`      | Shadow level           |
| `backgroundColor` | `string`                                               | `''`        | Custom bg color        |
| `borderColor`     | `string`                                               | `''`        | Custom border color    |
| `gradient`        | `string`                                               | `''`        | CSS gradient string    |
| `hoverEffect`     | `boolean`                                              | `false`     | Lift on hover          |
| `clickable`       | `boolean`                                              | `false`     | Pointer cursor + focus |
| `fullWidth`       | `boolean`                                              | `false`     | Full width             |
| `noBorder`        | `boolean`                                              | `false`     | Remove border          |
| `config`          | `Partial<CardConfig>`                                  | —           | Config object          |

### Outputs

| Output      | Type    | When                            |
| ----------- | ------- | ------------------------------- |
| `cardClick` | `Event` | Card clicked (when `clickable`) |

### Usage Example

```html
<ntv-card variant="elevated" [hoverEffect]="true" [clickable]="true" (cardClick)="navigate()">
    <h3>Card Title</h3>
    <p>Card content goes here.</p>
</ntv-card>
```

---

## 15. Modal (`ntv-modal`)

**Purpose:** Advanced reusable modal dialog overlay with support for content projection, backdrop styles, transition animations, and pre-built variant structures (confirmation, loading, status alerts).

**Import:** `import { Modal } from '@ntv360/component-pantry';`

### Sizing & Customization

1. **Size Preset (`size`):** `'small' | 'medium' | 'large' | 'xlarge' | 'confirmation' | 'success' | 'error' | 'loading'`. Maps to widths defined in `MODAL_SIZE_PRESETS` (ranging from `280px` to `1000px`).
2. **Custom Sizing Inputs:**
    - `modalWidth` (string, e.g. `'500px'`, `'60%'`) overrides size preset.
    - `modalHeight` (string) overrides height.
3. **Custom Sizing Config:** Pass custom dimensions within `config.customSize` of type `ModalStyleConfig` (`width`, `height`, `maxWidth`, `maxHeight`, `minWidth`, `minHeight`, `padding`).
4. **Content Projection Slots:**
    - **Header:** Project using the `[modal-header]` attribute selector (renders only if `showHeader` is true).
    - **Footer:** Project using the `[modal-footer]` attribute selector (renders only if `showFooter` is true).
    - **Body (Default):** Project standard children inside the modal tag (falls into default projection).
5. **Visual Classes:** Add custom styles to the modal container using `customClass`.

### Controlling Close Behavior (Disabling triggers)

- **Disable Backdrop Dismiss:** Set `[closeOnBackdrop]="false"` (backdrop click is ignored).
- **Disable Escape Key Dismiss:** Set `[closeOnEscape]="false"` (Escape keypress is ignored).
- **Hide Header Close Icon:** Set `[closable]="false"` (hides the × close button).
- **Prevent Closing Entirely:** Set `[preventClose]="true"`. This blocks all dismissal attempts (backdrop, Escape, close button) until toggled back to `false` (ideal during active API/saving states).

### Inputs

| Input                           | Type               | Default               | Description                                                            |
| ------------------------------- | ------------------ | --------------------- | ---------------------------------------------------------------------- |
| `isVisible`                     | `boolean`          | `false`               | Declaratively opens/closes the modal                                   |
| `config`                        | `ModalConfig`      | —                     | Combined configuration object                                          |
| `variant`                       | `ModalVariant`     | `'default'`           | Modal type: `'default'\|'confirmation'\|'success'\|'error'\|'loading'` |
| `size`                          | `ModalSizeVariant` | `'medium'`            | Sizing preset (small, medium, large, xlarge, etc.)                     |
| `position`                      | `ModalPosition`    | `'center'`            | Vertical screen position: `'center'\|'top'\|'bottom'`                  |
| `backdrop`                      | `ModalBackdrop`    | `'blur'`              | Backdrop visual: `'blur'\|'dark'\|'none'\|'glass'\|'gradient'`         |
| `closable`                      | `boolean`          | `true`                | Show × close button in the header                                      |
| `closeOnBackdrop`               | `boolean`          | `true`                | Click outside modal content card to close                              |
| `closeOnEscape`                 | `boolean`          | `true`                | Press Escape key to close                                              |
| `preventClose`                  | `boolean`          | `false`               | Ignore all close actions/triggers                                      |
| `fullscreen`                    | `boolean`          | `false`               | Render modal full-width and full-height                                |
| `scrollable`                    | `boolean`          | `false`               | Enable vertical scrolling inside the modal body                        |
| `centered`                      | `boolean`          | `true`                | Center the modal overlay vertically                                    |
| `showHeader`                    | `boolean`          | `true`                | Renders projected `[modal-header]` and close icon                      |
| `showFooter`                    | `boolean`          | `false`               | Renders projected `[modal-footer]`                                     |
| `headerTitle`                   | `string`           | `''`                  | Title text in header (if `showHeader` is true)                         |
| `headerSubtitle`                | `string`           | `''`                  | Subtitle text in header                                                |
| `customClass`                   | `string`           | `''`                  | Extra class name applied to host element                               |
| `animation`                     | `boolean`          | `true`                | Enable enter/exit transition animations                                |
| `grayBackground`                | `boolean`          | `true`                | Toggles subtle background color variants on overlay/card               |
| `modalWidth`                    | `string`           | `''`                  | Custom width override (e.g. `'650px'`, `'80vw'`)                       |
| `modalHeight`                   | `string`           | `''`                  | Custom height override                                                 |
| **Confirmation Variant Inputs** |                    |                       |                                                                        |
| `confirmationTitle`             | `string`           | `'Confirm to Delete'` | Header title for confirmation layout                                   |
| `confirmationMessage`           | `string`           | `'Are you sure...'`   | Body text description                                                  |
| `confirmButtonText`             | `string`           | `'Confirm'`           | Confirm CTA button text                                                |
| `cancelButtonText`              | `string`           | `'Back'`              | Cancel/back button text                                                |
| `confirmButtonColor`            | `string`           | `'#8dcb2c'`           | Confirm CTA background color                                           |
| `cancelButtonColor`             | `string`           | `'#f3f4f6'`           | Cancel background color                                                |
| `isLoading`                     | `boolean`          | `false`               | Shows loading spinner on confirm CTA                                   |
| `loadingText`                   | `string`           | `'Processing...'`     | Button text during loading state                                       |
| `customIcon`                    | `string`           | `''`                  | Custom SVG icon HTML instead of default warning icon                   |
| **Status Alert Variant Inputs** |                    |                       |                                                                        |
| `alertTitle`                    | `string`           | `''`                  | Heading title (used by `success` or `error` variants)                  |
| `alertDescription`              | `string`           | `''`                  | Supporting message text                                                |
| `alertButtonText`               | `string`           | `''`                  | Dismiss CTA button text                                                |
| **Loading Variant Inputs**      |                    |                       |                                                                        |
| `loadingTitleInput`             | `string`           | `''`                  | Header title (alias: `loadingTitle`)                                   |
| `loadingMessageInput`           | `string`           | `''`                  | Supporting message (alias: `loadingMessage`)                           |

### Types

```typescript
export type ModalSizeVariant =
    'small' | 'medium' | 'large' | 'xlarge' | 'confirmation' | 'success' | 'error' | 'loading';

export type ModalVariant = 'default' | 'confirmation' | 'loading' | 'success' | 'error';

export type ModalPosition = 'center' | 'top' | 'bottom';

export type ModalBackdrop = 'blur' | 'dark' | 'none' | 'glass' | 'gradient';

export interface ModalStyleConfig {
    width?: string;
    height?: string;
    maxWidth?: string;
    maxHeight?: string;
    minWidth?: string;
    minHeight?: string;
    padding?: string;
}

export interface ModalConfig {
    variant?: ModalVariant;
    size?: ModalSizeVariant;
    position?: ModalPosition;
    backdrop?: ModalBackdrop;
    customSize?: ModalStyleConfig;
    customClass?: string;
    animation?: boolean;
    grayBackground?: boolean;
    closable?: boolean;
    closeOnBackdrop?: boolean;
    closeOnEscape?: boolean;
    preventClose?: boolean;
    fullscreen?: boolean;
    scrollable?: boolean;
    centered?: boolean;
    showHeader?: boolean;
    headerTitle?: string;
    headerSubtitle?: string;
    showFooter?: boolean;
}
```

### Outputs

| Output          | Type   | When                                               |
| --------------- | ------ | -------------------------------------------------- |
| `modalOpen`     | `void` | Modal transition starts opening                    |
| `modalClose`    | `void` | Modal starts closing (any dismiss trigger)         |
| `backdropClick` | `void` | Backdrop overlay clicked                           |
| `escapeKey`     | `void` | Escape key pressed                                 |
| `confirmClick`  | `void` | Confirm button clicked (in `confirmation` variant) |
| `cancelClick`   | `void` | Cancel button clicked (in `confirmation` variant)  |

### Public Methods

If reference to the component is grabbed via `@ViewChild` or local variable, you can call these methods directly:

- `open(): void` - Imperatively opens the modal (sets internal visibility state).
- `close(force?: boolean): void` - Closes the modal. If `force` is `true`, bypasses `preventClose` checks.

### Usage Examples

#### 1. Basic Content Projection (Declarative)

```html
<ntv-modal
    [isVisible]="showProfileModal"
    headerTitle="User Details"
    headerSubtitle="Manage system attributes"
    [showFooter]="true"
    (modalClose)="showProfileModal = false">
    <!-- Custom Header content (replaces default title layout) -->
    <div modal-header class="flex items-center gap-2">
        <span class="icon">👤</span>
        <h3>User Profile</h3>
    </div>

    <!-- Default Body Content -->
    <div class="space-y-4">
        <p>Role: Administrator</p>
        <p>Status: Active</p>
    </div>

    <!-- Custom Footer content -->
    <div modal-footer class="flex justify-end gap-2 p-4">
        <button (click)="showProfileModal = false">Cancel</button>
        <button class="btn-primary" (click)="save()">Save Profile</button>
    </div>
</ntv-modal>
```

#### 2. DRY Configuration with Custom Sizing

```typescript
modalConfig: ModalConfig = {
    size: 'large',
    backdrop: 'glass',
    closable: true,
    closeOnBackdrop: false, // Click backdrop won't close
    customSize: {
        width: '600px',
        maxHeight: '80vh',
        padding: '24px',
    },
};
```

```html
<ntv-modal [config]="modalConfig" [isVisible]="showModal" (modalClose)="showModal = false">
    <p>Modal content here...</p>
</ntv-modal>
```

#### 3. Confirmation Dialog

```html
<ntv-modal
    [isVisible]="showDeleteModal"
    variant="confirmation"
    confirmationTitle="Remove Account"
    confirmationMessage="Are you absolutely sure you want to remove this account? This cannot be undone."
    confirmButtonText="Confirm Delete"
    confirmButtonColor="#EF4444"
    [isLoading]="isDeleting"
    (confirmClick)="handleDelete()"
    (cancelClick)="showDeleteModal = false"
    (modalClose)="showDeleteModal = false" />
```

#### 4. Success / Error Alerts (Using Lottie animations)

```html
<!-- Success Modal -->
<ntv-modal
    [isVisible]="showSuccess"
    variant="success"
    alertTitle="Payment Received!"
    alertDescription="Your transaction was processed successfully."
    alertButtonText="Got it"
    (modalClose)="showSuccess = false" />
```

#### 5. Loading Variant (Unclosable)

```html
<ntv-modal
    [isVisible]="isProcessing"
    variant="loading"
    loadingTitle="Syncing Data..."
    loadingMessage="Please do not refresh or close this window."
    [closable]="false"
    [preventClose]="true" />
```

**Common mistakes:**

- **Incorrect Import Name:** Import `Modal` from `@ntv360/component-pantry` (do **not** import `ModalComponent`).
- **No `alert` Variant:** Do not use `variant="alert"`. For alert banners/animations, use `variant="success"` or `variant="error"`.
- **Unitless Sizing Override:** Always provide CSS units (e.g. `'600px'`, `'80vw'`, not `600`) when setting `modalWidth` or `modalHeight`.
- **Missing close handler:** Ensure `(modalClose)` is handled to sync the parent property back to `false` when user closes via Escape or close buttons.
- **Form Control / Input scroll issues:** Set `scrollable="true"` if your projected content exceeds viewport heights to enable default scroll layouts properly.

---

---

## 16. Offcanvas (`ntv-offcanvas`)

**Purpose:** Slide-in side panel from any screen edge with a dark backdrop overlay.

**Import:** `import { OffcanvasComponent } from '@ntv360/component-pantry';`

### Inputs

| Input      | Type                               | Default  | Description                |
| ---------- | ---------------------------------- | -------- | -------------------------- |
| `position` | `'top'\|'left'\|'bottom'\|'right'` | `'left'` | Slide direction            |
| `header`   | `string`                           | `''`     | Header title text          |
| `visible`  | `model<boolean>`                   | `false`  | Two-way visibility binding |

### Usage Example

```html
<!-- Two-way binding with [(visible)] -->
<ntv-offcanvas [(visible)]="sidebarOpen" position="right" header="Filters">
    <p>Filter content here.</p>
</ntv-offcanvas>

<ntv-button (buttonClick)="sidebarOpen = true">Open Filters</ntv-button>
```

**Panel dimensions:** left/right → `width: 320px; height: 100%` · top/bottom → `width: 100%; max-height: 384px`

---

## 17. Popover (`ntv-popover`)

**Purpose:** Floating overlay panel anchored to a target trigger element. Automatically handles viewport edge detection, flip adjustments, scroll/resize positioning synchronization, and outside clicks.

**Import:** `import { Popover } from '@ntv360/component-pantry';`

### Customization & Behaviors

1. **Trigger Modes (`trigger`):**
    - `'click'`: Toggles visibility on click of the trigger element.
    - `'hover'`: Shows on mouse enter, hides on mouse leave.
    - `'manual'`: Ignores events. Visibility must be controlled manually via public API methods.
2. **Dimension Constraints:** Custom widths are adjusted using `maxWidth` (default `'320px'`) and `minWidth` (default `'200px'`) supporting standard CSS strings (e.g. `'25vw'`, `'400px'`).
3. **Placements:** Configurable using `'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'right'`. Positions auto-flip to the opposite side if not enough viewport space is available.
4. **Disabling Dismiss Triggers:**
    - Set `[closeOnClickOutside]="false"` to keep the popover open when clicks occur elsewhere in the document.
    - Set `[closeOnEscape]="false"` to ignore Escape key presses.
5. **Distance Offset:** Set `offset` (number, default `8` pixels) to specify the gap between the trigger boundary and the popover panel.

### Inputs

| Input                 | Type                         | Default    | Description                               |
| --------------------- | ---------------------------- | ---------- | ----------------------------------------- |
| `placement`           | `PopoverPlacement`           | `'bottom'` | Anchor position relative to trigger       |
| `offset`              | `number`                     | `8`        | Gap from trigger in pixels                |
| `arrow`               | `boolean`                    | `true`     | Show pointer triangle pointing to trigger |
| `trigger`             | `'click'\|'hover'\|'manual'` | `'manual'` | Triggers visibility toggle                |
| `closeOnClickOutside` | `boolean`                    | `true`     | Close popover when clicking elsewhere     |
| `closeOnEscape`       | `boolean`                    | `true`     | Close popover when Escape key pressed     |
| `disabled`            | `boolean`                    | `false`    | Turn off interactions entirely            |
| `maxWidth`            | `string`                     | `'320px'`  | Maximum CSS width                         |
| `minWidth`            | `string`                     | `'200px'`  | Minimum CSS width                         |
| `zIndex`              | `number`                     | `1000`     | Popover stack z-index value               |
| `config`              | `PopoverConfig`              | —          | Consolidated config object                |

### Outputs

| Output   | Type   | When                           |
| -------- | ------ | ------------------------------ |
| `shown`  | `void` | Popover enters/becomes visible |
| `hidden` | `void` | Popover closes/becomes hidden  |

### Public Methods

Access the popover via `@ViewChild` to trigger its display imperatively:

- `show(triggerElement?: HTMLElement): void` - Renders the popover relative to the specified element.
- `hide(): void` - Closes the popover.
- `toggle(event: Event, triggerElement?: HTMLElement): void` - Toggles the visibility.

### Usage Example

```html
<!-- Manual toggle on click using trigger="click" -->
<button #triggerBtn (click)="optionsPopover.toggle($event, triggerBtn)">Open Popover</button>

<ntv-popover
    #optionsPopover
    trigger="click"
    placement="bottom-start"
    minWidth="150px"
    [closeOnClickOutside]="true">
    <div class="p-2 space-y-1">
        <button (click)="edit()">Edit Item</button>
        <button (click)="delete()">Delete Item</button>
    </div>
</ntv-popover>
```

**Common mistakes:**

- **Incorrect Import Name:** Import `Popover` from `@ntv360/component-pantry` (do **not** import `PopoverComponent`).
- **Styles scope warning:** The popover teleports itself to the `document.body` to prevent nesting clipping (e.g., inside overflow-hidden parent elements). Any parent component styles with scoped/nested selectors will not target it. Use global styles or specify utility class combinations.

---

## 18. Toast (`ntv-toast`)

**Purpose:** Notification toast alerts containing visual state variants (success, error, warning, info), progress timing bars, and support for complete custom color overrides.

**Import:** `import { Toast } from '@ntv360/component-pantry';`

### Customization & Behaviors

1. **Auto-Dismiss Timer (`duration`):** Specifies duration in milliseconds before auto-dismissal. Set `duration="0"` to disable the timer and require manual closing.
2. **Display Position (`position`):** Renders floating positions in any corner or center of the viewport: `'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'`.
3. **Progress Bar Indicator:** Bottom progress bar visually tracks duration. Enabled by setting `[showProgress]="true"` (requires `duration > 0`).
4. **Color Customization:** Overrides standard status layouts with custom hex strings:
    - `customBackgroundColor`: Backing panel color.
    - `customTextColor`: Message font color.
    - `customIconColor`: SVG icon color.
    - `customProgressColor`: Bottom progress countdown line color.
5. **Dismiss capability:** Toggle the close 'X' button using `[dismissible]="false"`.

### Inputs

| Input                   | Type                   | Default       | Description                                            |
| ----------------------- | ---------------------- | ------------- | ------------------------------------------------------ |
| `variant`               | `ToastVariant`         | `'info'`      | Status layout: `'success'\|'error'\|'warning'\|'info'` |
| `message`               | `string`               | `''`          | Text displayed in toast body                           |
| `duration`              | `number`               | `5000`        | Active display duration (ms; 0 = manual close)         |
| `dismissible`           | `boolean`              | `true`        | Shows close (×) button                                 |
| `showProgress`          | `boolean`              | `true`        | Shows animated bottom timeline bar                     |
| `position`              | `ToastPosition`        | `'top-right'` | Visual viewport anchor position                        |
| `customBackgroundColor` | `string`               | `''`          | Custom CSS background color override                   |
| `customTextColor`       | `string`               | `''`          | Custom CSS text color override                         |
| `customIconColor`       | `string`               | `''`          | Custom CSS icon color override                         |
| `customProgressColor`   | `string`               | `''`          | Custom CSS progress timeline color override            |
| `config`                | `Partial<ToastConfig>` | `{}`          | DRY config object                                      |

### Outputs

| Output   | Type   | When                                                              |
| -------- | ------ | ----------------------------------------------------------------- |
| `closed` | `void` | Toast closes (dismiss timer completes or close button is clicked) |

### Public Methods

- `dismiss(): void` - Closes the toast and triggers exit animations.

### Usage Example

```html
<ntv-toast
    variant="success"
    message="Database entries backed up!"
    [duration]="3000"
    position="bottom-left"
    customBackgroundColor="#f0fdf4"
    customTextColor="#166534"
    (closed)="handleClose()" />
```

**Common mistakes:**

- **No `default` variant:** Do not use `variant="default"`. Visual styles are governed strictly by `'success' | 'error' | 'warning' | 'info'`.
- **String durations:** Ensure `duration` is bound as a number (e.g. `[duration]="4000"`) rather than a string property literal (e.g. `duration="4000"` will evaluate as a string and break timer calculations).

---

## 19. Stepper (`ntv-stepper`)

**Purpose:** Highly customizable linear or non-linear multi-step workflow tracker. Renders 11 distinct layouts (horizontal, vertical, panels, detailed paths) and tracks active status states.

**Import:** `import { Stepper } from '@ntv360/component-pantry';`

### Customization & Behaviors

1. **Layout Modes (`variant`):** Renders different visual presentations of step elements:
    - `'default'`: Minimal dots and connecting lines.
    - `'numbered'`: Circular indexes and connecting lines.
    - `'progress'`: Contiguous solid bar filling up proportionally.
    - `'detailed'`: Labeled steps showing side-by-side titles, subtext, and descriptions.
    - `'vertical'`: Downward sequence layout with connecting tracks.
    - `'vertical-reverse'`: Reverse ordered vertical sequence layout.
    - `'panel'`: Boxed clickable dashboard buttons representing steps.
    - `'breadcrumb'`: Breadcrumb-styled step elements.
    - `'form'`: Integrated visual indicators designed for multi-step form wizard pages.
    - `'icon'`: Employs icons inside circles instead of numbers.
2. **Predefined Color Schemes:** Applies semantic color combinations (`stepperColor`, `labelColor`, `descriptionColor`): `'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'white' | 'neutral' | 'neutral-dark'`.
3. **Step State management (within `StepData` objects):**
    - `disabled`: Prevents the step from being clicked.
    - `completed`: Force-overlays a green checkmark or completed design state.
    - `error`: Triggers danger indicator styling (red outline/circle).
    - `warning`: Triggers warning indicator styling (orange/amber outline).
4. **Behavioral Settings:**
    - Click navigation: Set `[clickable]="true"`.
    - Prevent skipping forward: Set `[allowSkipping]="false"`. Only previous steps or the immediately next step (`currentStep + 1`) are active for clicking.
    - Animated progress: Set `[animateProgress]="true"` to smoothly fill vertical connection lines.

### Inputs

| Input              | Type                     | Default     | Description                                              |
| ------------------ | ------------------------ | ----------- | -------------------------------------------------------- |
| `steps`            | `StepData[]`             | `[]`        | Array of step objects                                    |
| `currentStep`      | `number`                 | `0`         | Active index (0-based)                                   |
| `variant`          | `StepperVariant`         | `'default'` | Layout representation of steps                           |
| `size`             | `StepperSize`            | `'md'`      | Sizing scale: `'sm'\|'md'\|'lg'`                         |
| `stepperColor`     | `ColorVariant`           | `'accent'`  | Primary theme color of track connectors/circles          |
| `labelColor`       | `ColorVariant`           | `'accent'`  | Font theme color for title labels                        |
| `descriptionColor` | `ColorVariant`           | `'accent'`  | Font theme color for descriptions                        |
| `clickable`        | `boolean`                | `false`     | Enables click interactions on step elements              |
| `showLabels`       | `boolean`                | `true`      | Renders the step title text                              |
| `showDescriptions` | `boolean`                | `false`     | Renders detailed step description text                   |
| `allowSkipping`    | `boolean`                | `false`     | Allows clicking any step index without sequential limits |
| `animateProgress`  | `boolean`                | `false`     | Animates the fill level of connectors                    |
| `config`           | `Partial<StepperConfig>` | —           | DRY config object                                        |

### Outputs

| Output       | Type             | When                                                   |
| ------------ | ---------------- | ------------------------------------------------------ |
| `stepClick`  | `StepClickEvent` | Step clicked (emits `{step: StepData, index: number}`) |
| `stepChange` | `number`         | Step change is confirmed (emits new index)             |

### Usage Example

```typescript
steps: StepData[] = [
  { id: '1', label: 'Identity Check', description: 'Provide passport scans', completed: true },
  { id: '2', label: 'Payment Info', description: 'Bind CC or IBAN', error: true },
  { id: '3', label: 'Setup Completed', description: 'Ready to login' }
];
```

```html
<ntv-stepper
    [steps]="steps"
    [currentStep]="1"
    variant="detailed"
    [showDescriptions]="true"
    [clickable]="true"
    stepperColor="primary"
    (stepChange)="currentStep = $event" />
```

**Common mistakes:**

- **Incorrect Import Name:** Import `Stepper` from `@ntv360/component-pantry` (do **not** import `StepperComponent`).
- **Skipping limits:** If `allowSkipping` is `false`, users cannot jump directly to `step index 3` from `step index 1` even if `clickable` is `true`. They must click step `2` first.

---

## 20. Breadcrumbs (`ntv-breadcrumbs`)

**Purpose:** Navigation trace element mapping parent hierarchies. Supports responsive list collapsing, auto-truncation of long titles, and customized divider strings/icons.

**Import:** `import { Breadcrumbs } from '@ntv360/component-pantry';`

### Customization & Styling

1. **Separator Options (`separator`):** Uses custom strings (e.g. `'/'`, `'~'`, `'|'`) or predefined icons: `'ANGLE_RIGHT' | 'SLASH' | 'ARROW_RIGHT' | 'CHEVRON_RIGHT'`.
2. **Middle Collapse (`maxItems`):** Limit the maximum items to render before breadcrumbs collapse the middle steps automatically into an ellipsis (`...`).
3. **Active item custom colors:**
    - `customActiveColor`: String CSS color for the current/active item (defaults to NCompass accent green).
    - `customInactiveColor`: String CSS color for non-active trailing links.
4. **Classes Injectors:**
    - `containerClass`: Custom class name on the `<nav>` tag.
    - `itemClass`: Custom class name applied to each link item wrapper.
    - `activeClass`: Custom class name applied only to the active leaf node.
    - `separatorClass`: Custom class name on the divider element.
5. **Length clipping:** Toggle `[truncate]="true"` to cap long string labels using CSS ellipsis.

### Inputs

| Input                 | Type                | Default     | Description                                              |
| --------------------- | ------------------- | ----------- | -------------------------------------------------------- |
| `items`               | `BreadcrumbItem[]`  | `[]`        | Array of path items `{label, url?, isActive?, icon?}`    |
| `size`                | `BreadcrumbSize`    | `'md'`      | Scale height/font sizes: `'sm'\|'md'\|'lg'`              |
| `variant`             | `BreadcrumbVariant` | `'default'` | Visual padding layout: `'default'\|'compact'\|'minimal'` |
| `separator`           | `string`            | `'>'`       | Divider character or preset icon name                    |
| `showSeparator`       | `boolean`           | `true`      | Toggle display of separators                             |
| `truncate`            | `boolean`           | `false`     | Apply ellipsis truncation to labels                      |
| `maxItems`            | `number`            | `10`        | Maximum items to show before middle collapse             |
| `containerClass`      | `string`            | `''`        | Extra class on wrapper container                         |
| `itemClass`           | `string`            | `''`        | Extra class on breadcrumb items                          |
| `activeClass`         | `string`            | `''`        | Extra class on the active item link                      |
| `customActiveColor`   | `string`            | `''`        | Active item font color CSS value                         |
| `customInactiveColor` | `string`            | `''`        | Inactive item font color CSS value                       |
| `separatorClass`      | `string`            | `''`        | Extra class on separator elements                        |
| `config`              | `BreadcrumbsConfig` | —           | Consolidated config object                               |

### Outputs

| Output       | Type                        | When                                                  |
| ------------ | --------------------------- | ----------------------------------------------------- |
| `itemClick`  | `BreadcrumbItemClickEvent`  | Emitted when link item is clicked (before navigation) |
| `navigation` | `BreadcrumbNavigationEvent` | Emitted when router navigation starts                 |

### Usage Example

```html
<ntv-breadcrumbs
    [items]="myPaths"
    size="sm"
    separator="SLASH"
    customActiveColor="#10b981"
    [truncate]="true"
    (navigation)="onNavigate($event)" />
```

**Common mistakes:**

- **Incorrect Import Name:** Import `Breadcrumbs` from `@ntv360/component-pantry` (do **not** import `BreadcrumbsComponent`).
- **Wrong Active Property:** In `BreadcrumbItem`, the state property is `isActive`, not `active`.
- **Router Dependency:** The component uses Angular's `Router` internally for navigation if `url` is specified on items. If your app lacks `RouterModule` or `provideRouter()`, manual navigation events must be captured via `(itemClick)`.

---

## 21. Skeleton (`ntv-skeleton`)

**Purpose:** Layout placeholder loading screen. Can be composable or wrap existing real elements directly, automatically measuring dimensions when visible.

**Import:** `import { Skeleton } from '@ntv360/component-pantry';`

### Shapes & Composites (`variant`)

1. **Simple Placeholders:**
    - `'text'`: Single text line block (default, height `1rem`, width `100%`).
    - `'title'`: Thick heading line block (height `1.5rem`, width `60%`).
    - `'avatar'`: Circular placeholder (height/width `48px`, `50%` radius).
    - `'thumbnail'`: Small rounded box (height/width `80px`, `8px` radius).
    - `'image'`: Large image block placeholder (height `200px`, width `100%`).
    - `'button'`: Button-shaped loader block (height `40px`, width `120px`).
    - `'custom'`: Base block using explicit `width`, `height`, and `borderRadius` inputs.
2. **Composite Block Layouts:**
    - `'card'`: Built-in composite rendering a large image block, a title line, and 3 paragraph description lines.
    - `'list-item'`: Renders a circular avatar beside a title line and short sub-text block.
    - `'paragraph'`: Renders multiple text lines (`lines` input). Line lengths vary slightly (the last line is 60%) to mimic natural reading copy layout.

### Sizing, Animations, & Colors

- **Automatic Dimension Detection:** Wrap standard HTML content in `<ntv-skeleton [loading]="isLoading">`. When loading is `true`, a ResizeObserver automatically measures the wrapped content's width/height and fits the skeleton overlay exactly to those bounds.
- **Animation Options:** Toggle shimmer effects with `animation` set to `'shimmer' | 'pulse' | 'none'`.
- **Custom Shimmer Theme:** Override default colors by setting custom base backgrounds (`baseColor`) and scanning highlight bars (`highlightColor`).

### Inputs

| Input               | Type                      | Default     | Description                                                      |
| ------------------- | ------------------------- | ----------- | ---------------------------------------------------------------- |
| `variant`           | `SkeletonVariant`         | `'text'`    | Visual placeholder structure/presets                             |
| `width`             | `string`                  | `''`        | Width (e.g. `'120px'`; overrides presets)                        |
| `height`            | `string`                  | `''`        | Height (e.g. `'2.5rem'`; overrides presets)                      |
| `bordered`          | `boolean`                 | `false`     | Renders a border around custom shapes                            |
| `borderRadius`      | `string`                  | `''`        | Border radius CSS (overrides presets)                            |
| `lines`             | `number`                  | `1`         | Total lines to render (text or paragraph variants)               |
| `animation`         | `SkeletonAnimation`       | `'shimmer'` | Animation style: `'shimmer'\|'pulse'\|'none'`                    |
| `loading`           | `boolean`                 | `true`      | Renders skeleton overlay (true) or displays real content (false) |
| `baseColor`         | `string`                  | `''`        | Main background color CSS                                        |
| `highlightColor`    | `string`                  | `''`        | Scan animation highlight color CSS                               |
| `animationDuration` | `number`                  | `1.5`       | Completion speed of one animation cycle (seconds)                |
| `config`            | `Partial<SkeletonConfig>` | `{}`        | DRY config object                                                |

### Usage Examples

#### 1. Automatic Content Wrapping

```html
<ntv-skeleton [loading]="isLoading">
    <div class="user-profile-card">
        <img src="avatar.jpg" alt="Profile" />
        <h2>Jane Doe</h2>
    </div>
</ntv-skeleton>
```

#### 2. Manual Custom layout mapping

```html
<div class="flex gap-4">
    <ntv-skeleton variant="avatar" />
    <div class="flex-1 space-y-2">
        <ntv-skeleton variant="title" />
        <ntv-skeleton variant="text" [lines]="2" />
    </div>
</div>
```

**Common mistakes:**

- **Incorrect Import Name:** Import `Skeleton` from `@ntv360/component-pantry` (do **not** import `SkeletonComponent`).
- **Incorrect Variant Name:** Do not use `variant="circle"`. Use `variant="avatar"` for circular loaders.
- **Dual projection conflict:** When using default wrapping (unnamed slot), ResizeObserver measures dimensions and hides content during load states. If you use `<ng-content select="[skeleton-content]">` selector tags explicitly, the ResizeObserver **will not** auto-measure width/height. Use default wrapping for auto-sizing.

---

## 22. Progress (`ntv-progress`)

**Purpose:** Horizontal progress bar that renders in two modes — a standalone bar-only strip or a full card layout with label, value text, remaining text, and a floating percentage tooltip.

**Import:** `import { Progress } from '@ntv360/component-pantry';`

### Display Modes

1. **Full Card Mode** (`[isOnlyProgressBar]="false"` — default): Renders a header row with a label and remaining text (`X unit left`), followed by a horizontal bar with current value on the left and max value on the right.
2. **Bar-Only Mode** (`[isOnlyProgressBar]="true"`): Renders just the bar strip — no label or remaining text. Use when embedding inside a table row or tighter layout.

### UI Customization

| What to change             | Property            | How                                                                          |
| -------------------------- | ------------------- | ---------------------------------------------------------------------------- |
| Fill bar color             | `color`             | Any CSS color string e.g. `color="#8DCB2C"`                                  |
| Track (unfilled) color     | `bgColor`           | Any CSS color string e.g. `bgColor="#e5e7eb"`                                |
| Bar thickness              | `height`            | Number in pixels e.g. `[height]="8"`                                         |
| Percentage label placement | `labelPosition`     | `'top'` (floating tooltip) or `'right'` (inside fill)                        |
| Show only bar strip        | `isOnlyProgressBar` | `[isOnlyProgressBar]="true"` removes label, remaining text, and card wrapper |
| Header label               | `label`             | String e.g. `label="Storage Used"`                                           |
| Unit suffix text           | `unit`              | String e.g. `unit="GB"` — appended to value and remaining text               |

**Font size** inside the bar scales automatically with `height`: a `height` of `20` gives ≈12px; `40` gives ≈18px.

**Tooltip bubble color** (when `labelPosition="top"`) inherits the `color` value — they always match.

### Label Position

- `labelPosition="top"`: Floating tooltip bubble appears above the bar at the progress fill position. Useful for wide bars where the inline percentage would overflow.
- `labelPosition="right"` (default): Inline percentage label rendered inside the fill. Font size is automatically scaled proportionally to `height`.

### Color Customization

Both the fill and track colors are raw CSS color strings — any valid CSS value is accepted:

- `color`: Fill bar color (default `'#4caf50'`).
- `bgColor`: Track / unfilled background color (default `'#f3f4f6'`).

### Inputs

| Input               | Type             | Default     | Description                                                             |
| ------------------- | ---------------- | ----------- | ----------------------------------------------------------------------- |
| `label`             | `string`         | `''`        | Header label text (visible in full card mode)                           |
| `value`             | `number`         | `0`         | Current filled value                                                    |
| `max`               | `number`         | `100`       | Maximum value (represents 100%)                                         |
| `unit`              | `string`         | `''`        | Unit suffix appended to value and remaining text (e.g. `'hrs'`, `'MB'`) |
| `color`             | `string`         | `'#4caf50'` | CSS color string for the fill bar                                       |
| `bgColor`           | `string`         | `'#f3f4f6'` | CSS color string for the unfilled track                                 |
| `labelPosition`     | `'top'\|'right'` | `'right'`   | Placement of the percentage label                                       |
| `height`            | `number`         | `20`        | Bar height in pixels                                                    |
| `isOnlyProgressBar` | `boolean`        | `false`     | Renders only the bar strip (no card wrapper, label, or remaining text)  |

### Usage Examples

#### Full Card Mode

```html
<ntv-progress
    label="Storage Used"
    [value]="75"
    [max]="100"
    unit="GB"
    color="#8DCB2C"
    bgColor="#e5e7eb"
    [height]="12" />
```

#### Bar-Only Strip (for tables/compact layouts)

```html
<ntv-progress
    [value]="45"
    [max]="100"
    color="#3b82f6"
    [height]="6"
    [isOnlyProgressBar]="true"
    labelPosition="top" />
```

**Common mistakes:**

- **Incorrect Import Name:** Import `Progress` from `@ntv360/component-pantry` (do **not** import `ProgressComponent`).
- **No `config` object:** This component uses individual signal inputs only — there is no `config` DRY object.
- **`height` is a number (pixels):** Pass `[height]="12"` (bound number), not `height="12px"` (string with unit). The component applies `[style.height.px]` internally.

---

## 23. Graph (`ntv-graph`)

**Purpose:** ApexCharts-powered line and bar chart with built-in time-frame filters (month/year), optional graph type toggle, hierarchical data (`graphData`) support, and responsive sizing presets.

**Import:** `import { GraphComponent } from '@ntv360/component-pantry';`

> **Note:** The exported class name is `GraphComponent`, not `Graph`.

### Variants (`GraphVariant` enum)

| Value                               | Chart Type | Has Filters                |
| ----------------------------------- | ---------- | -------------------------- |
| `GraphVariant.LineWithLegend`       | Line       | No                         |
| `GraphVariant.LineWithFilterLegend` | Line       | Yes (month/year dropdowns) |
| `GraphVariant.BarWithLegend`        | Bar        | No                         |
| `GraphVariant.BarWithFilterLegend`  | Bar        | Yes (month/year dropdowns) |

### Size Presets (`GraphSizeVariant`)

| Value          | Height       | Notes                       |
| -------------- | ------------ | --------------------------- |
| `'small'`      | `400px`      | Standard compact panels     |
| `'medium'`     | `500px`      | Detailed analysis           |
| `'large'`      | `490px`      | Full-width dashboard panels |
| `'fullscreen'` | `600px`      | Full viewport takeover      |
| `'custom'`     | User-defined | Use `customSize` in config  |

### UI Customization

#### Colors

| What to change         | Config Property              | Example                                                         |
| ---------------------- | ---------------------------- | --------------------------------------------------------------- |
| Series line/bar colors | `config.colors`              | `colors: ['#8DCB2C', '#3b82f6']` — aligned by data series index |
| Chart background       | Built-in default `'#FFFFFF'` | Cannot be changed via input; wrap in a custom container         |

#### Sizing & Layout

| What to change                    | How                                                                        |
| --------------------------------- | -------------------------------------------------------------------------- |
| Use a preset height               | `config.size: 'small' \| 'medium' \| 'large' \| 'fullscreen'`              |
| Custom pixel/percent dimensions   | `config.customSize: { width: '600px', height: '350px', maxWidth: '100%' }` |
| Remove card background/shadow     | `[hideBackgroundCard]="true"` on the component element                     |
| Hide the Line/Bar toggle dropdown | `[showSwitchGraphButton]="false"` on the component element                 |

#### Chart Type Switching

- Set `config.variant` to a `BarWith*` variant to default to bar layout.
- At runtime users can switch via the built-in Switch Graph dropdown (if `showSwitchGraphButton` is true).

#### Header Area

| What to change                | Config Property                                                             |
| ----------------------------- | --------------------------------------------------------------------------- |
| Card title                    | `config.header: 'My Chart Title'`                                           |
| Card subtitle                 | `config.subHeader: 'Monthly Overview'`                                      |
| Stat metric tiles above chart | `config.headerMetrics: [{ label: 'Total', value: 1200, color: '#8DCB2C' }]` |

#### Filter Controls (Filter variants only)

- Shown automatically for `LineWithFilterLegend` / `BarWithFilterLegend` variants.
- Month dropdown, Year dropdown, and View Type (Weekly/Daily) toggle are built-in.
- Hide the graph type switcher: `[showSwitchGraphButton]="false"`.
- Respond to filter changes: `(filterChange)="onFilter($event)"`.

### Data Strategies

1. **`series` (static):** Provide flat data arrays directly on the config.
    ```typescript
    series: [{ name: 'Active', data: [10, 20, 15, 30] }];
    ```
2. **`graphData` (hierarchical — preferred):** Year → Category → Month → Weekly values. The component auto-generates month/year dropdown options from available data.
    ```typescript
    graphData: {
      '2025': {
        'active': { jan: [4, 6, 8, 5], feb: [3, 7, 9, 6] },
        'inactive': { jan: [2, 3, 1, 4], feb: [1, 5, 2, 3] }
      }
    }
    ```

### TypeScript Interfaces

```typescript
interface GraphConfig {
    variant?: GraphVariant; // Chart type + filter visibility
    size?: GraphSizeVariant; // Size preset
    customSize?: GraphStyleConfig; // { width?, height?, maxWidth?, maxHeight?, minWidth?, minHeight? }
    header?: string; // Card title
    subHeader?: string; // Card subtitle
    headerMetrics?: HeaderMetric[]; // Stat tiles shown above chart  [{ label, value, color? }]
    series?: { name: string; data: number[] }[]; // Static data
    colors?: string[]; // Series color overrides (hex strings)
    graphData?: GraphDataType; // Hierarchical data (year > category > month > weekly[])
    categories?: string[]; // X-axis category labels override
    selectedTimeFrame?: 'month' | 'year';
    selectedMonth?: string;
    selectedYear?: string;
}
```

### Inputs

| Input                   | Type          | Default      | Description                                  |
| ----------------------- | ------------- | ------------ | -------------------------------------------- |
| `config`                | `GraphConfig` | **required** | Full chart configuration object              |
| `hideBackgroundCard`    | `boolean`     | `false`      | Hides the card background/shadow             |
| `showSwitchGraphButton` | `boolean`     | `true`       | Show Line/Bar toggle dropdown in filter area |

### Outputs

| Output         | Type          | When                                                                                |
| -------------- | ------------- | ----------------------------------------------------------------------------------- |
| `filterChange` | `FilterEvent` | Month, year, or view type changes (emits `{ timeFrame, month?, year?, viewType? }`) |

### Usage Example

```typescript
// Component TS
graphConfig: GraphConfig = {
    variant: GraphVariant.LineWithFilterLegend,
    size: 'large',
    header: 'User Activity',
    subHeader: 'Monthly overview',
    colors: ['#8DCB2C', '#3b82f6'],
    graphData: {
        '2025': {
            active: { jan: [4, 6, 8, 5], feb: [3, 7, 9, 6] },
            inactive: { jan: [2, 3, 1, 4], feb: [1, 5, 2, 3] },
        },
    },
};
```

```html
<ntv-graph [config]="graphConfig" (filterChange)="onFilterChange($event)" />
```

**Common mistakes:**

- **Incorrect Import Name:** Import `GraphComponent` from `@ntv360/component-pantry` (do **not** import `Graph`).
- **`config` is required:** The `config` input uses `input.required<GraphConfig>()` — omitting it will throw a compile error.
- **Series colors:** Override per-series colors via `config.colors`, NOT through individual series objects.
- **`graphData` vs `series`:** When `graphData` is provided, the component ignores the `series` field. Choose one strategy.

---

## 24. Radial Graph (`ntv-radial-graph`)

**Purpose:** SVG-based animated circular arc gauge showing a single value against a configurable maximum. Renders a centered value with animated ring fill on load and hover brightness effects.

**Import:** `import { RadialGraphComponent } from '@ntv360/component-pantry';`

> **Note:** The exported class name is `RadialGraphComponent`, not `RadialGraph`.

### Color Priority Order

The component resolves colors using a cascading priority:

1. `config.progressColor` (arc fill)
2. `config.color` (shorthand for both arc and value)
3. Default `'#0d2137'`

Same for `valueColor`:

1. `config.valueColor`
2. `config.color`
3. Default `'#0d2137'`

### Size Presets (`config.size`)

| Value      | Behavior                               |
| ---------- | -------------------------------------- |
| `'small'`  | Fixed small pixel dimension            |
| `'medium'` | Default fixed size                     |
| `'large'`  | Larger fixed dimension                 |
| `'auto'`   | `width: 100%` — fills parent container |

### UI Customization

#### Colors

| What to change                | Config Property | Notes                                                             |
| ----------------------------- | --------------- | ----------------------------------------------------------------- |
| Arc fill color                | `progressColor` | Highest priority color override for the ring arc                  |
| Center value text color       | `valueColor`    | Highest priority color override for the center number             |
| Both arc + value (same color) | `color`         | Shorthand — applied when `progressColor`/`valueColor` are not set |
| Unfilled track ring           | `trackColor`    | Default `'#dce8f7'` — the grey background ring                    |
| Label text below ring         | `labelColor`    | Default `'#6b7280'`                                               |

#### Shape & Size

| What to change        | Property                                      | Notes                                            |
| --------------------- | --------------------------------------------- | ------------------------------------------------ |
| Ring stroke thickness | `config.strokeWidth` or `[strokeWidth]` input | SVG units (default `20`) — higher = thicker ring |
| Component size preset | `config.size`                                 | `'small' \| 'medium' \| 'large' \| 'auto'`       |
| Fill to parent width  | `config.size: 'auto'`                         | Component sets `width: 100%`                     |

#### Value Display

| What to change       | Config Property        | Example                                           |
| -------------------- | ---------------------- | ------------------------------------------------- |
| Decimal places shown | `config.decimalPlaces` | `decimalPlaces: 0` shows `84` not `84.0`          |
| Suffix after value   | `config.valueSuffix`   | `valueSuffix: '%'` → `84%`                        |
| Scale maximum        | `config.max`           | `max: 10` means value `7.5` fills 75% of the ring |
| Label below arc      | `config.label`         | `label: 'Excellent'`                              |

#### Card Shell

| What to change                      | Property                      | Notes                              |
| ----------------------------------- | ----------------------------- | ---------------------------------- |
| Hide card background/padding/shadow | `config.showCard: false`      | Renders ring only, no card wrapper |
| Highlight border                    | `config.highlightBorderColor` | Used with `[highlighted]="true"`   |
| Highlight background tint           | `config.highlightBgColor`     | Used with `[highlighted]="true"`   |

### TypeScript Interface

```typescript
interface RadialChartConfig {
    value: number; // Current value (REQUIRED)
    max?: number; // Scale maximum (default: 10)
    label?: string; // Text below the arc
    size?: 'small' | 'medium' | 'large' | 'auto'; // default: 'medium'
    showCard?: boolean; // Show card bg/padding/shadow (default: true)
    trackColor?: string; // Unfilled background ring (default: '#dce8f7')
    color?: string; // Shorthand: sets arc + value text to same color
    progressColor?: string; // Arc fill color override (priority over color)
    valueColor?: string; // Center text color override (priority over color)
    labelColor?: string; // Label text color (default: '#6b7280')
    strokeWidth?: number; // Ring stroke thickness in SVG units (default: 20)
    decimalPlaces?: number; // Center value decimals (default: 1)
    valueSuffix?: string; // Appended string after value (e.g. '%')
    highlightBorderColor?: string; // Border shown when highlighted=true
    highlightBgColor?: string; // Background tint when highlighted=true
}
```

### Inputs

| Input         | Type                  | Default        | Description                                                             |
| ------------- | --------------------- | -------------- | ----------------------------------------------------------------------- |
| `config`      | `RadialChartConfig`   | `{ value: 0 }` | Chart configuration                                                     |
| `strokeWidth` | `number \| undefined` | `undefined`    | Direct stroke width override (takes priority over `config.strokeWidth`) |
| `highlighted` | `boolean`             | `false`        | Applies border + background highlight styles from config                |

### Usage Examples

#### Basic Gauge

```html
<ntv-radial-graph [config]="{ value: 7.5, max: 10, label: 'Performance', color: '#8DCB2C' }" />
```

#### With Percentage Suffix and Custom Colors

```html
<ntv-radial-graph
    [config]="{
    value: 84,
    max: 100,
    valueSuffix: '%',
    decimalPlaces: 0,
    progressColor: '#3b82f6',
    trackColor: '#dbeafe',
    size: 'large'
  }" />
```

**Common mistakes:**

- **Incorrect Import Name:** Import `RadialGraphComponent` from `@ntv360/component-pantry` (not `RadialGraph`).
- **`value` is required:** The config object must always include `value`. Omitting it renders the ring at 0.
- **`color` vs `progressColor`:** Use `color` for a quick one-shot color. Use `progressColor` + `valueColor` separately when the arc and center number should differ in color.
- **`strokeWidth` direct input:** Pass via the top-level `[strokeWidth]` input to override config without cloning the entire config object.

---

## 25. Donut Graph (`ntv-donut-graph`)

**Purpose:** ApexCharts donut chart with interactive segment hover highlighting, custom legend, header icon, footer badge/timestamp, responsive size presets, and full card shell toggle.

**Import:** `import { DonutGraphComponent } from '@ntv360/component-pantry';`

> **Note:** The exported class name is `DonutGraphComponent`, not `DonutGraph`.

### Data Shape

```typescript
interface DonutChartItem {
    label: string; // Segment name (e.g. 'Raspberry Pi3')
    total: number; // Segment numeric value (e.g. 600)
    color?: string; // Per-item color override (legacy — prefer config.colors[])
}
```

### Size Presets (`config.size`)

| Value          | Behavior                                              |
| -------------- | ----------------------------------------------------- |
| `'small'`      | Compact card                                          |
| `'medium'`     | Default (recommended for dashboards)                  |
| `'large'`      | Wide card                                             |
| `'fullscreen'` | Full viewport                                         |
| `'auto'`       | Fills parent container via ResizeObserver             |
| `'custom'`     | Use `config.customSize` for explicit pixel dimensions |

### Icon Sources (priority order)

1. `config.iconSvg` — raw SVG string (iconColor is auto-applied).
2. `config.iconHtml` — raw HTML string.
3. `config.iconName` — key from the internal `FILE_ICONS` map.
4. Default Raspberry Pi icon.

### UI Customization

#### Segment Colors

| What to change          | How                                      | Notes                                                                                 |
| ----------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------- |
| Colors for all segments | `config.colors: ['#hex1', '#hex2', ...]` | Array aligned by segment index in `data[]`                                            |
| Per-item color (legacy) | `data[n].color: '#hex'`                  | Only use when you cannot control the `colors[]` array; `config.colors` takes priority |

#### Sizing & Dimensions

| What to change         | How                                                                             |
| ---------------------- | ------------------------------------------------------------------------------- |
| Use size preset        | `config.size: 'small' \| 'medium' \| 'large' \| 'fullscreen' \| 'auto'`         |
| Exact pixel dimensions | `config.size: 'custom', config.customSize: { width: '320px', height: '320px' }` |
| Chart height only      | `config.height: 300` (number in px)                                             |
| Donut ring/hole ratio  | `config.donutHoleSize: 65` (percentage number; higher = bigger hole)            |
| Gap between segments   | `config.strokeWidth: 2` (number in px)                                          |

#### Card Shell

| What to change              | Config Property                          | Notes                                        |
| --------------------------- | ---------------------------------------- | -------------------------------------------- |
| Hide card background/shadow | `config.showCard: false`                 | Renders chart + legend only, no card wrapper |
| Highlight border            | `config.highlightBorderColor: '#3b82f6'` | Applied when `[highlighted]="true"`          |
| Highlight background        | `config.highlightBgColor: '#eff6ff'`     | Applied when `[highlighted]="true"`          |

#### Header Area

| What to change            | Config Property                                | Notes                                                     |
| ------------------------- | ---------------------------------------------- | --------------------------------------------------------- |
| Card title                | `config.title`                                 | Displayed above the chart                                 |
| Card subtitle             | `config.subHeader`                             | Displayed below the title                                 |
| Show/hide header icon     | `config.showIcon: false`                       | Defaults to `true`                                        |
| Use custom SVG icon       | `config.iconSvg: '<svg>...</svg>'`             | `iconColor` is auto-applied to all fill/stroke hex values |
| Icon tint color           | `config.iconColor: '#8DCB2C'`                  | Applied as CSS `color` to the icon container              |
| Icon container background | `config.iconBgColor: '#f0fdd6'`                | The colored circle/square behind the icon                 |
| Use sprite icon           | `config.iconSprite: { icon: 'cpu', size: 20 }` | References a `<symbol>` in the SVG sprite                 |

#### Legend

| What to change   | Config Property                                                 | Notes                                           |
| ---------------- | --------------------------------------------------------------- | ----------------------------------------------- |
| Show/hide legend | `config.showLegend: false`                                      | Default is a custom HTML legend                 |
| Legend position  | `config.legendPosition: 'right' \| 'bottom' \| 'left' \| 'top'` | Responsive: auto-switches to `bottom` on mobile |

#### Footer

| What to change         | Config Property                                  | Notes                                                    |
| ---------------------- | ------------------------------------------------ | -------------------------------------------------------- |
| Performance badge text | `config.footer.badge: '+2.3%'`                   | Auto-styles green (positive) or red (negative)           |
| Badge background       | `config.footer.badgeBgColor: '#e8f8d4'`          | Overrides auto-color                                     |
| Badge text color       | `config.footer.badgeTextColor: '#4a8a0c'`        | Overrides auto-color                                     |
| Badge border           | `config.footer.badgeBorderColor: '#b6e27a'`      | Overrides auto-color                                     |
| Timestamp label        | `config.footer.timestamp: 'Updated 1 day ago'`   | Small muted text next to the badge                       |
| Hide footer entirely   | Omit `config.footer` or pass `config.footer: {}` | Footer renders only when badge or timestamp is non-empty |

### TypeScript Interface

```typescript
interface DonutChartConfig {
    title?: string;
    subHeader?: string;
    subtitle?: string;
    showIcon?: boolean; // default: true
    iconName?: string; // FILE_ICONS key
    iconHtml?: string; // Custom HTML icon
    iconSvg?: string; // Custom SVG icon (iconColor applied automatically)
    iconSprite?: { icon: string; size?: number | [number, number] };
    iconBgColor?: string; // Icon container background color
    iconColor?: string; // Icon/SVG tint color (default: '#8dcb2c')
    totalCount?: number; // Explicit override for center value
    size?: 'small' | 'medium' | 'large' | 'fullscreen' | 'auto' | 'custom';
    customSize?: { width?; height?; maxWidth?; maxHeight?; minWidth?; minHeight? };
    colors?: string[]; // Array of hex colors per segment (aligned by index)
    showDataLabels?: boolean;
    showLegend?: boolean;
    legendPosition?: 'top' | 'right' | 'bottom' | 'left';
    height?: number;
    strokeWidth?: number; // Gap between segments (default from constants)
    donutHoleSize?: number; // Percentage size of center hole
    footer?: DonutChartFooter; // { badge?, timestamp?, badgeBgColor?, badgeTextColor?, badgeBorderColor? }
    showCard?: boolean; // Renders card bg/padding/shadow (default: true)
    highlightBorderColor?: string; // Border when highlighted=true
    highlightBgColor?: string; // Background tint when highlighted=true
}
```

### Inputs

| Input         | Type               | Default      | Description                                    |
| ------------- | ------------------ | ------------ | ---------------------------------------------- |
| `data`        | `DonutChartItem[]` | **required** | Chart segment data                             |
| `config`      | `DonutChartConfig` | `{}`         | Chart appearance and behavior                  |
| `highlighted` | `boolean`          | `false`      | Applies highlight border and background styles |

### Usage Examples

#### Basic Donut Chart

```typescript
segments: DonutChartItem[] = [
  { label: 'Active', total: 420 },
  { label: 'Idle', total: 130 },
  { label: 'Offline', total: 50 }
];

chartConfig: DonutChartConfig = {
  title: 'Device Status',
  size: 'medium',
  colors: ['#8DCB2C', '#f59e0b', '#ef4444'],
  footer: { badge: '+5.2%', timestamp: 'Updated just now' }
};
```

```html
<ntv-donut-graph [data]="segments" [config]="chartConfig" />
```

#### Custom Sizing & No Card Wrapper

```html
<ntv-donut-graph
    [data]="segments"
    [config]="{
    showCard: false,
    size: 'custom',
    customSize: { width: '300px', height: '300px' },
    colors: ['#3b82f6', '#a855f7', '#ec4899']
  }" />
```

**Common mistakes:**

- **Incorrect Import Name:** Import `DonutGraphComponent` from `@ntv360/component-pantry` (not `DonutGraph`).
- **`data` is required:** The `data` input uses `input.required<DonutChartItem[]>()`. Omitting it will throw a compile error.
- **Total count override:** By default, the center value is the sum of all `data[n].total`. To override this independently of the data, set `config.totalCount`.
- **Footer is opt-in:** The footer section (badge/timestamp) only renders when at least one of `footer.badge` or `footer.timestamp` is set. Passing an empty `footer: {}` will hide it entirely.
- **`size: 'auto'` & ResizeObserver:** In `auto` mode, the component uses a `ResizeObserver` on its parent container. If the parent has `display: contents` or zero intrinsic width, the chart may render at 0 dimensions. Always ensure the parent has a defined width.

---

## 23. Date Picker (`ntv-date-picker`)

**Purpose:** Calendar date picker with drill-down navigation (Dates → Months → Years), three trigger styles (regular, legend, date-range-single), and date range support.

**Import:** `import { DatePickerComponent } from '@ntv360/component-pantry';`

### Inputs

| Input                       | Type                                                             | Default        | Description                    |
| --------------------------- | ---------------------------------------------------------------- | -------------- | ------------------------------ |
| `width`                     | `number`                                                         | `250`          | Popover width (px)             |
| `triggerVariant`            | `'regular'\|'legend'\|'date-range-single'`                       | `'regular'`    | Trigger button style           |
| `triggerHeight`             | `'sm'\|'md'\|'lg'`                                               | `'md'`         | Trigger height                 |
| `variant`                   | `'date-range-double'\|'date-range-single'\|'birthday'\|'events'` | `'events'`     | Calendar mode                  |
| `previousDateSelect`        | `Date\|null`                                                     | `null`         | Pre-selected date (controlled) |
| `canSelectPrevDates`        | `boolean`                                                        | `false`        | Allow past dates               |
| `color`                     | `'success'\|'danger'\|'black'`                                   | `'black'`      | Trigger text color             |
| `triggerRadius`             | `'sm'\|'md'\|'lg'\|'full'`                                       | `'md'`         | Trigger border radius          |
| `customColor`               | `string`                                                         | `''`           | Custom trigger color           |
| `enableDateRangeHightlight` | `boolean`                                                        | `true`         | Highlight date range           |
| `id`                        | `string`                                                         | `''`           | HTML id                        |
| `startDate`                 | `Date\|null`                                                     | `null`         | Range start (range variants)   |
| `endDate`                   | `Date\|null`                                                     | `null`         | Range end (range variants)     |
| `placeholder`               | `string`                                                         | (current date) | Trigger placeholder            |

### Outputs

| Output          | Type                               | When                 |
| --------------- | ---------------------------------- | -------------------- |
| `selectDate`    | `Date`                             | Single date selected |
| `selectedDates` | `{startDate: Date; endDate: Date}` | Date range selected  |
| `cleared`       | `void`                             | Selection cleared    |

### Usage Example

```html
<!-- Single date -->
<ntv-date-picker
    [previousDateSelect]="selectedDate"
    (selectDate)="selectedDate = $event"
    (cleared)="selectedDate = null" />

<!-- Date range with legend trigger -->
<ntv-date-picker
    triggerVariant="legend"
    variant="date-range-double"
    placeholder="Select dates"
    [canSelectPrevDates]="true"
    [startDate]="rangeStart"
    [endDate]="rangeEnd"
    (selectedDates)="onRange($event)"
    (cleared)="clearRange()" />
```

**Navigation:** Clicking the month/year header drills into months view; clicking year drills into years view. Click again to go back to dates.

---

## 24. Date Range Picker (`ntv-date-range-picker`)

**Purpose:** Thin wrapper around `ntv-date-picker` that renders two linked calendars (double) or a single split-field trigger (single).

**Import:** `import { DateRangePicker } from '@ntv360/component-pantry';`

### Inputs

| Input                | Type                  | Default    | Description               |
| -------------------- | --------------------- | ---------- | ------------------------- |
| `triggerVariant`     | `'regular'\|'legend'` | `'legend'` | Trigger style             |
| `variant`            | `'single'\|'double'`  | `'double'` | Single or double calendar |
| `canSelectPrevDates` | `boolean`             | `true`     | Allow past dates          |

### Outputs

| Output    | Type                       | When           |
| --------- | -------------------------- | -------------- |
| `dates`   | `{start: Date; end: Date}` | Range selected |
| `cleared` | `void`                     | Cleared        |

### Usage Example

```html
<ntv-date-range-picker
    variant="double"
    [canSelectPrevDates]="false"
    (dates)="onRange($event)"
    (cleared)="clearDates()" />
```

---

## 25. Timepicker (`ntv-timepicker`)

**Purpose:** Scroll-column time input (HH · MM · SS · AM/PM) with 12h/24h format support. Implements `ControlValueAccessor`.

**Import:** `import { Timepicker } from '@ntv360/component-pantry';`

### Inputs

| Input           | Type                                       | Default     | Description                 |
| --------------- | ------------------------------------------ | ----------- | --------------------------- |
| `size`          | `'xs'\|'sm'\|'md'\|'lg'\|'xl'`             | `'md'`      | Size                        |
| `variant`       | `'default'\|'primary'\|'success'\|'error'` | `'default'` | Border variant              |
| `format`        | `'12h'\|'24h'`                             | `'24h'`     | Time format                 |
| `showSeconds`   | `boolean`                                  | `false`     | Show seconds column         |
| `disabledInput` | `boolean`                                  | `false`     | Disabled                    |
| `required`      | `boolean`                                  | `false`     | Required                    |
| `label`         | `string\|null`                             | `null`      | Field label                 |
| `title`         | `string\|null`                             | `null`      | Title above                 |
| `info`          | `string\|null`                             | `null`      | Helper text                 |
| `error`         | `string\|null`                             | `null`      | Error message               |
| `showError`     | `boolean`                                  | `true`      | Show error                  |
| `isError`       | `boolean`                                  | `false`     | Error state without message |
| `borderRadius`  | `string`                                   | `'md'`      | Radius token                |
| `id`            | `string`                                   | `''`        | HTML id                     |
| `minTime`       | `TimeValue\|undefined`                     | `undefined` | Minimum allowed time        |
| `maxTime`       | `TimeValue\|undefined`                     | `undefined` | Maximum allowed time        |
| `step`          | `number`                                   | `1`         | Minute step                 |
| `config`        | `Partial<TimePickerConfig>`                | —           | Config object               |

### Outputs

| Output        | Type              | When               |
| ------------- | ----------------- | ------------------ |
| `timeChanged` | `TimeValue\|null` | Time value changes |
| `opened`      | `void`            | Picker opens       |
| `closed`      | `void`            | Picker closes      |

### Usage Example

```html
<ntv-timepicker
    label="Start Time"
    format="12h"
    [showSeconds]="false"
    [(ngModel)]="startTime"
    (timeChanged)="onTimeChange($event)" />
```

---

## 26. Table (`ntv-table`)

**Purpose:** Feature-rich data table with column dragging, row dragging, expandable rows, checkboxes, column visibility settings, filtering, sorting, and locked rows.

**Import:** `import { Table } from '@ntv360/component-pantry';`

### Inputs

| Input                 | Type                        | Default               | Description                        |
| --------------------- | --------------------------- | --------------------- | ---------------------------------- |
| `columns`             | `TableColumn[]`             | `[]`                  | Column definitions                 |
| `value`               | `Record<string, unknown>[]` | `[]`                  | Row data (preferred)               |
| `data`                | `Record<string, unknown>[]` | `[]`                  | Row data (alias)                   |
| `tableTitle`          | `string`                    | `' '`                 | Table header title                 |
| `tableHeight`         | `TableHeight`               | `'600px'`             | Table height                       |
| `tableBGColor`        | `string`                    | `'#ffffff'`           | Table background                   |
| `tableHeaderBGColor`  | `string`                    | `'#F9FAFB'`           | Header background                  |
| `hasCheckBox`         | `boolean`                   | `false`               | Row checkbox column                |
| `hasIndex`            | `boolean`                   | `false`               | Row number column                  |
| `columnDraggable`     | `boolean`                   | `false`               | Drag to reorder columns            |
| `rowDraggable`        | `boolean`                   | `false`               | Drag to reorder rows               |
| `expandableRows`      | `boolean`                   | `false`               | Expandable row panels              |
| `showColumnSettings`  | `boolean`                   | `true`                | Column visibility toggle           |
| `showItemCount`       | `boolean`                   | `true`                | "N items" count                    |
| `filterEnabled`       | `boolean`                   | `false`               | Column filters                     |
| `defaultMinWidth`     | `number`                    | `100`                 | Column min-width (px)              |
| `defaultMaxWidth`     | `number`                    | `400`                 | Column max-width (px)              |
| `maxLockedRows`       | `number`                    | `3`                   | Max pinned rows                    |
| `lockIdentifierField` | `string`                    | `'licenseKey'`        | Lock row by field value            |
| `storageKey`          | `string`                    | `'ntv-table-columns'` | LocalStorage key for column config |
| `totalDataLength`     | `number\|null`              | `null`                | Total rows for pagination          |

### Outputs

| Output                   | Type                        | When                       |
| ------------------------ | --------------------------- | -------------------------- |
| `dataChange`             | `Record<string, unknown>[]` | Row data changes           |
| `lockedItemsChange`      | `Record<string, unknown>[]` | Locked rows change         |
| `columnReorder`          | `ColumnReorderEvent`        | Columns reordered          |
| `rowReorder`             | `RowReorderEvent`           | Rows reordered             |
| `columnVisibilityChange` | `{column; visible}`         | Column shown/hidden        |
| `columnsChange`          | `TableColumn[]`             | Columns array changes      |
| `selectedRowsChange`     | `Record<string, unknown>[]` | Checkbox selection changes |
| `showMoreRequested`      | `void`                      | "Show more" clicked        |
| `tableStateChange`       | `TableStateEvent`           | Any table state change     |

### Column Definition

```typescript
interface TableColumn {
    field: string; // Data object key
    header: string; // Column header text
    visible?: boolean; // Default: true
    sortable?: boolean; // Sortable column
    filterable?: boolean; // Filterable column
    minWidth?: number; // Min width px
    maxWidth?: number; // Max width px
    frozen?: boolean; // Frozen/pinned column
    template?: TemplateRef; // Custom cell template
}
```

### Usage Example

```html
<ntv-table
    tableTitle="Content Library"
    [columns]="columns"
    [value]="rows"
    [hasCheckBox]="true"
    [filterEnabled]="true"
    tableHeight="500px"
    (selectedRowsChange)="selected = $event" />
```

```typescript
columns: TableColumn[] = [
  { field: 'name', header: 'Name', sortable: true, minWidth: 200 },
  { field: 'type', header: 'Type', filterable: true },
  { field: 'size', header: 'Size', sortable: true },
  { field: 'date', header: 'Modified' }
];
```

---

## 27. Uploader (`ntv-uploader`)

**Purpose:** Full-featured file upload dialog with three tabs (Content/Documents/Providers), grid and list views, duplicate detection, inline rename, suggestion banners, and multi-provider upload (Transloadit + Filestack + Google Drive + Dropbox).

**Import:** `import { Uploader } from '@ntv360/component-pantry';`

### Inputs

| Input                      | Type                 | Default                    | Description                                   |
| -------------------------- | -------------------- | -------------------------- | --------------------------------------------- |
| `uploadConfig`             | `UploadConfig\|null` | `null`                     | **Required for upload.** Provider credentials |
| `accentColor`              | `string`             | `'#8dcb2c'`                | Accent color (CSS var)                        |
| `maxFiles`                 | `number`             | `10`                       | Max files per upload session                  |
| `showContentTab`           | `boolean`            | `true`                     | Show Content (images/video) tab               |
| `acceptImages`             | `boolean`            | `true`                     | Accept image files                            |
| `imageTypes`               | `string[]`           | `['png','jpg','jpeg']`     | Allowed image extensions                      |
| `acceptVideos`             | `boolean`            | `true`                     | Accept video files                            |
| `videoTypes`               | `string[]`           | `['mp4','webm']`           | Allowed video extensions                      |
| `acceptDocuments`          | `boolean`            | `false`                    | Show Documents tab                            |
| `documentTypes`            | `string[]`           | `['pdf','doc','docx',...]` | Allowed document extensions                   |
| `showProviders`            | `boolean`            | `false`                    | Show Providers tab (Google Drive/Dropbox)     |
| `duplicateResults`         | `DuplicateResult[]`  | `[]`                       | Parent-provided duplicate check results       |
| `isCheckingDuplicates`     | `boolean`            | `false`                    | Show checking-duplicates spinner banner       |
| `hideScrollbar`            | `boolean`            | `false`                    | Hide file list scrollbar                      |
| `validationErrorTimer`     | `boolean`            | `false`                    | Auto-dismiss validation errors                |
| `validationErrorDismissMs` | `number\|null`       | `null`                     | Auto-dismiss delay ms                         |

### Outputs

| Output            | Type           | When                         |
| ----------------- | -------------- | ---------------------------- |
| `filesSelected`   | `UploadFile[]` | Files added to the queue     |
| `uploadConfirmed` | `UploadFile[]` | User clicks "Upload N files" |
| `close`           | `void`         | User clicks Close            |
| `uploadCancelled` | `void`         | User cancels during upload   |

### UploadConfig

```typescript
interface UploadConfig {
    provider: 'transloadit' | 'filestack';
    transloadit?: {
        key: string;
        templateId: string;
        expiryMinutes?: number;
        optimizeVideoTemplateId?: string; // For video optimization
        documentTemplateId?: string; // For document uploads
    };
    filestack?: {
        apiKey: string;
        videoOptimization?: { width?: number; height?: number };
    };
    simulateFilestackFailure?: boolean; // Dev/test only
    googleDrive?: { apiKey: string; clientId: string };
    dropbox?: { appKey: string };
}
```

### Usage Example

```html
<ntv-uploader
    [uploadConfig]="uploadConfig"
    [showContentTab]="true"
    [acceptDocuments]="true"
    [acceptImages]="true"
    [acceptVideos]="true"
    [showProviders]="true"
    [maxFiles]="20"
    [duplicateResults]="duplicateCheckResults"
    [isCheckingDuplicates]="checkingDuplicates"
    (filesSelected)="onFilesSelected($event)"
    (uploadConfirmed)="onUpload($event)"
    (close)="closeUploader()" />
```

### Key UX Flows

- **Content tab:** Drop zone for images/video. Drag & drop or click to browse.
- **Documents tab:** Identical drop zone but accepts `docsAcceptAttr()` MIME types.
- **Providers tab:** Google Drive and Dropbox picker buttons (requires credentials in `uploadConfig`).
- **Grid view:** 5-column thumbnail grid; cards show SVG border-progress during upload.
- **List view:** 2-column list rows with inline progress bar and rename input.
- **Duplicate detection:** Parent calls the API, passes `DuplicateResult[]` back; component shows suggestion banner with accept-all / per-file rename.
- **Rename flow:** Each file can be renamed via the inline panel; validation rejects invalid filename characters.
- **Upload lock:** While uploading, `uploader__upload-lock` overlay blocks all interactions.

---

## 28. Thumbnail Gallery (`ntv-thumbnail-gallery`)

**Purpose:** Responsive grid of thumbnail cards with selection, context menu, drag-to-reorder, stats row, and tag display.

**Import:** `import { ThumbnailGalleryComponent } from '@ntv360/component-pantry';`

### Variants

| `size`                                              | Description                                |
| --------------------------------------------------- | ------------------------------------------ |
| `sm` `md` `lg` `xl`                                 | Standard card sizes                        |
| `channel-sm` `channel-md` `channel-lg` `channel-xl` | Channel display sizes (wider aspect ratio) |

| `variant`  | Description                |
| ---------- | -------------------------- |
| `default`  | No extra border/shadow     |
| `bordered` | Subtle border on each card |
| `shadow`   | Drop shadow on each card   |
| `rounded`  | Extra-rounded corners      |
| `channel`  | Channel-optimized styling  |

| `layout` | Description                 |
| -------- | --------------------------- |
| `grid`   | Multi-column thumbnail grid |
| `list`   | Single-column list rows     |

### Key Inputs

| Input                | Type                                                                             | Default         | Description                |
| -------------------- | -------------------------------------------------------------------------------- | --------------- | -------------------------- |
| `items`              | `ThumbnailItem[]`                                                                | `[]`            | Thumbnail data array       |
| `columns`            | `number`                                                                         | `4`             | Grid columns               |
| `size`               | `'sm'\|'md'\|'lg'\|'xl'\|'channel-sm'\|'channel-md'\|'channel-lg'\|'channel-xl'` | `'md'`          | Thumbnail size             |
| `variant`            | `'default'\|'bordered'\|'shadow'\|'rounded'\|'channel'`                          | `'default'`     | Card style variant         |
| `layout`             | `'grid'\|'list'`                                                                 | `'grid'`        | Layout mode                |
| `selectable`         | `boolean`                                                                        | `false`         | Enable selection           |
| `multiSelect`        | `boolean`                                                                        | `false`         | Allow multi-select         |
| `clickable`          | `boolean`                                                                        | `true`          | Click handler              |
| `hoverEffects`       | `boolean`                                                                        | `true`          | Hover lift animation       |
| `draggable`          | `boolean`                                                                        | `false`         | CDK drag-to-reorder        |
| `showTotalMins`      | `boolean`                                                                        | `false`         | Show total duration stat   |
| `showTotalContents`  | `boolean`                                                                        | `false`         | Show total count stat      |
| `totalMins`          | `string`                                                                         | `''`            | Duration string            |
| `totalContents`      | `string`                                                                         | `''`            | Count string               |
| `galleryTitle`       | `string`                                                                         | `''`            | Gallery heading            |
| `showThumbnailTag`   | `boolean`                                                                        | `true`          | Show media-type tag        |
| `galleryTagVariant`  | `ThumbnailTagVariant`                                                            | `'default'`     | Tag variant for all items  |
| `showContextMenu`    | `boolean`                                                                        | `true`          | Right-click menu           |
| `contextMenuActions` | `ThumbnailAction[]`                                                              | default actions | Context menu items         |
| `showDuration`       | `boolean`                                                                        | `false`         | Show duration on thumbnail |
| `gap`                | `string`                                                                         | `'0.5rem'`      | Grid gap                   |

### Outputs

| Output            | Type                        | When                  |
| ----------------- | --------------------------- | --------------------- |
| `itemClick`       | `ThumbnailClickEvent`       | Thumbnail clicked     |
| `selectionChange` | `ThumbnailSelectionEvent`   | Selection changes     |
| `actionClick`     | `ThumbnailActionEvent`      | Context menu action   |
| `contextMenu`     | `ThumbnailContextMenuEvent` | Right-click           |
| `itemsReorder`    | `ThumbnailItem[]`           | Drag reorder complete |

### ThumbnailItem Shape

```typescript
interface ThumbnailItem {
    id: string;
    name: string;
    // Full type union:
    type:
        | 'image'
        | 'video'
        | 'document'
        | 'audio'
        | 'folder'
        | 'archive'
        | 'code'
        | 'feed'
        | 'filler'
        | 'unknown';
    url: string; // Preview image URL
    duration?: string; // e.g. "1:30"
    fileSize?: number; // bytes
    modified?: Date;
    tags?: string[];
}
```

### Usage Example

```html
<ntv-thumbnail-gallery
    [items]="mediaItems"
    [columns]="5"
    [selectable]="true"
    [multiSelect]="true"
    [showTotalContents]="true"
    [totalContents]="mediaItems.length.toString()"
    [draggable]="true"
    (selectionChange)="onSelection($event)"
    (itemsReorder)="saveOrder($event)" />
```

---

## 29. Thumbnail Item (`ntv-thumbnail-item`)

**Purpose:** Single thumbnail card used inside `ntv-thumbnail-gallery`. Can also be used standalone.

**Import:** `import { ThumbnailItemComponent } from '@ntv360/component-pantry';`

### Key Inputs

| Input                   | Type                                                                             | Default      | Description               |
| ----------------------- | -------------------------------------------------------------------------------- | ------------ | ------------------------- |
| `item`                  | `ThumbnailItem`                                                                  | **REQUIRED** | Item data                 |
| `selectable`            | `boolean`                                                                        | `false`      | Checkbox on hover         |
| `selected`              | `model<boolean>`                                                                 | `false`      | Two-way selection state   |
| `size`                  | `'sm'\|'md'\|'lg'\|'xl'\|'channel-sm'\|'channel-md'\|'channel-lg'\|'channel-xl'` | `'md'`       | Card size                 |
| `variant`               | `'default'\|'bordered'\|'shadow'\|'rounded'\|'channel'`                          | `'default'`  | Card style                |
| `layout`                | `'grid'\|'list'`                                                                 | `'grid'`     | Grid or list card         |
| `hoverEffects`          | `boolean`                                                                        | `true`       | Lift on hover             |
| `showActionButtons`     | `boolean`                                                                        | `true`       | Action icon buttons       |
| `eyeIconVisible`        | `boolean`                                                                        | `true`       | Eye (view) button         |
| `showFavoriteIcon`      | `model<boolean>`                                                                 | `false`      | Favorite button           |
| `showEditButton`        | `model<boolean>`                                                                 | `false`      | Edit button               |
| `showDeleteButton`      | `model<boolean>`                                                                 | `false`      | Delete button             |
| `suppressHoverPlayback` | `boolean`                                                                        | `false`      | Suppress video hover-play |
| `infoTagText`           | `string`                                                                         | `''`         | Overlay info tag text     |
| `infoTagVariant`        | `ThumbnailTagVariant`                                                            | `'default'`  | Info tag color variant    |
| `infoTagBorderRadius`   | `'xs'\|'sm'\|'md'\|'lg'\|'full'`                                                 | `'full'`     | Info tag radius           |

### Outputs

| Output            | Type                          | When              |
| ----------------- | ----------------------------- | ----------------- |
| `itemClick`       | `ThumbnailClickEvent`         | Clicked           |
| `selectionToggle` | `ThumbnailItemSelectionEvent` | Checkbox toggled  |
| `favoriteClick`   | `ThumbnailItem`               | ❤ clicked         |
| `editClick`       | `ThumbnailItem`               | Edit clicked      |
| `deleteClick`     | `ThumbnailItem`               | Delete clicked    |
| `nameClick`       | `ThumbnailItem`               | Name text clicked |
| `viewClick`       | `ThumbnailItem`               | Eye icon clicked  |

---

## 30. Thumbnail Preview (`ntv-thumbnail-preview`)

**Purpose:** Expanded media preview card (used in carousel main panel and standalone). Shows image/video with metadata content slot below.

**Import:** `import { ThumbnailPreview } from '@ntv360/component-pantry';`

### Key Inputs

| Input              | Type                                                                     | Default     | Description                      |
| ------------------ | ------------------------------------------------------------------------ | ----------- | -------------------------------- |
| `thumbnailSrc`     | `string`                                                                 | `''`        | Image/video URL                  |
| `size`             | `'xs'\|'sm'\|'md'\|'lg'\|'xl'\|'expanded'\|'carousel-md'\|'carousel-lg'` | `'md'`      | Preset size                      |
| `variant`          | `'default'\|'bordered'\|'shadow'\|'elevated'`                            | `'default'` | Card style                       |
| `rounded`          | `'none'\|'sm'\|'md'\|'lg'\|'xl'\|'full'`                                 | `'md'`      | Border radius                    |
| `width`            | `string`                                                                 | `''`        | Custom width                     |
| `height`           | `string`                                                                 | `''`        | Custom height                    |
| `mediaHeight`      | `string`                                                                 | `'380px'`   | Media area height (expanded)     |
| `selected`         | `boolean`                                                                | `false`     | Selected border                  |
| `hoverEffects`     | `boolean`                                                                | `true`      | Hover scale                      |
| `clickable`        | `boolean`                                                                | `true`      | Cursor pointer                   |
| `loading`          | `boolean`                                                                | `false`     | Loading overlay                  |
| `showDefaultMedia` | `boolean`                                                                | `true`      | Show placeholder when no src     |
| `data`             | `ThumbnailPreviewData`                                                   | —           | Structured data for content slot |
| `config`           | `ThumbnailPreviewConfig`                                                 | —           | Config object                    |

### Outputs

| Output         | Type                          | When                  |
| -------------- | ----------------------------- | --------------------- |
| `previewClick` | `ThumbnailPreviewClickEvent`  | Clicked               |
| `actionClick`  | `ThumbnailPreviewActionEvent` | Action button clicked |
| `mouseEnter`   | `ThumbnailPreviewData\|null`  | Mouse enters          |
| `mouseLeave`   | `void`                        | Mouse leaves          |

### Size Reference

| Size       | Width | Height |
| ---------- | ----- | ------ |
| `xs`       | 197px | 161px  |
| `sm`       | 240px | 160px  |
| `md`       | 353px | 238px  |
| `lg`       | 480px | 320px  |
| `xl`       | 640px | 426px  |
| `expanded` | 570px | auto   |

---

## 31. Thumbnail Tag (`ntv-tag`)

> **Note:** Selector is `ntv-tag`, NOT `ntv-thumbnail-tag`.

**Purpose:** Small media-type badge used overlaid on thumbnails. 15 semantic variant colors.

**Import:** `import { ThumbnailTag } from '@ntv360/component-pantry';`

### Variants

| `variant`       | Use case                                   |
| --------------- | ------------------------------------------ |
| `documentary`   | Documentary content                        |
| `entertainment` | Entertainment content                      |
| `education`     | Educational content                        |
| `nature`        | Nature/wildlife content                    |
| `technology`    | Tech content                               |
| `lifestyle`     | Lifestyle content                          |
| `fashion`       | Fashion content                            |
| `animal`        | Animal content                             |
| `image`         | Image file type                            |
| `video`         | Video file type                            |
| `feed`          | Live feed content                          |
| `channel`       | Channel indicator                          |
| `filler`        | Filler content                             |
| `default`       | Neutral gray                               |
| `custom`        | Use `backgroundColor` + `textColor` inputs |

### Inputs

| Input             | Type                             | Default         | Description                                     |
| ----------------- | -------------------------------- | --------------- | ----------------------------------------------- |
| `label`           | `string`                         | `''`            | Tag text                                        |
| `variant`         | `ThumbnailTagVariant`            | `'documentary'` | Semantic color preset (see table)               |
| `size`            | `'xs'\|'sm'\|'md'\|'lg'\|'full'` | `'md'`          | Size                                            |
| `maxWidth`        | `string`                         | (config)        | Max label width                                 |
| `textColor`       | `string`                         | `''`            | Custom text color (use with `variant='custom'`) |
| `backgroundColor` | `string`                         | `''`            | Custom bg color (use with `variant='custom'`)   |
| `borderRadius`    | `'xs'\|'sm'\|'md'\|'lg'\|'full'` | `'full'`        | Radius                                          |
| `config`          | `ThumbnailTagConfig`             | —               | Config object                                   |

### Outputs

| Output     | Type                     | When        |
| ---------- | ------------------------ | ----------- |
| `tagClick` | `ThumbnailTagClickEvent` | Tag clicked |

### Usage Example

```html
<ntv-tag label="VIDEO" variant="video" size="sm" />
<ntv-tag label="Education" variant="education" />
<ntv-tag label="LIVE" variant="feed" />
<ntv-tag label="Custom" variant="custom" backgroundColor="#8DCB2C" textColor="#fff" />
```

---

## 32. Video Preview (`ntv-video-preview`)

**Purpose:** In-panel video player with frosted-glass controls bar, scrubber, play/pause, time display, and expand-to-fullscreen button.

**Import:** `import { VideoPreview } from '@ntv360/component-pantry';`

### Inputs

| Input               | Type                                     | Default | Description                                                          |
| ------------------- | ---------------------------------------- | ------- | -------------------------------------------------------------------- |
| `src`               | `string`                                 | `''`    | Video URL                                                            |
| `size`              | `'xs'\|'sm'\|'md'\|'lg'\|'xl'\|'custom'` | `'md'`  | Panel size (`'custom'` → use `customPanelWidth`/`customPanelHeight`) |
| `showVideoTag`      | `boolean`                                | `true`  | Show "VIDEO" badge overlay                                           |
| `customPanelHeight` | `string`                                 | `''`    | Height override                                                      |
| `customPanelWidth`  | `string`                                 | `''`    | Width override                                                       |

### Usage Example

```html
<ntv-video-preview
    [src]="videoUrl"
    [showVideoTag]="true"
    customPanelHeight="400px"
    customPanelWidth="100%" />
```

---

## 33. Carousel (`ntv-carousel`)

**Purpose:** Two-panel layout: scrollable thumbnail panel (left) + expanded main preview panel (right). Supports CDK drag-to-reorder, multiple column counts, autoplay, and navigation.

**Import (standalone):** `import { CarouselComponent } from '@ntv360/component-pantry';`
**Import (NgModule):** `import { CarouselModule } from '@ntv360/component-pantry';`

### Variants

| `variant`  | Description                          |
| ---------- | ------------------------------------ |
| `default`  | Standard two-panel layout            |
| `bordered` | Border around the carousel container |
| `shadow`   | Drop shadow on container             |
| `rounded`  | Extra-rounded container corners      |

| `size` | Description                 |
| ------ | --------------------------- |
| `sm`   | Small thumbnails            |
| `md`   | Medium thumbnails (default) |
| `lg`   | Large thumbnails            |
| `xl`   | Extra-large thumbnails      |

| `layout`     | Description                                         |
| ------------ | --------------------------------------------------- |
| `horizontal` | Thumbnail panel on left, preview on right (default) |
| `vertical`   | Thumbnail panel on top, preview below               |

| `navigation` | Description             |
| ------------ | ----------------------- |
| `arrows`     | Prev/next arrow buttons |
| `dots`       | Dot indicators          |
| `both`       | Arrows + dots           |
| `none`       | No navigation controls  |

| `autoplay` | Description         |
| ---------- | ------------------- |
| `none`     | No autoplay         |
| `slow`     | Slow auto-advance   |
| `normal`   | Normal auto-advance |
| `fast`     | Fast auto-advance   |

### Key Inputs

| Input                    | Type                                         | Default        | Description                       |
| ------------------------ | -------------------------------------------- | -------------- | --------------------------------- |
| `items`                  | `model<CarouselItemInput[]>`                 | `[]`           | Carousel items (two-way)          |
| `size`                   | `'sm'\|'md'\|'lg'\|'xl'`                     | `'md'`         | Thumbnail size preset             |
| `variant`                | `'default'\|'bordered'\|'shadow'\|'rounded'` | `'default'`    | Visual variant                    |
| `layout`                 | `'horizontal'\|'vertical'`                   | `'horizontal'` | Panel arrangement                 |
| `navigation`             | `'arrows'\|'dots'\|'both'\|'none'`           | `'arrows'`     | Navigation controls               |
| `autoplay`               | `'none'\|'slow'\|'normal'\|'fast'`           | `'none'`       | Auto-advance speed                |
| `thumbnailColumns`       | `number`                                     | `6`            | Thumbnail grid columns            |
| `draggable`              | `boolean`                                    | `false`        | CDK drag-to-reorder               |
| `mainPanelWidth`         | `string`                                     | `'570px'`      | Right panel width                 |
| `mainPanelHeight`        | `string`                                     | `'380px'`      | Main media height                 |
| `videoAutoplay`          | `boolean`                                    | `true`         | Autoplay video on select          |
| `isLoading`              | `boolean`                                    | `false`        | Shimmer loading state             |
| `defaultDuration`        | `model<number>`                              | `20`           | Default content duration (s)      |
| `thumbnailGap`           | `string`                                     | `'10px'`       | Column gap                        |
| `thumbnailSurfaceHeight` | `string\|undefined`                          | `undefined`    | Constrained thumbnail area height |

### Outputs

| Output             | Type                      | When                   |
| ------------------ | ------------------------- | ---------------------- |
| `select`           | `CarouselItemInput`       | Item selected          |
| `itemClick`        | `CarouselClickEvent`      | Thumbnail clicked      |
| `navigationChange` | `CarouselNavigationEvent` | Prev/next navigation   |
| `autoplayChange`   | `CarouselAutoplayEvent`   | Autoplay state changes |

### Usage Example

```html
<ntv-carousel
    [(items)]="playlistItems"
    [thumbnailColumns]="6"
    [draggable]="true"
    mainPanelWidth="570px"
    mainPanelHeight="380px"
    [videoAutoplay]="true"
    (select)="onSelect($event)" />
```

---

## 34. Content View (`ntv-content-view`)

**Purpose:** Media content browser with grid/list toggle, item actions (share, settings, download, delete), lock controls, and a detail modal.

**Import:** `import { ContentViewComponent } from '@ntv360/component-pantry';`

### Key Inputs

| Input               | Type                                         | Default                  | Description                    |
| ------------------- | -------------------------------------------- | ------------------------ | ------------------------------ |
| `items`             | `ContentViewItem[]`                          | `[]`                     | Content items                  |
| `variant`           | `'default'\|'card'\|'list'\|'grid'\|'media'` | `'default'`              | Layout variant                 |
| `size`              | `'sm'\|'md'\|'lg'\|'xl'`                     | `'md'`                   | Size multiplier                |
| `layout`            | `'vertical'\|'horizontal'`                   | `'vertical'`             | Flex direction                 |
| `loading`           | `boolean`                                    | `false`                  | Loading state                  |
| `error`             | `boolean`                                    | `false`                  | Error state                    |
| `showImages`        | `boolean`                                    | `true`                   | Show media preview             |
| `showActions`       | `boolean`                                    | `true`                   | Show action buttons            |
| `showDelete`        | `boolean`                                    | `true`                   | Show delete button             |
| `canLock`           | `boolean`                                    | `true`                   | Show lock controls             |
| `allowSelection`    | `boolean`                                    | `false`                  | Selection mode                 |
| `currentItemIndex`  | `number`                                     | `0`                      | Open item index (for modal)    |
| `isVisible`         | `boolean`                                    | `true`                   | Show/hide component            |
| `redirectUrl`       | `string\|null`                               | `null`                   | External URL for redirect icon |
| `emptyStateMessage` | `string`                                     | `'No content available'` | Empty state text               |
| `filterToggleState` | `boolean`                                    | `false`                  | Filter toggle initial state    |

### Key Outputs

| Output               | Type              | When                      |
| -------------------- | ----------------- | ------------------------- |
| `itemClick`          | `ContentViewItem` | Item clicked              |
| `actionClick`        | `{action; item}`  | Action button clicked     |
| `deleteClick`        | `void`            | Delete clicked            |
| `nextClick`          | `number`          | Navigate to next item     |
| `previousClick`      | `number`          | Navigate to previous item |
| `filterToggleChange` | `boolean`         | Filter toggle changes     |
| `modalClose`         | `void`            | Detail modal closed       |

---

## 35. Calendar (`ntv-calendar-base`)

**Purpose:** Full calendar with day/week/month views, event data, legend, and year/month drill-down navigation.

**Import:** `import { CalendarBaseComponent } from '@ntv360/component-pantry';`

### Inputs

| Input                 | Type                       | Default                 | Description                                                                          |
| --------------------- | -------------------------- | ----------------------- | ------------------------------------------------------------------------------------ |
| `calendarType`        | `CalendarTypes`            | `CalendarTypes.DEFAULT` | Calendar mode — `'default'` `'event'` `'host-installation'` `'leave'` `'attendance'` |
| `calendarConfig`      | `CalendarConfig`           | `{}`                    | View configuration                                                                   |
| `isLoading`           | `boolean`                  | `false`                 | Loading state                                                                        |
| `showYearPicker`      | `boolean`                  | `true`                  | Year picker in header                                                                |
| `showCalendarLegends` | `boolean`                  | `false`                 | Show legend                                                                          |
| `calendarLegends`     | `Record<string, string>[]` | `[]`                    | Legend items                                                                         |
| `data`                | `CalendarData[]`           | `[]`                    | Event data                                                                           |

### Outputs

| Output       | Type                                                                   | When             |
| ------------ | ---------------------------------------------------------------------- | ---------------- |
| `onDayClick` | `{payload: CalendarData[]; dateClicked: Date; isForAddEvent: boolean}` | Day cell clicked |

### Usage Example

```html
<ntv-calendar-base
    [data]="calendarEvents"
    [calendarConfig]="{ defaultView: 'month' }"
    [showCalendarLegends]="true"
    [calendarLegends]="legends"
    (onDayClick)="onDayClick($event)" />
```

---

## 36. Graph (`ntv-graph`)

**Purpose:** ApexCharts bar/line chart wrapper with metric row, legend, filter dropdowns, and weekly/daily toggle.

**Import:** `import { GraphComponent } from '@ntv360/component-pantry';`

### Inputs

| Input                   | Type          | Default      | Description              |
| ----------------------- | ------------- | ------------ | ------------------------ |
| `config`                | `GraphConfig` | **REQUIRED** | Chart configuration      |
| `hideBackgroundCard`    | `boolean`     | `false`      | Transparent background   |
| `showSwitchGraphButton` | `boolean`     | `true`       | Show weekly/daily toggle |

### Outputs

| Output         | Type          | When                    |
| -------------- | ------------- | ----------------------- |
| `filterChange` | `FilterEvent` | Filter dropdown changes |

### Usage Example

```html
<ntv-graph [config]="graphConfig" (filterChange)="onFilter($event)" />
```

### GraphConfig Key Fields

| Field            | Type               | Values                                                                                          |
| ---------------- | ------------------ | ----------------------------------------------------------------------------------------------- |
| `variant`        | `GraphVariant`     | `'line-with-legend'` `'line-with-filter-legend'` `'bar-with-legend'` `'bar-with-filter-legend'` |
| `size`           | `GraphSizeVariant` | `'small'` `'medium'` `'large'` `'fullscreen'` `'custom'`                                        |
| `legendPosition` | `string`           | `'top'` `'right'` `'bottom'` `'left'`                                                           |
| `strokeCurve`    | `string`           | `'smooth'` `'straight'` `'stepline'`                                                            |

```typescript
graphConfig: GraphConfig = {
    title: 'Content Views',
    subtitle: 'Last 30 days',
    variant: 'bar-with-legend',
    size: 'medium',
    series: [{ name: 'Views', data: [30, 40, 35, 50, 49, 60, 70] }],
    categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    legendPosition: 'bottom',
};
```

---

## 37. Donut Graph (`ntv-donut-graph`)

**Purpose:** ApexCharts donut chart with legend, center total, header with icon, timestamp footer, and 4 legend positions.

**Import:** `import { DonutGraphComponent } from '@ntv360/component-pantry';`

### Inputs

| Input         | Type               | Default      | Description                          |
| ------------- | ------------------ | ------------ | ------------------------------------ |
| `data`        | `DonutChartItem[]` | **REQUIRED** | Chart segments                       |
| `config`      | `DonutChartConfig` | `{}`         | Full chart configuration (see below) |
| `highlighted` | `boolean`          | `false`      | Highlight border                     |

### DonutChartConfig Key Fields

| Field            | Values                                                            |
| ---------------- | ----------------------------------------------------------------- |
| `size`           | `'small'` `'medium'` `'large'` `'fullscreen'` `'custom'` `'auto'` |
| `legendPosition` | `'top'` `'right'` `'bottom'` `'left'`                             |
| `showTotal`      | `boolean` — show sum in center                                    |
| `title`          | `string` — card header text                                       |

### Usage Example

```html
<ntv-donut-graph
    [data]="segments"
    [config]="{ title: 'Content Types', legendPosition: 'right',
              showTotal: true, size: 'medium' }" />
```

```typescript
segments: DonutChartItem[] = [
  { label: 'Videos', value: 45, color: '#8DCB2C' },
  { label: 'Images', value: 30, color: '#095AF3' },
  { label: 'Documents', value: 25, color: '#F59E0B' }
];
```

---

## 38. Radial Graph (`ntv-radial-graph`)

**Purpose:** Single SVG arc progress ring (0–100%) with center value label and optional text below.

**Import:** `import { RadialGraphComponent } from '@ntv360/component-pantry';`

### Inputs

| Input         | Type                | Default      | Description                                                |
| ------------- | ------------------- | ------------ | ---------------------------------------------------------- |
| `config`      | `RadialChartConfig` | `{value: 0}` | Ring config — `size`: `'small'\|'medium'\|'large'\|'auto'` |
| `strokeWidth` | `number\|undefined` | `undefined`  | Override arc stroke width                                  |
| `highlighted` | `boolean`           | `false`      | Highlight border                                           |

### Usage Example

```html
<ntv-radial-graph
    [config]="{ value: 72, max: 100, color: '#8DCB2C',
              label: 'Completion', size: 'large', card: true }" />
```

---

## 39. Horizontal Graph (`app-horizontal-graph`)

> **Note:** Selector is `app-horizontal-graph` (not `ntv-`). This is a known naming inconsistency.

**Purpose:** Horizontal bar chart with a label sidebar, grid-line overlay, and x-axis tick labels.

### Inputs

| Input         | Type     | Default         | Description                          |
| ------------- | -------- | --------------- | ------------------------------------ |
| `graphData`   | `object` | complex default | `{timeline, colors, data}` structure |
| `itemGap`     | `number` | `10`            | Gap between rows (px)                |
| `graphHeight` | `number` | `20`            | Bar height (px)                      |

---

## 40. Error States (`ntv-error-states`)

**Purpose:** Full-page error display for HTTP 4xx/5xx codes with illustrations, action buttons, and size variants.

**Import:** `import { ErrorStatesComponent } from '@ntv360/component-pantry';`

### Inputs

| Input               | Type                                                                                                      | Default | Description           |
| ------------------- | --------------------------------------------------------------------------------------------------------- | ------- | --------------------- |
| `variant`           | `'404'\|'500'\|'500-card'\|'502-card'\|'503-card'\|'504-card'\|'403'\|'403-card'\|'401-card'\|'400-card'` | `'404'` | Error type            |
| `errorTitle`        | `string\|undefined`                                                                                       | `''`    | Override title        |
| `errorMessage`      | `string\|undefined`                                                                                       | `''`    | Override message      |
| `goHomePath`        | `string`                                                                                                  | —       | "Go Home" router path |
| `signInPath`        | `string`                                                                                                  | —       | "Sign In" router path |
| `requestAccessPath` | `string`                                                                                                  | —       | "Request Access" path |
| `customWidth`       | `string`                                                                                                  | —       | Container width       |
| `customHeight`      | `string`                                                                                                  | —       | Container height      |
| `config`            | `ErrorStateConfig`                                                                                        | —       | Config object         |

### Outputs

| Output          | Type   | When                   |
| --------------- | ------ | ---------------------- |
| `goHome`        | `void` | Go Home clicked        |
| `goBack`        | `void` | Go Back clicked        |
| `retry`         | `void` | Retry clicked          |
| `signIn`        | `void` | Sign In clicked        |
| `requestAccess` | `void` | Request Access clicked |

### Usage Example

```html
<!-- 404 page -->
<ntv-error-states
    variant="404"
    goHomePath="/dashboard"
    (goHome)="router.navigate(['/dashboard'])" />

<!-- 403 with custom message -->
<ntv-error-states
    variant="403"
    errorTitle="Access Denied"
    errorMessage="You don't have permission to view this page."
    requestAccessPath="/request"
    (requestAccess)="requestAccess()" />
```

---

## 41. Stack (`ntv-stack`)

**Purpose:** Three-card fan display (like a deck of photos) with hover-fan animation.

**Import:** `import { Stack } from '@ntv360/component-pantry';`

### Inputs

| Input     | Type      | Default | Description                      |
| --------- | --------- | ------- | -------------------------------- |
| `items`   | `any[]`   | `[]`    | Items with `imageUrl` or similar |
| `label`   | `string`  | `''`    | Label above the stack            |
| `loading` | `boolean` | `false` | Skeleton loading state           |

### Usage Example

```html
<ntv-stack label="Recent Uploads" [items]="recentFiles" />
```

---

## 42. Grid (`ntv-grid`)

**Purpose:** CSS grid layout container with configurable columns and gaps.

### Inputs

| Input    | Type           | Default | Description          |
| -------- | -------------- | ------- | -------------------- |
| `cols`   | `number`       | `1`     | Number of columns    |
| `colGap` | `number`       | `5`     | Column gap (px)      |
| `rowGap` | `number`       | `5`     | Row gap (px)         |
| `gap`    | `number\|null` | `null`  | Uniform gap override |

### Usage Example

```html
<ntv-grid [cols]="3" [gap]="16">
    <ntv-card *ngFor="let item of items">{{ item.name }}</ntv-card>
</ntv-grid>
```

---

## 43. Template (`ntv-template`)

**Purpose:** Screen zone layout editor — positions content zones on a digital signage display canvas. Zones are overlaid on a proportional canvas.

**Import:** `import { Template } from '@ntv360/component-pantry';`

### Inputs

| Input                | Type         | Default | Description                         |
| -------------------- | ------------ | ------- | ----------------------------------- |
| `zones`              | `ZoneData[]` | —       | Zone definitions with position/size |
| `availablePlaylists` | `Playlist[]` | `[]`    | Playlists assignable to zones       |
| `showZoneInfo`       | `boolean`    | `false` | Show zone info overlay              |
| `showHoverEffects`   | `boolean`    | `true`  | Zone hover highlight                |

### Outputs

| Output         | Type     | When                   |
| -------------- | -------- | ---------------------- |
| `zoneSelected` | `string` | Zone clicked (zone ID) |

### Usage Example

```html
<ntv-template
    [zones]="screenZones"
    [availablePlaylists]="playlists"
    [showZoneInfo]="true"
    (zoneSelected)="onZoneSelect($event)" />
```

---

## 44. Zone (`ntv-zone`)

**Purpose:** Individual zone panel rendered inside `ntv-template`. Represents one content area on a digital signage screen. Can also be used standalone to render a single assignable zone.

**Import:** `import { ZoneComponent } from '@ntv360/component-pantry';`

### Inputs

| Input                | Type         | Default      | Description                                                               |
| -------------------- | ------------ | ------------ | ------------------------------------------------------------------------- |
| `zoneData`           | `ZoneData`   | **REQUIRED** | Zone geometry and metadata `{id, x, y, width, height, label?, playlist?}` |
| `availablePlaylists` | `Playlist[]` | `[]`         | Playlists available for assignment                                        |
| `showInfo`           | `boolean`    | `false`      | Show zone info overlay (label, dimensions)                                |
| `hoverEffects`       | `boolean`    | `true`       | Highlight on hover                                                        |
| `selected`           | `boolean`    | `false`      | Selected/active state                                                     |

### Outputs

| Output             | Type                                   | When                      |
| ------------------ | -------------------------------------- | ------------------------- |
| `zoneClick`        | `ZoneData`                             | Zone clicked              |
| `playlistAssigned` | `{zone: ZoneData; playlist: Playlist}` | Playlist assigned to zone |

### ZoneData Shape

```typescript
interface ZoneData {
    id: string;
    label?: string;
    x: number; // % from left (0–100)
    y: number; // % from top (0–100)
    width: number; // % width (0–100)
    height: number; // % height (0–100)
    playlist?: Playlist;
}
```

### Usage Example

```html
<!-- Standalone zone -->
<ntv-zone
    [zoneData]="{ id: 'zone-1', x: 0, y: 0, width: 100, height: 50, label: 'Header' }"
    [availablePlaylists]="playlists"
    [showInfo]="true"
    (zoneClick)="selectZone($event)"
    (playlistAssigned)="assign($event)" />
```

**Common mistakes:**

- `zoneData` is required — always provide it.
- Positions (`x`, `y`, `width`, `height`) are **percentages** (0–100), not pixels.
- Use `ntv-template` when you need to compose multiple zones on a canvas. Use `ntv-zone` standalone only for a single isolated zone.

---

## 45. Strapi Showcase Integration

### Overview

The live component showcase is powered by **ng-scaffolding** (v0.1.0) — an Angular 21 application that consumes a Strapi CMS to dynamically render component documentation, live demos, and property tables.

|                  |                                                       |
| ---------------- | ----------------------------------------------------- |
| **Showcase URL** | https://strapi-xi-smoky.vercel.app/                   |
| **Strapi CMS**   | https://nctv-strapi-core.onrender.com                 |
| **Repository**   | `N-Compass-TV/nctv-strapi` (folder: `ng-scaffolding`) |

### Tech Stack

| Technology        | Details                                                            |
| ----------------- | ------------------------------------------------------------------ |
| Framework         | Angular 21.2.10 — **zoneless** change detection                    |
| Language          | TypeScript 5.9.3 (strict mode)                                     |
| Rendering         | Angular SSR 21.2.8 + `RenderMode.Client` (no static HTML fallback) |
| BFF Server        | Express 5.1 — Node.js proxy between browser and Strapi             |
| Styling           | SCSS + Tailwind CSS 3.4.18, class-based dark mode, Syne font       |
| HTTP              | Axios 1.12.2 (BFF), Angular HttpClient (client-side)               |
| Charts            | ApexCharts 5.10.6 via ng-apexcharts                                |
| Markdown          | marked 17.0.4 + highlight.js / PrismJS                             |
| Animations        | Lottie Web 5.13.0                                                  |
| Component Library | `@ntv360/component-pantry ^0.5.9`                                  |

### Local Dev Setup

**Prerequisites:** Node.js ^20.19, npm, private registry token for `@ntv360`.

```ini
# .npmrc (configure BEFORE npm install)
@ntv360:registry=https://npm-dev.n-compass.online/
//npm-dev.n-compass.online/:_authToken=<YOUR_BASE64_TOKEN>
```

```bash
git clone https://github.com/N-Compass-TV/nctv-strapi.git
cd ng-scaffolding
npm install
cp .env.example .env   # Fill in env vars
npm run start          # http://localhost:4000
```

### Environment Variables

| Variable         | Default                                 | Description              |
| ---------------- | --------------------------------------- | ------------------------ |
| `PORT`           | `4000`                                  | Local server port        |
| `NODE_ENV`       | `development`                           | Environment mode         |
| `ENABLE_LOGGING` | `true`                                  | Request logging toggle   |
| `API_BASE_URL`   | `https://nctv-strapi-core.onrender.com` | Strapi URL for BFF proxy |
| `API_TIMEOUT`    | `30000`                                 | BFF request timeout (ms) |
| `ALLOWED_ORIGIN` | _(your domain)_                         | CORS origin (production) |

### Available Scripts

| Command                            | Description             |
| ---------------------------------- | ----------------------- |
| `npm run start`                    | Dev server (`ng serve`) |
| `npm run build`                    | Production build        |
| `npm run build:ssr`                | SSR build               |
| `npm run serve:ssr:ng-scaffolding` | Serve SSR build locally |
| `npm run pretty`                   | Format with Prettier    |

### Architecture — SSR + BFF Pattern

```
Browser  ←→  Angular SSR (Node.js/Express, port 4000)
                    ↕ /api/* proxy
              BFF Express (src/server.ts)
                    ↕
           Remote Strapi CMS (nctv-strapi-core.onrender.com)
```

**BFF responsibilities (`src/server.ts`):**

- **Origin validation** — localhost allowed in dev; `ALLOWED_ORIGIN` enforced in prod (403 otherwise)
- **API proxy** — `/api/*` → `API_BASE_URL` via Axios singleton (30s timeout)
- **Static serving** — `/browser` directory with 1-year cache header

**Client-side HTTP path:** `StrapiService` makes direct calls from the browser using `STRAPI_URL` env var (falls back to the production Strapi URL if not set).

> **Critical:** All routes use `RenderMode.Client`. If the BFF or Strapi is unreachable, the user sees a blank page — there is no static fallback.

### Directory Structure

```
src/
├── app/
│   ├── core/
│   │   ├── services/strapi/      StrapiService (REST API client)
│   │   ├── services/             AuthService, InstanceInputMapperService,
│   │   │                         SnippetGeneratorService
│   │   └── directive/            HighlightDirective
│   ├── features/
│   │   ├── components/           ComponentsService (sidebar data)
│   │   ├── dynamic-overview/     CMS-driven overview pages
│   │   ├── dynamic-showcase/     CMS-driven showcase pages
│   │   ├── overview/             Colors feature (static)
│   │   └── pantry/               Preview registry (slug → component class)
│   ├── layout/docs/              Docs layout shell (header, sidebar, wrapper)
│   └── shared/
│       ├── components/           Properties table
│       ├── strapi-blocks/        5 Strapi block renderers
│       ├── markdown.pipe.ts      Markdown → HTML pipe
│       └── icons/                SVG icons, Lottie animations
├── server/
│   ├── config/                   Environment configuration
│   ├── middleware/               Origin validation
│   └── services/                 Axios HTTP singleton
├── server.ts                     Express BFF entry point
├── main.ts                       Client bootstrap
└── main.server.ts                SSR bootstrap
```

**Path aliases:**

| Alias         | Resolves to             |
| ------------- | ----------------------- |
| `@core`       | `src/app/core/index.ts` |
| `@features/*` | `src/app/features/*`    |
| `@shared/*`   | `src/app/shared/*`      |
| `@layouts/*`  | `src/app/layout/*`      |

### Routes

All routes are children of `DocsLayoutComponent`:

| Route                                | Component                                      |
| ------------------------------------ | ---------------------------------------------- |
| `/`                                  | Redirects to `/overview/overview-installation` |
| `/overview/colors`                   | `ColorsComponent` (static)                     |
| `/overview/colors/variants/:variant` | `ColorVariantDetailComponent` (static)         |
| `/overview/:slug`                    | `DynamicOverviewPage` (Strapi-driven)          |
| `/component/:slug`                   | `DynamicShowcasePage` (Strapi-driven)          |

### Strapi Collections

**Used directly at runtime:**

| Collection                 | Purpose                                                                                                                            |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `overview-pages`           | Overview sidebar section + content for `/overview/:slug` pages. Consumed by `ComponentsService` and `dynamic-overview.page.ts`.    |
| `showcases`                | Components sidebar section + content for `/component/:slug` pages. Consumed by `ComponentsService` and `dynamic-showcase.page.ts`. |
| `component-pantry-version` | Version and branding info in the frontend header. Consumed by `docs-header.component.ts`.                                          |

**Used indirectly:**

| Collection              | Notes                                                                                                                                                                                                                                                           |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `component-definitions` | Not queried directly. Arrives as a populated relation on `showcases` and `overview-pages` responses (via `populate: '*'`). Read via `data.component_definitions` in `demo-block.component.ts`, `properties-table.component.ts`, and `dynamic-showcase.page.ts`. |

### Dynamic Zone Block Types

**Inside Showcase entries** (`sectionContent` field):

| `__component` value                 | Rendered by              | Behaviour                                                                |
| ----------------------------------- | ------------------------ | ------------------------------------------------------------------------ |
| `sections.section-demo`             | `<ntv-demo-block>`       | Live component demo with instance inputs, bindings, child element config |
| `sections.section-properties-table` | `<ntv-properties-table>` | Component API property table                                             |
| `section-header`                    | —                        | **Silently skipped**                                                     |
| `section-text`                      | —                        | **Silently skipped**                                                     |

**Inside Overview Page entries** (`sectionContent` field):

| `__component` value        | Rendered by           | Behaviour                                                                          |
| -------------------------- | --------------------- | ---------------------------------------------------------------------------------- |
| `overview-section.section` | `<app-section-block>` | Section container (colored/bordered). Contains a `sectionList` array of sub-blocks |

Sub-block `sectionType` values:

| `sectionType`                  | Status                                            |
| ------------------------------ | ------------------------------------------------- |
| `header` / `subsection header` | Rendered                                          |
| `content`                      | Rendered                                          |
| `list`                         | Rendered (uses `listItem`, `itemName`, `itemUrl`) |
| `code`                         | Rendered (uses `sectionCode`, `codeContent`)      |
| `colored`                      | Rendered                                          |
| `item`                         | **Not rendered** — silently skipped               |
| `text-only`                    | **Not rendered** — silently skipped               |

> **Debug tip:** If you see a blank section on a live page, the Strapi entry likely uses an unhandled type (`section-header`, `section-text`, `item`, `text-only`). Either remove the block or add a renderer in `src/app/shared/strapi-blocks/`.

> **Important:** Dynamic zone blocks are identified in Strapi API responses via the `__component` field, formatted as `category.component-name` (e.g. `sections.section-demo`). Match on this field when writing new block renderers.

### Component Showcase Pattern

The showcase renders live components from `@ntv360/component-pantry` using four pieces:

**1. Preview Registry** (`src/app/features/pantry/preview-registry.ts`)
Maps URL slugs (e.g. `thumbnail-gallery`) to Angular component classes. Components following the standard `ntv-{name}` selector pattern auto-resolve via `ALL_COMPONENT_MANIFESTS`. Only add a manual entry for non-standard naming (e.g. `horizontal-graph` which uses `app-horizontal-graph`).

**2. Demo Blocks** (`src/app/shared/strapi-blocks/demo-block/`)
Angular components that read instance inputs, child element configs, and binding data from the Strapi response and apply them to rendered components.

**3. SnippetGeneratorService** (`core/services/snippet-generator.service.ts`)
Auto-generates Angular template code snippets from component metadata. Produces the copy-pasteable `<ntv-xxx>` example shown on each showcase page.

**4. InstanceInputMapperService** (`core/services/instance-input-mapper.service.ts`)
Maps Strapi instance data to `@Input()` bindings on rendered components. Example: a Strapi `button-demo` entry with `variant: 'outline'`, `size: 'lg'` → applied as `[variant]="'outline'" [size]="'lg'"`.

### Custom Services

| Service                      | Location                                         | Purpose                                                                                  |
| ---------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `AuthService`                | `core/services/auth/auth.service.ts`             | Auth state via Angular signals                                                           |
| `StrapiService`              | `core/services/strapi/strapi.service.ts`         | Generic Strapi REST API client; reads `STRAPI_URL` env var, falls back to production URL |
| `InstanceInputMapperService` | `core/services/instance-input-mapper.service.ts` | Maps Strapi data to `@Input()` bindings                                                  |
| `SnippetGeneratorService`    | `core/services/snippet-generator.service.ts`     | Generates template code snippets                                                         |
| `DocsSidebarService`         | `layout/docs/docs-sidebar.service.ts`            | Sidebar open/close state                                                                 |
| `ComponentsService`          | `features/components/components.service.ts`      | Fetches sidebar data from Strapi; caches via `shareReplay(1)`                            |
| `ColorsService`              | `features/overview/colors/colors.service.ts`     | Color palette data for the Colors page                                                   |
| `HttpClientService`          | `server/services/http-client.service.ts`         | Axios singleton for the BFF proxy                                                        |

### Key Development Conventions

| Convention                     | Details                                                                                   |
| ------------------------------ | ----------------------------------------------------------------------------------------- |
| **Zoneless change detection**  | Do NOT use Zone.js-based patterns. Use signals and explicit change detection triggers.    |
| **Strict TypeScript**          | All new code must be fully typed.                                                         |
| **SSR-aware code**             | `window`, `document`, and browser APIs are unavailable during SSR. Guard appropriately.   |
| **No pre-rendering**           | All routes use `RenderMode.Client`. No static HTML fallback exists.                       |
| **Dynamic zone `__component`** | Block renderers must match on the `__component` field (`category.component-name` format). |

### Troubleshooting

**`npm install` fails on `@ntv360/component-pantry`**
→ Missing `.npmrc` credentials. Request a token from the NTV360 team. See the `.npmrc` config above.

**Pages load but content is blank**
→ BFF cannot reach Strapi. Verify `API_BASE_URL` in `.env`. For client-side calls, verify `STRAPI_URL`. Confirm Strapi is running at the target address.

**`403 Forbidden` on `/api/*` requests**
→ BFF origin middleware rejected the request. In local dev, access at `http://localhost:4000` specifically. In production, `ALLOWED_ORIGIN` in `.env` must match the frontend domain exactly.

**Component demo area renders blank**
→ Two possible causes:

1. Slug not resolving in the Preview Registry (`src/app/features/pantry/preview-registry.ts`). Add a manual entry for non-standard selectors.
2. Strapi entry uses an unhandled block type (`section-header`, `section-text`, `item`, `text-only`). Check the Strapi entry and either remove the block or add a renderer.

**Data is stale after Strapi content update**
→ `ComponentsService` caches via `shareReplay(1)`. Hard-refresh the browser or restart the dev server. Production requires a rebuild.

---

## 46. Kanban (`ntv-kanban`)

**Purpose:** A drag-and-drop board of columns (lanes) and cards, built on `@angular/cdk/drag-drop`, modeled after the Order Monitoring board in Figma. Cards are supplied as one flat array (each naming its lane via `columnId`); the board handles paging, WIP limits, collapsible lanes and priority-colored cards, but never persists anything itself — it reports via outputs and waits.

**Import:** `import { Kanban } from '@ntv360/component-pantry';`

### Inputs

| Input                          | Type                                     | Default         | Description                                                                                         |
| ------------------------------ | ---------------------------------------- | --------------- | --------------------------------------------------------------------------------------------------- |
| `columnCount`                  | `number`                                 | `0`             | Number of columns to generate when `columns` is empty                                               |
| `columns`                      | `KanbanColumn[]`                         | `[]`            | Explicit column definitions. Takes precedence over `columnCount`                                    |
| `accents`                      | `KanbanAccent[]`                         | `[]`            | Accent cycle applied per column index — theme token or any CSS colour                               |
| `priorityColors`               | `KanbanPriorityColors`                   | `{}`            | Per-priority overrides for the card accent bar and priority chip                                    |
| `cards`                        | `KanbanCard[]`                           | `[]`            | Cards rendered on the board; each points at a column via `columnId`                                 |
| `config`                       | `KanbanConfig`                           | `undefined`     | Configuration object for DRY usage; overrides individual inputs                                     |
| `size`                         | `'sm'\|'md'\|'lg'`                       | `'md'`          | Board density                                                                                       |
| `columnWidth`                  | `string`                                 | `''`            | Explicit column width (e.g. `'320px'`); overrides the density default                               |
| `draggable`                    | `boolean`                                | `true`          | Whether cards can be dragged                                                                        |
| `collapsible`                  | `boolean`                                | `true`          | Whether the column header shows its collapse control                                                |
| `collapsedTitleOrientation`    | `'vertical'\|'horizontal'`               | `'vertical'`    | How a collapsed column prints its title                                                             |
| `showCardCount`                | `boolean`                                | `true`          | Whether the card count renders in the column header                                                 |
| `showColumnMenu`               | `boolean`                                | `true`          | Whether the column header's overflow ("⋮") button renders                                           |
| `showAddCard`                  | `boolean`                                | `true`          | Whether the "+ Add Card" button renders under each column                                           |
| `showCardAccent`               | `boolean`                                | `true`          | Whether cards render their coloured top accent bar                                                  |
| `showWipLimit`                 | `boolean`                                | `true`          | Whether the WIP limit renders next to the card count                                                |
| `enforceWipLimit`              | `boolean`                                | `false`         | Whether drops into a column at its WIP limit are rejected                                           |
| `addCardText`                  | `string`                                 | `'Add Card'`    | Label of the column footer button                                                                   |
| `emptyText`                    | `string`                                 | `''`            | Text shown inside an empty column; empty string renders nothing                                     |
| `pageSize`                     | `number`                                 | `30` (min `10`) | Cards revealed per page inside a single column; `0` renders every card. Values 1–9 are raised to 10 |
| `loadMoreThreshold`            | `number`                                 | `96`            | Distance in px from a column's scroll bottom that triggers the next page                            |
| `loadingText`                  | `string`                                 | `'Loading…'`    | Label shown while a column is fetching its next page                                                |
| `cardTemplate` (`#kanbanCard`) | `TemplateRef<KanbanCardTemplateContext>` | —               | Optional consumer template used to render each card body                                            |

### Outputs

| Output         | Type                      | Description                                                                                      |
| -------------- | ------------------------- | ------------------------------------------------------------------------------------------------ |
| `cardMoved`    | `KanbanCardMovedEvent`    | Emitted after a card is dropped, with the full reordered card list                               |
| `cardsChange`  | `KanbanCard[]`            | Emitted with the full card list whenever the board mutates                                       |
| `cardClick`    | `KanbanCard`              | Emitted when a card is activated by click or Enter                                               |
| `addCard`      | `KanbanColumn`            | Emitted when "+ Add Card" is pressed (board never creates the card itself)                       |
| `columnToggle` | `KanbanColumnToggleEvent` | Emitted when a column is collapsed or expanded                                                   |
| `columnMenu`   | `KanbanColumnMenuEvent`   | Emitted when a column's overflow ("⋮") button is pressed                                         |
| `loadMore`     | `KanbanLoadMoreEvent`     | Emitted when a column flagged `hasMore` has revealed every card it holds and needs the next page |

Public methods: `loadMoreCards(view)`, `canEnterColumn(columnId)`, `columnViews()` (readonly signal of view models).

### Types

```typescript
interface KanbanColumn {
    id: string;
    title: string;
    variant?: KanbanColumnVariant;
    color?: string;
    wipLimit?: number;
    collapsed?: boolean;
    canAddCard?: boolean;
    hasMore?: boolean;
    loading?: boolean;
    totalCount?: number;
}

interface KanbanCard {
    id: string;
    columnId: string;
    title: string;
    key?: string;
    description?: string;
    assignee?: string;
    avatarUrl?: string;
    priority?: KanbanPriority;
    accentColor?: string;
    status?: KanbanCardTag;
    tags?: KanbanCardTag[];
    commentCount?: number;
    dueDate?: string | Date;
    data?: Record<string, unknown>;
}

interface KanbanCardTag {
    label: string;
    color?: string;
}

type KanbanPriority = 'low' | 'medium' | 'high' | 'urgent';
type KanbanPriorityColors = Partial<Record<KanbanPriority, string>>;
type KanbanColumnVariant = 'neutral' | 'warning' | 'jazzberry' | 'danger' | 'success' | 'bigStone';
type KanbanAccent = KanbanColumnVariant | (string & {});

interface KanbanCardMovedEvent {
    card: KanbanCard;
    previousColumnId: string;
    currentColumnId: string;
    previousIndex: number;
    currentIndex: number;
    cards: KanbanCard[];
}
interface KanbanLoadMoreEvent {
    column: KanbanColumn;
    loadedCount: number;
    pageSize: number;
}
interface KanbanColumnToggleEvent {
    column: KanbanColumn;
    collapsed: boolean;
}
interface KanbanColumnMenuEvent {
    column: KanbanColumn;
    trigger: HTMLElement;
}
```

### Usage Example

```html
<ntv-kanban
    [columns]="columns()"
    [cards]="cards()"
    [enforceWipLimit]="true"
    (cardMoved)="onCardMoved($event)"
    (addCard)="onAddCard($event)"
    (loadMore)="onLoadMore($event)">
</ntv-kanban>
```

```typescript
public readonly columns = signal<KanbanColumn[]>([
  { id: 'todo', title: 'Todo' },
  { id: 'doing', title: 'In Progress', wipLimit: 5 },
  { id: 'done', title: 'Done' },
]);
public readonly cards = signal<KanbanCard[]>([
  { id: 'c1', columnId: 'todo', title: 'Save A Lot - 0572' },
]);
public onCardMoved(event: KanbanCardMovedEvent): void {
  this.cards.set(event.cards); // persist the new order
}
```

**Common mistakes:**

- A card's `columnId` that matches no `column.id` renders **nowhere with no error** (e.g. `'Todo'` vs `'todo'` typo) — the most common reason for "my cards aren't showing."
- Without handling `(cardMoved)`, drags don't persist — the board keeps an internal working copy so dragging _appears_ to work, but any external change to `cards` wipes out unsaved drags.
- `cards` must be one flat `KanbanCard[]`, not grouped/nested per column.
- `config` always wins over individually-set inputs when both set the same property.
- The moment `columns` is non-empty, `columnCount` has no effect.
- `pageSize` 1–9 is auto-raised to 10 — a page that fits without a scrollbar can never trigger the scroll-driven `loadMore`.
- The board fills its parent's height; without a real height on an ancestor, lanes render as slivers.
- `(loadMore)` only fires for a column with `hasMore: true`, and is purely scroll-driven (no button).

---

## 47. Empty State (`ntv-empty-state`)

**Purpose:** Placeholder shown when a list/table/grid has no data: an animation (or static illustration) plus a heading, optional description, and an optional projected call-to-action. Defaults to the library's bundled brand Lottie animation ("No Items Found") when neither `animationSrc` nor `imageSrc` is given, and falls back to it again if a consumer's `animationSrc` fails to load with no `imageSrc` escape hatch — the illustration slot always renders _something_, never a blank box.

**Import:** `import { EmptyState } from '@ntv360/component-pantry';`

### Inputs

| Input          | Type                        | Default              | Description                                                                                                                                                                      |
| -------------- | --------------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`        | `string`                    | `'No Records Found'` | Heading text                                                                                                                                                                     |
| `description`  | `string`                    | `''`                 | Supporting text under the heading; only rendered when non-empty                                                                                                                  |
| `animationSrc` | `string`                    | `''`                 | Path/URL to a Lottie JSON animation. Defaults to the bundled brand animation when neither this nor `imageSrc` is given                                                           |
| `imageSrc`     | `string`                    | `''`                 | Static image/SVG fallback. Rendered when `animationSrc` is empty and this is given, or if a given `animationSrc` fails to load (wins if given, else the brand animation is used) |
| `loop`         | `boolean`                   | `true`               | Whether the Lottie animation loops                                                                                                                                               |
| `autoplay`     | `boolean`                   | `true`               | Whether the Lottie animation autoplays                                                                                                                                           |
| `size`         | `'sm'\|'md'\|'lg'`          | `'md'`               | Illustration size preset (sm 96px, md 160px, lg 240px)                                                                                                                           |
| `width`        | `string`                    | `''`                 | Explicit illustration width, overriding the size preset                                                                                                                          |
| `height`       | `string`                    | `''`                 | Explicit illustration height, overriding the size preset                                                                                                                         |
| `testId`       | `string`                    | `'empty-state'`      | Base value for `data-testid` hooks on the root and key sub-elements                                                                                                              |
| `config`       | `Partial<EmptyStateConfig>` | `{}`                 | Configuration object for DRY usage                                                                                                                                               |

**No outputs.** Content projection slot: `[empty-state-action]` — project a button (or any element) with this attribute for a call-to-action; nothing projected means nothing renders in that slot.

### Types

```typescript
type EmptyStateSize = 'sm' | 'md' | 'lg';

interface EmptyStateConfig {
    title?: string;
    description?: string;
    animationSrc?: string;
    imageSrc?: string;
    loop?: boolean;
    autoplay?: boolean;
    size?: EmptyStateSize;
    width?: string;
    height?: string;
    testId?: string;
}
```

### Usage Example

```html
<ntv-empty-state
    title="No Results Found"
    description="Try adjusting your filters or search terms."
    animationSrc="/assets/animations/no-results.json">
    <button empty-state-action (click)="clearFilters()">Clear Filters</button>
</ntv-empty-state>
```

**Common mistakes:**

- `animationSrc` expects a **path/URL string**, not an inline Lottie JSON object — the component fetches and loads it itself.
- A consumer-given `imageSrc` does **not** override a successfully-loading `animationSrc` — it only wins when there's no `animationSrc` at all, or the given one failed to load.
- The component fully manages its own Lottie instance (disposed on `ngOnDestroy`, reloaded on `animationSrc`/`loop` changes) — don't manage the animation instance yourself.
- The projected button needs the literal `empty-state-action` attribute to land in the centered action slot.

---

## 48. Logo Loader (`ntv-logo-loader`)

**Purpose:** Draws any logo SVG's outline first, then floods it with a gradient — built to take **any** arbitrary logo markup, not one hand-prepared asset. At runtime it parses the SVG via `DOMParser`, strips unsafe content, namespaces every internal id per-instance, injects one gradient, and splits merged compound paths into individually staggerable shapes.

**Import:** `import { LogoLoader } from '@ntv360/component-pantry';`

### Inputs

| Input         | Type                          | Default                             | Description                                                                          |
| ------------- | ----------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------ |
| `svg`         | `string` **(required)**       | —                                   | Raw `<svg>...</svg>` markup for the logo to animate                                  |
| `colors`      | `readonly string[] \| null`   | `['#A00558', '#EF060F', '#F18029']` | Gradient stops applied to every shape, in order; `null` keeps the logo's own colours |
| `angle`       | `number`                      | `0`                                 | Gradient direction in degrees, where 0 runs left to right                            |
| `duration`    | `number`                      | `1.8`                               | Length of one draw pass, in seconds                                                  |
| `stagger`     | `number`                      | `1.6`                               | Total spread of per-shape start delays, in seconds                                   |
| `direction`   | `LogoLoaderDirection`         | `'left-to-right'`                   | Axis/heading the stagger sweeps along                                                |
| `strokeWidth` | `number`                      | `2`                                 | Outline thickness in screen pixels, independent of the logo's viewBox                |
| `size`        | `string`                      | `'64px'`                            | CSS width of the rendered logo; height follows the source aspect ratio               |
| `playback`    | `'alternate'\|'loop'\|'once'` | `'alternate'`                       | How the animation repeats once a pass completes                                      |
| `animated`    | `boolean`                     | `true`                              | When `false`, renders the finished filled logo with no motion                        |
| `label`       | `string`                      | `'Loading'`                         | Accessible label announced for the loader                                            |

**No outputs.** **No `config` input** — unlike the library's other DRY-config components, every field above is set individually only (`LogoLoaderConfig` is exported as a type but isn't consumed as an `@Input`).

### Types

```typescript
type LogoLoaderPlayback = 'alternate' | 'loop' | 'once';
type LogoLoaderDirection =
    'left-to-right' | 'right-to-left' | 'top-to-bottom' | 'bottom-to-top' | 'document';
```

### Usage Example

```html
<ntv-logo-loader
    [svg]="brandLogoMarkup"
    [colors]="['#00C2FF', '#7B61FF', '#FF3DCB']"
    [angle]="45"
    [duration]="2.4"
    size="140px"
    direction="right-to-left" />
```

**Common mistakes (documented as "Limitations" in source):**

- Raster-in-SVG artwork (e.g. a `pattern` wrapping a base64 PNG) can't animate — renders correctly but statically.
- `text`, `image`, `use` elements are not strokeable — render statically regardless of `animated`.
- A logo made of only one un-splittable shape can't sweep — `direction`/`stagger` have no visible effect.
- Very thin logos can render as solid blobs from frame one if `strokeWidth` is large relative to `size` (trace lines from both edges meet in the middle) — lower `strokeWidth` or raise `size`.
- `prefers-reduced-motion: reduce` disables the animation automatically (intentional).
- Styles are unscoped (`ViewEncapsulation.None`) by necessity since the SVG is attached outside Angular's template — override via CSS custom properties on `.ntv-logo-loader`, not emulated encapsulation.
- `svg` is required — omitting it is a compile-time error, not a silent default.

---

## 49. Filter By (`ntv-filter-by`)

**Purpose:** A grouped, collapsible "Filter by" dropdown (built on `ntv-popover`) with a removable active-filter chip row below the trigger. Holds its own selection and expand/collapse state internally and never makes HTTP requests itself — on every change it emits the _full_ current selection map via `selectionChange` so the consumer wires it straight into their own API call.

**Import:** `import { FilterBy } from '@ntv360/component-pantry';`

### Inputs

| Input               | Type                      | Default       | Description                                                                                                               |
| ------------------- | ------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `groups`            | `FilterGroup[]`           | `[]`          | Filter groups to render in the panel                                                                                      |
| `label`             | `string`                  | `'Filter by'` | Trigger button label                                                                                                      |
| `showActiveFilters` | `boolean`                 | `true`        | Whether the "Active filters" chip row renders below the trigger                                                           |
| `minWidth`          | `string`                  | `'220px'`     | Popover minimum width                                                                                                     |
| `maxWidth`          | `string`                  | `'260px'`     | Popover maximum width                                                                                                     |
| `testId`            | `string`                  | `'filter-by'` | Root test id (sub-elements get suffixed variants: `-trigger`, `-active`, `-chip`, `-clear-all`, `-panel`, `-group-<key>`) |
| `config`            | `Partial<FilterByConfig>` | `{}`          | Configuration object for DRY usage — overrides individual inputs when provided                                            |

### Outputs

| Output            | Type                | Description                                                                                                                    |
| ----------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `selectionChange` | `FilterBySelection` | Emits the full current selection map (group key → selected values) on every change (option toggle, chip removal, or Clear All) |

Public methods: `isGroupExpanded(groupKey)`, `toggleGroup(groupKey)`, `isOptionSelected(groupKey, value)`, `toggleOption(groupKey, value)`, `removeChip(chip)`, `clearAll()`. Public computed signals: `activeChips()`, `hasActiveFilters()`.

### Types

```typescript
interface FilterByOption {
    label: string;
    value: string | number;
}

interface FilterGroup {
    key: string; // used as the key in the emitted selection map
    label: string;
    options: FilterByOption[];
    expanded?: boolean; // starts expanded; default false (collapsed)
}

type FilterBySelection = Record<string, (string | number)[]>;

interface ActiveFilterChip {
    groupKey: string;
    groupLabel: string;
    optionValue: string | number;
    optionLabel: string;
}

interface FilterByConfig {
    groups?: FilterGroup[];
    label?: string;
    showActiveFilters?: boolean;
    minWidth?: string;
    maxWidth?: string;
    testId?: string;
}
```

### Usage Example

```html
<ntv-filter-by [groups]="filterGroups" (selectionChange)="onFiltersChange($event)"> </ntv-filter-by>
```

```typescript
filterGroups: FilterGroup[] = [
  {
    key: 'licenses',
    label: 'Licenses',
    expanded: true,
    options: [
      { label: '0-5 Licenses', value: '0-5' },
      { label: '6-10 Licenses', value: '6-10' },
      { label: '10+ Licenses', value: '10+' },
    ],
  },
  { key: 'hosts', label: 'Hosts', options: [{ label: '1-3 Hosts', value: '1-3' }] },
];

onFiltersChange(selection: FilterBySelection) {
  // e.g. { licenses: ['0-5', '10+'], hosts: ['1-3'] }
  this.myApi.fetchDealers({ filters: selection }).subscribe(...);
}
```

**Common mistakes:**

- The component never calls an API itself — it's fully controlled via `groups`; pair `selectionChange` with your own service call.
- The emitted `FilterBySelection` is keyed by `group.key`, and each entry's array holds `option.value`s — not labels.
- Collapse/expand state is per-group and defaults to `false`, seeded once per group key so later re-renders won't stomp a user's manual toggle — set `expanded: true` per-group for groups that should start open.
- `config`'s properties always win over the individually-set input when both are present, same DRY pattern as Kanban/Empty State.

---

_Last updated: v0.7.9 · Angular 22 · Tailwind CSS v3 · ng-scaffolding v0.1.0_
