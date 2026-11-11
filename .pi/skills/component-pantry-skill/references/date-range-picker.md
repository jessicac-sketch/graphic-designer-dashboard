---
tags:
  - component-docs
  - ntv360
  - component-pantry
  - date-range-picker
---

# Component: Date Range Picker

Read this file after selecting it from the component index. It is optimized for quick component lookup and implementation support.

## Summary
- Tag: `ntv-date-range-picker`
- Slug: `date-range-picker`
- Package: `@ntv360/component-pantry`
- Source: `component-pantry/date-range-picker/date-range-picker.manifest.ts`
- Playground controls: 3
- Properties: 4
- Demos: 4

## Description
A composite date range picker that wraps two `ntv-date-picker` instances into a single start-and-end range selector.

## Features
- Single "double" variant: two side-by-side pickers (start date + end date)
- Single "single" variant: one picker that selects both start and end from one trigger (date-range-single)
- Trigger style toggle - regular or legend
- Past date restriction via canSelectPrevDates
- Auto-sets end date to the day after the selected start date
- Emits complete range as `{ start: Date; end: Date }` on the `dates` output

## Playground Controls
| Control | Type | Default | Label | Description | Options | Content |
| --- | --- | --- | --- | --- | --- | --- |
| `variant` | `select` | `double` | Variant | 'double' = two separate pickers; 'single' = one picker that handles start & end | double, single | no |
| `triggerVariant` | `select` | `legend` | Trigger Variant | Visual style of the date picker trigger input | regular, legend | no |
| `canSelectPrevDates` | `boolean` | `true` | Allow Past Dates | Whether users can select past dates in both start and end pickers |  | no |

## Properties
| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `variant` | `'double' \| 'single'` | no | `'double'` | 'double' renders two side-by-side pickers; 'single' renders one picker that selects start and end together |
| `triggerVariant` | `'regular' \| 'legend'` | no | `'legend'` | Visual style of the date picker trigger input |
| `canSelectPrevDates` | `boolean` | no | `true` | Whether users can select past dates in the underlying pickers |
| `dates` | `EventEmitter<{ start: Date; end: Date }>` | no | `N/A` | Emitted when a complete date range is selected (start and end) |

## Demos
### 1. Basic Usage

- Category: Usage
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-date-range-picker

Double variant — two pickers for start and end date selection

#### Instance 1: Double (Default)

- Label: Double (Default)

Config entries:
- `variant`: `double`
- `triggerVariant`: `legend`

Code example:

```html
<ntv-date-range-picker
  variant="double"
  triggerVariant="legend"
  (dates)="onDatesSelected($event)">
</ntv-date-range-picker>
```

### 2. Single Trigger Variant

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-date-range-picker

One picker that selects start and end from a single trigger

#### Instance 1: Single

- Label: Single

Config entries:
- `variant`: `single`

Code example:

```html
<ntv-date-range-picker
  variant="single"
  (dates)="onDatesSelected($event)">
</ntv-date-range-picker>
```

### 3. Trigger Variants

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-date-range-picker

Regular and legend visual styles for the trigger input

#### Instance 1: Regular Trigger

- Label: Regular Trigger

Config entries:
- `variant`: `double`
- `triggerVariant`: `regular`

#### Instance 2: Legend Trigger

- Label: Legend Trigger

Config entries:
- `variant`: `double`
- `triggerVariant`: `legend`

### 4. Allow Past Dates

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-date-range-picker

Enabling past date selection in the range pickers

#### Instance 1: Past Dates Allowed

- Label: Past Dates Allowed

Config entries:
- `variant`: `double`
- `canSelectPrevDates`: `true`

Code example:

```html
<ntv-date-range-picker
  variant="double"
  [canSelectPrevDates]="true"
  (dates)="onDatesSelected($event)">
</ntv-date-range-picker>
```

#### Instance 2: Past Dates Disabled

- Label: Past Dates Disabled

Config entries:
- `variant`: `double`
- `canSelectPrevDates`: `false`
