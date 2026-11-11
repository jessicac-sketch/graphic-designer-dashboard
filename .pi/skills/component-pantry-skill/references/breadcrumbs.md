---
tags:
  - component-docs
  - ntv360
  - component-pantry
  - breadcrumbs
---

# Component: Breadcrumbs

Read this file after selecting it from the component index. It is optimized for quick component lookup and implementation support.

## Summary
- Tag: `ntv-breadcrumbs`
- Slug: `breadcrumbs`
- Package: `@ntv360/component-pantry`
- Source: `component-pantry/breadcrumbs/breadcrumbs.manifest.ts`
- Playground controls: 6
- Properties: 16
- Demos: 8

## Description
A flexible breadcrumbs component for displaying navigational hierarchy.

## Features
- Multiple sizes - sm, md, lg
- Visual variants - default, compact, minimal
- Custom separators - angle right, slash, arrow right, chevron right, or any string
- Truncation support - truncate long labels with configurable max character count
- Item limiting - responsive limiting via maxItems
- Icon support - optional icon per breadcrumb item
- Custom colors - customActiveColor and customInactiveColor for themed styling
- CSS class overrides - containerClass, itemClass, activeClass, separatorClass
- Navigation events - itemClick and navigation outputs
- Config object pattern - DRY configuration via single [config] input

## Playground Controls
| Control | Type | Default | Label | Description | Options | Content |
| --- | --- | --- | --- | --- | --- | --- |
| `variant` | `select` | `default` | Variant | Visual style variant of the breadcrumbs | default, compact, minimal | no |
| `size` | `select` | `md` | Size | Size of the breadcrumbs | sm, md, lg | no |
| `separator` | `text` | `ANGLE_RIGHT` | Separator | Separator between breadcrumb items (use key name like ANGLE_RIGHT, SLASH, ARROW_RIGHT, CHEVRON_RIGHT, or any custom string) |  | no |
| `showSeparator` | `boolean` | `true` | Show Separator | Whether to show the separator between breadcrumb items |  | no |
| `truncate` | `boolean` | `false` | Truncate | Whether to truncate long breadcrumb labels |  | no |
| `maxItems` | `number` | `10` | Max Items | Maximum number of breadcrumb items to display |  | no |

## Properties
| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `items` | `BreadcrumbItem[]` | no | `[]` | Array of breadcrumb items to display |
| `size` | `'sm' \| 'md' \| 'lg'` | no | `'md'` | Size of the breadcrumbs |
| `variant` | `'default' \| 'compact' \| 'minimal'` | no | `'default'` | Visual variant of the breadcrumbs |
| `separator` | `string` | no | `'>'` | Custom separator icon or string (also accepts key names: ANGLE_RIGHT, SLASH, ARROW_RIGHT, CHEVRON_RIGHT) |
| `showSeparator` | `boolean` | no | `true` | Whether to show the separator between items |
| `truncate` | `boolean` | no | `false` | Whether to truncate long breadcrumb labels |
| `maxItems` | `number` | no | `10` | Maximum number of items to display |
| `containerClass` | `string` | no | `''` | Extra CSS classes for the breadcrumbs container |
| `itemClass` | `string` | no | `''` | Extra CSS classes for individual breadcrumb items |
| `activeClass` | `string` | no | `''` | Extra CSS classes for the active/current breadcrumb item |
| `separatorClass` | `string` | no | `''` | Extra CSS classes for the separator |
| `customActiveColor` | `string` | no | `'#8DCB2C'` | Custom color for the active/current breadcrumb item |
| `customInactiveColor` | `string` | no | `'#091635'` | Custom color for non-active breadcrumb items |
| `config` | `BreadcrumbsConfig` | no | `undefined` | Configuration object for DRY pattern - merges with individual properties |
| `itemClick` | `EventEmitter<{ item: BreadcrumbItem; index: number; event: Event }>` | no | `N/A` | Emitted when a breadcrumb item is clicked |
| `navigation` | `EventEmitter<{ url: string; item: BreadcrumbItem }>` | no | `N/A` | Emitted when navigation occurs |

## Demos
### 1. Basic Usage

- Category: Usage
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-breadcrumbs

Simple breadcrumbs with navigation links

#### Instance 1: Default Breadcrumbs

- Label: Default Breadcrumbs
- Variant: default

Config entries:
- `items`: `[{"label":"Home","url":"/"},{"label":"Library","url":"/library"},{"label":"Data","url":"/library/data"},{"label":"Current Page"}]`

Code example:

```html
breadcrumbs = [
  { label: 'Home', url: '/' },
  { label: 'Library', url: '/library' },
  { label: 'Data', url: '/library/data' },
  { label: 'Current Page' },
];
<ntv-breadcrumbs [items]="breadcrumbs"></ntv-breadcrumbs>
```

### 2. Sizes

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-breadcrumbs

Size options: sm, md, lg

#### Instance 1: Small

- Label: Small

Config entries:
- `items`: `[{"label":"Home","url":"/"},{"label":"Section","url":"/section"},{"label":"Page"}]`

#### Instance 2: Medium

- Label: Medium

Config entries:
- `items`: `[{"label":"Home","url":"/"},{"label":"Section","url":"/section"},{"label":"Page"}]`

#### Instance 3: Large

- Label: Large

Config entries:
- `items`: `[{"label":"Home","url":"/"},{"label":"Section","url":"/section"},{"label":"Page"}]`

### 3. Variants

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-breadcrumbs

Visual style variants: default, compact, minimal

#### Instance 1: Default

- Label: Default
- Variant: default

Config entries:
- `items`: `[{"label":"Home","url":"/"},{"label":"Category","url":"/category"},{"label":"Item"}]`

#### Instance 2: Compact

- Label: Compact
- Variant: compact

Config entries:
- `items`: `[{"label":"Home","url":"/"},{"label":"Category","url":"/category"},{"label":"Item"}]`

#### Instance 3: Minimal

- Label: Minimal
- Variant: minimal

Config entries:
- `items`: `[{"label":"Home","url":"/"},{"label":"Category","url":"/category"},{"label":"Item"}]`

### 4. Separators

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-breadcrumbs

Different separator options

#### Instance 1: Angle Right (default)

- Label: Angle Right (default)

Config entries:
- `items`: `[{"label":"Home","url":"/"},{"label":"Docs","url":"/docs"},{"label":"Components"}]`
- `separator`: `ANGLE_RIGHT`

#### Instance 2: Slash

- Label: Slash

Config entries:
- `items`: `[{"label":"Home","url":"/"},{"label":"Docs","url":"/docs"},{"label":"Components"}]`
- `separator`: `SLASH`

#### Instance 3: Arrow Right

- Label: Arrow Right

Config entries:
- `items`: `[{"label":"Home","url":"/"},{"label":"Docs","url":"/docs"},{"label":"Components"}]`
- `separator`: `ARROW_RIGHT`

#### Instance 4: Chevron Right

- Label: Chevron Right

Config entries:
- `items`: `[{"label":"Home","url":"/"},{"label":"Docs","url":"/docs"},{"label":"Components"}]`
- `separator`: `CHEVRON_RIGHT`

### 5. With Icons

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-breadcrumbs

Breadcrumb items with icon support

#### Instance 1: Emoji Icons

- Label: Emoji Icons

Config entries:
- `items`: `[{"label":"Home","url":"/","icon":"🏠"},{"label":"Projects","url":"/projects","icon":"📁"},{"label":"Angular","url":"/projects/angular","icon":"🅰️"},{"label":"Current","icon":"📄"}]`

### 6. Truncation

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-breadcrumbs

Truncate long breadcrumb labels

#### Instance 1: Truncated Labels

- Label: Truncated Labels

Config entries:
- `items`: `[{"label":"Home","url":"/"},{"label":"Very Long Section Name That Should Truncate","url":"/section"},{"label":"Another Extremely Long Page Title To Demonstrate Truncation"}]`
- `truncate`: `true`

Code example:

```html
<ntv-breadcrumbs [items]="items" [truncate]="true"></ntv-breadcrumbs>
```

### 7. Max Items

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-breadcrumbs

Limit the number of visible breadcrumb items

#### Instance 1: Max 5 Items

- Label: Max 5 Items

Config entries:
- `items`: `[{"label":"Home","url":"/"},{"label":"Level 1","url":"/l1"},{"label":"Level 2","url":"/l2"},{"label":"Level 3","url":"/l3"},{"label":"Level 4","url":"/l4"},{"label":"Level 5","url":"/l5"},{"label":"Level 6","url":"/l6"},{"label":"Current"}]`
- `maxItems`: `5`

Code example:

```html
<ntv-breadcrumbs [items]="items" [maxItems]="5"></ntv-breadcrumbs>
```

### 8. Config Pattern

- Category: Configuration
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-breadcrumbs

Using the DRY config object pattern

#### Instance 1: Config Object

- Label: Config Object

Config entries:
- `config`: `{"items":[{"label":"Home","url":"/"},{"label":"Library","url":"/library"},{"label":"Data","url":"/library/data"},{"label":"Current Page"}],"size":"md","variant":"default","showSeparator":true,"separator":"ANGLE_RIGHT"}`

Code example:

```html
breadcrumbsConfig = {
  items: [
    { label: 'Home', url: '/' },
    { label: 'Library', url: '/library' },
    { label: 'Current Page' },
  ],
  size: 'md',
  variant: 'default',
  showSeparator: true,
  separator: 'ANGLE_RIGHT',
};
<ntv-breadcrumbs [config]="breadcrumbsConfig"></ntv-breadcrumbs>
```
