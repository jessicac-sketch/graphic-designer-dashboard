# Pre-Submission Checklist

Run through this checklist before completing any Angular feature, component, or code review task. All items must pass.

---

## Styles

- [ ] Styles use **SCSS** with **BEM naming** convention
- [ ] `@apply` is used for Tailwind utilities in SCSS — not in HTML templates
- [ ] SCSS nesting does not exceed **3 levels**
- [ ] No static `style=""` inline attributes — only `[style.*]` for data-driven values
- [ ] No hardcoded hex colors in component code — static colors come from `tailwind.config.js` tokens
- [ ] BEM block names are **short and feature-based** (matching the component/file name where possible)
- [ ] Each component uses **one primary BEM block**
- [ ] SCSS uses **1200px + 768px** responsive breakpoints

## NTV Components

- [ ] `::ng-deep` is **not used** for color overrides on `ntv-*` components — `variant=""` is used instead
- [ ] `data-testid` exists on **every** user-interactive `ntv-*` element/component
- [ ] `data-testid` names are **lowercase-hyphenated** and **max 5 words**

## TypeScript

- [ ] No `any` types — proper interfaces used throughout
- [ ] All functions and methods have **explicit return types**
- [ ] All class members have **access modifiers** declared (`public` / `private` / `protected`)
- [ ] Variables and functions use **camelCase** naming
- [ ] Static values and labels are extracted to **`constants/`** files — not hardcoded in templates
- [ ] Table columns typed as `TableColumn[]` — not `any[]`
- [ ] Event types use **explicit interfaces** — not `string | {}`

## Angular Patterns

- [ ] `@if` / `@for` control flow used — not `*ngIf` / `*ngFor`
- [ ] `signal()` / `computed()` / `inject()` pattern used for state
- [ ] **SSR-safe patterns** applied (`isPlatformBrowser()` checks) where browser APIs are used
- [ ] Clickable elements that behave as buttons use `<button>` — not `<span>` / `<i>`
- [ ] Standalone component pattern — no NgModules introduced

## Imports & Architecture

- [ ] Imports organized: **Angular → Third-party/NTV → Local**
- [ ] **Path aliases** used for local imports (`@core`, `@shared`, `@features`, `@layouts`)
- [ ] All classes, methods, functions, and interfaces have **JSDoc comments**
- [ ] Page structure is **split into child components** by section and interaction boundary
- [ ] Static config/types extracted into **`constants/`** and **`interfaces/`** siblings
- [ ] Code is **formatted and linted**
