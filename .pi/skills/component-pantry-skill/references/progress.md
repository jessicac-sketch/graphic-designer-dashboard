---
tags:
  - component-docs
  - ntv360
  - component-pantry
  - progress
---

# Component: Progress

Read this file after selecting it from the component index. It is optimized for quick component lookup and implementation support.

## Summary
- Tag: `ntv-progress`
- Slug: `progress`
- Package: `@ntv360/component-pantry`
- Source: `component-pantry/progress/progress.manifest.ts`
- Playground controls: 3
- Properties: 9
- Demos: 5

## Description
A horizontal progress bar component with label, percentage, and remaining value.

## Features
- Configurable label text and position (`top` tooltip or `right` inline)
- Current value and maximum value inputs (percentage auto-calculated)
- Unit label (e.g. "hrs", "pts") shown in remaining text
- Custom progress bar color (any valid CSS color)
- Custom background color for the unfilled track
- Configurable bar height (converted to px; font size scales proportionally)
- Bare mode via `isOnlyProgressBar` — renders just the bar without labels or remaining text
- Percentage clamped to 0–100 (never overflows or goes negative)

## Playground Controls
| Control | Type | Default | Label | Description | Options | Content |
| --- | --- | --- | --- | --- | --- | --- |
| `labelPosition` | `select` | `right` | Label Position | Where to place the label: 'right' inline or 'top' as a tooltip | right, top | no |
| `height` | `select` | `20` | Height (px) | Height of the progress bar in pixels | 10, 14, 20, 28, 36 | no |
| `isOnlyProgressBar` | `boolean` | `false` | Bar Only | When true, renders only the progress bar strip without labels or remaining text |  | no |

## Properties
| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `label` | `string` | no | `''` | Label text for the progress bar (e.g. "Intern Duration") |
| `value` | `number` | no | `0` | Current progress value |
| `max` | `number` | no | `100` | Maximum value; percentage = value / max × 100 (clamped 0–100) |
| `unit` | `string` | no | `''` | Unit string appended to the remaining text (e.g. "hrs", "pts") |
| `color` | `string` | no | `'#4caf50'` | CSS color for the filled progress bar (any valid CSS color) |
| `bgColor` | `string` | no | `'#f3f4f6'` | CSS color for the unfilled track background |
| `labelPosition` | `'top' \| 'right'` | no | `'right'` | Label position: 'right' = inline next to bar, 'top' = tooltip above the bar |
| `height` | `number` | no | `20` | Height of the progress bar in pixels; font size scales proportionally (min 8px, max 18px) |
| `isOnlyProgressBar` | `boolean` | no | `false` | When true, renders only the bar strip without label, percentage, or remaining text |

## Demos
### 1. Basic Usage

- Category: Usage
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-progress

Progress bar with label, value, and remaining text

#### Instance 1: Basic Progress

- Label: Basic Progress

Config entries:
- `label`: `Task Completion`
- `value`: `65`
- `max`: `100`
- `unit`: `%`

Code example:

```html
<ntv-progress label="Task Completion" [value]="65" [max]="100" unit="%"></ntv-progress>
```

#### Instance 2: With Hours Unit

- Label: With Hours Unit

Config entries:
- `label`: `Intern Duration`
- `value`: `320`
- `max`: `500`
- `unit`: `hrs`

### 2. Label Positions

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1.5rem
- Component tag: ntv-progress

Label on the right (inline) or top (tooltip)

#### Instance 1: Label Right

- Label: Label Right

Config entries:
- `label`: `Right Label`
- `value`: `40`
- `max`: `100`
- `labelPosition`: `right`

#### Instance 2: Label Top

- Label: Label Top

Config entries:
- `label`: `Top Label`
- `value`: `40`
- `max`: `100`
- `labelPosition`: `top`

### 3. Custom Colors

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-progress

Custom progress and background colors

#### Instance 1: Green (Default)

- Label: Green (Default)

Config entries:
- `label`: `Health`
- `value`: `80`
- `max`: `100`
- `color`: `#4caf50`
- `bgColor`: `#dcfce7`

#### Instance 2: Blue

- Label: Blue

Config entries:
- `label`: `Progress`
- `value`: `60`
- `max`: `100`
- `color`: `#3b82f6`
- `bgColor`: `#dbeafe`

#### Instance 3: Warning

- Label: Warning

Config entries:
- `label`: `Storage`
- `value`: `75`
- `max`: `100`
- `color`: `#f59e0b`
- `bgColor`: `#fef3c7`

#### Instance 4: Danger

- Label: Danger

Config entries:
- `label`: `Memory`
- `value`: `92`
- `max`: `100`
- `color`: `#ef4444`
- `bgColor`: `#fee2e2`

### 4. Heights

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-progress

Different bar heights

#### Instance 1: Thin (10px)

- Label: Thin (10px)

Config entries:
- `label`: `Thin Bar`
- `value`: `55`
- `max`: `100`
- `height`: `10`

#### Instance 2: Default (20px)

- Label: Default (20px)

Config entries:
- `label`: `Default Bar`
- `value`: `55`
- `max`: `100`
- `height`: `20`

#### Instance 3: Tall (36px)

- Label: Tall (36px)

Config entries:
- `label`: `Tall Bar`
- `value`: `55`
- `max`: `100`
- `height`: `36`

### 5. Bar Only Mode

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 0.75rem
- Component tag: ntv-progress

Renders just the progress bar strip without labels or text

#### Instance 1: Bar Only — 30%

- Label: Bar Only — 30%

Config entries:
- `value`: `30`
- `max`: `100`
- `color`: `#8DCB2C`
- `isOnlyProgressBar`: `true`

Code example:

```html
<ntv-progress [value]="30" [max]="100" color="#8DCB2C" [isOnlyProgressBar]="true"></ntv-progress>
```

#### Instance 2: Bar Only — 70%

- Label: Bar Only — 70%

Config entries:
- `value`: `70`
- `max`: `100`
- `color`: `#3b82f6`
- `isOnlyProgressBar`: `true`
