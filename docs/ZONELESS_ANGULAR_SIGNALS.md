# Zoneless Angular with Signals

## Overview

This document describes our migration from manual change detection (`ChangeDetectorRef`) to Angular signals for full zoneless reactivity.

## Why Zoneless?

Traditional Angular uses **Zone.js** to automatically detect changes by monkey-patching browser APIs. This comes with:

- ❌ Performance overhead
- ❌ Bundle size increase (~30KB)
- ❌ Complex debugging
- ❌ Compatibility issues with some libraries

**Zoneless Angular** removes this dependency and relies on **signals** for reactive state management, providing:

- ✅ Better performance
- ✅ Smaller bundle size
- ✅ Explicit reactivity
- ✅ Easier debugging
- ✅ Modern React-like developer experience

## What We Removed

### 1. ChangeDetectorRef Pattern (Old Way)

```typescript
// ❌ OLD: Manual change detection
import { ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush, // ❌ Remove
})
export class MyComponent {
    private readonly cdr = inject(ChangeDetectorRef); // ❌ Remove

    data: any[] = [];
    isLoading = false;

    loadData() {
        this.http.get('/api/data').subscribe((result) => {
            this.data = result;
            this.isLoading = false;
            this.cdr.markForCheck(); // ❌ Remove - Manual trigger
        });
    }
}
```

### 2. OnPush Change Detection Strategy

```typescript
// ❌ OLD: Requires manual change detection
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,  // ❌ Remove
})
```

## What We Added

### 1. Signals Pattern (New Way)

```typescript
// ✅ NEW: Automatic reactivity with signals
import { Component, signal } from '@angular/core';

@Component({
    // No changeDetection strategy needed
})
export class MyComponent {
    // Convert properties to signals
    data = signal<any[]>([]);
    isLoading = signal(false);

    loadData() {
        this.http.get('/api/data').subscribe((result) => {
            this.data.set(result); // ✅ Automatic reactivity
            this.isLoading.set(false); // ✅ Automatic reactivity
            // No manual change detection needed!
        });
    }
}
```

### 2. Template Updates

```html
<!-- ❌ OLD: Direct property access -->
@if (isLoading) {
<p>Loading...</p>
} @for (item of data; track item.id) {
<div>{{ item.name }}</div>
}

<!-- ✅ NEW: Signal syntax with () -->
@if (isLoading()) {
<p>Loading...</p>
} @for (item of data(); track item.id) {
<div>{{ item.name }}</div>
}
```

## Migration Checklist

When converting a component to use signals:

- [ ] Remove `ChangeDetectorRef` import
- [ ] Remove `changeDetection: ChangeDetectionStrategy.OnPush`
- [ ] Remove all `cdr.markForCheck()` calls
- [ ] Convert properties to signals using `signal()`
- [ ] Update all property assignments to use `.set()`
- [ ] Update all property reads to use `()`
- [ ] Update template to use signal syntax with `()`

## Real Examples from Our Codebase

### Example 1: Ad Analytics Component

**Before:**

```typescript
export class AdAnalyticsComponent {
    private readonly cdr = inject(ChangeDetectorRef);

    content: ProgrammaticContent | null = null;
    isLoadingContent = true;
    playRecordsData: ProgrammaticContent[] = [];

    loadContent() {
        this.service.getById(id).subscribe((content) => {
            this.content = content;
            this.isLoadingContent = false;
            this.cdr.detectChanges(); // Manual trigger
        });
    }
}
```

**After:**

```typescript
export class AdAnalyticsComponent {
    // No ChangeDetectorRef needed!

    content = signal<ProgrammaticContent | null>(null);
    isLoadingContent = signal(true);
    playRecordsData = signal<ProgrammaticContent[]>([]);

    loadContent() {
        this.service.getById(id).subscribe((content) => {
            this.content.set(content); // ✅ Auto-reactive
            this.isLoadingContent.set(false); // ✅ Auto-reactive
            // No manual change detection!
        });
    }
}
```

### Example 2: Ads Gallery Component

**Before:**

```typescript
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush, // ❌
})
export class AdsGalleryComponent {
    private readonly cdr = inject(ChangeDetectorRef); // ❌

    contents: ProgrammaticContent[] = [];
    isLoading = true;
    hasMore = true;

    loadAds() {
        this.service.getAll().subscribe((ads) => {
            this.contents = ads;
            this.isLoading = false;
            this.hasMore = ads.length >= this.limit;
            this.cdr.markForCheck(); // ❌ Manual trigger
        });
    }

    loadMore() {
        this.isLoadingMore = true;
        this.cdr.markForCheck(); // ❌ Manual trigger

        this.service.getAll().subscribe((ads) => {
            this.contents = [...this.contents, ...ads];
            this.isLoadingMore = false;
            this.cdr.markForCheck(); // ❌ Manual trigger
        });
    }
}
```

**After:**

```typescript
@Component({
    // No changeDetection strategy!
})
export class AdsGalleryComponent {
    // No ChangeDetectorRef!

    contents = signal<ProgrammaticContent[]>([]);
    isLoading = signal(true);
    hasMore = signal(true);

    loadAds() {
        this.service.getAll().subscribe((ads) => {
            this.contents.set(ads); // ✅ Auto-reactive
            this.isLoading.set(false); // ✅ Auto-reactive
            this.hasMore.set(ads.length >= this.limit); // ✅ Auto-reactive
            // No manual change detection needed!
        });
    }

    loadMore() {
        this.isLoadingMore.set(true); // ✅ Auto-reactive

        this.service.getAll().subscribe((ads) => {
            this.contents.set([...this.contents(), ...ads]); // ✅ Auto-reactive
            this.isLoadingMore.set(false); // ✅ Auto-reactive
        });
    }
}
```

## Signal API Quick Reference

### Creating Signals

```typescript
// Primitive values
const count = signal(0);
const name = signal('');
const isActive = signal(false);

// Objects
const user = signal<User | null>(null);

// Arrays
const items = signal<Item[]>([]);
```

### Reading Signal Values

```typescript
// In TypeScript
const currentCount = count();
const currentName = name();
const currentItems = items();

// In Templates
{{ count() }}
{{ name() }}
@for (item of items(); track item.id) { ... }
```

### Updating Signal Values

```typescript
// Set new value
count.set(10);
name.set('John');
items.set([...newItems]);

// Update based on current value
count.update((value) => value + 1);
items.update((current) => [...current, newItem]);
```

### Computed Signals

```typescript
const count = signal(0);
const doubled = computed(() => count() * 2);

// Automatically updates when count changes
console.log(doubled()); // Always in sync
```

### Effects

```typescript
effect(() => {
    // Runs whenever signals used inside change
    console.log('Count changed:', count());
});
```

## Benefits Observed

After migrating to signals:

1. **Simpler Code**: Removed ~50 lines of boilerplate (`cdr.markForCheck()` calls)
2. **Better Performance**: No Zone.js overhead for change detection
3. **Clearer Intent**: Explicit reactivity makes data flow obvious
4. **Fewer Bugs**: No forgotten `markForCheck()` calls causing stale UI
5. **Better DevEx**: Less cognitive overhead, more predictable behavior

## Common Pitfalls

### ❌ Forgetting to Call Signal in Template

```html
<!-- ❌ WRONG: Displays the signal object, not the value -->
<p>{{ count }}</p>

<!-- ✅ CORRECT: Call the signal to get its value -->
<p>{{ count() }}</p>
```

### ❌ Direct Mutation

```typescript
// ❌ WRONG: Direct mutation doesn't trigger reactivity
items()[0].name = 'New Name';

// ✅ CORRECT: Create new reference
items.update((current) => {
    const updated = [...current];
    updated[0] = { ...updated[0], name: 'New Name' };
    return updated;
});
```

### ❌ Mixing Patterns

```typescript
// ❌ WRONG: Mixing signals with non-signal properties
content = signal<Content | null>(null);
isLoading = true; // Not a signal!

// ✅ CORRECT: Use signals consistently
content = signal<Content | null>(null);
isLoading = signal(true);
```

## Testing with Signals

```typescript
it('should update count', () => {
    const component = new MyComponent();

    // Signals work the same in tests
    expect(component.count()).toBe(0);

    component.increment();

    expect(component.count()).toBe(1);
});
```

## Future Considerations

### Signal Inputs (Angular 17.1+)

```typescript
@Component({ ... })
export class MyComponent {
    // ✅ Input as signal
    @Input() user = input<User>();

    // Access like any other signal
    ngOnInit() {
        console.log(this.user()?.name);
    }
}
```

### Signal Outputs (Angular 17.3+)

```typescript
@Component({ ... })
export class MyComponent {
    // ✅ Output as signal-based
    itemClicked = output<Item>();

    onClick(item: Item) {
        this.itemClicked.emit(item);
    }
}
```

## Resources

- [Angular Signals Documentation](https://angular.dev/guide/signals)
- [Zoneless Angular Guide](https://angular.dev/guide/experimental/zoneless)
- [Migration Guide](https://angular.dev/guide/signals/migration)

## Summary

**Before (Zone.js + ChangeDetectorRef):**

- Manual change detection required
- `OnPush` strategy with `markForCheck()` calls
- Less predictable reactivity
- More boilerplate code

**After (Zoneless + Signals):**

- Automatic reactivity
- No manual change detection
- Clearer data flow
- Less code, better performance

---

**Migration Date:** 2026-06-03  
**Components Migrated:** `AdAnalyticsComponent`, `AdsGalleryComponent`  
**Status:** ✅ Production Ready
