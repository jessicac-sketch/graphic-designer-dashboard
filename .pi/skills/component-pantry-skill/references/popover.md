---
tags:
  - component-docs
  - ntv360
  - component-pantry
  - popover
---

# Component: Popover

Read this file after selecting it from the component index. It is optimized for quick component lookup and implementation support.

## Summary
- Tag: `ntv-popover`
- Slug: `popover`
- Package: `@ntv360/component-pantry`
- Source: `component-pantry/popover/popover.manifest.ts`
- Playground controls: 6
- Properties: 12
- Demos: 5

## Description
A floating overlay panel positioned relative to a trigger element.

## Features
- Eight placement positions: `top`, `top-start`, `top-end`, `bottom`, `bottom-start`, `bottom-end`, `left`, `right`
- Three trigger modes: `click`, `hover`, `manual`
- Arrow indicator pointing to the trigger
- Auto-repositions to stay within viewport boundaries
- Teleports to `document.body` to escape stacking contexts (works inside modals)
- Click outside to close (configurable)
- Escape key to close (configurable)
- Configurable max-width and z-index
- DRY `config` object overrides individual inputs
- Programmatic `show()`, `hide()`, and `toggle()` methods
- `shown` and `hidden` event outputs

## Playground Controls
| Control | Type | Default | Label | Description | Options | Content |
| --- | --- | --- | --- | --- | --- | --- |
| `placement` | `select` | `bottom` | Placement | Position of the popover relative to the trigger | top, top-start, top-end, bottom, bottom-start, bottom-end, left, right | no |
| `trigger` | `select` | `manual` | Trigger | How the popover is opened and closed | click, hover, manual | no |
| `arrow` | `boolean` | `true` | Arrow | Whether to show the arrow indicator |  | no |
| `disabled` | `boolean` | `false` | Disabled | Whether the popover is disabled |  | no |
| `closeOnClickOutside` | `boolean` | `true` | Close On Click Outside | Close when clicking outside the popover |  | no |
| `closeOnEscape` | `boolean` | `true` | Close On Escape | Close when pressing the Escape key |  | no |

## Properties
| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `placement` | `'top' \| 'top-start' \| 'top-end' \| 'bottom' \| 'bottom-start' \| 'bottom-end' \| 'left' \| 'right'` | no | `'bottom'` | Placement of the popover relative to the trigger element |
| `trigger` | `'click' \| 'hover' \| 'manual'` | no | `'manual'` | Trigger mode for showing/hiding the popover |
| `arrow` | `boolean` | no | `true` | Whether to show the arrow indicator pointing to the trigger |
| `offset` | `number` | no | `8` | Offset distance in pixels from the trigger element |
| `closeOnClickOutside` | `boolean` | no | `true` | Whether to close the popover when clicking outside of it |
| `closeOnEscape` | `boolean` | no | `true` | Whether to close the popover when pressing the Escape key |
| `disabled` | `boolean` | no | `false` | Whether the popover is disabled and cannot be shown |
| `maxWidth` | `string` | no | `'320px'` | Maximum width of the popover as a CSS value |
| `zIndex` | `number` | no | `1000` | z-index for stacking context |
| `config` | `PopoverConfig` | no | `undefined` | DRY config object — overrides individual inputs when provided. Accepts: placement, offset, arrow, trigger, closeOnClickOutside, closeOnEscape, disabled, maxWidth, zIndex |
| `shown` | `EventEmitter<void>` | no | `N/A` | Emitted when the popover becomes visible |
| `hidden` | `EventEmitter<void>` | no | `N/A` | Emitted when the popover becomes hidden |

## Demos
### 1. Basic Usage

- Category: Usage
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-popover

Click trigger popover with content projection

#### Instance 1: Click Trigger

- Label: Click Trigger

Config entries:
- `trigger`: `click`
- `placement`: `bottom`

Content:

```html
<p style="padding:0.75rem 1rem;margin:0">This is popover content projected via ng-content.</p>
```

Code example:

```html
<!-- Get a template reference to the popover -->
<button (click)="popover.toggle($event)">Open Popover</button>

<ntv-popover #popover trigger="click" placement="bottom" (shown)="onShown()" (hidden)="onHidden()">
  <p>Popover content goes here.</p>
</ntv-popover>
```

### 2. Placement Options

- Category: Examples
- Component type: universal
- Layout: horizontal
- Gap: 1rem
- Component tag: ntv-popover

Popover positioned at different locations relative to the trigger

#### Instance 1: Top

- Label: Top

Config entries:
- `placement`: `top`
- `trigger`: `click`

Content:

```html
<p style="padding:0.5rem">Top placement</p>
```

#### Instance 2: Bottom

- Label: Bottom

Config entries:
- `placement`: `bottom`
- `trigger`: `click`

Content:

```html
<p style="padding:0.5rem">Bottom placement</p>
```

#### Instance 3: Left

- Label: Left

Config entries:
- `placement`: `left`
- `trigger`: `click`

Content:

```html
<p style="padding:0.5rem">Left placement</p>
```

#### Instance 4: Right

- Label: Right

Config entries:
- `placement`: `right`
- `trigger`: `click`

Content:

```html
<p style="padding:0.5rem">Right placement</p>
```

### 3. Trigger Modes

- Category: Examples
- Component type: universal
- Layout: horizontal
- Gap: 1rem
- Component tag: ntv-popover

Click, hover, and manual trigger methods

#### Instance 1: Click

- Label: Click

Config entries:
- `trigger`: `click`
- `placement`: `bottom`

Content:

```html
<p style="padding:0.5rem">Clicked to open</p>
```

#### Instance 2: Hover

- Label: Hover

Config entries:
- `trigger`: `hover`
- `placement`: `bottom`

Content:

```html
<p style="padding:0.5rem">Hover to open</p>
```

### 4. DRY Config Pattern

- Category: Configuration
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-popover

Using the config object instead of individual inputs

#### Instance 1: Config Object

- Label: Config Object

Config entries:
- `config`: `{"placement":"bottom-start","trigger":"click","arrow":true,"offset":12,"maxWidth":"400px","closeOnClickOutside":true,"closeOnEscape":true}`

Content:

```html
<p style="padding:0.75rem">Configured via config object.</p>
```

Code example:

```html
popoverConfig = {
  placement: 'bottom-start',
  trigger: 'click',
  arrow: true,
  offset: 12,
  maxWidth: '400px',
};
<ntv-popover [config]="popoverConfig">
  <p>Content here.</p>
</ntv-popover>
```

### 5. Disabled State

- Category: Examples
- Component type: universal
- Layout: horizontal
- Gap: 1rem
- Component tag: ntv-popover

Popover that cannot be opened when disabled

#### Instance 1: Enabled

- Label: Enabled

Config entries:
- `trigger`: `click`
- `disabled`: `false`

Content:

```html
<p style="padding:0.5rem">I can be opened!</p>
```

#### Instance 2: Disabled

- Label: Disabled

Config entries:
- `trigger`: `click`
- `disabled`: `true`

Content:

```html
<p style="padding:0.5rem">I cannot be opened.</p>
```
