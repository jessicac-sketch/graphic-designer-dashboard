---
tags:
  - component-docs
  - ntv360
  - component-pantry
  - thumbnail-preview
---

# Component: Thumbnail Preview

Read this file after selecting it from the component index. It is optimized for quick component lookup and implementation support.

## Summary
- Tag: `ntv-thumbnail-preview`
- Slug: `thumbnail-preview`
- Package: `@ntv360/component-pantry`
- Source: `component-pantry/thumbnail-preview/thumbnail-preview.manifest.ts`
- Playground controls: 6
- Properties: 23
- Demos: 5

## Description
A single media thumbnail card with hover, title overlay, action buttons, lightbox, and selection state.

## Features
- 8 size presets: `xs` (197×161), `sm` (240×160), `md` (353×238), `lg` (480×320), `xl` (640×426), `expanded` (auto), `carousel-md`, `carousel-lg`
- 4 visual variants: `default`, `bordered`, `shadow`, `elevated`
- 6 border-radius options: `none`, `sm`, `md`, `lg`, `xl`, `full`
- Hover scale / shadow effects (configurable)
- Title, tag, details, and type-category overlay shown on hover
- Action buttons: edit, delete (shown on hover)
- Selected state (green border highlight)
- Loading state with Lottie animation
- Lightbox on preview with auto-play for video assets
- Supports image and video thumbnails; falls back to placeholder on error
- Custom width/height overrides via CSS variables
- DRY `config` object pattern; `data` object for content
- Outputs: `previewClick`, `actionClick`, `mouseEnter`, `mouseLeave`

## Playground Controls
| Control | Type | Default | Label | Description | Options | Content |
| --- | --- | --- | --- | --- | --- | --- |
| `size` | `select` | `md` | Size | Preset size controlling width and height | xs, sm, md, lg, xl, expanded, carousel-md, carousel-lg | no |
| `variant` | `select` | `default` | Variant | Visual style applied to the card | default, bordered, shadow, elevated | no |
| `rounded` | `select` | `lg` | Rounded | Border radius variant | none, sm, md, lg, xl, full | no |
| `hoverEffects` | `boolean` | `true` | Hover Effects | Whether to apply scale/shadow effects on hover |  | no |
| `showActionButtons` | `boolean` | `true` | Action Buttons | Whether to show edit/delete action buttons on hover |  | no |
| `selected` | `boolean` | `false` | Selected | Whether the preview shows a persistent selection border |  | no |

## Properties
| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `thumbnailSrc` | `string` | no | `''` | Direct thumbnail image/video URL; takes precedence over data.src |
| `data` | `ThumbnailPreviewData` | no | `undefined` | Content data object: { id?, title?, tag?, tagVariant?, details?, src?, url?, alt?, type? ('image'\|'video'\|...), metadata? }. Used for the overlay text and lightbox. |
| `config` | `ThumbnailPreviewConfig` | no | `undefined` | DRY config object — overrides all individual inputs. Accepts: size, variant, rounded, hoverEffects, canHover, showContentOnHover, showActionButtons, clickable, width, height. |
| `size` | `'xs'\|'sm'\|'md'\|'lg'\|'xl'\|'expanded'\|'carousel-md'\|'carousel-lg'` | no | `'md'` | Size preset. xs=197×161 \| sm=240×160 \| md=353×238 \| lg=480×320 \| xl=640×426 \| expanded=auto |
| `variant` | `'default'\|'bordered'\|'shadow'\|'elevated'` | no | `'default'` | Visual style of the card |
| `rounded` | `'none'\|'sm'\|'md'\|'lg'\|'xl'\|'full'` | no | `'lg'` | Border radius preset |
| `hoverEffects` | `boolean` | no | `true` | Whether to apply hover scale/shadow effects (only when thumbnail data is present) |
| `canHover` | `boolean` | no | `true` | When false, the hovered visual style is applied permanently (useful for selected/expanded states) |
| `showContentOnHover` | `boolean` | no | `true` | Whether the title/tag/details overlay is only visible on hover |
| `showActionButtons` | `boolean` | no | `true` | Whether to show edit and delete action buttons on hover |
| `clickable` | `boolean` | no | `true` | Whether the preview responds to click events |
| `selected` | `boolean` | no | `false` | Whether to show a persistent green selection border |
| `loading` | `boolean` | no | `false` | Whether to show a Lottie loading animation overlay |
| `fileName` | `string` | no | `''` | File name or extension for media-type detection (determines if video controls and duration input are shown in expanded view) |
| `ariaLabel` | `string` | no | `''` | Aria-label for the preview container (accessibility) |
| `width` | `string` | no | `''` | Custom width override (any CSS value, e.g. "300px"). Overrides size preset. |
| `height` | `string` | no | `''` | Custom height override (any CSS value, e.g. "200px"). Overrides size preset. |
| `showDefaultMedia` | `boolean` | no | `true` | Whether to render the native img/video element |
| `imageLoading` | `'lazy'\|'eager'` | no | `'lazy'` | Native image loading attribute strategy. Use 'eager' for the main panel. |
| `previewClick` | `EventEmitter<ThumbnailPreviewClickEvent>` | no | `N/A` | Emits { data, event } when the preview is clicked |
| `actionClick` | `EventEmitter<ThumbnailPreviewActionEvent>` | no | `N/A` | Emits { action ('edit'\|'delete'), data, event } when an action button is clicked |
| `mouseEnter` | `EventEmitter<ThumbnailPreviewData \| null>` | no | `N/A` | Emits the data object when mouse enters the preview |
| `mouseLeave` | `EventEmitter<void>` | no | `N/A` | Emits when mouse leaves the preview |

## Demos
### 1. Basic Usage

- Category: Usage
- Component type: universal
- Layout: horizontal
- Gap: 1.5rem
- Component tag: ntv-thumbnail-preview

Single thumbnail preview with title and tag overlay

#### Instance 1: Image Preview

- Label: Image Preview

Config entries:
- `thumbnailSrc`: `https://picsum.photos/seed/tp1/700/470`
- `size`: `md`
- `data`: `{"title":"Mountain Landscape","tag":"Nature","tagVariant":"documentary","details":"Captured April 2024"}`

Code example:

```html
<ntv-thumbnail-preview
  thumbnailSrc="https://example.com/photo.jpg"
  [data]="{ title: 'Mountain Landscape', tag: 'Nature', tagVariant: 'documentary' }"
  size="md"
  (previewClick)="onPreviewClick($event)">
</ntv-thumbnail-preview>
```

### 2. Size Variants

- Category: Examples
- Component type: universal
- Layout: horizontal
- Gap: 1rem
- Component tag: ntv-thumbnail-preview

All available size presets

#### Instance 1: xs

- Label: xs

Config entries:
- `thumbnailSrc`: `https://picsum.photos/seed/tsxs/400/300`
- `size`: `xs`

#### Instance 2: sm

- Label: sm

Config entries:
- `thumbnailSrc`: `https://picsum.photos/seed/tssm/400/300`
- `size`: `sm`

#### Instance 3: md

- Label: md

Config entries:
- `thumbnailSrc`: `https://picsum.photos/seed/tsmd/400/300`
- `size`: `md`

#### Instance 4: lg

- Label: lg

Config entries:
- `thumbnailSrc`: `https://picsum.photos/seed/tslg/400/300`
- `size`: `lg`

### 3. Visual Variants

- Category: Examples
- Component type: universal
- Layout: horizontal
- Gap: 1rem
- Component tag: ntv-thumbnail-preview

Different card styles

#### Instance 1: Default

- Label: Default

Config entries:
- `thumbnailSrc`: `https://picsum.photos/seed/vd/400/300`
- `size`: `sm`
- `variant`: `default`

#### Instance 2: Bordered

- Label: Bordered

Config entries:
- `thumbnailSrc`: `https://picsum.photos/seed/vb/400/300`
- `size`: `sm`
- `variant`: `bordered`

#### Instance 3: Shadow

- Label: Shadow

Config entries:
- `thumbnailSrc`: `https://picsum.photos/seed/vs/400/300`
- `size`: `sm`
- `variant`: `shadow`

#### Instance 4: Elevated

- Label: Elevated

Config entries:
- `thumbnailSrc`: `https://picsum.photos/seed/ve/400/300`
- `size`: `sm`
- `variant`: `elevated`

### 4. Selected State

- Category: Examples
- Component type: universal
- Layout: horizontal
- Gap: 1rem
- Component tag: ntv-thumbnail-preview

Preview with persistent green selection border

#### Instance 1: Selected

- Label: Selected

Config entries:
- `thumbnailSrc`: `https://picsum.photos/seed/sel1/400/300`
- `size`: `sm`
- `selected`: `true`

#### Instance 2: Not Selected

- Label: Not Selected

Config entries:
- `thumbnailSrc`: `https://picsum.photos/seed/sel2/400/300`
- `size`: `sm`
- `selected`: `false`

### 5. DRY Config Pattern

- Category: Configuration
- Component type: universal
- Layout: horizontal
- Gap: 1rem
- Component tag: ntv-thumbnail-preview

Using config and data objects

#### Instance 1: Config Object

- Label: Config Object

Config entries:
- `config`: `{"size":"lg","variant":"shadow","rounded":"xl","hoverEffects":true,"showActionButtons":true}`
- `data`: `{"title":"Brand Campaign","tag":"Marketing","tagVariant":"documentary","details":"Q1 2024 Campaign","src":"https://picsum.photos/seed/cfg1/700/470"}`

Code example:

```html
previewConfig = { size: 'lg', variant: 'shadow', rounded: 'xl' };
previewData = { title: 'Brand Campaign', tag: 'Marketing', src: '/img/campaign.jpg' };

<ntv-thumbnail-preview [config]="previewConfig" [data]="previewData"
  (previewClick)="onPreviewClick($event)"
  (actionClick)="onActionClick($event)">
</ntv-thumbnail-preview>
```
