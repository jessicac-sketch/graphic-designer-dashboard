---
tags:
  - component-docs
  - ntv360
  - component-pantry
  - template
---

# Component: Template

Read this file after selecting it from the component index. It is optimized for quick component lookup and implementation support.

## Summary
- Tag: `ntv-template`
- Slug: `template`
- Package: `@ntv360/component-pantry`
- Source: `component-pantry/template/template.manifest.ts`
- Playground controls: 2
- Properties: 5
- Demos: 4

## Description
A digital-signage template layout renderer for positioning and displaying content zones.

## Features
- Renders an array of `ZoneData` zones positioned absolutely within a container
- Each zone uses percentage-based `xPos`, `yPos`, `width`, `height` relative to `containerWidth` / `containerHeight`
- Zones can be assigned a playlist via `playlistId`
- Playlists cycle automatically through IMAGE, VIDEO, TEXT, FEED, and FILLER content
- Configurable zone info overlay (`showZoneInfo`) showing zone metadata
- Configurable hover/selection effects (`showHoverEffects`)
- Clickable zones emit `zoneSelected` with the zone ID
- A zone list popover for navigating zones
- Powered by inner `ntv-zone` components with `ChangeDetectionStrategy.OnPush`

## Playground Controls
| Control | Type | Default | Label | Description | Options | Content |
| --- | --- | --- | --- | --- | --- | --- |
| `showZoneInfo` | `boolean` | `false` | Show Zone Info | Whether to show an information overlay on each zone |  | no |
| `showHoverEffects` | `boolean` | `true` | Show Hover Effects | Whether to apply hover and selection visual effects on zones |  | no |

## Properties
| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `zones` | `ZoneData[]` | no | `undefined` | Array of zone configuration objects. Each ZoneData:<br>- backgroundColor: string — CSS background color of the zone<br>- height: number — zone height as percentage of containerHeight<br>- width: number — zone width as percentage of containerWidth<br>- xPos: number — horizontal position as percentage of containerWidth<br>- yPos: number — vertical position as percentage of containerHeight<br>- zIndex: number — stacking order<br>- containerHeight: number — height of the parent container in px<br>- containerWidth: number — width of the parent container in px<br>- name: string — display name of the zone<br>- playlistId?: string — ID of the playlist to assign to this zone<br>- id?: string — unique zone identifier |
| `availablePlaylists` | `Playlist[]` | no | `[]` | Array of available playlists for zone assignment. Each Playlist:<br>- id: string — unique playlist identifier (matched to zone.playlistId)<br>- name: string — playlist display name<br>- description?: string<br>- createdAt?: Date<br>- contents: PlaylistContent[] — array of content items (IMAGE \| VIDEO \| TEXT \| FEED \| FILLER) |
| `showZoneInfo` | `boolean` | no | `false` | Whether to show an information overlay on each zone displaying zone metadata |
| `showHoverEffects` | `boolean` | no | `true` | Whether to apply hover and selection visual effects on zones |
| `zoneSelected` | `EventEmitter<string>` | no | `N/A` | Emits the zone ID (or name as fallback) when a zone is clicked |

## Demos
### 1. Basic Usage

- Category: Usage
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-template

Template with two zones side by side

#### Instance 1: Two Zones

- Label: Two Zones

Config entries:
- `zones`: `[{"id":"zone-1","name":"Main Zone","backgroundColor":"#1e293b","width":70,"height":100,"xPos":0,"yPos":0,"zIndex":1,"containerWidth":960,"containerHeight":540},{"id":"zone-2","name":"Side Zone","backgroundColor":"#334155","width":30,"height":100,"xPos":70,"yPos":0,"zIndex":1,"containerWidth":960,"containerHeight":540}]`
- `showZoneInfo`: `true`

Code example:

```html
zones = [
  {
    id: 'zone-1',
    name: 'Main Zone',
    backgroundColor: '#1e293b',
    width: 70, height: 100,
    xPos: 0, yPos: 0,
    zIndex: 1,
    containerWidth: 960, containerHeight: 540,
  },
  {
    id: 'zone-2',
    name: 'Side Zone',
    backgroundColor: '#334155',
    width: 30, height: 100,
    xPos: 70, yPos: 0,
    zIndex: 1,
    containerWidth: 960, containerHeight: 540,
  },
];
<ntv-template [zones]="zones" [showZoneInfo]="true" (zoneSelected)="onZoneSelected($event)"></ntv-template>
```

### 2. With Zones Info Overlay

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-template

Shows zone names and metadata on each zone panel

#### Instance 1: Zone Info Enabled

- Label: Zone Info Enabled

Config entries:
- `zones`: `[{"id":"z1","name":"Header","backgroundColor":"#6366f1","width":100,"height":20,"xPos":0,"yPos":0,"zIndex":1,"containerWidth":960,"containerHeight":540},{"id":"z2","name":"Body","backgroundColor":"#4f46e5","width":100,"height":60,"xPos":0,"yPos":20,"zIndex":1,"containerWidth":960,"containerHeight":540},{"id":"z3","name":"Footer","backgroundColor":"#4338ca","width":100,"height":20,"xPos":0,"yPos":80,"zIndex":1,"containerWidth":960,"containerHeight":540}]`
- `showZoneInfo`: `true`
- `showHoverEffects`: `true`

### 3. With Playlist Assignment

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-template

Zones with assigned playlists for content playback

#### Instance 1: Zone with Playlist

- Label: Zone with Playlist

Config entries:
- `zones`: `[{"id":"main","name":"Main Display","backgroundColor":"#0f172a","width":100,"height":100,"xPos":0,"yPos":0,"zIndex":1,"containerWidth":960,"containerHeight":540,"playlistId":"playlist-1"}]`
- `availablePlaylists`: `[{"id":"playlist-1","name":"Brand Showcase","contents":[{"id":"c1","title":"Slide 1","type":"IMAGE","src":"https://picsum.photos/seed/s1/960/540","duration":3},{"id":"c2","title":"Slide 2","type":"IMAGE","src":"https://picsum.photos/seed/s2/960/540","duration":3}]}]`
- `showZoneInfo`: `false`

Code example:

```html
zones = [
  {
    id: 'main', name: 'Main Display',
    backgroundColor: '#0f172a',
    width: 100, height: 100,
    xPos: 0, yPos: 0, zIndex: 1,
    containerWidth: 960, containerHeight: 540,
    playlistId: 'playlist-1',
  },
];
playlists = [
  {
    id: 'playlist-1',
    name: 'Brand Showcase',
    contents: [
      { id: 'c1', title: 'Slide 1', type: 'IMAGE', src: '/img/slide1.jpg', duration: 5 },
      { id: 'c2', title: 'Slide 2', type: 'IMAGE', src: '/img/slide2.jpg', duration: 5 },
    ],
  },
];
<ntv-template [zones]="zones" [availablePlaylists]="playlists" (zoneSelected)="onZoneSelected($event)">
</ntv-template>
```

### 4. Grid Layout

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-template

2×2 grid zone layout example

#### Instance 1: 2×2 Grid

- Label: 2×2 Grid

Config entries:
- `zones`: `[{"id":"tl","name":"Top Left","backgroundColor":"#1e3a5f","width":50,"height":50,"xPos":0,"yPos":0,"zIndex":1,"containerWidth":960,"containerHeight":540},{"id":"tr","name":"Top Right","backgroundColor":"#1d4ed8","width":50,"height":50,"xPos":50,"yPos":0,"zIndex":1,"containerWidth":960,"containerHeight":540},{"id":"bl","name":"Bottom Left","backgroundColor":"#1e40af","width":50,"height":50,"xPos":0,"yPos":50,"zIndex":1,"containerWidth":960,"containerHeight":540},{"id":"br","name":"Bottom Right","backgroundColor":"#1e3a8a","width":50,"height":50,"xPos":50,"yPos":50,"zIndex":1,"containerWidth":960,"containerHeight":540}]`
- `showZoneInfo`: `true`
- `showHoverEffects`: `true`
