---
tags:
  - component-docs
  - ntv360
  - component-pantry
  - content-view
---

# Component: Content View

Read this file after selecting it from the component index. It is optimized for quick component lookup and implementation support.

## Summary
- Tag: `ntv-content-view`
- Slug: `content-view`
- Package: `@ntv360/component-pantry`
- Source: `component-pantry/content-view/content-view.manifest.ts`
- Playground controls: 7
- Properties: 38
- Demos: 4

## Description
A flexible content view component for displaying various types of content items.

## Features
- Multiple visual variants - default, card, list, grid, media
- Flexible sizing options - sm, md, lg, xl
- Layout options - vertical, horizontal
- Content types - text, image, video, mixed, feed
- Item selection with single/multi select
- Action buttons - delete, lock, settings, share, download, set-to-filter
- Loading, empty, and error states with custom messages
- Metadata display - author, date, tags, category, duration
- Navigation between items (previous/next)
- Modal integration for detail view
- Filter toggle support
- Max items limit
- Responsive design with mobile-first approach
- Accessibility via ARIA attributes
- DRY configuration pattern via single [config] input

## Playground Controls
| Control | Type | Default | Label | Description | Options | Content |
| --- | --- | --- | --- | --- | --- | --- |
| `variant` | `select` | `default` | Variant | Visual style variant of the content view | default, card, list, grid, media | no |
| `size` | `select` | `md` | Size | Size of the content view | sm, md, lg, xl | no |
| `layout` | `select` | `vertical` | Layout | Layout orientation | vertical, horizontal | no |
| `showImages` | `boolean` | `true` | Show Images | Whether to show images in content items |  | no |
| `showMetadata` | `boolean` | `true` | Show Metadata | Whether to show metadata (author, date, tags) |  | no |
| `showActions` | `boolean` | `true` | Show Actions | Whether to show action buttons |  | no |
| `allowSelection` | `boolean` | `false` | Allow Selection | Whether items can be selected |  | no |

## Properties
| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `items` | `ContentViewItem[]` | no | `[]` | Array of content items to display (id, title, type, description, imageUrl, videoUrl, metadata, actions) |
| `variant` | `'default' \| 'card' \| 'list' \| 'grid' \| 'media'` | no | `'default'` | Visual style variant |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | no | `'md'` | Size of the content view |
| `layout` | `'vertical' \| 'horizontal'` | no | `'vertical'` | Layout orientation |
| `showImages` | `boolean` | no | `true` | Whether to show images in content items |
| `showMetadata` | `boolean` | no | `true` | Whether to show metadata (author, date, tags, category) |
| `showActions` | `boolean` | no | `true` | Whether to show action buttons |
| `showDelete` | `boolean` | no | `true` | Whether to show the delete button |
| `canLock` | `boolean` | no | `true` | Whether to show the unlock/lock button |
| `openSettings` | `boolean` | no | `true` | Whether to show the settings button |
| `allowSelection` | `boolean` | no | `false` | Whether items can be selected via click |
| `maxItems` | `number \| undefined` | no | `undefined` | Maximum number of items to display |
| `emptyStateMessage` | `string` | no | `'No content available'` | Message shown when there are no items |
| `loadingMessage` | `string` | no | `'Loading content...'` | Message shown during loading state |
| `errorMessage` | `string` | no | `'Failed to load content'` | Message shown in error state |
| `loading` | `boolean` | no | `false` | Whether the component is in loading state |
| `error` | `boolean` | no | `false` | Whether the component is in error state |
| `isVisible` | `boolean` | no | `true` | Whether the modal is visible |
| `currentItemIndex` | `number` | no | `0` | Current item index for detail view navigation |
| `addSetToFilter` | `boolean` | no | `true` | Whether to show the Set to Filter control |
| `filterToggleState` | `boolean` | no | `false` | Initial toggle state for the filter control |
| `redirectUrl` | `string \| null` | no | `null` | URL to redirect to when opening feed/filler content |
| `modalConfig` | `Partial<ModalConfig>` | no | `undefined` | Modal configuration overrides for the detail view modal |
| `config` | `Partial<ContentViewConfig>` | no | `undefined` | DRY configuration object — merges with individual property inputs |
| `currentItemIndexChange` | `EventEmitter<number>` | no | `N/A` | Emitted when the current item index changes during navigation |
| `itemClick` | `EventEmitter<ContentViewItem>` | no | `N/A` | Emitted when a content item is clicked |
| `itemSelect` | `EventEmitter<ContentViewItem>` | no | `N/A` | Emitted when a content item is selected |
| `itemDeselect` | `EventEmitter<ContentViewItem>` | no | `N/A` | Emitted when a content item is deselected |
| `actionClick` | `EventEmitter<{ action: ContentViewAction; item: ContentViewItem }>` | no | `N/A` | Emitted when an action button is clicked |
| `shareClick` | `EventEmitter<ContentViewItem>` | no | `N/A` | Emitted when the share button is clicked |
| `settingsClick` | `EventEmitter<ContentViewItem>` | no | `N/A` | Emitted when the settings button is clicked |
| `downloadClick` | `EventEmitter<ContentViewItem>` | no | `N/A` | Emitted when the download button is clicked |
| `setToFilterClick` | `EventEmitter<void>` | no | `N/A` | Emitted when the Set to Filter button is clicked |
| `deleteClick` | `EventEmitter<void>` | no | `N/A` | Emitted when the delete button is clicked |
| `modalClose` | `EventEmitter<void>` | no | `N/A` | Emitted when the detail modal is closed |
| `previousClick` | `EventEmitter<number>` | no | `N/A` | Emitted when navigating to the previous item |
| `nextClick` | `EventEmitter<number>` | no | `N/A` | Emitted when navigating to the next item |
| `filterToggleChange` | `EventEmitter<boolean>` | no | `N/A` | Emitted when the filter toggle state changes |

## Demos
### 1. Basic Usage

- Category: Usage
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-content-view

Default content view with text and image items

#### Instance 1: Default

- Label: Default
- Variant: default

Config entries:
- `items`: `[{"id":"1","title":"Getting Started Guide","description":"Learn how to set up and use the component library.","type":"text","metadata":{"author":"Dev Team","date":"new Date('2025-01-15T00:00:00.000Z')","tags":["guide","setup"]}},{"id":"2","title":"Component Overview","description":"A brief overview of all available components.","type":"image","imageUrl":"https://picsum.photos/seed/101/400/300","metadata":{"author":"Design Team","date":"new Date('2025-02-01T00:00:00.000Z')"}},{"id":"3","title":"Video Tutorial","description":"Watch and learn with our video tutorial series.","type":"video","videoUrl":"https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4","metadata":{"duration":120}}]`

Code example:

```html
<ntv-content-view [items]="contentItems" (itemClick)="onItemClick($event)"></ntv-content-view>
```

### 2. Variants

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1.5rem
- Component tag: ntv-content-view

Visual style variants: default, card, list, grid, media

#### Instance 1: Card

- Label: Card
- Variant: card

Config entries:
- `items`: `[{"id":"1","title":"Card Item 1","description":"Card layout description.","type":"text"},{"id":"2","title":"Card Item 2","description":"Another card item.","type":"image","imageUrl":"https://picsum.photos/seed/102/400/300"}]`

#### Instance 2: List

- Label: List
- Variant: list

Config entries:
- `items`: `[{"id":"1","title":"List Item 1","description":"First list item.","type":"text"},{"id":"2","title":"List Item 2","description":"Second list item.","type":"text"},{"id":"3","title":"List Item 3","description":"Third list item.","type":"text"}]`

#### Instance 3: Grid

- Label: Grid
- Variant: grid

Config entries:
- `items`: `[{"id":"1","title":"Grid Item 1","type":"image","imageUrl":"https://picsum.photos/seed/103/400/300"},{"id":"2","title":"Grid Item 2","type":"image","imageUrl":"https://picsum.photos/seed/104/400/300"},{"id":"3","title":"Grid Item 3","type":"image","imageUrl":"https://picsum.photos/seed/105/400/300"}]`

#### Instance 4: Media

- Label: Media
- Variant: media

Config entries:
- `items`: `[{"id":"1","title":"Media Item","description":"Full-featured media view with details panel.","type":"image","imageUrl":"https://picsum.photos/seed/106/800/500","metadata":{"author":"Photographer","date":"new Date('2025-01-20T00:00:00.000Z')","duration":60}},{"id":"2","title":"Another Media Item","description":"Second media item.","type":"image","imageUrl":"https://picsum.photos/seed/107/800/500"}]`

### 3. Loading and Empty States

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-content-view

Loading, empty, and error state handling

#### Instance 1: Loading

- Label: Loading

Config entries:
- `loading`: `true`
- `items`: `[]`

#### Instance 2: Empty State

- Label: Empty State

Config entries:
- `items`: `[]`
- `emptyStateMessage`: `No content found. Try adjusting your filters.`

#### Instance 3: Error State

- Label: Error State

Config entries:
- `error`: `true`
- `items`: `[]`
- `errorMessage`: `Failed to load content. Please try again.`

### 4. Config Pattern

- Category: Configuration
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-content-view

Using the DRY config object pattern

#### Instance 1: Config Object

- Label: Config Object

Config entries:
- `config`: `{"variant":"grid","size":"md","layout":"vertical","showImages":true,"showMetadata":false,"allowSelection":true}`
- `items`: `[{"id":"1","title":"Config Grid Item 1","type":"image","imageUrl":"https://picsum.photos/seed/108/400/300"},{"id":"2","title":"Config Grid Item 2","type":"image","imageUrl":"https://picsum.photos/seed/109/400/300"}]`

Code example:

```html
contentConfig = {
  variant: 'grid',
  size: 'md',
  showImages: true,
  allowSelection: true,
};
<ntv-content-view [config]="contentConfig" [items]="items" (itemSelect)="onSelect($event)">
</ntv-content-view>
```
