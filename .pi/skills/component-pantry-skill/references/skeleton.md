---
tags:
  - component-docs
  - ntv360
  - component-pantry
  - skeleton
---

# Component: Skeleton

Read this file after selecting it from the component index. It is optimized for quick component lookup and implementation support.

## Summary
- Tag: `ntv-skeleton`
- Slug: `skeleton`
- Package: `@ntv360/component-pantry`
- Source: `component-pantry/skeleton/skeleton.manifest.ts`
- Playground controls: 7
- Properties: 12
- Demos: 6

## Description
A shimmer skeleton loader component with automatic content detection.

## Features
- Multiple preset variants - text, title, avatar, thumbnail, image, button, card, list-item, paragraph, custom
- Automatic content dimension detection when wrapping content
- Shimmer, pulse, or no animation options
- Custom dimensions and colors (width, height, borderRadius, baseColor, highlightColor)
- Multiple lines for text/paragraph variants
- Composable for complex layouts
- Config object pattern for DRY usage

## Playground Controls
| Control | Type | Default | Label | Description | Options | Content |
| --- | --- | --- | --- | --- | --- | --- |
| `variant` | `select` | `text` | Variant | Shape/variant of the skeleton | text, title, avatar, thumbnail, image, button, card, list-item, paragraph, custom | no |
| `animation` | `select` | `shimmer` | Animation | Animation type | shimmer, pulse, none | no |
| `loading` | `boolean` | `true` | Loading | Whether the skeleton is visible |  | no |
| `lines` | `number` | `1` | Lines | Number of lines for text/paragraph variants |  | no |
| `width` | `text` | `` | Width | Custom width (CSS value) |  | no |
| `height` | `text` | `` | Height | Custom height (CSS value) |  | no |
| `borderRadius` | `text` | `` | Border Radius | Custom border radius (CSS value) |  | no |

## Properties
| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `variant` | `SkeletonVariant` | no | `'text'` | Shape/variant of the skeleton |
| `width` | `string` | no | `''` | Width (CSS value) |
| `height` | `string` | no | `''` | Height (CSS value) |
| `bordered` | `boolean` | no | `false` | Whether to show a border around the skeleton |
| `borderRadius` | `string` | no | `''` | Border radius (CSS value) |
| `lines` | `number` | no | `1` | Number of lines for text/paragraph variants |
| `animation` | `SkeletonAnimation` | no | `'shimmer'` | Animation type |
| `loading` | `boolean` | no | `true` | Whether skeleton is visible |
| `baseColor` | `string` | no | `''` | Custom base color |
| `highlightColor` | `string` | no | `''` | Custom highlight/shimmer color |
| `animationDuration` | `number` | no | `1.5` | Animation duration in seconds |
| `config` | `Partial<SkeletonConfig>` | no | `{}` | Configuration object |

## Demos
### 1. Basic Usage

- Category: Usage
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-skeleton

Simple skeleton with preset variant

#### Instance 1: Text Skeleton

- Label: Text Skeleton

Config entries:
- `variant`: `text`

Code example:

```html
<ntv-skeleton variant="text"></ntv-skeleton>
```

#### Instance 2: With Loading State

- Label: With Loading State

Config entries:
- `variant`: `text`
- `loading`: `true`

Rendered HTML example:

```html
<ntv-skeleton [loading]="true" variant="text">Content when loaded</ntv-skeleton>
```

Code example:

```html
<ntv-skeleton [loading]="isLoading"><div>Content when loaded</div></ntv-skeleton>
```

### 2. Variants

- Category: Examples
- Component type: universal
- Layout: horizontal
- Gap: 1rem
- Component tag: ntv-skeleton

Preset shape variants

#### Instance 1: Text

- Label: Text

Config entries:
- `variant`: `text`

#### Instance 2: Title

- Label: Title

Config entries:
- `variant`: `title`

#### Instance 3: Avatar

- Label: Avatar

Config entries:
- `variant`: `avatar`

#### Instance 4: Thumbnail

- Label: Thumbnail

Config entries:
- `variant`: `thumbnail`

#### Instance 5: Button

- Label: Button

Config entries:
- `variant`: `button`

### 3. Text & Paragraph

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-skeleton

Multiple lines for text content

#### Instance 1: Single Line

- Label: Single Line

Config entries:
- `variant`: `text`
- `lines`: `1`

#### Instance 2: Paragraph (3 lines)

- Label: Paragraph (3 lines)

Config entries:
- `variant`: `paragraph`
- `lines`: `3`

Code example:

```html
<ntv-skeleton variant="paragraph" [lines]="3"></ntv-skeleton>
```

### 4. Animations

- Category: Examples
- Component type: universal
- Layout: horizontal
- Gap: 1rem
- Component tag: ntv-skeleton

Shimmer, pulse, and none

#### Instance 1: Shimmer

- Label: Shimmer

Config entries:
- `animation`: `shimmer`

#### Instance 2: Pulse

- Label: Pulse

Config entries:
- `animation`: `pulse`

#### Instance 3: None

- Label: None

Config entries:
- `animation`: `none`

### 5. Card & List

- Category: Examples
- Component type: universal
- Layout: horizontal
- Gap: 1rem
- Component tag: ntv-skeleton

Composite variants for complex layouts

#### Instance 1: Card

- Label: Card

Config entries:
- `variant`: `card`

#### Instance 2: List Item

- Label: List Item

Config entries:
- `variant`: `list-item`

### 6. Config Pattern

- Category: Configuration
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-skeleton

Using the config object

#### Instance 1: Config Object

- Label: Config Object

Config entries:
- `config`: `{"variant":"image","animation":"pulse","loading":true}`

Code example:

```html
skeletonConfig = { variant: 'image', animation: 'pulse' };
<ntv-skeleton [config]="skeletonConfig"></ntv-skeleton>
```
