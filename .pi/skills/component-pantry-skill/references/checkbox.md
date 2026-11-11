---
tags:
  - component-docs
  - ntv360
  - component-pantry
  - checkbox
---

# Component: Checkbox

Read this file after selecting it from the component index. It is optimized for quick component lookup and implementation support.

## Summary
- Tag: `ntv-checkbox`
- Slug: `checkbox`
- Package: `@ntv360/component-pantry`
- Source: `component-pantry/checkbox/checkbox.manifest.ts`
- Playground controls: 5
- Properties: 13
- Demos: 4

## Description
A flexible checkbox component with multiple sizes, colors, and states.

## Features
- Multiple sizes - sm, md, lg
- Color options - accent (green), information (blue), custom (any hex)
- Disabled state
- Indeterminate state with separate color support
- Label support
- Required field indicator
- Accessibility via ARIA attributes
- Two-way binding via checkedChange output
- DRY configuration via single [config] input

## Playground Controls
| Control | Type | Default | Label | Description | Options | Content |
| --- | --- | --- | --- | --- | --- | --- |
| `size` | `select` | `md` | Size | Size of the checkbox | sm, md, lg | no |
| `color` | `select` | `accent` | Color | Color variant (use 'custom' with customColor for hex colors) | accent, information, custom | no |
| `disabled` | `boolean` | `false` | Disabled | Whether the checkbox is disabled |  | no |
| `indeterminate` | `boolean` | `false` | Indeterminate | Whether the checkbox is in an indeterminate state |  | no |
| `required` | `boolean` | `false` | Required | Whether the checkbox is required |  | no |

## Properties
| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `label` | `string` | no | `''` | Label text displayed next to the checkbox |
| `checked` | `boolean` | no | `true` | Whether the checkbox is checked |
| `disabled` | `boolean` | no | `false` | Whether the checkbox is disabled |
| `indeterminate` | `boolean` | no | `false` | Whether the checkbox is in an indeterminate (mixed) state |
| `size` | `'sm' \| 'md' \| 'lg'` | no | `'md'` | Size of the checkbox |
| `color` | `'accent' \| 'information' \| 'custom'` | no | `'accent'` | Color variant. Use 'custom' with customColor for hex colors. |
| `customColor` | `string` | no | `''` | Custom hex color when color is 'custom' |
| `indeterminateColor` | `'accent' \| 'information' \| 'custom' \| undefined` | no | `undefined` | Color of the checkbox when in indeterminate state |
| `indeterminateCustomColor` | `string` | no | `''` | Custom hex color for indeterminate state when indeterminateColor is 'custom' |
| `required` | `boolean` | no | `false` | Whether the checkbox is required |
| `config` | `Partial<CheckboxConfig>` | no | `{}` | DRY configuration object — merges with individual property inputs |
| `checkedChange` | `EventEmitter<boolean>` | no | `N/A` | Emitted when the checkbox is toggled. Use with (checkedChange) for two-way binding. |
| `stateChange` | `EventEmitter<{ checked: boolean; indeterminate: boolean }>` | no | `N/A` | Emitted when the checkbox state changes (includes indeterminate status) |

## Demos
### 1. Basic Usage

- Category: Usage
- Component type: universal
- Layout: vertical
- Gap: 0.75rem
- Component tag: ntv-checkbox

Simple checkbox with a label

#### Instance 1: Unchecked

- Label: Unchecked

Config entries:
- `label`: `Accept terms and conditions`
- `checked`: `false`

#### Instance 2: Checked

- Label: Checked

Config entries:
- `label`: `Remember me`
- `checked`: `true`

### 2. Sizes

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 0.75rem
- Component tag: ntv-checkbox

Checkbox in sm, md, and lg sizes

#### Instance 1: Small

- Label: Small

Config entries:
- `label`: `Small checkbox`
- `checked`: `true`

#### Instance 2: Medium

- Label: Medium

Config entries:
- `label`: `Medium checkbox`
- `checked`: `true`

#### Instance 3: Large

- Label: Large

Config entries:
- `label`: `Large checkbox`
- `checked`: `true`

### 3. Colors

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 0.75rem
- Component tag: ntv-checkbox

Accent and information color variants

#### Instance 1: Accent (Default)

- Label: Accent (Default)

Config entries:
- `label`: `Accent color`
- `checked`: `true`
- `color`: `accent`

#### Instance 2: Information

- Label: Information

Config entries:
- `label`: `Information color`
- `checked`: `true`
- `color`: `information`

#### Instance 3: Custom Color

- Label: Custom Color

Config entries:
- `label`: `Custom color (#7c3aed)`
- `checked`: `true`
- `color`: `custom`
- `customColor`: `#7c3aed`

### 4. States

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 0.75rem
- Component tag: ntv-checkbox

Disabled and indeterminate states

#### Instance 1: Disabled Unchecked

- Label: Disabled Unchecked

Config entries:
- `label`: `Disabled unchecked`
- `checked`: `false`

#### Instance 2: Disabled Checked

- Label: Disabled Checked

Config entries:
- `label`: `Disabled checked`
- `checked`: `true`

#### Instance 3: Indeterminate

- Label: Indeterminate

Config entries:
- `label`: `Indeterminate state`
- `indeterminate`: `true`
