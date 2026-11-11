---
tags:
  - component-docs
  - ntv360
  - component-pantry
  - thumbnail-gallery
---

# Component: Thumbnail Gallery

Read this file after selecting it from the component index. It is optimized for quick component lookup and implementation support.

## Summary
- Tag: `ntv-thumbnail-gallery`
- Slug: `thumbnail-gallery`
- Package: `@ntv360/component-pantry`
- Source: `component-pantry/thumbnail-gallery/thumbnail-gallery.manifest.ts`
- Playground controls: 6
- Properties: 34
- Demos: 6

## Description
A media gallery component that renders a grid or list of thumbnail cards from an `items` array.

## Features
- Grid and list layouts with configurable columns and gap
- Size variants: `sm`, `md`, `lg`, `xl`, `channel-sm/md/lg/xl`
- Visual variants: `default`, `bordered`, `shadow`, `rounded`, `channel`
- Single and multi-select modes with checkbox support
- Drag-and-drop reorder via Angular CDK
- Right-click context menu with customizable actions (edit, copy, download, delete)
- Action buttons: eye icon, menu, favourite, edit, delete
- Per-item duration badge for video/audio types
- Custom info tags with colour, border-radius, and text overrides
- Animated empty state (Lottie "No Items Found" animation)
- DRY `config` object overrides all individual inputs
- Outputs: `itemClick`, `selectionChange`, `actionClick`, `contextMenu`, `itemsReorder`

## Playground Controls
| Control | Type | Default | Label | Description | Options | Content |
| --- | --- | --- | --- | --- | --- | --- |
| `size` | `select` | `md` | Size | Size preset for each thumbnail card | sm, md, lg, xl, channel-sm, channel-md, channel-lg, channel-xl | no |
| `variant` | `select` | `default` | Variant | Visual style of each thumbnail card | default, bordered, shadow, rounded, channel | no |
| `layout` | `select` | `grid` | Layout | Grid or list layout mode | grid, list | no |
| `columns` | `select` | `4` | Columns | Number of grid columns | 2, 3, 4, 5, 6 | no |
| `selectable` | `boolean` | `false` | Selectable | Whether items can be selected |  | no |
| `multiSelect` | `boolean` | `false` | Multi Select | Whether multiple items can be selected simultaneously |  | no |

## Properties
| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `items` | `ThumbnailItem[]` | no | `[]` | Array of media items to display. Each ThumbnailItem: { id, name, type ('image'\|'video'\|'document'\|'audio'\|'folder'\|...), src?, url?, thumbnail?, size?, modified?, metadata?, selected?, favorited?, duration?, showDuration?, infoTag* } |
| `config` | `ThumbnailConfig` | no | `undefined` | DRY config object — overrides all individual inputs. Accepts any ThumbnailConfig property: size, variant, layout, selectable, multiSelect, showLabels, columns, gap, etc. |
| `size` | `'sm'\|'md'\|'lg'\|'xl'\|'channel-sm'\|'channel-md'\|'channel-lg'\|'channel-xl'` | no | `'md'` | Size preset for thumbnail cards |
| `variant` | `'default'\|'bordered'\|'shadow'\|'rounded'\|'channel'` | no | `'default'` | Visual variant for thumbnail styling |
| `layout` | `'grid'\|'list'` | no | `'grid'` | Layout mode: grid (CSS Grid) or list (vertical) |
| `selectable` | `boolean` | no | `false` | Whether items are selectable (shows checkboxes) |
| `multiSelect` | `boolean` | no | `false` | Whether multiple items can be selected at once |
| `showLabels` | `boolean` | no | `true` | Whether to show item name labels below thumbnails |
| `showMetadata` | `boolean` | no | `false` | Whether to show item metadata (dimensions, duration, pages) |
| `showFileSize` | `boolean` | no | `false` | Whether to show the file size below the thumbnail |
| `showModified` | `boolean` | no | `false` | Whether to show the last-modified date |
| `showDuration` | `boolean` | no | `false` | Whether to show video/audio duration badge |
| `hoverEffects` | `boolean` | no | `true` | Whether to enable hover effects on items |
| `clickable` | `boolean` | no | `true` | Whether items respond to click events |
| `columns` | `number` | no | `4` | Number of columns in grid layout |
| `gap` | `string` | no | `'0.5rem'` | Gap between grid/list items (any CSS spacing value) |
| `draggable` | `boolean` | no | `false` | Whether items can be dragged to reorder (uses Angular CDK DragDrop). Emits itemsReorder on drop. |
| `showActionButtons` | `boolean` | no | `true` | Whether to show action buttons (eye, menu) on hover |
| `eyeIconVisible` | `boolean` | no | `true` | Whether to show the eye/preview icon button |
| `menuOptionVisible` | `boolean` | no | `false` | Whether to show the three-dot menu button |
| `showFavoriteIcon` | `boolean` | no | `false` | Whether to show the favourite icon on items |
| `showEditButton` | `boolean` | no | `false` | Whether to show an edit button on items |
| `showDeleteButton` | `boolean` | no | `false` | Whether to show a delete button on items |
| `disableRightClick` | `boolean` | no | `false` | Whether to disable the right-click context menu |
| `thumbnailWidth` | `string` | no | `''` | Custom thumbnail width (CSS value, e.g. "197px"). Overrides size-based width. |
| `thumbnailHeight` | `string` | no | `''` | Custom thumbnail height (CSS value, e.g. "172px"). Overrides size-based height. |
| `showThumbnailInfoTag` | `boolean` | no | `true` | Whether to show the info tag overlay on thumbnails |
| `textSize` | `string` | no | `''` | Custom font size for item labels (e.g. "14px", "0.875rem") |
| `contextMenuActions` | `ThumbnailAction[]` | no | `DEFAULT_THUMBNAIL_ACTIONS` | Array of context menu action objects: { type, label, icon?, disabled?, submenu?, divider? }. Defaults include edit, copy, download, delete. |
| `itemClick` | `EventEmitter<ThumbnailClickEvent>` | no | `N/A` | Emits { item, index, event } when a thumbnail is clicked |
| `selectionChange` | `EventEmitter<ThumbnailSelectionEvent>` | no | `N/A` | Emits { selectedItems, item, selected, event, source?, index? } when selection changes |
| `actionClick` | `EventEmitter<ThumbnailActionEvent>` | no | `N/A` | Emits { action, item, items?, event } when an action button is clicked |
| `contextMenu` | `EventEmitter<ThumbnailContextMenuEvent>` | no | `N/A` | Emits { item, x, y, event } when the right-click context menu is opened |
| `itemsReorder` | `EventEmitter<ThumbnailItem[]>` | no | `N/A` | Emits the full reordered items array after a drag-and-drop operation |

## Demos
### 1. Basic Grid

- Category: Usage
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-thumbnail-gallery

Default 4-column grid with image and video items

#### Instance 1: Image Grid

- Label: Image Grid

Config entries:
- `items`: `[{"id":"1","name":"Landscape.jpg","type":"image","src":"https://picsum.photos/seed/g1/400/300","thumbnail":"https://picsum.photos/seed/g1/400/300"},{"id":"2","name":"City Night.jpg","type":"image","src":"https://picsum.photos/seed/g2/400/300","thumbnail":"https://picsum.photos/seed/g2/400/300"},{"id":"3","name":"Mountains.jpg","type":"image","src":"https://picsum.photos/seed/g3/400/300","thumbnail":"https://picsum.photos/seed/g3/400/300"},{"id":"4","name":"Ocean.jpg","type":"image","src":"https://picsum.photos/seed/g4/400/300","thumbnail":"https://picsum.photos/seed/g4/400/300"}]`
- `columns`: `4`

Code example:

```html
<ntv-thumbnail-gallery [items]="items" [columns]="4" (itemClick)="onItemClick($event)"></ntv-thumbnail-gallery>
```

### 2. Size Variants

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 2rem
- Component tag: ntv-thumbnail-gallery

Different thumbnail sizes

#### Instance 1: Small (sm)

- Label: Small (sm)

Config entries:
- `size`: `sm`
- `columns`: `5`
- `items`: `[{"id":"s1","name":"Photo 1","type":"image","src":"https://picsum.photos/seed/s1/300/200","thumbnail":"https://picsum.photos/seed/s1/300/200"},{"id":"s2","name":"Photo 2","type":"image","src":"https://picsum.photos/seed/s2/300/200","thumbnail":"https://picsum.photos/seed/s2/300/200"},{"id":"s3","name":"Photo 3","type":"image","src":"https://picsum.photos/seed/s3/300/200","thumbnail":"https://picsum.photos/seed/s3/300/200"}]`

#### Instance 2: Large (lg)

- Label: Large (lg)

Config entries:
- `size`: `lg`
- `columns`: `3`
- `items`: `[{"id":"l1","name":"Large Photo 1","type":"image","src":"https://picsum.photos/seed/l1/600/400","thumbnail":"https://picsum.photos/seed/l1/600/400"},{"id":"l2","name":"Large Photo 2","type":"image","src":"https://picsum.photos/seed/l2/600/400","thumbnail":"https://picsum.photos/seed/l2/600/400"},{"id":"l3","name":"Large Photo 3","type":"image","src":"https://picsum.photos/seed/l3/600/400","thumbnail":"https://picsum.photos/seed/l3/600/400"}]`

### 3. Selectable Items

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-thumbnail-gallery

Multi-select gallery with checkboxes

#### Instance 1: Multi Select

- Label: Multi Select

Config entries:
- `selectable`: `true`
- `multiSelect`: `true`
- `columns`: `4`
- `items`: `[{"id":"ms1","name":"Select Me 1","type":"image","src":"https://picsum.photos/seed/ms1/400/300","thumbnail":"https://picsum.photos/seed/ms1/400/300"},{"id":"ms2","name":"Select Me 2","type":"image","src":"https://picsum.photos/seed/ms2/400/300","thumbnail":"https://picsum.photos/seed/ms2/400/300"},{"id":"ms3","name":"Select Me 3","type":"image","src":"https://picsum.photos/seed/ms3/400/300","thumbnail":"https://picsum.photos/seed/ms3/400/300"},{"id":"ms4","name":"Select Me 4","type":"image","src":"https://picsum.photos/seed/ms4/400/300","thumbnail":"https://picsum.photos/seed/ms4/400/300"}]`

Code example:

```html
<ntv-thumbnail-gallery [items]="items" [selectable]="true" [multiSelect]="true" (selectionChange)="onSelectionChange($event)">
</ntv-thumbnail-gallery>
```

### 4. List Layout

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-thumbnail-gallery

Items displayed in a vertical list with metadata

#### Instance 1: List with Metadata

- Label: List with Metadata

Config entries:
- `layout`: `list`
- `showLabels`: `true`
- `showFileSize`: `true`
- `showModified`: `true`
- `items`: `[{"id":"li1","name":"Report Q4.pdf","type":"document","size":"2.4 MB","modified":"new Date('2024-01-15T00:00:00.000Z')"},{"id":"li2","name":"Promo Video.mp4","type":"video","src":"https://picsum.photos/seed/v1/400/300","thumbnail":"https://picsum.photos/seed/v1/400/300","size":"18.7 MB","modified":"new Date('2024-01-12T00:00:00.000Z')","duration":"2:15"},{"id":"li3","name":"Brand Assets.zip","type":"archive","size":"45.2 MB","modified":"new Date('2024-01-10T00:00:00.000Z')"}]`

### 5. DRY Config Pattern

- Category: Configuration
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-thumbnail-gallery

Using the config object for full gallery configuration

#### Instance 1: Config Object

- Label: Config Object

Config entries:
- `config`: `{"size":"md","variant":"shadow","layout":"grid","columns":3,"selectable":true,"multiSelect":true,"showLabels":true,"showDuration":true,"hoverEffects":true,"gap":"1rem"}`
- `items`: `[{"id":"c1","name":"Product Shot","type":"image","src":"https://picsum.photos/seed/c1/400/300","thumbnail":"https://picsum.photos/seed/c1/400/300"},{"id":"c2","name":"Promo Clip","type":"video","src":"https://picsum.photos/seed/c2/400/300","thumbnail":"https://picsum.photos/seed/c2/400/300","duration":"0:45"},{"id":"c3","name":"Banner Art","type":"image","src":"https://picsum.photos/seed/c3/400/300","thumbnail":"https://picsum.photos/seed/c3/400/300"}]`

Code example:

```html
galleryConfig: ThumbnailConfig = {
  size: 'md',
  variant: 'shadow',
  layout: 'grid',
  columns: 3,
  selectable: true,
  multiSelect: true,
  showLabels: true,
  showDuration: true,
};
<ntv-thumbnail-gallery [items]="items" [config]="galleryConfig" (selectionChange)="onSelect($event)">
</ntv-thumbnail-gallery>
```

### 6. Empty State

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-thumbnail-gallery

Gallery with no items shows Lottie animation

#### Instance 1: No Items

- Label: No Items

Config entries:
- `items`: `[]`
