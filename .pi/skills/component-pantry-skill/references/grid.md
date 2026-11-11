---
tags:
  - component-docs
  - ntv360
  - component-pantry
  - grid
---

# Component: Grid

Read this file after selecting it from the component index. It is optimized for quick component lookup and implementation support.

## Summary
- Tag: `ntv-grid`
- Slug: `grid`
- Package: `@ntv360/component-pantry`
- Source: `component-pantry/grid/grid.manifest.ts`
- Playground controls: 2
- Properties: 4
- Demos: 3

## Description
A lightweight CSS grid layout wrapper component.

## Features
- Configurable number of columns (1–12+) via `cols`
- Independent column and row gap control via `colGap` / `rowGap`
- Unified gap shorthand via `gap` (overrides colGap and rowGap)
- Uses Tailwind CSS `grid-cols-N` and `gap-N` utility classes
- Gap formula: value × 16px (e.g. gap=5 → 80px, gap=1 → 16px)
- Content projection — place any child elements inside

## Playground Controls
| Control | Type | Default | Label | Description | Options | Content |
| --- | --- | --- | --- | --- | --- | --- |
| `cols` | `select` | `1` | Columns | Number of columns in the grid | 1, 2, 3, 4, 6, 12 | no |
| `gap` | `select` | `5` | Gap | Unified gap (overrides colGap and rowGap). Value × 16px. | 1, 2, 3, 4, 5, 6 | no |

## Properties
| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `cols` | `number` | no | `1` | Number of grid columns. Maps to Tailwind grid-cols-N class. |
| `colGap` | `number` | no | `5` | Column gap size. Formula: value × 16px. Ignored when gap is set. |
| `rowGap` | `number` | no | `5` | Row gap size. Formula: value × 16px. Ignored when gap is set. |
| `gap` | `number \| null` | no | `null` | Unified gap for both row and column. Overrides colGap and rowGap when set. |

## Demos
### 1. Basic Usage

- Category: Usage
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-grid

Simple 3-column grid layout

#### Instance 1: 3 Columns

- Label: 3 Columns

Config entries:
- `cols`: `3`
- `gap`: `3`

Content:

```html
<div style="background:#e2e8f0;padding:1rem;border-radius:4px;">Item 1</div>
<div style="background:#e2e8f0;padding:1rem;border-radius:4px;">Item 2</div>
<div style="background:#e2e8f0;padding:1rem;border-radius:4px;">Item 3</div>
<div style="background:#e2e8f0;padding:1rem;border-radius:4px;">Item 4</div>
<div style="background:#e2e8f0;padding:1rem;border-radius:4px;">Item 5</div>
<div style="background:#e2e8f0;padding:1rem;border-radius:4px;">Item 6</div>
```

Code example:

```html
<ntv-grid [cols]="3" [gap]="3">
  <div *ngFor="let item of items">{{ item }}</div>
</ntv-grid>
```

### 2. Column Counts

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1.5rem
- Component tag: ntv-grid

Different numbers of columns

#### Instance 1: 2 Columns

- Label: 2 Columns

Config entries:
- `cols`: `2`
- `gap`: `3`

Content:

```html
<div style="background:#dbeafe;padding:1rem;border-radius:4px;">Col 1</div><div style="background:#dbeafe;padding:1rem;border-radius:4px;">Col 2</div>
```

#### Instance 2: 4 Columns

- Label: 4 Columns

Config entries:
- `cols`: `4`
- `gap`: `3`

Content:

```html
<div style="background:#dcfce7;padding:1rem;border-radius:4px;">1</div><div style="background:#dcfce7;padding:1rem;border-radius:4px;">2</div><div style="background:#dcfce7;padding:1rem;border-radius:4px;">3</div><div style="background:#dcfce7;padding:1rem;border-radius:4px;">4</div>
```

#### Instance 3: 6 Columns

- Label: 6 Columns

Config entries:
- `cols`: `6`
- `gap`: `2`

Content:

```html
<div style="background:#fef9c3;padding:0.5rem;border-radius:4px;text-align:center">1</div><div style="background:#fef9c3;padding:0.5rem;border-radius:4px;text-align:center">2</div><div style="background:#fef9c3;padding:0.5rem;border-radius:4px;text-align:center">3</div><div style="background:#fef9c3;padding:0.5rem;border-radius:4px;text-align:center">4</div><div style="background:#fef9c3;padding:0.5rem;border-radius:4px;text-align:center">5</div><div style="background:#fef9c3;padding:0.5rem;border-radius:4px;text-align:center">6</div>
```

### 3. Gap Control

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1.5rem
- Component tag: ntv-grid

Using colGap and rowGap vs unified gap

#### Instance 1: Unified Gap (gap=2)

- Label: Unified Gap (gap=2)

Config entries:
- `cols`: `3`
- `gap`: `2`

Content:

```html
<div style="background:#e2e8f0;padding:0.75rem;border-radius:4px;text-align:center">A</div><div style="background:#e2e8f0;padding:0.75rem;border-radius:4px;text-align:center">B</div><div style="background:#e2e8f0;padding:0.75rem;border-radius:4px;text-align:center">C</div><div style="background:#e2e8f0;padding:0.75rem;border-radius:4px;text-align:center">D</div><div style="background:#e2e8f0;padding:0.75rem;border-radius:4px;text-align:center">E</div><div style="background:#e2e8f0;padding:0.75rem;border-radius:4px;text-align:center">F</div>
```

Code example:

```html
<!-- Unified gap: 2 × 16px = 32px for both row and column -->
<ntv-grid [cols]="3" [gap]="2">...</ntv-grid>
```

#### Instance 2: Different Row/Col Gaps

- Label: Different Row/Col Gaps

Config entries:
- `cols`: `3`
- `colGap`: `1`
- `rowGap`: `4`

Content:

```html
<div style="background:#ede9fe;padding:0.75rem;border-radius:4px;text-align:center">A</div><div style="background:#ede9fe;padding:0.75rem;border-radius:4px;text-align:center">B</div><div style="background:#ede9fe;padding:0.75rem;border-radius:4px;text-align:center">C</div><div style="background:#ede9fe;padding:0.75rem;border-radius:4px;text-align:center">D</div><div style="background:#ede9fe;padding:0.75rem;border-radius:4px;text-align:center">E</div><div style="background:#ede9fe;padding:0.75rem;border-radius:4px;text-align:center">F</div>
```

Code example:

```html
<!-- colGap=1 → 16px column gap; rowGap=4 → 64px row gap -->
<ntv-grid [cols]="3" [colGap]="1" [rowGap]="4">...</ntv-grid>
```
