---
tags:
  - component-docs
  - ntv360
  - component-pantry
  - button
---

# Component: Button

Read this file after selecting it from the component index. It is optimized for quick component lookup and implementation support.

## Summary
- Tag: `ntv-button`
- Slug: `button`
- Package: `@ntv360/component-pantry`
- Source: `component-pantry/button/button.manifest.ts`
- Playground controls: 11
- Properties: 20
- Demos: 7

## Description
A versatile button component with multiple variants, sizes, and states.

## Playground Controls
| Control | Type | Default | Label | Description | Options | Content |
| --- | --- | --- | --- | --- | --- | --- |
| `variant` | `select` | `primary` | Variant | Visual style variant of the button | primary, secondary, success, warning, danger, outline, accent, description, info | no |
| `size` | `select` | `md` | Size | Size of the button (xxl = 42px) | xs, sm, md, lg, xl, xxl | no |
| `color` | `select` | `` | Color | Color of the button - overrides variant color | , blue, green, red, yellow, purple, gray, indigo, pink, custom | no |
| `customColor` | `color` | `#3b82f6` | Custom Color | Custom hex color when color is "custom" |  | no |
| `disabled` | `boolean` | `false` | Disabled | Whether the button is disabled |  | no |
| `loading` | `boolean` | `false` | Loading | Whether the button is in loading state |  | no |
| `fullWidth` | `boolean` | `false` | Full Width | Whether the button should take full width |  | no |
| `rounded` | `select` | `md` | Rounded | Border radius style | none, sm, md, lg, xl, full | no |
| `shadow` | `boolean` | `true` | Shadow | Whether the button has shadow |  | no |
| `type` | `select` | `button` | Type | Button HTML type attribute | button, submit, reset, fab, fabRoundedFull | no |
| `label` | `text` | `Click me` | Label | Button text content |  | yes |

## Properties
| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `variant` | `'primary' \| 'secondary' \| 'success' \| 'warning' \| 'danger' \| 'outline' \| 'accent' \| 'description' \| 'info'` | no | `'primary'` | Visual style variant of the button |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| 'xxl'` | no | `'md'` | Size of the button (xxl = 42px) |
| `color` | `'blue' \| 'green' \| 'red' \| 'yellow' \| 'purple' \| 'gray' \| 'indigo' \| 'pink' \| 'custom' \| ''` | no | `''` | Color of the button - only used when you want a specific color independent of variant |
| `customColor` | `string` | no | `''` | Custom hex color when color is "custom" |
| `disabled` | `boolean` | no | `false` | Whether the button is disabled |
| `loading` | `boolean` | no | `false` | Whether the button is in loading state |
| `fullWidth` | `boolean` | no | `false` | Whether the button should take full width |
| `rounded` | `'none' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | no | `'md'` | Rounded corner style |
| `shadow` | `boolean` | no | `true` | Whether the button has shadow |
| `type` | `'button' \| 'submit' \| 'reset' \| 'fab' \| 'fabRoundedFull'` | no | `'button'` | Button type attribute |
| `fontSize` | `string` | no | `'14px'` | Font size for button text |
| `contentAlignment` | `'center' \| 'start' \| 'between'` | no | `'center'` | Content alignment inside the button |
| `innerContentAlignment` | `'center' \| 'start' \| 'end' \| 'between'` | no | `'center'` | Inner content alignment for ng-content wrapper |
| `customHeight` | `string` | no | `''` | Custom height of the button |
| `noFocusRing` | `boolean` | no | `true` | Whether to remove focus ring styles |
| `hoverColor` | `string` | no | `''` | Custom hover color for the button |
| `backgroundColor` | `string` | no | `''` | Custom background color for the button |
| `config` | `ButtonConfig` | no | `undefined` | Configuration object for DRY pattern - merges with individual properties |
| `showSplitOptions` | `boolean` | no | `false` | Whether to show split button options |
| `buttonClick` | `EventEmitter<MouseEvent>` | no | `N/A` | Event emitted when button is clicked (not emitted when disabled or loading) |

## Demos
### 1. Button Variants

- Category: Examples
- Component type: universal
- Layout: horizontal
- Gap: N/A
- Component tag: ntv-button

Different visual styles for various use cases

#### Instance 1: Primary

- Label: Primary
- Variant: primary

Content:

```html
Primary
```

#### Instance 2: Secondary

- Label: Secondary
- Variant: secondary

Content:

```html
Secondary
```

#### Instance 3: Success

- Label: Success
- Variant: success

Content:

```html
Success
```

#### Instance 4: Warning

- Label: Warning
- Variant: warning

Content:

```html
Warning
```

#### Instance 5: Danger

- Label: Danger
- Variant: danger

Content:

```html
Danger
```

#### Instance 6: Outline

- Label: Outline
- Variant: outline

Content:

```html
Outline
```

#### Instance 7: Accent

- Label: Accent
- Variant: accent

Content:

```html
Accent
```

#### Instance 8: Info

- Label: Info
- Variant: info

Content:

```html
Info
```

### 2. Button Sizes

- Category: Examples
- Component type: universal
- Layout: horizontal
- Gap: N/A
- Component tag: ntv-button

Different size options from extra small to extra large

#### Instance 1: Extra Small

- Label: Extra Small
- Variant: primary

Content:

```html
XS
```

#### Instance 2: Small

- Label: Small
- Variant: primary

Content:

```html
Small
```

#### Instance 3: Medium

- Label: Medium
- Variant: primary

Content:

```html
Medium
```

#### Instance 4: Large

- Label: Large
- Variant: primary

Content:

```html
Large
```

#### Instance 5: Extra Large

- Label: Extra Large
- Variant: primary

Content:

```html
XL
```

#### Instance 6: Extra Extra Large (42px)

- Label: Extra Extra Large (42px)
- Variant: primary

Content:

```html
XXL
```

### 3. Button States

- Category: Examples
- Component type: universal
- Layout: horizontal
- Gap: N/A
- Component tag: ntv-button

Disabled and loading states with proper accessibility

#### Instance 1: Normal

- Label: Normal
- Variant: primary

Content:

```html
Click me
```

#### Instance 2: Disabled

- Label: Disabled
- Variant: primary

Content:

```html
Disabled
```

#### Instance 3: Loading

- Label: Loading
- Variant: primary

Content:

```html
Loading...
```

### 4. Custom Colors

- Category: Examples
- Component type: universal
- Layout: horizontal
- Gap: N/A
- Component tag: ntv-button

Use predefined colors or custom hex values

#### Instance 1: Blue

- Label: Blue

Props:
- `color`: `blue`

Content:

```html
Blue
```

#### Instance 2: Green

- Label: Green

Props:
- `color`: `green`

Content:

```html
Green
```

#### Instance 3: Red

- Label: Red

Props:
- `color`: `red`

Content:

```html
Red
```

#### Instance 4: Custom

- Label: Custom

Props:
- `color`: `custom`
- `customColor`: `#ff6b35`

Content:

```html
Custom
```

### 5. Layout Options

- Category: Configuration
- Component type: universal
- Layout: vertical
- Gap: N/A
- Component tag: ntv-button

Full width and rounded corner variations

#### Instance 1: Full Width

- Label: Full Width
- Variant: primary

Props:
- `fullWidth`: `true`

Content:

```html
Full Width Button
```

#### Instance 2: Sharp Corners

- Label: Sharp Corners
- Variant: secondary

Props:
- `rounded`: `none`

Content:

```html
Sharp
```

#### Instance 3: Fully Rounded

- Label: Fully Rounded
- Variant: success

Props:
- `rounded`: `full`

Content:

```html
Rounded
```

### 6. Basic Usage

- Category: Usage
- Component type: universal
- Layout: vertical
- Gap: N/A
- Component tag: ntv-button

Simple button implementation

#### Instance 1: Basic Button

- Label: Basic Button
- Variant: primary

Content:

```html
Click me
```

Code example:

```html
<ntv-button variant="primary">Click me</ntv-button>
```

#### Instance 2: With Event Handler

- Label: With Event Handler
- Variant: secondary

Content:

```html
Submit
```

Code example:

```html
<ntv-button variant="secondary" (buttonClick)="handleClick($event)">Submit</ntv-button>
```

### 7. Config Pattern

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: N/A
- Component tag: ntv-button

Using the DRY config object pattern

#### Instance 1: Config Object

- Label: Config Object
- Variant: primary

Props:
- `shadow`: `true`

Content:

```html
Save Changes
```

Code example:

```html
// Component
buttonConfig = {
  variant: 'primary',
  size: 'lg',
  shadow: true
};

// Template
<ntv-button [config]="buttonConfig">Save Changes</ntv-button>
```
