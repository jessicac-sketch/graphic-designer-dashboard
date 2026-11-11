---
tags:
  - component-docs
  - ntv360
  - component-pantry
  - horizontal-graph
---

# Component: Horizontal Graph

Read this file after selecting it from the component index. It is optimized for quick component lookup and implementation support.

## Summary
- Tag: `app-horizontal-graph`
- Slug: `horizontal-graph`
- Package: `@ntv360/component-pantry`
- Source: `component-pantry/horizontal-graph/horizontal-graph.manifest.ts`
- Playground controls: 2
- Properties: 3
- Demos: 4

## Description
A horizontal progress/timeline chart for comparing values across multiple labelled rows.

## Features
- Each row has a label, a filled progress bar, and an optional remaining bar
- X-axis timeline built from a configurable interval and max value computed from data
- Content-aware: rows where remaining ≤ value show only the progress bar
- Configurable progress and remaining bar colors
- Responsive sidebar label width tracking via ResizeObserver
- Configurable item gap between rows
- Configurable graph bar height
- Labels auto-truncate at 20 characters

## Playground Controls
| Control | Type | Default | Label | Description | Options | Content |
| --- | --- | --- | --- | --- | --- | --- |
| `itemGap` | `select` | `10` | Item Gap (px) | Gap between each row in pixels | 5, 10, 15, 20 | no |
| `graphHeight` | `select` | `20` | Bar Height (px) | Height of each progress bar row | 10, 15, 20, 25, 30 | no |

## Properties
| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `graphData` | `{<br>  timeline: { interval: number };<br>  colors: { progress: string; remaining: string };<br>  data: { label: string; value: number; remaining: number }[];<br>}` | no | `{ timeline: { interval: 100 }, colors: { progress: 'green', remaining: 'blue' }, data: [...] }` | Complete graph data object:<br>- timeline.interval: X-axis tick spacing (e.g. 100 → ticks at 0, 100, 200, ...)<br>- colors.progress: CSS color for the filled/progress bar<br>- colors.remaining: CSS color for the remaining/unfilled bar<br>- data[].label: Row label (auto-truncated to 20 chars)<br>- data[].value: Filled portion amount<br>- data[].remaining: Remaining/unfilled portion amount (hidden when ≤ value) |
| `itemGap` | `number` | no | `10` | Gap between each row item in pixels |
| `graphHeight` | `number` | no | `20` | Height of each progress bar in pixels |

## Demos
### 1. Basic Usage

- Category: Usage
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: app-horizontal-graph

Horizontal timeline graph with progress and remaining bars

#### Instance 1: Default Data

- Label: Default Data

Config entries:
- `graphData`: `{"timeline":{"interval":200},"colors":{"progress":"#8DCB2C","remaining":"#E5E7EB"},"data":[{"label":"Arjay Saguisa","value":400,"remaining":1100},{"label":"Theus Mendez","value":600,"remaining":900},{"label":"Daisy Alcala","value":800,"remaining":700},{"label":"Mark Santos","value":1000,"remaining":500},{"label":"Jane Cruz","value":1200,"remaining":300}]}`

Code example:

```html
graphData = {
  timeline: { interval: 200 },
  colors: { progress: '#8DCB2C', remaining: '#E5E7EB' },
  data: [
    { label: 'Arjay Saguisa', value: 400, remaining: 1100 },
    { label: 'Theus Mendez', value: 600, remaining: 900 },
    { label: 'Daisy Alcala', value: 800, remaining: 700 },
  ],
};
<app-horizontal-graph [graphData]="graphData"></app-horizontal-graph>
```

### 2. Custom Colors

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: app-horizontal-graph

Different color combinations for progress and remaining bars

#### Instance 1: Blue & Gray

- Label: Blue & Gray

Config entries:
- `graphData`: `{"timeline":{"interval":100},"colors":{"progress":"#3B82F6","remaining":"#D1D5DB"},"data":[{"label":"Device A","value":300,"remaining":700},{"label":"Device B","value":500,"remaining":500},{"label":"Device C","value":700,"remaining":300}]}`

#### Instance 2: Purple & Pink

- Label: Purple & Pink

Config entries:
- `graphData`: `{"timeline":{"interval":100},"colors":{"progress":"#7C3AED","remaining":"#F9A8D4"},"data":[{"label":"Category A","value":250,"remaining":750},{"label":"Category B","value":600,"remaining":400},{"label":"Category C","value":900,"remaining":100}]}`

### 3. Bar Size Options

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1.5rem
- Component tag: app-horizontal-graph

Different item gap and bar height combinations

#### Instance 1: Compact Bars

- Label: Compact Bars

Config entries:
- `itemGap`: `5`
- `graphHeight`: `12`
- `graphData`: `{"timeline":{"interval":100},"colors":{"progress":"#8DCB2C","remaining":"#E5E7EB"},"data":[{"label":"Item 1","value":300,"remaining":700},{"label":"Item 2","value":500,"remaining":500},{"label":"Item 3","value":700,"remaining":300}]}`

#### Instance 2: Tall Bars

- Label: Tall Bars

Config entries:
- `itemGap`: `20`
- `graphHeight`: `30`
- `graphData`: `{"timeline":{"interval":100},"colors":{"progress":"#008FFB","remaining":"#FDE68A"},"data":[{"label":"Item 1","value":300,"remaining":700},{"label":"Item 2","value":500,"remaining":500},{"label":"Item 3","value":700,"remaining":300}]}`

### 4. Completed Items

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: app-horizontal-graph

Items where value exceeds remaining (remaining bar hidden)

#### Instance 1: Mixed Completion Rates

- Label: Mixed Completion Rates

Config entries:
- `graphData`: `{"timeline":{"interval":200},"colors":{"progress":"#8DCB2C","remaining":"#E5E7EB"},"data":[{"label":"Completed Task","value":1000,"remaining":200},{"label":"Exceeded Target","value":1400,"remaining":100},{"label":"In Progress","value":600,"remaining":800},{"label":"Just Started","value":200,"remaining":1200}]}`

Code example:

```html
<!-- When value >= remaining, the remaining bar is hidden automatically -->
<app-horizontal-graph [graphData]="graphData"></app-horizontal-graph>
```
