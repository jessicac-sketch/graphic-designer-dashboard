---
tags:
  - component-docs
  - ntv360
  - component-pantry
  - date-picker
---

# Component: Date Picker

Read this file after selecting it from the component index. It is optimized for quick component lookup and implementation support.

## Summary
- Tag: `ntv-date-picker`
- Slug: `date-picker`
- Package: `@ntv360/component-pantry`
- Source: `component-pantry/date-picker/date-picker.manifest.ts`
- Playground controls: 7
- Properties: 16
- Demos: 5

## Description
A date picker component with popover calendar, year picker, and multiple variants.

## Features
- Single date selection (events variant)
- Date range selection in a single trigger (date-range-single variant)
- Date range selection across two instances (date-range-double variant)
- Birthday picker variant
- Configurable trigger appearance - width, height, radius, color
- Past date restriction with canSelectPrevDates
- Date range highlight styling between selected dates
- Year picker with scrollable list
- Supports keyboard-accessible popover calendar
- Custom color theming

## Playground Controls
| Control | Type | Default | Label | Description | Options | Content |
| --- | --- | --- | --- | --- | --- | --- |
| `variant` | `select` | `events` | Variant | Date picker behavior variant | events, date-range-single, date-range-double, birthday | no |
| `triggerVariant` | `select` | `regular` | Trigger Variant | Visual style of the trigger input | regular, legend, date-range-single | no |
| `triggerHeight` | `select` | `md` | Trigger Height | Height of the trigger input | sm, md, lg | no |
| `triggerRadius` | `select` | `md` | Trigger Radius | Border radius of the trigger input | sm, md, lg, full | no |
| `color` | `select` | `black` | Color | Label and icon color | black, success, danger | no |
| `canSelectPrevDates` | `boolean` | `false` | Allow Past Dates | Whether users can select past dates |  | no |
| `enableDateRangeHightlight` | `boolean` | `true` | Highlight Date Range | Whether to highlight dates between two selected range dates |  | no |

## Properties
| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `variant` | `'events' \| 'date-range-single' \| 'date-range-double' \| 'birthday'` | no | `'events'` | Date picker behavior variant |
| `triggerVariant` | `'regular' \| 'legend' \| 'date-range-single'` | no | `'regular'` | Visual style of the trigger input |
| `triggerHeight` | `'sm' \| 'md' \| 'lg'` | no | `'md'` | Height of the trigger input |
| `triggerRadius` | `'sm' \| 'md' \| 'lg' \| 'full'` | no | `'md'` | Border radius of the trigger input |
| `width` | `number` | no | `250` | Width of the trigger input in pixels |
| `color` | `'success' \| 'danger' \| 'black'` | no | `'black'` | Label and icon color |
| `customColor` | `string` | no | `''` | Custom CSS color for the trigger label and selected date highlight |
| `placeholder` | `string` | no | `Current date (formatted)` | Placeholder text in the trigger input (defaults to formatted today) |
| `startDate` | `Date \| null` | no | `null` | Selected start date (used in date-range variants) |
| `endDate` | `Date \| null` | no | `null` | Selected end date (used in date-range variants) |
| `previousDateSelect` | `Date \| null` | no | `null` | Previously selected date to pre-fill the picker |
| `canSelectPrevDates` | `boolean` | no | `false` | Whether users can select past dates (past days are disabled by default) |
| `enableDateRangeHightlight` | `boolean` | no | `true` | Whether to style/highlight dates between two selected range dates |
| `id` | `string` | no | `''` | Identifier for styling purposes (e.g. 'startDate' or 'endDate' in date-range) |
| `selectDate` | `EventEmitter<Date>` | no | `N/A` | Emitted when a single date is selected (all variants except date-range-single) |
| `selectedDates` | `EventEmitter<{ startDate: Date; endDate: Date }>` | no | `N/A` | Emitted when both dates are selected in 'date-range-single' variant |

## Demos
### 1. Basic Usage

- Category: Usage
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-date-picker

Default date picker (events variant) for picking a single date

#### Instance 1: Single Date

- Label: Single Date

Config entries:
- `variant`: `events`
- `placeholder`: `Select a date`

Code example:

```html
<ntv-date-picker
  variant="events"
  placeholder="Select a date"
  (selectDate)="onDateSelected($event)">
</ntv-date-picker>
```

### 2. Variants

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-date-picker

Different picker variants for different use cases

#### Instance 1: Events (Single Date)

- Label: Events (Single Date)

Config entries:
- `variant`: `events`
- `placeholder`: `Pick event date`

#### Instance 2: Date Range (Single Trigger)

- Label: Date Range (Single Trigger)

Config entries:
- `variant`: `date-range-single`
- `triggerVariant`: `date-range-single`

Code example:

```html
<ntv-date-picker
  variant="date-range-single"
  triggerVariant="date-range-single"
  (selectedDates)="onRangeSelected($event)">
</ntv-date-picker>
```

#### Instance 3: Birthday Picker

- Label: Birthday Picker

Config entries:
- `variant`: `birthday`
- `canSelectPrevDates`: `true`
- `placeholder`: `Select birthday`

### 3. Trigger Appearance

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-date-picker

Trigger height, width, and radius options

#### Instance 1: Small Height

- Label: Small Height

Config entries:
- `triggerHeight`: `sm`
- `triggerRadius`: `sm`
- `placeholder`: `Small trigger`

#### Instance 2: Medium Height

- Label: Medium Height

Config entries:
- `triggerHeight`: `md`
- `triggerRadius`: `md`
- `placeholder`: `Medium trigger`

#### Instance 3: Large Rounded

- Label: Large Rounded

Config entries:
- `triggerHeight`: `lg`
- `triggerRadius`: `full`
- `placeholder`: `Large full-rounded trigger`

### 4. Colors

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-date-picker

Label and icon color options

#### Instance 1: Black (Default)

- Label: Black (Default)

Config entries:
- `color`: `black`
- `placeholder`: `Black color`

#### Instance 2: Success (Green)

- Label: Success (Green)

Config entries:
- `color`: `success`
- `placeholder`: `Success color`

#### Instance 3: Danger (Red)

- Label: Danger (Red)

Config entries:
- `color`: `danger`
- `placeholder`: `Danger color`

#### Instance 4: Custom Color

- Label: Custom Color

Config entries:
- `customColor`: `#7c3aed`
- `placeholder`: `Custom purple`

### 5. Date Range (Two Pickers)

- Category: Examples
- Component type: universal
- Layout: horizontal
- Gap: 1rem
- Component tag: ntv-date-picker

Two separate date pickers for start and end date selection

#### Instance 1: Start Date

- Label: Start Date

Config entries:
- `variant`: `date-range-double`
- `id`: `startDate`
- `placeholder`: `Start Date`

Code example:

```html
<!-- Use two instances side by side, passing the selected startDate to endDate picker -->
<ntv-date-picker
  variant="date-range-double"
  id="startDate"
  placeholder="Start Date"
  (selectDate)="onStartDate($event)">
</ntv-date-picker>
<ntv-date-picker
  variant="date-range-double"
  id="endDate"
  [startDate]="selectedStartDate"
  [enableDateRangeHightlight]="true"
  placeholder="End Date"
  (selectDate)="onEndDate($event)">
</ntv-date-picker>
```

#### Instance 2: End Date

- Label: End Date

Config entries:
- `variant`: `date-range-double`
- `id`: `endDate`
- `placeholder`: `End Date`
