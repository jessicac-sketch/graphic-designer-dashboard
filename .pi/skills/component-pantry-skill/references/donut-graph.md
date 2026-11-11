---
tags:
  - component-docs
  - ntv360
  - component-pantry
  - donut-graph
---

# Component: Donut Graph

Read this file after selecting it from the component index. It is optimized for quick component lookup and implementation support.

## Summary
- Tag: `ntv-donut-graph`
- Slug: `donut-graph`
- Package: `@ntv360/component-pantry`
- Source: `component-pantry/donut-graph/donut-graph.manifest.ts`
- Playground controls: 4
- Properties: 2
- Demos: 6

## Description
An interactive donut chart powered by ApexCharts for data visualization.

## Features
- Multiple size presets - small, medium, large, fullscreen, custom, auto
- Custom color overrides per segment or entire palette
- Custom/built-in header icon and iconHtml
- Title and subtitle display
- Interactive hover effects — hovered segment highlights and center number updates
- Legend with coordinated hover between chart segments and legend items
- Responsive legend position (auto-adapts: right on desktop, bottom on mobile, dropdown on very small containers)
- Legend dropdown mode for mobile/small containers (auto size only)
- Custom size configuration (width, height, min/max)
- Stroke width and donut hole size configuration
- Total count override (defaults to sum of all items)
- Powered by ng-apexcharts

## Playground Controls
| Control | Type | Default | Label | Description | Options | Content |
| --- | --- | --- | --- | --- | --- | --- |
| `size` | `select` | `medium` | Size | Size preset for the chart | small, medium, large, fullscreen, auto | no |
| `showLegend` | `boolean` | `true` | Show Legend | Whether to show the custom legend |  | no |
| `showIcon` | `boolean` | `true` | Show Icon | Whether to show the header icon |  | no |
| `legendPosition` | `select` | `right` | Legend Position | Preferred legend position (auto adjusts for viewport) | right, left, bottom, top | no |

## Properties
| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `data` | `DonutChartItem[]` | yes | `required` | Array of chart segments. Each item needs label (string) and total (number). Optional color per item. |
| `config` | `DonutChartConfig` | no | `{}` | Configuration object for chart appearance and behavior:<br>- title?: string — title above the chart header<br>- subtitle?: string — subtitle/description  <br>- showIcon?: boolean — whether to show the header icon (default true)<br>- iconName?: string — built-in icon name key from library<br>- iconHtml?: string — custom SVG/HTML string for the header icon<br>- totalCount?: number — override total displayed in center (defaults to sum of totals)<br>- size?: 'small' \| 'medium' \| 'large' \| 'fullscreen' \| 'custom' \| 'auto'<br>- customSize?: { width, height, maxWidth, maxHeight, minWidth, minHeight }<br>- colors?: string[] — custom color palette for segments<br>- showDataLabels?: boolean<br>- showLegend?: boolean<br>- legendPosition?: 'top' \| 'right' \| 'bottom' \| 'left'<br>- height?: number<br>- strokeWidth?: number<br>- donutHoleSize?: number |

## Demos
### 1. Basic Usage

- Category: Usage
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-donut-graph

Donut chart with simple data

#### Instance 1: Basic Chart

- Label: Basic Chart

Config entries:
- `data`: `[{"label":"Category A","total":400},{"label":"Category B","total":300},{"label":"Category C","total":200},{"label":"Category D","total":100}]`
- `config`: `{"title":"Data Overview","size":"medium"}`

Code example:

```html
data = [
  { label: 'Category A', total: 400 },
  { label: 'Category B', total: 300 },
  { label: 'Category C', total: 200 },
  { label: 'Category D', total: 100 },
];
chartConfig = { title: 'Data Overview', size: 'medium' };

<ntv-donut-graph [data]="data" [config]="chartConfig"></ntv-donut-graph>
```

### 2. Sizes

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 2rem
- Component tag: ntv-donut-graph

Available size presets

#### Instance 1: Small

- Label: Small

Config entries:
- `data`: `[{"label":"Type A","total":300},{"label":"Type B","total":250},{"label":"Type C","total":150}]`
- `config`: `{"title":"Small Size","size":"small"}`

#### Instance 2: Medium

- Label: Medium

Config entries:
- `data`: `[{"label":"Type A","total":300},{"label":"Type B","total":250},{"label":"Type C","total":150}]`
- `config`: `{"title":"Medium Size","size":"medium"}`

#### Instance 3: Large

- Label: Large

Config entries:
- `data`: `[{"label":"Type A","total":300},{"label":"Type B","total":250},{"label":"Type C","total":150}]`
- `config`: `{"title":"Large Size","size":"large"}`

### 3. Custom Colors

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-donut-graph

Chart with custom segment color palette

#### Instance 1: Custom Colors

- Label: Custom Colors

Config entries:
- `data`: `[{"label":"Raspberry Pi 3","total":600},{"label":"Raspberry Pi 4","total":450},{"label":"Arduino Uno","total":300},{"label":"ESP32","total":200},{"label":"Others","total":100}]`
- `config`: `{"title":"Device Distribution","subtitle":"By device type","size":"medium","colors":["#6366f1","#8b5cf6","#a78bfa","#c4b5fd","#ddd6fe"]}`

Code example:

```html
data = [
  { label: 'Raspberry Pi 3', total: 600 },
  { label: 'Raspberry Pi 4', total: 450 },
  { label: 'Arduino Uno', total: 300 },
];
config = {
  title: 'Device Distribution',
  size: 'medium',
  colors: ['#6366f1', '#8b5cf6', '#a78bfa'],
};
<ntv-donut-graph [data]="data" [config]="config"></ntv-donut-graph>
```

### 4. With Title and Subtitle

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-donut-graph

Chart with header title, subtitle, and total count override

#### Instance 1: With Metadata

- Label: With Metadata

Config entries:
- `data`: `[{"label":"Online","total":4500},{"label":"Offline","total":1200},{"label":"Maintenance","total":300},{"label":"Unknown","total":150}]`
- `config`: `{"title":"Device Status","subtitle":"Real-time device counts","totalCount":6150,"size":"medium","showIcon":true}`

### 5. Legend Positions

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 2rem
- Component tag: ntv-donut-graph

Different legend position options

#### Instance 1: Legend Right

- Label: Legend Right

Config entries:
- `data`: `[{"label":"Success","total":750},{"label":"Failed","total":180},{"label":"Pending","total":70}]`
- `config`: `{"title":"Legend Right","size":"medium","legendPosition":"right"}`

#### Instance 2: Legend Bottom

- Label: Legend Bottom

Config entries:
- `data`: `[{"label":"Success","total":750},{"label":"Failed","total":180},{"label":"Pending","total":70}]`
- `config`: `{"title":"Legend Bottom","size":"medium","legendPosition":"bottom"}`

### 6. Auto Size (Responsive)

- Category: Configuration
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-donut-graph

Auto size adapts to container width and viewport

#### Instance 1: Auto Size

- Label: Auto Size

Config entries:
- `data`: `[{"label":"Active","total":1200},{"label":"Inactive","total":400},{"label":"Pending","total":200}]`
- `config`: `{"title":"Responsive Chart","size":"auto"}`

Code example:

```html
<ntv-donut-graph
  [data]="data"
  [config]="{ title: 'Responsive Chart', size: 'auto' }">
</ntv-donut-graph>
```
