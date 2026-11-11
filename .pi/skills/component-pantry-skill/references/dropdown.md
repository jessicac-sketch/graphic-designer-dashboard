---
tags:
  - component-docs
  - ntv360
  - component-pantry
  - dropdown
---

# Component: Dropdown

Read this file after selecting it from the component index. It is optimized for quick component lookup and implementation support.

## Summary
- Tag: `ntv-dropdown`
- Slug: `dropdown`
- Package: `@ntv360/component-pantry`
- Source: `component-pantry/dropdown/dropdown.manifest.ts`
- Playground controls: 9
- Properties: 20
- Demos: 3

## Description
A flexible dropdown select component with multiple variants, sizes, and customization options.

## Playground Controls
| Control | Type | Default | Label | Description | Options | Content |
| --- | --- | --- | --- | --- | --- | --- |
| `label` | `text` | `Select Item` | Label | Label text displayed above the dropdown |  | no |
| `placeholder` | `text` | `Choose an option` | Placeholder | Placeholder text shown when no option is selected |  | no |
| `size` | `select` | `md` | Size | Size variant of the dropdown | xs, sm, md, lg, xl | no |
| `variant` | `select` | `default` | Variant | Visual variant of the dropdown | default, soft, ghost, custom | no |
| `disabled` | `boolean` | `false` | Disabled | Whether the dropdown is disabled |  | no |
| `fullWidth` | `boolean` | `true` | Full Width | Whether the dropdown should stretch to full container width |  | no |
| `showCheckmark` | `boolean` | `true` | Show Checkmark | Whether to show checkmark on selected option |  | no |
| `closeOnSelect` | `boolean` | `true` | Close on Select | Whether to close dropdown when an option is selected |  | no |
| `borderRadius` | `select` | `md` | Border Radius | Border radius of the dropdown trigger | none, sm, md, lg, xl | no |

## Properties
| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `options` | `DropdownOption[]` | no | `[]` | Array of options to display in the dropdown menu |
| `label` | `string \| null` | no | `null` | Label text displayed above the dropdown trigger |
| `placeholder` | `string` | no | `'Select an option'` | Placeholder text shown when no option is selected |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | no | `'md'` | Size variant of the dropdown |
| `variant` | `'default' \| 'soft' \| 'ghost' \| string` | no | `'default'` | Visual variant of the dropdown |
| `disabled` | `boolean` | no | `false` | Whether the dropdown is disabled |
| `fullWidth` | `boolean` | no | `true` | Whether the dropdown should stretch to full container width |
| `showCheckmark` | `boolean` | no | `true` | Whether to show checkmark on selected option |
| `closeOnSelect` | `boolean` | no | `true` | Whether to close dropdown when an option is selected |
| `borderRadius` | `'none' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| string` | no | `'md'` | Border radius of the dropdown trigger |
| `defaultOpen` | `boolean` | no | `false` | Whether the dropdown should be open by default |
| `value` | `string \| number \| null` | no | `null` | Pre-selected value |
| `zIndex` | `number` | no | `10000` | z-index for the dropdown panel |
| `maxWidth` | `number \| string` | no | `'700px'` | Maximum width of the dropdown |
| `hoverColor` | `string` | no | `DROPDOWN_COLORS.accent` | Custom color for hover state on the dropdown trigger button |
| `hoverBgColor` | `string` | no | `''` | Custom background color for hover state on dropdown items |
| `config` | `Partial<DropdownConfig>` | no | `undefined` | Configuration object combining all dropdown settings |
| `selectionChange` | `EventEmitter<DropdownOption \| null>` | no | `N/A` | Emits when an option is selected or cleared |
| `valueChange` | `EventEmitter<string \| number \| null>` | no | `N/A` | Emits the value when selection changes |
| `openChange` | `EventEmitter<boolean>` | no | `N/A` | Emits when dropdown opens or closes |

## Demos
### 1. Basic Usage

- Category: Usage
- Component type: universal
- Layout: vertical
- Gap: N/A
- Component tag: ntv-dropdown

Simple dropdown with options

#### Instance 1: Basic Dropdown

- Label: Basic Dropdown

Props:
- `label`: `Select Country`
- `options`: `[{"label":"United States","value":"us"},{"label":"Canada","value":"ca"},{"label":"Mexico","value":"mx"}]`

Code example:

```html
<ntv-dropdown label="Select Country" [options]="options"></ntv-dropdown>
```

### 2. Sizes

- Category: Examples
- Component type: universal
- Layout: horizontal
- Gap: N/A
- Component tag: ntv-dropdown

Different size options

#### Instance 1: Small

- Label: Small

Props:
- `size`: `sm`
- `options`: `[{"label":"Option 1","value":"1"},{"label":"Option 2","value":"2"}]`

#### Instance 2: Medium

- Label: Medium

Props:
- `size`: `md`
- `options`: `[{"label":"Option 1","value":"1"},{"label":"Option 2","value":"2"}]`

#### Instance 3: Large

- Label: Large

Props:
- `size`: `lg`
- `options`: `[{"label":"Option 1","value":"1"},{"label":"Option 2","value":"2"}]`

### 3. Variants

- Category: Examples
- Component type: universal
- Layout: horizontal
- Gap: N/A
- Component tag: ntv-dropdown

Visual style variants

#### Instance 1: Default

- Label: Default

Props:
- `variant`: `default`
- `options`: `[{"label":"Option 1","value":"1"}]`

#### Instance 2: Soft

- Label: Soft

Props:
- `variant`: `soft`
- `options`: `[{"label":"Option 1","value":"1"}]`

#### Instance 3: Ghost

- Label: Ghost

Props:
- `variant`: `ghost`
- `options`: `[{"label":"Option 1","value":"1"}]`
