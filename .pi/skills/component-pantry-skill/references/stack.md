---
tags:
  - component-docs
  - ntv360
  - component-pantry
  - stack
---

# Component: Stack

Read this file after selecting it from the component index. It is optimized for quick component lookup and implementation support.

## Summary
- Tag: `ntv-stack`
- Slug: `stack`
- Package: `@ntv360/component-pantry`
- Source: `component-pantry/stack/stack.manifest.ts`
- Playground controls: 2
- Properties: 3
- Demos: 3

## Description
A visual stacked card component that shows up to three layered thumbnails from an items array.

## Features
- Renders up to 3 cards with a staggered depth/offset effect (back → middle → front)
- Accepts an array of items where each can be a string (URL) or an object with `thumbnail` or `image` properties
- Label text above the stack
- Loading state shows skeleton placeholders via `ntv-skeleton`
- Index order: items[0] = front card, items[1] = middle, items[2] = back card

## Playground Controls
| Control | Type | Default | Label | Description | Options | Content |
| --- | --- | --- | --- | --- | --- | --- |
| `label` | `text` | `My Collection` | Label | Label text displayed above the stack |  | no |
| `loading` | `boolean` | `false` | Loading | When true, shows skeleton placeholders instead of images |  | no |

## Properties
| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `items` | `any[]` | no | `[]` | Array of items to display as stacked cards. Each item can be a URL string or an object with `thumbnail` or `image` string properties. The first item (index 0) appears as the front card. |
| `label` | `string` | no | `''` | Label text displayed above the stack |
| `loading` | `boolean` | no | `false` | When true, renders ntv-skeleton placeholders in place of images |

## Demos
### 1. Basic Usage

- Category: Usage
- Component type: universal
- Layout: horizontal
- Gap: 2rem
- Component tag: ntv-stack

Stack with image URLs as items

#### Instance 1: Image URLs

- Label: Image URLs

Config entries:
- `label`: `Photo Collection`
- `items`: `["https://picsum.photos/seed/a/200/200","https://picsum.photos/seed/b/200/200","https://picsum.photos/seed/c/200/200"]`

Code example:

```html
items = [
  'https://example.com/photo1.jpg',
  'https://example.com/photo2.jpg',
  'https://example.com/photo3.jpg',
];
<ntv-stack label="Photo Collection" [items]="items"></ntv-stack>
```

### 2. Object Items

- Category: Examples
- Component type: universal
- Layout: horizontal
- Gap: 2rem
- Component tag: ntv-stack

Stack with object items using thumbnail or image properties

#### Instance 1: With thumbnail property

- Label: With thumbnail property

Config entries:
- `label`: `Content Library`
- `items`: `[{"thumbnail":"https://picsum.photos/seed/p1/200/200","title":"Photo 1"},{"thumbnail":"https://picsum.photos/seed/p2/200/200","title":"Photo 2"},{"thumbnail":"https://picsum.photos/seed/p3/200/200","title":"Photo 3"}]`

Code example:

```html
items = [
  { thumbnail: '/img/thumb1.jpg', title: 'Item 1' },
  { thumbnail: '/img/thumb2.jpg', title: 'Item 2' },
  { thumbnail: '/img/thumb3.jpg', title: 'Item 3' },
];
<ntv-stack label="Content Library" [items]="items"></ntv-stack>
```

### 3. Loading State

- Category: Examples
- Component type: universal
- Layout: horizontal
- Gap: 2rem
- Component tag: ntv-stack

Stack with skeleton loading placeholders

#### Instance 1: Loading

- Label: Loading

Config entries:
- `label`: `Loading...`
- `loading`: `true`
- `items`: `[]`

#### Instance 2: Loaded

- Label: Loaded

Config entries:
- `label`: `Loaded`
- `loading`: `false`
- `items`: `["https://picsum.photos/seed/x1/200/200","https://picsum.photos/seed/x2/200/200","https://picsum.photos/seed/x3/200/200"]`
