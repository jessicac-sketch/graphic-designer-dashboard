---
name: ntv360-pantry-design-check
description: Use when reviewing or implementing Angular UI changes in this repo to verify Component Pantry usage and compliance with docs/DESIGN.md.
---

# NTV360 Pantry + Design Check

Use this skill when the user wants you to implement or review UI work and expects it to match the repo’s design system.

## Goal

Before changing UI, confirm:
- `@ntv360/component-pantry` is used where it fits
- the result follows `docs/DESIGN.md`
- the change matches nearby app patterns
- the diff stays small and boring                                           

## Workflow

1. Read the nearest component/route files first.
2. Read `docs/DESIGN.md` and follow the repo’s current visual direction.
3. Prefer Component Pantry for cards, buttons, and standard UI pieces.
4. Use Tailwind/SCSS for layout and component-scoped styling.
5. If pantry already covers the need, do not build a custom replacement.
6. If custom styling is needed, keep it consistent with the repo palette, spacing, and radius.
7. Validate the change against the existing screen visually and structurally.

## Checks

- Pantry first for buttons/cards/inputs when available.
- No random colors or fonts.
- Keep the NTV360 blue/green/neutral look.
- Preserve SSR-safe Angular patterns.
- Keep changes minimal.

## Output

When asked to apply this skill, report briefly:
- whether Component Pantry was used
- whether the design docs were followed
- if anything was intentionally custom and why
