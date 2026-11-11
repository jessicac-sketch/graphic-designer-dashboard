---
tags:
  - component-docs
  - ntv360
  - component-pantry
  - toggle-button
---

# Component: Toggle Button

Read this file after selecting it from the component index. It is optimized for quick component lookup and implementation support.

## Summary
- Tag: `ntv-toggle-button`
- Slug: `toggle-button`
- Package: `@ntv360/component-pantry`
- Source: `component-pantry/toggle-button/toggle-button.manifest.ts`
- Playground controls: 5
- Properties: 10
- Demos: 7

## Description
A switch-style toggle control with customisable size, colour theme, and optional label.

## Features
- 3 sizes: `sm`, `md`, `lg`
- 7 preset colour tokens: `accent_color`, `blue`, `green`, `red`, `yellow`, `purple`, `gray`
- Custom CSS colour via `color="custom"` + `customColor="#hexvalue"`
- Optional label with position: `left` or `right`
- Two-way binding via `[(checked)]` — supports both `checked` input and `checkedChange` output
- `toggled` output emits the next boolean value on every change
- Keyboard accessible: Space / Enter toggles the control
- Disabled state blocks all interaction
- DRY `config` object pattern — individual inputs take precedence when both are provided

## Playground Controls
| Control | Type | Default | Label | Description | Options | Content |
| --- | --- | --- | --- | --- | --- | --- |
| `size` | `select` | `md` |  | Visual size of the toggle control | sm, md, lg | no |
| `color` | `select` | `blue` |  | Colour theme when checked. Use 'custom' with customColor for a hex value. | accent_color, blue, green, red, yellow, purple, gray, custom | no |
| `checked` | `boolean` | `false` |  | Whether the toggle is in the on (checked) state |  | no |
| `disabled` | `boolean` | `false` |  | Whether the toggle is disabled and non-interactive |  | no |
| `labelPosition` | `select` | `right` |  | Position of the label relative to the control | left, right | no |

## Properties
| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `checked` | `boolean` | no | `false` | Current on/off state of the toggle. Use with [checked] for one-way or [(checked)] for two-way binding. |
| `disabled` | `boolean` | no | `false` | When true, the toggle is non-interactive and visually muted |
| `size` | `'sm'\|'md'\|'lg'` | no | `'md'` | Visual size of the toggle control |
| `color` | `'accent_color'\|'blue'\|'green'\|'red'\|'yellow'\|'purple'\|'gray'\|'custom'` | no | `'blue'` | Colour preset applied when the toggle is checked. Use 'custom' together with customColor for a hex override. |
| `customColor` | `string` | no | `''` | CSS hex or colour string applied when color is 'custom' (e.g. '#8b5cf6') |
| `label` | `string` | no | `''` | Optional text label displayed next to the toggle control |
| `labelPosition` | `'left'\|'right'` | no | `'right'` | Which side to render the label relative to the toggle |
| `config` | `ToggleButtonConfig` | no | `undefined` | DRY config object — sets any combination of: checked, disabled, size, color, customColor, label, labelPosition. Individual inputs take precedence if both are provided. |
| `toggled` | `EventEmitter<boolean>` | no | `N/A` | Emits the next checked value (true/false) whenever the toggle changes |
| `checkedChange` | `EventEmitter<boolean>` | no | `N/A` | Two-way binding change event for [(checked)] syntax — emits the next boolean |

## Demos
### 1. Basic Usage

- Category: Usage
- Component type: universal
- Layout: horizontal
- Gap: 1.5rem
- Component tag: ntv-toggle-button

Default toggle in off and on states

#### Instance 1: Off (default)

- Label: Off (default)

Config entries:
- `checked`: `false`
- `label`: `Enable notifications`

Code example:

```html
<ntv-toggle-button [checked]="isEnabled" label="Enable notifications" (toggled)="isEnabled = $event">
</ntv-toggle-button>
```

#### Instance 2: On

- Label: On

Config entries:
- `checked`: `true`
- `label`: `Enable notifications`

### 2. Sizes

- Category: Examples
- Component type: universal
- Layout: horizontal
- Gap: 2rem
- Component tag: ntv-toggle-button

Small, medium, and large size variants

#### Instance 1: Small

- Label: Small

Config entries:
- `size`: `sm`
- `checked`: `true`
- `label`: `Small`

#### Instance 2: Medium

- Label: Medium

Config entries:
- `size`: `md`
- `checked`: `true`
- `label`: `Medium`

#### Instance 3: Large

- Label: Large

Config entries:
- `size`: `lg`
- `checked`: `true`
- `label`: `Large`

### 3. Colour Tokens

- Category: Examples
- Component type: universal
- Layout: horizontal
- Gap: 1.5rem
- Component tag: ntv-toggle-button

Preset colour themes for the active state

#### Instance 1: Blue (default)

- Label: Blue (default)

Config entries:
- `checked`: `true`
- `color`: `blue`
- `label`: `Blue`

#### Instance 2: Green

- Label: Green

Config entries:
- `checked`: `true`
- `color`: `green`
- `label`: `Green`

#### Instance 3: Red

- Label: Red

Config entries:
- `checked`: `true`
- `color`: `red`
- `label`: `Red`

#### Instance 4: Yellow

- Label: Yellow

Config entries:
- `checked`: `true`
- `color`: `yellow`
- `label`: `Yellow`

#### Instance 5: Purple

- Label: Purple

Config entries:
- `checked`: `true`
- `color`: `purple`
- `label`: `Purple`

#### Instance 6: Gray

- Label: Gray

Config entries:
- `checked`: `true`
- `color`: `gray`
- `label`: `Gray`

### 4. Custom Colour

- Category: Examples
- Component type: universal
- Layout: horizontal
- Gap: 1.5rem
- Component tag: ntv-toggle-button

Using color='custom' with a hex value

#### Instance 1: Brand Teal

- Label: Brand Teal

Config entries:
- `checked`: `true`
- `color`: `custom`
- `customColor`: `#0d9488`
- `label`: `Brand Teal`

Code example:

```html
<ntv-toggle-button [checked]="value" color="custom" customColor="#0d9488"
  label="Brand Teal" (toggled)="value = $event">
</ntv-toggle-button>
```

#### Instance 2: Deep Orange

- Label: Deep Orange

Config entries:
- `checked`: `true`
- `color`: `custom`
- `customColor`: `#ea580c`
- `label`: `Deep Orange`

### 5. Label Position

- Category: Examples
- Component type: universal
- Layout: horizontal
- Gap: 2rem
- Component tag: ntv-toggle-button

Label to the left or right of the control

#### Instance 1: Label Right (default)

- Label: Label Right (default)

Config entries:
- `checked`: `true`
- `label`: `Auto-save`
- `labelPosition`: `right`

#### Instance 2: Label Left

- Label: Label Left

Config entries:
- `checked`: `true`
- `label`: `Auto-save`
- `labelPosition`: `left`

### 6. Disabled State

- Category: Examples
- Component type: universal
- Layout: horizontal
- Gap: 2rem
- Component tag: ntv-toggle-button

Toggle in disabled on and off states

#### Instance 1: Disabled Off

- Label: Disabled Off

Config entries:
- `checked`: `false`
- `disabled`: `true`
- `label`: `Disabled`

#### Instance 2: Disabled On

- Label: Disabled On

Config entries:
- `checked`: `true`
- `disabled`: `true`
- `label`: `Disabled On`

### 7. DRY Config Pattern

- Category: Configuration
- Component type: universal
- Layout: horizontal
- Gap: 1.5rem
- Component tag: ntv-toggle-button

Using the config object for full toggle configuration

#### Instance 1: Config Object

- Label: Config Object

Config entries:
- `config`: `{"checked":true,"size":"md","color":"green","label":"Live broadcast","labelPosition":"right","disabled":false}`

Code example:

```html
toggleConfig: ToggleButtonConfig = {
  checked: true,
  size: 'md',
  color: 'green',
  label: 'Live broadcast',
  labelPosition: 'right',
};
<ntv-toggle-button [config]="toggleConfig" (toggled)="onToggled($event)"></ntv-toggle-button>
```
