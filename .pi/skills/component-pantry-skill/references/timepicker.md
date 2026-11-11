---
tags:
  - component-docs
  - ntv360
  - component-pantry
  - timepicker
---

# Component: Timepicker

Read this file after selecting it from the component index. It is optimized for quick component lookup and implementation support.

## Summary
- Tag: `ntv-timepicker`
- Slug: `timepicker`
- Package: `@ntv360/component-pantry`
- Source: `component-pantry/timepicker/timepicker.manifest.ts`
- Playground controls: 6
- Properties: 23
- Demos: 7

## Description
A scrollable time picker with 12h/24h format support and full form integration.

## Features
- 12-hour (AM/PM) and 24-hour format modes
- Optional seconds column
- Three sizes: `sm`, `md`, `lg`
- Scrollable drum-roll columns for hours, minutes, seconds, period
- Direct keyboard input into each field
- Arrow key navigation between fields
- Min/max time constraint with disabled options
- Step increment for minutes/seconds
- Label, title, info, and error text slots
- Error state (red border + text) via `isError` or `error`
- Border toggle, border radius, and custom hex colour theming
- Display-only (read-only) mode
- Custom width, height, and text-size CSS overrides
- Full `ControlValueAccessor` implementation for use with `ngModel` and reactive forms
- DRY `config` object pattern reduces template verbosity by ~90%
- Outputs: `timeChanged`, `opened`, `closed`

## Playground Controls
| Control | Type | Default | Label | Description | Options | Content |
| --- | --- | --- | --- | --- | --- | --- |
| `format` | `select` | `24h` | Format | 12-hour (AM/PM) or 24-hour time format | 12h, 24h | no |
| `size` | `select` | `md` | Size | Overall size of the timepicker | sm, md, lg | no |
| `showSeconds` | `boolean` | `false` | Show Seconds | Whether to show the seconds selection column |  | no |
| `border` | `boolean` | `false` | Border | Whether to show a border around the timepicker |  | no |
| `disabled` | `boolean` | `false` | Disabled | Whether the timepicker is disabled |  | no |
| `isError` | `boolean` | `false` | Error State | Whether to render the timepicker in error state |  | no |

## Properties
| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `format` | `'12h'\|'24h'` | no | `'24h'` | Time format: 12-hour (AM/PM) or 24-hour |
| `size` | `'sm'\|'md'\|'lg'` | no | `'md'` | Size preset controlling padding and font size |
| `showSeconds` | `boolean` | no | `false` | Whether to show the seconds selection column |
| `label` | `string \| null` | no | `null` | Label text displayed above the timepicker trigger |
| `title` | `string \| null` | no | `null` | Accessible title attribute for the timepicker (ARIA) |
| `info` | `string \| null` | no | `null` | Informational hint text shown below the timepicker |
| `error` | `string \| null` | no | `null` | Error message text shown below the timepicker when showError is true |
| `showError` | `boolean` | no | `true` | Whether to display the error message |
| `isError` | `boolean` | no | `false` | Whether to render the timepicker in error state (red border and text) |
| `border` | `boolean` | no | `false` | Whether to show a visible border around the timepicker trigger |
| `borderRadius` | `string` | no | `'md'` | Border radius size: 'none' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| 'full' |
| `disabled` | `boolean` | no | `false` | Whether the timepicker is disabled and non-interactive |
| `required` | `boolean` | no | `false` | Whether a time selection is required (for form validation) |
| `display` | `boolean` | no | `false` | When true, renders in read-only, display-only mode (no interaction) |
| `minTime` | `TimeValue` | no | `undefined` | Minimum allowed time: { hours: number; minutes: number; seconds?: number } |
| `maxTime` | `TimeValue` | no | `undefined` | Maximum allowed time: { hours: number; minutes: number; seconds?: number } |
| `step` | `number` | no | `1` | Step increment in minutes/seconds for the scrollable columns |
| `variant` | `string` | no | `'default'` | Visual variant or custom hex color string (e.g. "#3b82f6") for accent theming |
| `id` | `string` | no | `''` | Unique identifier for accessibility label association |
| `config` | `Partial<TimePickerConfig>` | no | `undefined` | DRY config object — overrides all individual inputs. Accepts any TimePickerConfig key: format, size, showSeconds, label, info, error, border, disabled, required, display, minTime, maxTime, step, width, height, textSize, variant, borderRadius, id. |
| `timeChanged` | `EventEmitter<TimeValue \| null>` | no | `N/A` | Emits { hours, minutes, seconds? } when the selected time changes, or null when cleared |
| `opened` | `EventEmitter<void>` | no | `N/A` | Emits when the picker dropdown is opened |
| `closed` | `EventEmitter<void>` | no | `N/A` | Emits when the picker dropdown is closed |

## Demos
### 1. Basic Usage

- Category: Usage
- Component type: universal
- Layout: horizontal
- Gap: 1.5rem
- Component tag: ntv-timepicker

24h format timepicker with a label

#### Instance 1: 24h Format

- Label: 24h Format

Config entries:
- `format`: `24h`
- `label`: `Meeting Time`
- `size`: `md`
- `border`: `true`

Code example:

```html
<ntv-timepicker format="24h" label="Meeting Time" size="md" [border]="true"
  (timeChanged)="onTimeChanged($event)">
</ntv-timepicker>
```

#### Instance 2: 12h Format

- Label: 12h Format

Config entries:
- `format`: `12h`
- `label`: `Start Time`
- `size`: `md`
- `border`: `true`

### 2. With Seconds

- Category: Examples
- Component type: universal
- Layout: horizontal
- Gap: 1.5rem
- Component tag: ntv-timepicker

Timepicker showing hours, minutes, and seconds columns

#### Instance 1: 24h + Seconds

- Label: 24h + Seconds

Config entries:
- `format`: `24h`
- `showSeconds`: `true`
- `label`: `Duration`
- `border`: `true`

#### Instance 2: 12h + Seconds

- Label: 12h + Seconds

Config entries:
- `format`: `12h`
- `showSeconds`: `true`
- `label`: `Duration`
- `border`: `true`

### 3. Sizes

- Category: Examples
- Component type: universal
- Layout: horizontal
- Gap: 1.5rem
- Component tag: ntv-timepicker

Small, medium, and large size variants

#### Instance 1: Small

- Label: Small

Config entries:
- `size`: `sm`
- `label`: `Small`
- `border`: `true`

#### Instance 2: Medium

- Label: Medium

Config entries:
- `size`: `md`
- `label`: `Medium`
- `border`: `true`

#### Instance 3: Large

- Label: Large

Config entries:
- `size`: `lg`
- `label`: `Large`
- `border`: `true`

### 4. Min/Max Time Constraints

- Category: Examples
- Component type: universal
- Layout: horizontal
- Gap: 1.5rem
- Component tag: ntv-timepicker

Timepicker with valid range enforcement

#### Instance 1: Business Hours (09:00–17:00)

- Label: Business Hours (09:00–17:00)

Config entries:
- `format`: `24h`
- `label`: `Business Hours Only`
- `border`: `true`
- `minTime`: `{"hours":9,"minutes":0}`
- `maxTime`: `{"hours":17,"minutes":0}`

Code example:

```html
<ntv-timepicker format="24h" label="Business Hours" [border]="true"
  [minTime]="{ hours: 9, minutes: 0 }"
  [maxTime]="{ hours: 17, minutes: 0 }"
  (timeChanged)="onTimeChanged($event)">
</ntv-timepicker>
```

### 5. Error State

- Category: Examples
- Component type: universal
- Layout: horizontal
- Gap: 1.5rem
- Component tag: ntv-timepicker

Timepicker in error state with an error message

#### Instance 1: With Error

- Label: With Error

Config entries:
- `label`: `Appointment Time`
- `isError`: `true`
- `error`: `Please select a valid time`
- `showError`: `true`
- `border`: `true`

#### Instance 2: Disabled

- Label: Disabled

Config entries:
- `label`: `Disabled Picker`
- `disabled`: `true`
- `border`: `true`

### 6. DRY Config Pattern

- Category: Configuration
- Component type: universal
- Layout: horizontal
- Gap: 1.5rem
- Component tag: ntv-timepicker

Using the config object to configure the timepicker

#### Instance 1: Config Object

- Label: Config Object

Config entries:
- `config`: `{"format":"12h","size":"md","showSeconds":false,"border":true,"label":"Scheduled Time","info":"Select time for the scheduled broadcast","required":true,"borderRadius":"lg","step":5}`

Code example:

```html
timeConfig: TimePickerConfig = {
  format: '12h',
  size: 'md',
  border: true,
  label: 'Scheduled Time',
  info: 'Select time for the scheduled broadcast',
  required: true,
  step: 5,
};
<ntv-timepicker [config]="timeConfig" (timeChanged)="onTimeChanged($event)"></ntv-timepicker>
```

### 7. Step Intervals

- Category: Examples
- Component type: universal
- Layout: horizontal
- Gap: 1.5rem
- Component tag: ntv-timepicker

Timepicker with 5-minute step increments

#### Instance 1: 5-minute Steps

- Label: 5-minute Steps

Config entries:
- `format`: `24h`
- `step`: `5`
- `label`: `Every 5 Minutes`
- `border`: `true`

#### Instance 2: 15-minute Steps

- Label: 15-minute Steps

Config entries:
- `format`: `24h`
- `step`: `15`
- `label`: `Every 15 Minutes`
- `border`: `true`
