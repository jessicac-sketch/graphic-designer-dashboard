---
tags:
  - component-docs
  - ntv360
  - component-pantry
  - graph
---

# Component: Graph

Read this file after selecting it from the component index. It is optimized for quick component lookup and implementation support.

## Summary
- Tag: `ntv-graph`
- Slug: `graph`
- Package: `@ntv360/component-pantry`
- Source: `component-pantry/graph/graph.manifest.ts`
- Playground controls: 4
- Properties: 13
- Demos: 5

## Description
A versatile line and bar chart component powered by ApexCharts with support for time-based filtering.

## Features
- Four variants: line-with-legend, line-with-filter-legend, bar-with-legend, bar-with-filter-legend
- Size presets: small (800px), medium (1000px), large (1446px), fullscreen, custom
- Toggle between line and bar chart types at runtime
- Month/Year filter dropdowns (for filter variants)
- Header title, subtitle, and metric badges
- Dynamic hierarchical graphData structure (year → category → month → weekly values)
- Static series data support for simpler use cases
- Custom color palette per series
- emits FilterEvent on time frame changes
- Powered by ng-apexcharts

## Playground Controls
| Control | Type | Default | Label | Description | Options | Content |
| --- | --- | --- | --- | --- | --- | --- |
| `variant` | `select` | `line-with-legend` | Variant | Chart type combined with legend/filter configuration | line-with-legend, line-with-filter-legend, bar-with-legend, bar-with-filter-legend | no |
| `size` | `select` | `medium` | Size | Size preset for the graph container | small, medium, large, fullscreen | no |
| `hideBackgroundCard` | `boolean` | `false` | Hide Background Card | Removes background card appearance (padding, shadow, border radius) |  | no |
| `showSwitchGraphButton` | `boolean` | `true` | Show Switch Graph Button | Controls visibility of the Switch Graph button in the filter popover |  | no |

## Properties
| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `config` | `GraphConfig` | yes | `required` | Required configuration object containing all graph settings:<br>- variant?: GraphVariant — 'line-with-legend' \| 'line-with-filter-legend' \| 'bar-with-legend' \| 'bar-with-filter-legend'<br>- size?: 'small' \| 'medium' \| 'large' \| 'fullscreen' \| 'custom'<br>- customSize?: { width, height, maxWidth, maxHeight, minWidth, minHeight }<br>- header?: string — header title<br>- subHeader?: string — header subtitle<br>- headerMetrics?: { label, value, color }[] — metric badges shown in header<br>- series?: { name: string; data: number[] }[] — static series data<br>- colors?: string[] — custom color palette<br>- categories?: string[] — x-axis category labels<br>- selectedTimeFrame?: 'month' \| 'year'<br>- selectedMonth?: string<br>- selectedYear?: string<br>- timeFrames?: { monthly?: TimeFrame[]; yearly?: TimeFrame[] } — explicit filter options<br>- graphData?: GraphDataType — hierarchical { [year]: { [category]: { [month]: number[] } } } |
| `hideBackgroundCard` | `boolean` | no | `false` | When true, removes the card background, padding, shadow, and border radius from the graph container |
| `showSwitchGraphButton` | `boolean` | no | `true` | Controls whether the "Switch Graph" button is shown in the filter popover |
| `filterChange` | `EventEmitter<FilterEvent>` | no | `N/A` | Emitted when the user changes the time frame filter. FilterEvent: { timeFrame: "month" \| "year"; month?: string; year?: string } |
| `variant` | `Signal<GraphVariant>` | no | `GraphVariant.LineWithLegend` | Computed signal resolving the current graph variant from config, with fallback to LineWithLegend |
| `showFilters` | `Signal<boolean>` | no | `false` | Computed signal indicating whether filter controls are visible based on the variant (true for filter variants) |
| `chartType` | `Signal<'line' \| 'bar'>` | no | `'line'` | Computed signal for the current chart type, derived from internal state or variant default |
| `selectedTimeFrame` | `Signal<'month' \| 'year'>` | no | `'year'` | Computed signal for the current time frame selection, with intelligent default based on month selection |
| `selectedMonth` | `Signal<string>` | no | `'default'` | Computed signal for the currently selected month, from config or internal state |
| `selectedYear` | `Signal<string>` | no | `current year` | Computed signal for the currently selected year, with intelligent fallback to best available year |
| `monthDropdownOptions` | `Signal<DropdownOption[]>` | no | `[]` | Computed signal providing month options formatted for the ntv-dropdown component |
| `yearDropdownOptions` | `Signal<DropdownOption[]>` | no | `[]` | Computed signal providing year options formatted for the ntv-dropdown component |
| `chartOptions` | `Signal<Partial<ChartOptions>>` | no | `N/A` | Computed signal for the complete ApexCharts options, derived from config, chart type, and filter state |

## Demos
### 1. Line Graph with Legend

- Category: Usage
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-graph

Basic line graph with a legend and static series data

#### Instance 1: Line with Legend

- Label: Line with Legend

Config entries:
- `config`: `{"variant":"line-with-legend","size":"medium","header":"Monthly Active Users","subHeader":"Last 12 months","series":[{"name":"Active","data":[120,145,160,175,190,210,230,215,245,260,280,300]},{"name":"New","data":[30,45,55,60,70,85,90,80,95,100,115,130]}],"categories":["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],"colors":["#8DCB2C","#008FFB"]}`

Code example:

```html
graphConfig = {
  variant: 'line-with-legend',
  size: 'medium',
  header: 'Monthly Active Users',
  series: [
    { name: 'Active', data: [120, 145, 160, ...] },
    { name: 'New', data: [30, 45, 55, ...] },
  ],
  categories: ['Jan', 'Feb', 'Mar', ...],
};
<ntv-graph [config]="graphConfig" (filterChange)="onFilter($event)"></ntv-graph>
```

### 2. Bar Graph with Legend

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-graph

Bar chart variant with grouped series

#### Instance 1: Bar with Legend

- Label: Bar with Legend

Config entries:
- `config`: `{"variant":"bar-with-legend","size":"medium","header":"Device Count by Month","series":[{"name":"Online","data":[400,430,448,470,540,580,690,670,710,750,780,820]},{"name":"Offline","data":[80,90,95,100,110,120,130,125,115,105,95,85]}],"categories":["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],"colors":["#8DCB2C","#FF4560"]}`

### 3. Line Graph with Filters

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-graph

Line chart with month/year filter dropdowns

#### Instance 1: With Filters

- Label: With Filters

Config entries:
- `config`: `{"variant":"line-with-filter-legend","size":"medium","header":"Attendance Trends","subHeader":"Filter by month or year","graphData":{"2024":{"active":{"jan":[120,135,118,142],"feb":[138,145,130,155],"mar":[160,175,165,190]},"inactive":{"jan":[30,25,28,22],"feb":[28,30,26,24],"mar":[22,20,18,16]}},"2025":{"active":{"jan":[180,190,175,200],"feb":[195,210,200,220]},"inactive":{"jan":[20,18,22,15],"feb":[15,18,12,10]}}},"colors":["#8DCB2C","#FF6B35"]}`

### 4. Header Metrics

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-graph

Graph with metric badges in the header

#### Instance 1: With Header Metrics

- Label: With Header Metrics

Config entries:
- `config`: `{"variant":"line-with-legend","size":"medium","header":"System Performance","subHeader":"Real-time metrics","headerMetrics":[{"label":"Peak","value":98,"color":"#8DCB2C"},{"label":"Avg","value":82,"color":"#008FFB"},{"label":"Low","value":61,"color":"#FF4560"}],"series":[{"name":"CPU","data":[61,75,82,90,88,95,98,92,87,80,74,68]},{"name":"Memory","data":[55,60,65,70,72,78,80,75,70,65,60,58]}],"categories":["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]}`

### 5. Size Variants

- Category: Configuration
- Component type: universal
- Layout: vertical
- Gap: 2rem
- Component tag: ntv-graph

Small, medium, and large size presets

#### Instance 1: Small (800px)

- Label: Small (800px)

Config entries:
- `config`: `{"variant":"line-with-legend","size":"small","header":"Small Graph","series":[{"name":"Data","data":[10,30,20,50,40,60]}],"categories":["Jan","Feb","Mar","Apr","May","Jun"]}`

#### Instance 2: Large (1446px)

- Label: Large (1446px)

Config entries:
- `config`: `{"variant":"bar-with-legend","size":"large","header":"Large Dashboard Graph","series":[{"name":"Revenue","data":[300,450,500,480,520,600,650,700,680,720,780,800]}],"categories":["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]}`
