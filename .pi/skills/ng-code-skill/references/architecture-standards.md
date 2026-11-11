# Architecture & Angular Patterns

These are the mandatory architecture, import, documentation, and Angular pattern rules for this workspace.

---

## 1. Import Organization (WARP — Mandatory)

Group imports in this order with a blank line between groups:

```typescript
// ✅ correct order
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import axios from 'axios';
import { NtvButtonComponent } from '@ntv360/component-pantry';

import { AuthService } from '@core';
import { DashboardComponent } from '@features/dashboard';
import { MyComponent } from '@shared/components';
```

**Rules:**
- Group 1: Angular (`@angular/*`)
- Group 2: Third-party and NTV (`@ntv360/*`, `axios`, `express`, etc.)
- Group 3: Local (path aliases: `@core`, `@features`, `@shared`, `@layouts`)
- Never use deep relative imports (`../../core/auth.service`) — use path aliases
- Server-side local imports use `.js` extension: `import { service } from './service.js'`

---

## 2. Path Aliases (WARP)

Always use path aliases for local imports in `src/app`:

| Alias | Maps to |
|---|---|
| `@core` | `src/app/core` |
| `@features` | `src/app/features` |
| `@shared` | `src/app/shared` |
| `@layouts` | `src/app/layout` |

---

## 3. WARP Folder Structure

```
src/
├── app/
│   ├── core/        # Singleton services, guards, interceptors, models, constants
│   ├── features/    # Feature screens and smart components (pages)
│   ├── layout/      # Layout shells (authenticated, public) and route groupings
│   └── shared/      # Reusable dumb components, directives, pipes
└── server/          # BFF Layer (Express middleware, config, services, types)
```

**Adding a new feature:**
1. Create in `src/app/features/your-feature/`
2. Add routes in `layout/*/routes.ts`
3. Use path aliases for imports
4. Export via `index.ts` barrel

**Rule:** `core` = app-wide singletons. `shared` = reusable UI. `features` = route-driven business UI. `layout` = route grouping/shells.

---

## 4. JSDoc — Mandatory

Required on all classes, methods, functions, and interfaces. Must include applicable tags.

```typescript
/**
 * Calculates the total price of a cart including tax.
 *
 * @param {number} subtotal - The sum of item prices.
 * @param {number} taxRate - The tax rate as a decimal (e.g. 0.1 for 10%).
 * @returns {number} The total price.
 * @throws {Error} If the subtotal is negative.
 *
 * @example
 * const total = calculateTotal(100, 0.2); // Returns 120
 */
public calculateTotal(subtotal: number, taxRate: number): number {
  if (subtotal < 0) throw new Error('Subtotal cannot be negative');
  return subtotal * (1 + taxRate);
}

/**
 * DataService handles fetching and caching of catalog items.
 */
class DataService {
  /**
   * Retrieves all items from the catalog.
   * @returns {Promise<Item[]>} Array of catalog items.
   */
  public getItems(): Promise<Item[]> { ... }
}
```

---

## 5. Angular Control Flow — `@if` / `@for` (Not `*ngIf` / `*ngFor`)

Use the Angular 17+ block syntax in all templates.

```html
<!-- ❌ legacy directives -->
<div *ngIf="isVisible">...</div>
<li *ngFor="let item of items">{{ item.name }}</li>

<!-- ✅ block control flow -->
@if (isVisible) {
  <div>...</div>
}

@for (item of items; track item.id) {
  <li>{{ item.name }}</li>
}
```

---

## 6. State — Signals Pattern

Use `signal()`, `computed()`, and `inject()` for state and dependency management. Avoid constructor injection.

```typescript
// ❌
constructor(private authService: AuthService) {}

// ✅
private readonly authService = inject(AuthService);
public isLoggedIn = signal(false);
public displayName = computed(() => this.isLoggedIn() ? 'User' : 'Guest');
```

---

## 7. SSR Safety

Never access browser-only APIs (`window`, `document`, `localStorage`, `sessionStorage`) without an SSR guard.

```typescript
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';

private readonly platformId = inject(PLATFORM_ID);

private loadFromStorage(): void {
  if (!isPlatformBrowser(this.platformId)) return;
  const token = localStorage.getItem('token');
}
```

---

## 8. Clickable Elements — Use `<button>`

If a UI element is clickable and behaves as a button, it must be wrapped in `<button>`.

```html
<!-- ❌ -->
<span class="fas fa-times" (click)="delete()"></span>
<i class="fas fa-edit" (click)="edit()"></i>

<!-- ✅ -->
<button (click)="delete()" aria-label="Delete item">
  <span class="fas fa-times"></span>
</button>
```

Custom containers or components with click triggers are acceptable when they do not represent a button action.

---

## 9. Console Logging

Use `console.error()` for errors, not `console.log()`. Minimize `console.log` in production code.

```typescript
// ❌
console.log('Error:', error);

// ✅
console.error('Error:', error);
```

---

## 10. `data-testid` — Required on Interactive Elements

Add `data-testid` to every user-interactive component or element.

```html
<!-- ✅ -->
<ntv-button data-testid="hosts-add-btn">Add Host</ntv-button>
<ntv-table data-testid="hosts-table" ...></ntv-table>
<ntv-dropdown data-testid="status-filter-dropdown" ...></ntv-dropdown>
```

**Rules:**
- Lowercase, hyphenated names only
- Maximum 5 words per `data-testid`
- Apply to: buttons, dropdowns, tables, inputs, breadcrumbs, interactive controls
- Do **not** add to: passive wrappers, labels, `<span>`, layout containers

---

## 11. Page Structure — Component Splitting

Split pages into child components by section and interaction boundary. Do not build monolithic page components.

```
features/
└── campaign/
    ├── campaign-page/           # Smart container — routing entry point
    ├── campaign-header/         # Presentational — header section
    ├── campaign-stats/          # Presentational — KPI cards
    ├── campaign-table/          # Presentational — data table
    └── constants/               # Static configs, column definitions
        interfaces/              # TypeScript interfaces for this feature
```

Static config and types are extracted into `constants/` and `interfaces/` siblings — never inline in the component class.
