---
name: ng-code-skill
description: >
  Enforces project coding standards for TypeScript, Angular patterns, SCSS/BEM,
  and WARP architecture. Use when writing, reviewing, or refactoring any
  TypeScript, SCSS, or Angular code in this workspace. Also use for pre-PR
  checklist validation.
---

# Angular Code Standards Skill

## Non-Negotiable Rules (always apply)
- `strict: true` in tsconfig — never bypass
- No `any` — use `unknown` or define proper interfaces
- SCSS only — no plain CSS; BEM naming required on all class names
- `@apply` for Tailwind utilities in SCSS, never as raw classes in HTML templates
- No static `style=""` attributes — only data-driven `[style.*]` bindings allowed

## How to Use
1. Identify the domain from the Reference Index below.
2. Open **only** the relevant file(s) from `./references/`.
3. Apply standards before committing or generating code.

> **Pipeline:** This skill is the final stage of the feature-building flow.
> `data-design-skill` → `component-pantry-skill` → **`ng-code-skill`**

## Reference Index

| Domain | When to Load | File |
|---|---|---|
| TypeScript: types, naming, access modifiers, variables, functions | Writing/reviewing any TypeScript | [ts-standards.md](./references/ts-standards.md) |
| SCSS/BEM, Tailwind @apply, inline styles, colors | Writing/reviewing styles | [styling-standards.md](./references/styling-standards.md) |
| Import order, JSDoc, WARP folder structure, Angular patterns | Scaffolding, code review, import fixes | [architecture-standards.md](./references/architecture-standards.md) |
| Pre-submission gate — full project checklist | Before any PR / final review | [checklist.md](./references/checklist.md) |
