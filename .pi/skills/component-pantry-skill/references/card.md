---
tags:
  - component-docs
  - ntv360
  - component-pantry
  - card
---

# Component: Card

Read this file after selecting it from the component index. It is optimized for quick component lookup and implementation support.

## Summary
- Tag: `ntv-card`
- Slug: `card`
- Package: `@ntv360/component-pantry`
- Source: `component-pantry/card/card.manifest.ts`
- Playground controls: 9
- Properties: 13
- Demos: 7

## Description
A flexible and customizable card component with comprehensive styling options.

## Features
- Visual variants - default, elevated, outlined, filled
- Border radius options - none, sm, md, lg, xl, full
- Shadow customization - none, sm, md, lg, xl
- Custom background and border colors (hex or CSS)
- Gradient background support
- Hover effects and clickable states with keyboard accessibility
- Full-width layout option
- Borderless cards via noBorder
- Dark mode awareness via adaptToTheme
- Content projection with ng-content (content-driven sizing)
- DRY configuration pattern via single [config] input

## Playground Controls
| Control | Type | Default | Label | Description | Options | Content |
| --- | --- | --- | --- | --- | --- | --- |
| `variant` | `select` | `default` | Variant | Visual style variant of the card | default, elevated, outlined, filled | no |
| `rounded` | `select` | `md` | Rounded | Border radius style | none, sm, md, lg, xl, full | no |
| `shadow` | `select` | `sm` | Shadow | Shadow intensity | none, sm, md, lg, xl | no |
| `hoverEffect` | `boolean` | `false` | Hover Effect | Whether to apply hover effects on the card |  | no |
| `clickable` | `boolean` | `false` | Clickable | Whether the card is clickable (adds pointer cursor and emits cardClick) |  | no |
| `fullWidth` | `boolean` | `false` | Full Width | Whether the card should take the full width of its container |  | no |
| `noBorder` | `boolean` | `false` | No Border | Whether to remove the card border |  | no |
| `backgroundColor` | `text` | `` | Background Color | Custom background color (hex or CSS color) |  | no |
| `borderColor` | `text` | `` | Border Color | Custom border color (hex or CSS color) |  | no |

## Properties
| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `variant` | `'default' \| 'elevated' \| 'outlined' \| 'filled'` | no | `'default'` | Visual style variant of the card |
| `rounded` | `'none' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | no | `'md'` | Border radius style of the card |
| `shadow` | `'none' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | no | `'sm'` | Shadow intensity of the card |
| `backgroundColor` | `string` | no | `''` | Custom background color (hex or CSS color value) |
| `borderColor` | `string` | no | `''` | Custom border color (hex or CSS color value) |
| `gradient` | `string` | no | `''` | CSS gradient background, e.g. 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' |
| `hoverEffect` | `boolean` | no | `false` | Whether to apply hover effects on the card |
| `clickable` | `boolean` | no | `false` | Whether the card is clickable (enables cardClick and keyboard support) |
| `fullWidth` | `boolean` | no | `false` | Whether the card should take full width of its container |
| `adaptToTheme` | `boolean` | no | `true` | Whether custom colors adapt to dark mode |
| `noBorder` | `boolean` | no | `false` | Whether to remove the border from the card |
| `config` | `Partial<CardConfig>` | no | `undefined` | DRY configuration object - merges with individual property inputs |
| `cardClick` | `EventEmitter<Event>` | no | `N/A` | Emitted when a clickable card is clicked (also triggered by Enter / Space keys) |

## Demos
### 1. Basic Usage

- Category: Usage
- Component type: universal
- Layout: horizontal
- Gap: 1rem
- Component tag: ntv-card

Simple card with default styling

#### Instance 1: Default

- Label: Default
- Variant: default

Content:

```html
<p style="padding:1rem">Default card content</p>
```

Code example:

```html
<ntv-card variant="default">
  <p>Default card content</p>
</ntv-card>
```

### 2. Variants

- Category: Examples
- Component type: universal
- Layout: horizontal
- Gap: 1rem
- Component tag: ntv-card

Visual style variants: default, elevated, outlined, filled

#### Instance 1: Default

- Label: Default
- Variant: default

Content:

```html
<p style="padding:1rem">Default</p>
```

#### Instance 2: Elevated

- Label: Elevated
- Variant: elevated

Content:

```html
<p style="padding:1rem">Elevated</p>
```

#### Instance 3: Outlined

- Label: Outlined
- Variant: outlined

Content:

```html
<p style="padding:1rem">Outlined</p>
```

#### Instance 4: Filled

- Label: Filled
- Variant: filled

Content:

```html
<p style="padding:1rem">Filled</p>
```

### 3. Shadow Levels

- Category: Examples
- Component type: universal
- Layout: horizontal
- Gap: 1.5rem
- Component tag: ntv-card

Shadow intensity options

#### Instance 1: No Shadow

- Label: No Shadow
- Variant: default

Config entries:
- `shadow`: `none`

Content:

```html
<p style="padding:1rem">shadow: none</p>
```

#### Instance 2: Small

- Label: Small
- Variant: default

Config entries:
- `shadow`: `sm`

Content:

```html
<p style="padding:1rem">shadow: sm</p>
```

#### Instance 3: Medium

- Label: Medium
- Variant: default

Config entries:
- `shadow`: `md`

Content:

```html
<p style="padding:1rem">shadow: md</p>
```

#### Instance 4: Large

- Label: Large
- Variant: default

Config entries:
- `shadow`: `lg`

Content:

```html
<p style="padding:1rem">shadow: lg</p>
```

#### Instance 5: Extra Large

- Label: Extra Large
- Variant: default

Config entries:
- `shadow`: `xl`

Content:

```html
<p style="padding:1rem">shadow: xl</p>
```

### 4. Border Radius

- Category: Examples
- Component type: universal
- Layout: horizontal
- Gap: 1rem
- Component tag: ntv-card

Border radius options

#### Instance 1: None

- Label: None
- Variant: outlined

Config entries:
- `rounded`: `none`

Content:

```html
<p style="padding:1rem">rounded: none</p>
```

#### Instance 2: Small

- Label: Small
- Variant: outlined

Config entries:
- `rounded`: `sm`

Content:

```html
<p style="padding:1rem">rounded: sm</p>
```

#### Instance 3: Medium

- Label: Medium
- Variant: outlined

Config entries:
- `rounded`: `md`

Content:

```html
<p style="padding:1rem">rounded: md</p>
```

#### Instance 4: Large

- Label: Large
- Variant: outlined

Config entries:
- `rounded`: `lg`

Content:

```html
<p style="padding:1rem">rounded: lg</p>
```

#### Instance 5: Full

- Label: Full
- Variant: outlined

Config entries:
- `rounded`: `full`

Content:

```html
<p style="padding:1rem">rounded: full</p>
```

### 5. Clickable and Hover

- Category: Examples
- Component type: universal
- Layout: horizontal
- Gap: 1rem
- Component tag: ntv-card

Interactive card states with hover effects and click event

#### Instance 1: Hover Only

- Label: Hover Only
- Variant: elevated

Config entries:
- `hoverEffect`: `true`

Content:

```html
<p style="padding:1rem">Hover over me</p>
```

#### Instance 2: Clickable

- Label: Clickable
- Variant: outlined

Config entries:
- `clickable`: `true`
- `hoverEffect`: `true`

Content:

```html
<p style="padding:1rem">Click me</p>
```

Code example:

```html
<ntv-card [clickable]="true" [hoverEffect]="true" (cardClick)="handleClick($event)">
  <p>Click me</p>
</ntv-card>
```

### 6. Custom Colors

- Category: Examples
- Component type: universal
- Layout: horizontal
- Gap: 1rem
- Component tag: ntv-card

Custom background color, border color, and gradient

#### Instance 1: Custom Background

- Label: Custom Background
- Variant: default

Config entries:
- `backgroundColor`: `#EEF7DF`
- `borderColor`: `#8DCB2C`

Content:

```html
<p style="padding:1rem">Custom background & border</p>
```

#### Instance 2: Gradient

- Label: Gradient
- Variant: default

Config entries:
- `gradient`: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- `noBorder`: `true`

Content:

```html
<p style="padding:1rem;color:#fff">Gradient card</p>
```

Code example:

```html
<ntv-card [noBorder]="true" gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
  <p>Gradient card</p>
</ntv-card>
```

### 7. Config Pattern

- Category: Configuration
- Component type: universal
- Layout: horizontal
- Gap: 1rem
- Component tag: ntv-card

Using the DRY config object pattern

#### Instance 1: Config Object

- Label: Config Object

Config entries:
- `config`: `{"variant":"elevated","rounded":"lg","shadow":"md","hoverEffect":true,"clickable":true}`

Content:

```html
<p style="padding:1rem">DRY config card</p>
```

Code example:

```html
cardConfig = {
  variant: 'elevated',
  rounded: 'lg',
  shadow: 'md',
  hoverEffect: true,
  clickable: true,
};
<ntv-card [config]="cardConfig" (cardClick)="onCardClick($event)">
  <p>DRY config card</p>
</ntv-card>
```
