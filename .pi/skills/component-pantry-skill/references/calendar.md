---
tags:
  - component-docs
  - ntv360
  - component-pantry
  - calendar
---

# Component: Calendar

Read this file after selecting it from the component index. It is optimized for quick component lookup and implementation support.

## Summary
- Tag: `ntv-calendar-base`
- Slug: `calendar`
- Package: `@ntv360/component-pantry`
- Source: `component-pantry/calendar/calendar.manifest.ts`
- Playground controls: 4
- Properties: 8
- Demos: 8

## Description
A fully interactive calendar component with month, week, and day views.

## Features
- Month / Week / Day view switching
- Navigate between months and years with year picker
- Highlight today's date
- Responsive layout
- Multiple calendar data types - event, leave, host-installation, attendance
- Calendar legends with scrollable overflow support
- Configurable accent colors via CalendarConfig
- Loading state support

## Sub-Components
The calendar package ships specialized wrapper components for each use-case:
- `ntv-calendar-event` — Calendar with event data
- `ntv-calendar-leave` — Calendar with leave/absence data
- `ntv-calendar-attendance` — Calendar with attendance data
- `ntv-calendar-installation` — Calendar with host installation data

All wrappers use `ntv-calendar-base` internally and handle their own business logic.

## Playground Controls
| Control | Type | Default | Label | Description | Options | Content |
| --- | --- | --- | --- | --- | --- | --- |
| `calendarType` | `select` | `default` | Calendar Type | Data type the calendar will display — determines cell rendering style | default, event, leave, attendance, host-installation | no |
| `isLoading` | `boolean` | `false` | Loading | Show skeleton/loading state while data is being fetched |  | no |
| `showYearPicker` | `boolean` | `true` | Show Year Picker | Whether to enable the year picker in the header |  | no |
| `showCalendarLegends` | `boolean` | `false` | Show Legends | Whether to display a legends row below the header (requires calendarLegends data) |  | no |

## Properties
| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `calendarType` | `'default' \| 'event' \| 'leave' \| 'attendance' \| 'host-installation'` | no | `'default'` | Determines how calendar cell data is rendered. Maps to CalendarTypes enum. |
| `data` | `CalendarData[]` | no | `[]` | Array of calendar data items. Type depends on calendarType: Event[], Leave[], Attendance[], or HostInstallation[]. |
| `isLoading` | `boolean` | no | `false` | When true, shows a loading state while calendar data is being fetched. |
| `showYearPicker` | `boolean` | no | `true` | Whether to display the year picker dropdown in the calendar header. |
| `showCalendarLegends` | `boolean` | no | `false` | Whether to show the calendar legend row. Requires calendarLegends to be populated. |
| `calendarLegends` | `Record<string, string>[]` | no | `[]` | Array of legend entries. Each entry is an object with a label key and color value, e.g. [{ "Vacation Leave": "#095AF3" }]. |
| `calendarConfig` | `CalendarConfig` | no | `{}` | Color configuration object to override the default accent color scheme. |
| `onDayClick` | `EventEmitter<{ payload: CalendarData[]; dateClicked: Date; isForAddEvent: boolean }>` | no | `N/A` | Emitted when a calendar day cell is clicked. Contains the cell data, the date, and whether the add-event button was clicked. |

## Demos
### 1. Basic Usage

- Category: Usage
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-calendar-base

Default calendar with no data — shows the month grid with today highlighted

#### Instance 1: Empty Calendar

- Label: Empty Calendar

Config entries:
- `calendarType`: `default`
- `showYearPicker`: `true`

Code example:

```html
<div style="height: 800px; width: 100%;">
  <ntv-calendar-base></ntv-calendar-base>
</div>
```

### 2. Event Calendar

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-calendar-event

Calendar pre-configured for event data using the ntv-calendar-event wrapper

#### Instance 1: Event Calendar

- Label: Event Calendar

Code example:

```html
<div style="height: 810px; width: 100%;">
  <ntv-calendar-event></ntv-calendar-event>
</div>
```

### 3. Leave Calendar

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-calendar-leave

Calendar for leave and absence management using the ntv-calendar-leave wrapper

#### Instance 1: Leave Calendar

- Label: Leave Calendar

Config entries:
- `leavesData`: `[{"id":1,"employeeName":"Alice Santos","leaveType":"Vacation Leave","startDate":"2025-02-10","endDate":"2025-02-14","status":"approved"},{"id":2,"employeeName":"Bob Reyes","leaveType":"Sick Leave","startDate":"2025-02-20","endDate":"2025-02-21","status":"pending"}]`
- `isLoading`: `false`

Code example:

```html
<div style="height: 800px; width: 100%;">
  <ntv-calendar-leave [leavesData]="leavesData" [isLoading]="isLoading">
  </ntv-calendar-leave>
</div>
```

### 4. Attendance Calendar

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-calendar-attendance

Calendar showing employee attendance records using the ntv-calendar-attendance wrapper

#### Instance 1: Attendance Calendar

- Label: Attendance Calendar

Code example:

```html
<div style="height: 810px; width: 100%;">
  <ntv-calendar-attendance></ntv-calendar-attendance>
</div>
```

### 5. With Calendar Type (Base)

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-calendar-base

Using ntv-calendar-base directly with a calendarType input

#### Instance 1: Leave Type via Base

- Label: Leave Type via Base

Config entries:
- `calendarType`: `leave`
- `data`: `[{"id":1,"employeeName":"Alice Santos","leaveType":"Vacation Leave","startDate":"2025-02-10","endDate":"2025-02-14","status":"approved","type":"leave"}]`

Code example:

```html
<ntv-calendar-base
  calendarType="leave"
  [data]="leaveData"
  (onDayClick)="handleDayClick($event)">
</ntv-calendar-base>
```

### 6. With Legends

- Category: Configuration
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-calendar-base

Calendar with a color legend row displayed

#### Instance 1: Leave Legends

- Label: Leave Legends

Config entries:
- `calendarType`: `leave`
- `showCalendarLegends`: `true`
- `calendarLegends`: `[{"Vacation Leave":"#095AF3"},{"Sick Leave":"#26A69A"},{"Personal Leave":"#8E0064"},{"Maternity Leave":"#FFA500"},{"Paternity Leave":"#FF5900"},{"Bereavement Leave":"#3926A6"}]`

Code example:

```html
<ntv-calendar-base
  calendarType="leave"
  [showCalendarLegends]="true"
  [calendarLegends]="[
    { 'Vacation Leave': '#095AF3' },
    { 'Sick Leave': '#26A69A' }
  ]">
</ntv-calendar-base>
```

### 7. Custom Color Config

- Category: Configuration
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-calendar-base

Override default accent colors using calendarConfig

#### Instance 1: Blue Theme

- Label: Blue Theme

Config entries:
- `calendarConfig`: `{"colorConfig":{"color":"#095AF3","bgColor":"#ffffff","opacityColors":{"hover-sm":"#095AF3","hover-md":"#DCE8FD","hover-lg":"#095AF3"}}}`

Code example:

```html
calendarConfig = {
  colorConfig: {
    color: '#095AF3',
    bgColor: '#ffffff',
    opacityColors: { 'hover-md': '#DCE8FD' },
  },
};
<ntv-calendar-base [calendarConfig]="calendarConfig"></ntv-calendar-base>
```

### 8. Loading State

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-calendar-base

Show the calendar in a loading/skeleton state

#### Instance 1: Loading

- Label: Loading

Config entries:
- `isLoading`: `true`

Code example:

```html
<ntv-calendar-base [isLoading]="true"></ntv-calendar-base>
```
