---
tags:
  - component-docs
  - ntv360
  - component-pantry
  - carousel
---

# Component: Carousel

Read this file after selecting it from the component index. It is optimized for quick component lookup and implementation support.

## Summary
- Tag: `ntv-carousel`
- Slug: `carousel`
- Package: `@ntv360/component-pantry`
- Source: `component-pantry/carousel/carousel.manifest.ts`
- Playground controls: 10
- Properties: 34
- Demos: 7

## Description
An advanced carousel component with thumbnail gallery integration for rich media display.

## Features
- Thumbnail gallery left panel + main media right panel layout
- Multiple sizes - sm, md, lg, xl (with responsive defaults)
- Visual variants - default, bordered, shadow, rounded
- Horizontal and vertical layouts
- Navigation controls - arrows, dots, both, or none
- Autoplay with configurable speeds - slow (5s), normal (3s), fast (1.5s)
- Infinite loop scrolling
- Draggable thumbnail reordering
- Touch/swipe support for mobile devices
- Keyboard navigation (arrow keys, Enter)
- Loading/shimmer state
- Items per view control for multi-item display
- Configurable thumbnail panel sizing
- Event emissions: select, itemClick, navigationChange, autoplayChange
- DRY configuration pattern via single [config] input

## Playground Controls
| Control | Type | Default | Label | Description | Options | Content |
| --- | --- | --- | --- | --- | --- | --- |
| `size` | `select` | `md` | Size | Size variant of the carousel (affects height and width defaults) | sm, md, lg, xl | no |
| `variant` | `select` | `default` | Variant | Visual style variant of the carousel | default, bordered, shadow, rounded | no |
| `navigation` | `select` | `both` | Navigation | Navigation control type to show | arrows, dots, both, none | no |
| `autoplay` | `select` | `none` | Autoplay | Autoplay speed (none=disabled, slow=5s, normal=3s, fast=1.5s) | none, slow, normal, fast | no |
| `layout` | `select` | `horizontal` | Layout | Direction layout of the carousel | horizontal, vertical | no |
| `infinite` | `boolean` | `false` | Infinite | Whether to enable infinite loop scrolling |  | no |
| `showIndicators` | `boolean` | `true` | Show Indicators | Whether to show dot page indicator navigation |  | no |
| `showArrows` | `boolean` | `true` | Show Arrows | Whether to show previous/next arrow navigation |  | no |
| `isLoading` | `boolean` | `false` | Loading | Whether the carousel is in a loading/shimmer state |  | no |
| `draggable` | `boolean` | `false` | Draggable Thumbnails | Whether thumbnails in the left panel can be dragged to reorder |  | no |

## Properties
| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `items` | `CarouselItemInput[]` | yes | `[]` | Array of carousel items with id, name, thumbnail (left panel), url (right panel) |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | no | `'md'` | Size variant of the carousel |
| `variant` | `'default' \| 'bordered' \| 'shadow' \| 'rounded'` | no | `'default'` | Visual style variant |
| `layout` | `'horizontal' \| 'vertical'` | no | `'horizontal'` | Layout direction |
| `navigation` | `'arrows' \| 'dots' \| 'both' \| 'none'` | no | `'both'` | Navigation control type |
| `autoplay` | `'none' \| 'slow' \| 'normal' \| 'fast'` | no | `'none'` | Autoplay speed (none=off, slow=5s, normal=3s, fast=1.5s) |
| `showIndicators` | `boolean` | no | `true` | Whether to show dot page indicators |
| `showArrows` | `boolean` | no | `true` | Whether to show navigation arrows |
| `infinite` | `boolean` | no | `false` | Whether to enable infinite loop scrolling |
| `draggable` | `boolean` | no | `false` | Whether thumbnails in the left panel can be dragged to reorder |
| `isLoading` | `boolean` | no | `false` | Whether to show the loading/shimmer state |
| `itemsPerView` | `number` | no | `1` | Number of items visible at once |
| `gap` | `string` | no | `'1rem'` | Gap spacing between items |
| `height` | `string` | no | `'auto'` | Height of the carousel container (overrides size default) |
| `width` | `string` | no | `'100%'` | Width of the carousel container |
| `mainPanelWidth` | `string` | no | `'570px'` | Width of the right main media panel |
| `mainPanelHeight` | `string` | no | `'380px'` | Max height of the right main media panel |
| `mainPanelMediaHeight` | `string` | no | `'380px'` | Height of the expanded thumbnail preview media area |
| `mainPanelMediaWidth` | `string` | no | `'100%'` | Width of the expanded thumbnail preview media area |
| `mainPanelMediaMinHeight` | `string` | no | `'380px'` | Minimum height of the expanded thumbnail preview media area |
| `thumbnailColumns` | `number` | no | `6` | Number of columns in the thumbnail grid |
| `thumbnailTitleSize` | `string` | no | `''` | Font size for thumbnail title text |
| `thumbnailWidthOverride` | `string` | no | `'167px'` | Optional width override for thumbnails (max 192px recommended) |
| `thumbnailHeightOverride` | `string` | no | `'140px'` | Optional height override for thumbnails (max 172px recommended) |
| `thumbnailGap` | `string` | no | `'10px'` | Horizontal gap between thumbnails |
| `thumbnailGapRow` | `string` | no | `'10px'` | Vertical gap between thumbnail rows |
| `thumbnailSurfaceHeight` | `string \| undefined` | no | `undefined` | Max height of the thumbnail panel. Content scrolls when exceeding this. |
| `videoAutoplay` | `boolean` | no | `true` | Whether to autoplay video in the main panel when selected |
| `carouselTotalDuration` | `string \| undefined` | no | `undefined` | Total duration label for channel content |
| `config` | `CarouselConfig` | no | `undefined` | DRY configuration object - merges with all individual property inputs |
| `select` | `EventEmitter<CarouselItemInput>` | no | `N/A` | Emitted when the selected item changes |
| `itemClick` | `EventEmitter<CarouselClickEvent>` | no | `N/A` | Emitted when a carousel item is clicked |
| `navigationChange` | `EventEmitter<CarouselNavigationEvent>` | no | `N/A` | Emitted when navigation occurs (prev, next, goto) |
| `autoplayChange` | `EventEmitter<CarouselAutoplayEvent>` | no | `N/A` | Emitted when autoplay state changes (start, stop, pause, resume) |

## Demos
### 1. Basic Usage

- Category: Usage
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-carousel

Carousel with image items showing the thumbnail and main panel layout

#### Instance 1: Image Carousel

- Label: Image Carousel

Config entries:
- `items`: `[{"id":"1","name":"Mountain Landscape","thumbnail":"https://picsum.photos/seed/1/300/200","url":"https://picsum.photos/seed/1/800/500"},{"id":"2","name":"City Skyline","thumbnail":"https://picsum.photos/seed/2/300/200","url":"https://picsum.photos/seed/2/800/500"},{"id":"3","name":"Forest Path","thumbnail":"https://picsum.photos/seed/3/300/200","url":"https://picsum.photos/seed/3/800/500"},{"id":"4","name":"Ocean Sunset","thumbnail":"https://picsum.photos/seed/4/300/200","url":"https://picsum.photos/seed/4/800/500"},{"id":"5","name":"Desert Dunes","thumbnail":"https://picsum.photos/seed/5/300/200","url":"https://picsum.photos/seed/5/800/500"}]`

Code example:

```html
items = [
  { id: '1', name: 'Mountain Landscape', thumbnail: '...', url: '...' },
  { id: '2', name: 'City Skyline', thumbnail: '...', url: '...' },
  { id: '3', name: 'Forest Path', thumbnail: '...', url: '...' },
];
<ntv-carousel [items]="items" (select)="onSelect($event)"></ntv-carousel>
```

### 2. Sizes

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 2rem
- Component tag: ntv-carousel

Available size options: sm, md, lg, xl

#### Instance 1: Small (sm)

- Label: Small (sm)

Config entries:
- `items`: `[{"id":"1","name":"Item 1","thumbnail":"https://picsum.photos/seed/10/300/200","url":"https://picsum.photos/seed/10/800/500"},{"id":"2","name":"Item 2","thumbnail":"https://picsum.photos/seed/11/300/200","url":"https://picsum.photos/seed/11/800/500"}]`

#### Instance 2: Medium (md)

- Label: Medium (md)

Config entries:
- `items`: `[{"id":"1","name":"Item 1","thumbnail":"https://picsum.photos/seed/10/300/200","url":"https://picsum.photos/seed/10/800/500"},{"id":"2","name":"Item 2","thumbnail":"https://picsum.photos/seed/11/300/200","url":"https://picsum.photos/seed/11/800/500"}]`

#### Instance 3: Large (lg)

- Label: Large (lg)

Config entries:
- `items`: `[{"id":"1","name":"Item 1","thumbnail":"https://picsum.photos/seed/10/300/200","url":"https://picsum.photos/seed/10/800/500"},{"id":"2","name":"Item 2","thumbnail":"https://picsum.photos/seed/11/300/200","url":"https://picsum.photos/seed/11/800/500"}]`

### 3. Variants

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 2rem
- Component tag: ntv-carousel

Visual style variants: default, bordered, shadow, rounded

#### Instance 1: Default

- Label: Default
- Variant: default

Config entries:
- `items`: `[{"id":"1","name":"Default Variant","thumbnail":"https://picsum.photos/seed/20/300/200","url":"https://picsum.photos/seed/20/800/500"},{"id":"2","name":"Item 2","thumbnail":"https://picsum.photos/seed/21/300/200","url":"https://picsum.photos/seed/21/800/500"}]`

#### Instance 2: Bordered

- Label: Bordered
- Variant: bordered

Config entries:
- `items`: `[{"id":"1","name":"Bordered Variant","thumbnail":"https://picsum.photos/seed/20/300/200","url":"https://picsum.photos/seed/20/800/500"},{"id":"2","name":"Item 2","thumbnail":"https://picsum.photos/seed/21/300/200","url":"https://picsum.photos/seed/21/800/500"}]`

#### Instance 3: Shadow

- Label: Shadow
- Variant: shadow

Config entries:
- `items`: `[{"id":"1","name":"Shadow Variant","thumbnail":"https://picsum.photos/seed/20/300/200","url":"https://picsum.photos/seed/20/800/500"},{"id":"2","name":"Item 2","thumbnail":"https://picsum.photos/seed/21/300/200","url":"https://picsum.photos/seed/21/800/500"}]`

#### Instance 4: Rounded

- Label: Rounded
- Variant: rounded

Config entries:
- `items`: `[{"id":"1","name":"Rounded Variant","thumbnail":"https://picsum.photos/seed/20/300/200","url":"https://picsum.photos/seed/20/800/500"},{"id":"2","name":"Item 2","thumbnail":"https://picsum.photos/seed/21/300/200","url":"https://picsum.photos/seed/21/800/500"}]`

### 4. Autoplay

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-carousel

Carousel with autoplay and infinite loop

#### Instance 1: Autoplay (Normal Speed)

- Label: Autoplay (Normal Speed)

Config entries:
- `autoplay`: `normal`
- `infinite`: `true`
- `items`: `[{"id":"1","name":"Slide 1","thumbnail":"https://picsum.photos/seed/30/300/200","url":"https://picsum.photos/seed/30/800/500"},{"id":"2","name":"Slide 2","thumbnail":"https://picsum.photos/seed/31/300/200","url":"https://picsum.photos/seed/31/800/500"},{"id":"3","name":"Slide 3","thumbnail":"https://picsum.photos/seed/32/300/200","url":"https://picsum.photos/seed/32/800/500"}]`

Code example:

```html
<ntv-carousel
  [items]="items"
  autoplay="normal"
  [infinite]="true">
</ntv-carousel>
```

### 5. Navigation Options

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 2rem
- Component tag: ntv-carousel

Different navigation control styles

#### Instance 1: Arrows Only

- Label: Arrows Only

Config entries:
- `navigation`: `arrows`
- `items`: `[{"id":"1","name":"Item 1","thumbnail":"https://picsum.photos/seed/40/300/200","url":"https://picsum.photos/seed/40/800/500"},{"id":"2","name":"Item 2","thumbnail":"https://picsum.photos/seed/41/300/200","url":"https://picsum.photos/seed/41/800/500"}]`

#### Instance 2: Dots Only

- Label: Dots Only

Config entries:
- `navigation`: `dots`
- `items`: `[{"id":"1","name":"Item 1","thumbnail":"https://picsum.photos/seed/40/300/200","url":"https://picsum.photos/seed/40/800/500"},{"id":"2","name":"Item 2","thumbnail":"https://picsum.photos/seed/41/300/200","url":"https://picsum.photos/seed/41/800/500"}]`

#### Instance 3: No Navigation

- Label: No Navigation

Config entries:
- `navigation`: `none`
- `items`: `[{"id":"1","name":"Item 1","thumbnail":"https://picsum.photos/seed/40/300/200","url":"https://picsum.photos/seed/40/800/500"},{"id":"2","name":"Item 2","thumbnail":"https://picsum.photos/seed/41/300/200","url":"https://picsum.photos/seed/41/800/500"}]`

### 6. Loading State

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-carousel

Shimmer loading state while items are being fetched

#### Instance 1: Loading

- Label: Loading

Config entries:
- `isLoading`: `true`
- `items`: `[{"id":"1","name":"Placeholder 1"},{"id":"2","name":"Placeholder 2"},{"id":"3","name":"Placeholder 3"}]`

Code example:

```html
<ntv-carousel [items]="placeholderItems" [isLoading]="true"></ntv-carousel>
```

### 7. Config Pattern

- Category: Configuration
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-carousel

Using the DRY config object pattern

#### Instance 1: Config Object

- Label: Config Object

Config entries:
- `config`: `{"size":"md","variant":"shadow","navigation":"both","autoplay":"slow","infinite":true}`
- `items`: `[{"id":"1","name":"Config Item 1","thumbnail":"https://picsum.photos/seed/50/300/200","url":"https://picsum.photos/seed/50/800/500"},{"id":"2","name":"Config Item 2","thumbnail":"https://picsum.photos/seed/51/300/200","url":"https://picsum.photos/seed/51/800/500"},{"id":"3","name":"Config Item 3","thumbnail":"https://picsum.photos/seed/52/300/200","url":"https://picsum.photos/seed/52/800/500"}]`

Code example:

```html
carouselConfig = {
  size: 'md',
  variant: 'shadow',
  navigation: 'both',
  autoplay: 'slow',
  infinite: true,
};
<ntv-carousel [config]="carouselConfig" [items]="items" (select)="onSelect($event)">
</ntv-carousel>
```
