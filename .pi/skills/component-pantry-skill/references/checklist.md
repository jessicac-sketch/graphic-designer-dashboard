# NTV Component Checklist

A focused pre-submission checklist specifically for work involving `@ntv360/component-pantry` components. For the full project-wide checklist, load `ng-code-skill` → `checklist.md`.

---

## NTV Component Rules

- [ ] `variant="<color>"` used for all `ntv-*` color theming — no `::ng-deep` for colors
- [ ] `data-testid` present on **every** interactive `ntv-*` element
- [ ] `data-testid` names are lowercase-hyphenated, max 5 words
- [ ] `@ntv360/component-pantry` imports are in the **Third Party** import group
- [ ] Component is added to the `imports: []` array of the standalone component (not a module)

## Configuration

- [ ] Complex components use a `config` object input rather than scattered individual inputs
- [ ] Table columns are typed as `TableColumn[]` — not `any[]`
- [ ] Event handler types use explicit interfaces — not `string | {}`

## Styling

- [ ] No `::ng-deep` used to override background, text, or border colors
- [ ] `::ng-deep` (if used at all) is only for structural overrides the component API cannot handle (e.g. `min-width`, custom padding)
- [ ] No inline `style=""` on static wrappers around NTV components

## Accessibility

- [ ] Buttons wrapping NTV icon components have `aria-label` set
- [ ] Interactive elements are reachable via keyboard (not hidden behind custom `<div>` click handlers)
