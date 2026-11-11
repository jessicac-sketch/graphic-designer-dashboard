---
tags:
  - component-docs
  - ntv360
  - component-pantry
  - tabs
---

# Component: Tabs

Read this file after selecting it from the component index. It is optimized for quick component lookup and implementation support.

## Summary
- Tag: `ntv-tabs`
- Slug: `tabs`
- Package: `@ntv360/component-pantry`
- Source: `component-pantry/tabs/tabs.manifest.ts`
- Playground controls: 1
- Properties: 4
- Demos: 5

## Description
A tab navigation bar that renders clickable tab headers and emits the active index on selection.

## Features
- Accepts a `tabs` array of `TabHeader` objects (label, optional value, optional disabled)
- Two-way control of active tab via `activeIndex` input
- Emits `tabChange` with the new zero-based index on tab click
- Disabled tabs cannot be selected
- DRY `config` object combines `tabs` and `activeIndex` in one input
- Tab content is managed externally — pair with `*ngIf` or a router outlet

## Playground Controls
| Control | Type | Default | Label | Description | Options | Content |
| --- | --- | --- | --- | --- | --- | --- |
| `activeIndex` | `select` | `0` | Active Index | Zero-based index of the currently active tab | 0, 1, 2 | no |

## Properties
| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `tabs` | `TabHeader[]` | no | `[]` | Array of tab header objects. Each TabHeader: { label: string; value?: string \| number; disabled?: boolean }. Disabled tabs cannot be selected. |
| `activeIndex` | `number` | no | `0` | Zero-based index of the currently active (highlighted) tab |
| `config` | `Partial<TabsConfig>` | no | `undefined` | DRY config object combining tabs and activeIndex in one input. Overrides individual inputs when provided. |
| `tabChange` | `EventEmitter<number>` | no | `N/A` | Emits the new active index whenever a tab is clicked (disabled and already-active tabs are ignored) |

## Demos
### 1. Basic Usage

- Category: Usage
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-tabs

Simple tab bar with three tabs

#### Instance 1: Three Tabs

- Label: Three Tabs

Config entries:
- `tabs`: `[{"label":"Overview"},{"label":"Details"},{"label":"Settings"}]`
- `activeIndex`: `0`

Code example:

```html
tabs = [
  { label: 'Overview' },
  { label: 'Details' },
  { label: 'Settings' },
];
activeIndex = 0;

<ntv-tabs [tabs]="tabs" [activeIndex]="activeIndex" (tabChange)="activeIndex = $event"></ntv-tabs>

<!-- Show content based on activeIndex -->
<div *ngIf="activeIndex === 0">Overview content</div>
<div *ngIf="activeIndex === 1">Details content</div>
<div *ngIf="activeIndex === 2">Settings content</div>
```

### 2. With Disabled Tab

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-tabs

Tab bar with one tab disabled and unselectable

#### Instance 1: Disabled Tab

- Label: Disabled Tab

Config entries:
- `tabs`: `[{"label":"Active Tab","value":"active"},{"label":"Another Tab","value":"another"},{"label":"Locked","value":"locked","disabled":true}]`
- `activeIndex`: `0`

### 3. Many Tabs

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-tabs

Tab bar with multiple tabs

#### Instance 1: Five Tabs

- Label: Five Tabs

Config entries:
- `tabs`: `[{"label":"Dashboard"},{"label":"Reports"},{"label":"Analytics"},{"label":"Logs"},{"label":"Settings"}]`
- `activeIndex`: `2`

### 4. DRY Config Pattern

- Category: Configuration
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-tabs

Using the config object instead of individual inputs

#### Instance 1: Config Object

- Label: Config Object

Config entries:
- `config`: `{"tabs":[{"label":"Tab One"},{"label":"Tab Two"},{"label":"Tab Three","disabled":true}],"activeIndex":1}`

Code example:

```html
tabsConfig = {
  tabs: [
    { label: 'Tab One' },
    { label: 'Tab Two' },
    { label: 'Tab Three', disabled: true },
  ],
  activeIndex: 1,
};
<ntv-tabs [config]="tabsConfig" (tabChange)="onTabChange($event)"></ntv-tabs>
```

### 5. Named Values

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-tabs

Tabs with explicit value identifiers for data-driven tab logic

#### Instance 1: Value-Driven

- Label: Value-Driven

Config entries:
- `tabs`: `[{"label":"All","value":"all"},{"label":"Pending","value":"pending"},{"label":"Active","value":"active"},{"label":"Archived","value":"archived"}]`
- `activeIndex`: `0`

Code example:

```html
tabs = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Active', value: 'active' },
  { label: 'Archived', value: 'archived' },
];
// Listen to tabChange and use tabs[index].value for filtering
onTabChange(index: number) {
  this.activeFilter = this.tabs[index].value;
}
```
