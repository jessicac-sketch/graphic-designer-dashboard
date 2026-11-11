---
tags:
  - component-docs
  - ntv360
  - component-pantry
  - radial-graph
---

# Component: Radial Graph

Read this file after selecting it from the component index. It is optimized for quick component lookup and implementation support.

## Summary
- Tag: `ntv-radial-graph`
- Slug: `radial-graph`
- Package: `@ntv360/component-pantry`
- Source: `component-pantry/radial-graph/radial-graph.manifest.ts`
- Playground controls: 5
- Properties: 3
- Demos: 7

## Description
A circular progress ring component for displaying a single KPI or metric.

## Features
- Animated ring fill on load — stroke-dashoffset transitions from 0 to the actual value
- Single config input — one object drives all appearance and behaviour
- `color` shorthand — sets both the progress arc and center value color in one field
- Size presets — small (120 px), medium (180 px), large (240 px), auto (fluid)
- Direct `strokeWidth` input — overrides config.strokeWidth for quick adjustments
- Card shell toggle — showCard: false removes background, padding, and shadow
- Highlight variant — border and background on highlighted input for togglable card selection
- Trailing-zero stripping — decimalPlaces controls precision without unnecessary zeros
- Reactive — driven by Angular signals; updating the config signal re-renders immediately

## Playground Controls
| Control | Type | Default | Label | Description | Options | Content |
| --- | --- | --- | --- | --- | --- | --- |
| `value` | `number` | `7.5` | Value | Current metric value |  | no |
| `max` | `number` | `10` | Max | Maximum value (100% of the ring) |  | no |
| `size` | `select` | `medium` | Size | Size preset for the component | small, medium, large, auto | no |
| `showCard` | `boolean` | `true` | Show Card | Toggle card background, padding, and shadow |  | no |
| `strokeWidth` | `number` | `20` | Stroke Width | Ring stroke thickness in SVG units |  | no |

## Properties
| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `config` | `RadialChartConfig` | no | `{ value: 0 }` | Configuration object for the component:<br>- value: number — current value to display (required)<br>- max?: number — maximum value representing 100% (default: 10)<br>- label?: string — label rendered below the ring<br>- size?: 'small' \| 'medium' \| 'large' \| 'auto' — size preset (default: 'medium')<br>- showCard?: boolean — show card background, padding, and shadow (default: true)<br>- trackColor?: string — background track ring color (default: '#dce8f7')<br>- color?: string — shorthand: sets both arc and center value to the same color<br>- progressColor?: string — progress arc fill color; overrides color (default: '#0d2137')<br>- valueColor?: string — center value text color; overrides color (default: '#0d2137')<br>- labelColor?: string — label text color (default: '#6b7280')<br>- strokeWidth?: number — ring stroke thickness in SVG units (default: 20)<br>- decimalPlaces?: number — decimal places for the displayed value (default: 1)<br>- valueSuffix?: string — string appended after the value, e.g. '%' (default: '')<br>- highlightBorderColor?: string — border color applied when highlighted<br>- highlightBgColor?: string — background color applied when highlighted |
| `strokeWidth` | `number \| undefined` | no | `undefined` | Direct stroke-width override. Takes precedence over config.strokeWidth. |
| `highlighted` | `boolean` | no | `false` | When true, applies highlightBorderColor and highlightBgColor from config. |

## Demos
### 1. Basic Usage

- Category: Usage
- Component type: universal
- Layout: horizontal
- Gap: 1rem
- Component tag: ntv-radial-graph

Radial graph with a score out of 10

#### Instance 1: Score

- Label: Score

Config entries:
- `config`: `{"value":8.9,"max":10,"label":"Excellent","size":"medium"}`

Code example:

```html
config: RadialChartConfig = {
  value: 8.9,
  max: 10,
  label: 'Excellent',
};

<ntv-radial-graph [config]="config"></ntv-radial-graph>
```

### 2. Size Presets

- Category: Examples
- Component type: universal
- Layout: horizontal
- Gap: 1.5rem
- Component tag: ntv-radial-graph

Available size options: small (120 px), medium (180 px), large (240 px)

#### Instance 1: Small

- Label: Small

Config entries:
- `config`: `{"value":7.5,"max":10,"label":"Good","size":"small"}`

#### Instance 2: Medium

- Label: Medium

Config entries:
- `config`: `{"value":7.5,"max":10,"label":"Good","size":"medium"}`

#### Instance 3: Large

- Label: Large

Config entries:
- `config`: `{"value":7.5,"max":10,"label":"Good","size":"large"}`

### 3. Custom Colors

- Category: Examples
- Component type: universal
- Layout: horizontal
- Gap: 1.5rem
- Component tag: ntv-radial-graph

Use color shorthand or individual progressColor / valueColor fields

#### Instance 1: Teal

- Label: Teal

Config entries:
- `config`: `{"value":8.1,"max":10,"label":"Very Good","size":"medium","color":"#0891b2","trackColor":"#cffafe"}`

#### Instance 2: Green

- Label: Green

Config entries:
- `config`: `{"value":9.2,"max":10,"label":"Outstanding","size":"medium","color":"#10b981","trackColor":"#d1fae5"}`

#### Instance 3: Amber

- Label: Amber

Config entries:
- `config`: `{"value":68,"max":100,"label":"Goal Progress","size":"medium","decimalPlaces":0,"color":"#f59e0b","trackColor":"#fef3c7"}`

### 4. Percentage

- Category: Examples
- Component type: universal
- Layout: horizontal
- Gap: 1.5rem
- Component tag: ntv-radial-graph

Display a percentage value with valueSuffix and decimalPlaces

#### Instance 1: Completion Rate

- Label: Completion Rate

Config entries:
- `config`: `{"value":75,"max":100,"label":"Completion Rate","size":"medium","valueSuffix":"%","decimalPlaces":0,"color":"#6366f1","trackColor":"#e0e7ff"}`

#### Instance 2: System Uptime

- Label: System Uptime

Config entries:
- `config`: `{"value":99,"max":100,"label":"System Uptime","size":"medium","valueSuffix":"%","decimalPlaces":0,"color":"#3b82f6","trackColor":"#dbeafe"}`

### 5. Stroke Width

- Category: Configuration
- Component type: universal
- Layout: horizontal
- Gap: 1.5rem
- Component tag: ntv-radial-graph

Control ring thickness via strokeWidth in config or as a direct input

#### Instance 1: Thin (10)

- Label: Thin (10)

Config entries:
- `config`: `{"value":7,"max":10,"label":"Thin","size":"medium","strokeWidth":10}`

#### Instance 2: Default (20)

- Label: Default (20)

Config entries:
- `config`: `{"value":7,"max":10,"label":"Default","size":"medium"}`

#### Instance 3: Thick (32)

- Label: Thick (32)

Config entries:
- `config`: `{"value":7,"max":10,"label":"Thick","size":"medium","strokeWidth":32}`

### 6. No Card

- Category: Configuration
- Component type: universal
- Layout: horizontal
- Gap: 1.5rem
- Component tag: ntv-radial-graph

Remove the card shell with showCard: false

#### Instance 1: With Card

- Label: With Card

Config entries:
- `config`: `{"value":6.5,"max":10,"label":"Average","size":"medium","showCard":true}`

#### Instance 2: No Card

- Label: No Card

Config entries:
- `config`: `{"value":6.5,"max":10,"label":"Average","size":"medium","showCard":false}`

### 7. Highlight Variant

- Category: Examples
- Component type: universal
- Layout: horizontal
- Gap: 1.5rem
- Component tag: ntv-radial-graph

Toggle a highlight border and background on click using the highlighted input

#### Instance 1: Highlighted

- Label: Highlighted

Config entries:
- `config`: `{"value":9.2,"max":10,"label":"Outstanding","size":"medium","color":"#10b981","trackColor":"#d1fae5","highlightBorderColor":"#10b981","highlightBgColor":"#f0fdf4"}`

#### Instance 2: Not Highlighted

- Label: Not Highlighted

Config entries:
- `config`: `{"value":9.2,"max":10,"label":"Outstanding","size":"medium","color":"#10b981","trackColor":"#d1fae5","highlightBorderColor":"#10b981","highlightBgColor":"#f0fdf4"}`
