---
tags:
  - component-docs
  - ntv360
  - component-pantry
  - offcanvas
---

# Component: Offcanvas

Read this file after selecting it from the component index. It is optimized for quick component lookup and implementation support.

## Summary
- Tag: `ntv-offcanvas`
- Slug: `offcanvas`
- Package: `@ntv360/component-pantry`
- Source: `component-pantry/offcanvas/offcanvas.manifest.ts`
- Playground controls: 2
- Properties: 3
- Demos: 3

## Description
A slide-in drawer panel that animates in from any edge of the screen.

## Features
- Four positions: `top`, `left`, `bottom`, `right`
- Two-way bindable `visible` state via Angular model signal
- Header text input for the panel title
- Content projection for body and footer slots
- Backdrop overlay that closes the drawer on click
- Escape key closes the drawer (keyboard accessible)
- Locks body scroll while the drawer is open
- SSR-safe (guards against access to `document` on the server)

## Playground Controls
| Control | Type | Default | Label | Description | Options | Content |
| --- | --- | --- | --- | --- | --- | --- |
| `position` | `select` | `left` | Position | Which edge the drawer slides in from | left, right, top, bottom | no |
| `header` | `text` | `Drawer Title` | Header | Title text shown at the top of the drawer |  | no |

## Properties
| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `position` | `'top' \| 'left' \| 'bottom' \| 'right'` | no | `'left'` | Which edge the drawer slides in from. Controls the animation direction. |
| `visible` | `boolean (model)` | no | `false` | Two-way bindable visibility state. Use [(visible)]="isOpen" for two-way binding or [visible]="isOpen" (visibleChange)="isOpen=$event" for event binding. |
| `header` | `string` | no | `''` | Title text displayed at the top of the offcanvas header bar. |

## Demos
### 1. Basic Usage

- Category: Usage
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-offcanvas

Default left-position drawer with a trigger button

#### Instance 1: Left Drawer

- Label: Left Drawer

Config entries:
- `position`: `left`
- `header`: `Navigation Menu`

Content:

```html
<p>Drawer body content goes here. You can project any HTML.</p>
```

Code example:

```html
<!-- In component -->
isOpen = false;

<!-- In template -->
<button (click)="isOpen = true">Open Drawer</button>
<ntv-offcanvas position="left" header="Navigation Menu" [(visible)]="isOpen">
  <p>Drawer body content goes here.</p>
</ntv-offcanvas>
```

### 2. Positions

- Category: Examples
- Component type: universal
- Layout: horizontal
- Gap: 1rem
- Component tag: ntv-offcanvas

Drawer sliding in from different edges

#### Instance 1: Left

- Label: Left

Config entries:
- `position`: `left`
- `header`: `Left Drawer`

Content:

```html
<p>Left panel content.</p>
```

#### Instance 2: Right

- Label: Right

Config entries:
- `position`: `right`
- `header`: `Right Drawer`

Content:

```html
<p>Right panel content.</p>
```

#### Instance 3: Top

- Label: Top

Config entries:
- `position`: `top`
- `header`: `Top Drawer`

Content:

```html
<p>Top panel content.</p>
```

#### Instance 4: Bottom

- Label: Bottom

Config entries:
- `position`: `bottom`
- `header`: `Bottom Drawer`

Content:

```html
<p>Bottom panel content.</p>
```

### 3. With Rich Content

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-offcanvas

Offcanvas with a navigation list projected inside

#### Instance 1: Navigation Panel

- Label: Navigation Panel

Config entries:
- `position`: `left`
- `header`: `Main Menu`

Content:

```html
<nav>
  <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:0.5rem">
    <li><a href="#">Dashboard</a></li>
    <li><a href="#">Reports</a></li>
    <li><a href="#">Settings</a></li>
    <li><a href="#">Help</a></li>
  </ul>
</nav>
```

Code example:

```html
<ntv-offcanvas position="left" header="Main Menu" [(visible)]="isMenuOpen">
  <nav>
    <ul>
      <li><a href="/dashboard">Dashboard</a></li>
      <li><a href="/reports">Reports</a></li>
      <li><a href="/settings">Settings</a></li>
    </ul>
  </nav>
</ntv-offcanvas>
```
