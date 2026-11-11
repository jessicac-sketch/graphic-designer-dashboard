# SCSS / Styling Standards

These are the mandatory styling rules for all components in this workspace.

---

## 1. SCSS Required — No Plain CSS

All style files must use the `.scss` extension. SASS features (nesting, variables, mixins) are expected.

---

## 2. BEM Naming — Required on All Classes

Use **BEM (Block Element Modifier)** naming for every CSS class. No flat semantic names, no generic utility classes in component stylesheets.

```
Block   — the main component (.card, .menu, .button)
Element — child of block, denoted by __ (.card__title, .menu__item)
Modifier — variation, denoted by -- (.button--primary, .menu__item--active)
```

```scss
// ❌ do not do this
.stat-card-header { ... }
.nav-item.active { ... }
.filter-toolbar-inner { ... }

// ✅ do this
.stat-card {
  &__header { ... }
  &__header--active { ... }
  &__content { ... }
  &__button {
    &--primary { ... }
    &--disabled { ... }
  }
}

.filter-toolbar {
  &__inner { ... }
  &__search { ... }
}
```

---

## 3. SCSS Nesting — Maximum 3 Levels

```scss
// ❌ too deep
.parent {
  .child {
    .grandchild {
      .great-grandchild { color: red; } // 4 levels — forbidden
    }
  }
}

// ✅ max 3 levels
.card {
  &__header { background: #f0f0f0; }
  &__button {
    background: blue;
    &--disabled { opacity: 0.5; } // 3rd level — OK
  }
}
```

---

## 4. Tailwind — `@apply` in SCSS, Never in HTML

Do not use raw Tailwind utility classes directly in HTML templates. Use `@apply` inside your SCSS/BEM classes instead.

```html
<!-- ❌ do not do this -->
<button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">

<!-- ✅ do this -->
<button class="button">
```

```scss
// ✅ SCSS file
.button {
  @apply px-4 py-2 bg-blue-500 text-white rounded;
  &:hover { @apply bg-blue-700; }
}
```

Use raw CSS only when Tailwind cannot express the value (e.g. complex `box-shadow`):
```scss
.card {
  @apply flex items-center justify-between bg-white rounded-xl;
  box-shadow: 0 4px 15px rgba(9, 22, 53, 0.04); // raw CSS only for values Tailwind can't express
}
```

---

## 5. No Inline Styles — Except Data-Driven Bindings

```html
<!-- ❌ static inline style — forbidden -->
<div style="background: #E3FAE1; color: #0C2D0A;">

<!-- ✅ data-driven binding — allowed -->
<div [style.background]="card.iconBgColor" [style.color]="card.iconColor">
```

Static styles must live in `.scss` files. `[style.*]` bindings are only acceptable when the value comes from component data at runtime.

---

## 6. No Hardcoded Hex Colors

Never hardcode hex color values in component SCSS or TypeScript styling configs. All colors must come from `tailwind.config.js` tokens.

```scss
// ❌
.dealers__icon { background: #6366F1; }

// ✅ — consume the token via @apply or CSS variable
.dealers__icon { @apply bg-primary-500; }
```

---

## 7. `::ng-deep` — FORBIDDEN for Color Overrides on `ntv-*` Components

`::ng-deep` **must not** be used to change colors on any `ntv-*` component. NTV components receive colors through the `variant` input property, which reads from `tailwind.config.js`.

```html
<!-- ❌ FORBIDDEN -->
<!-- ::ng-deep button { @apply bg-accent-50 text-accent-main; } -->

<!-- ✅ correct -->
<ntv-button variant="accent">Save</ntv-button>
<ntv-button variant="primary">Submit</ntv-button>
<ntv-button variant="danger">Delete</ntv-button>
```

`::ng-deep` is only permitted for **structural overrides** the component API cannot handle (e.g. `min-width`, custom padding, custom border). Colors always go through `variant`.

This rule applies to all `ntv-*` components: `ntv-button`, `ntv-dropdown`, `ntv-input`, `ntv-table`, `ntv-searchbar`, etc.

---

## 8. Bootstrap Grid — `col` Always Inside `row`

Every `.col-*` class must have a parent `.row`. Never use a column class without its row wrapper.

```html
<!-- ❌ -->
<div class="container">
  <div class="col-lg-12">Content</div>
</div>

<!-- ✅ -->
<div class="container">
  <div class="row">
    <div class="col-lg-12">
      Content
      <div class="row">
        <div class="col-lg-8">...</div>
        <div class="col-lg-4">...</div>
      </div>
    </div>
  </div>
</div>
```

Pattern: `row → col` (flat) or `row → col → row → col` (nested).

---

## 9. Responsive Breakpoints

Use `1200px` and `768px` as the standard responsive breakpoints for all new components.

```scss
@media (max-width: 1200px) { ... }
@media (max-width: 768px)  { ... }
```
