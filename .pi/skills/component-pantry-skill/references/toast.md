---
tags:
  - component-docs
  - ntv360
  - component-pantry
  - toast
---

# Component: Toast

Read this file after selecting it from the component index. It is optimized for quick component lookup and implementation support.

## Summary
- Tag: `ntv-toast`
- Slug: `toast`
- Package: `@ntv360/component-pantry`
- Source: `component-pantry/toast/toast.manifest.ts`
- Playground controls: 5
- Properties: 12
- Demos: 6

## Description
A self-dismissing notification banner with progress bar, icon, and configurable positioning.

## Features
- 4 semantic variants: `success`, `error`, `warning`, `info`
- 6 screen positions: `top-left`, `top-center`, `top-right`, `bottom-left`, `bottom-center`, `bottom-right`
- Auto-dismiss timer with animated progress bar (rAF-based, left-to-right fill)
- `duration` of `0` disables auto-close (persistent toast)
- Dismissible close button (can be hidden)
- Optional progress bar (`showProgress`)
- Custom colour overrides for background, text, icon, and progress bar
- Smooth enter/leave CSS transitions
- Variant-mapped icons (check, x-circle, triangle-alert, info-circle)
- DRY `config` object pattern — overrides all individual inputs
- Output: `closed` emitted when the toast finishes closing

## Playground Controls
| Control | Type | Default | Label | Description | Options | Content |
| --- | --- | --- | --- | --- | --- | --- |
| `variant` | `select` | `info` |  | Semantic variant — controls icon and colour scheme | info, success, warning, error | no |
| `position` | `select` | `top-right` |  | Screen position of the toast | top-left, top-center, top-right, bottom-left, bottom-center, bottom-right | no |
| `duration` | `select` | `5000` |  | Auto-dismiss delay in ms (0 = no auto-close) | 0, 3000, 5000, 8000, 10000 | no |
| `dismissible` | `boolean` | `true` |  | Whether to show the close (×) button |  | no |
| `showProgress` | `boolean` | `true` |  | Whether to show the animated progress bar |  | no |

## Properties
| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `variant` | `'success'\|'error'\|'warning'\|'info'` | no | `'info'` | Semantic variant — determines icon and colour scheme. 'success' = green, 'error' = red, 'warning' = amber, 'info' = blue |
| `message` | `string` | no | `''` | The notification text to display inside the toast |
| `duration` | `number` | no | `5000` | Auto-dismiss delay in milliseconds. Set to 0 to disable auto-close (persistent). |
| `dismissible` | `boolean` | no | `true` | Whether to render the close (×) button allowing manual dismissal |
| `showProgress` | `boolean` | no | `true` | Whether to show the animated progress bar that fills left-to-right over the duration |
| `position` | `'top-left'\|'top-center'\|'top-right'\|'bottom-left'\|'bottom-center'\|'bottom-right'` | no | `'top-right'` | Fixed screen position of the toast notification |
| `customBackgroundColor` | `string` | no | `''` | CSS colour string to override the variant background colour (e.g. "#1a1a2e") |
| `customTextColor` | `string` | no | `''` | CSS colour string to override the variant text colour |
| `customIconColor` | `string` | no | `''` | CSS colour string to override the variant icon colour |
| `customProgressColor` | `string` | no | `''` | CSS colour string to override the progress bar fill colour |
| `config` | `Partial<ToastConfig>` | no | `{}` | DRY config object — overrides all individual inputs. Accepts: variant, message, duration, dismissible, showProgress, position, customBackgroundColor, customTextColor, customIconColor, customProgressColor. |
| `closed` | `EventEmitter<void>` | no | `N/A` | Emits when the toast finishes its close animation (after dismiss or auto-timeout) |

## Demos
### 1. Variants

- Category: Usage
- Component type: universal
- Layout: vertical
- Gap: 0.75rem
- Component tag: ntv-toast

All four semantic variants

#### Instance 1: Info

- Label: Info

Config entries:
- `variant`: `info`
- `message`: `Your session will expire in 10 minutes.`
- `duration`: `0`
- `position`: `top-right`

Code example:

```html
<ntv-toast variant="info" message="Your session will expire in 10 minutes." [duration]="0" (closed)="onClosed()">
</ntv-toast>
```

#### Instance 2: Success

- Label: Success

Config entries:
- `variant`: `success`
- `message`: `File uploaded successfully!`
- `duration`: `0`
- `position`: `top-right`

#### Instance 3: Warning

- Label: Warning

Config entries:
- `variant`: `warning`
- `message`: `Storage is almost full. Please free up space.`
- `duration`: `0`
- `position`: `top-right`

#### Instance 4: Error

- Label: Error

Config entries:
- `variant`: `error`
- `message`: `Failed to connect. Please check your network.`
- `duration`: `0`
- `position`: `top-right`

### 2. Positions

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 0.75rem
- Component tag: ntv-toast

Toast displayed in different screen positions

#### Instance 1: Top-Left

- Label: Top-Left

Config entries:
- `variant`: `info`
- `message`: `Notification (top-left)`
- `position`: `top-left`
- `duration`: `0`

#### Instance 2: Top-Center

- Label: Top-Center

Config entries:
- `variant`: `success`
- `message`: `Notification (top-center)`
- `position`: `top-center`
- `duration`: `0`

#### Instance 3: Bottom-Right

- Label: Bottom-Right

Config entries:
- `variant`: `warning`
- `message`: `Notification (bottom-right)`
- `position`: `bottom-right`
- `duration`: `0`

### 3. Auto-Dismiss with Progress

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 0.75rem
- Component tag: ntv-toast

Toast with a 5-second auto-dismiss timer and progress bar

#### Instance 1: Auto-Close (5s)

- Label: Auto-Close (5s)

Config entries:
- `variant`: `success`
- `message`: `Changes saved! This will close in 5 seconds.`
- `duration`: `5000`
- `showProgress`: `true`
- `position`: `top-right`

#### Instance 2: No Progress Bar

- Label: No Progress Bar

Config entries:
- `variant`: `info`
- `message`: `Auto-closing without progress bar.`
- `duration`: `5000`
- `showProgress`: `false`
- `position`: `top-right`

### 4. Persistent (No Auto-Close)

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 0.75rem
- Component tag: ntv-toast

Toast that must be manually dismissed

#### Instance 1: Persistent

- Label: Persistent

Config entries:
- `variant`: `error`
- `message`: `Critical error: action required. This will not auto-close.`
- `duration`: `0`
- `dismissible`: `true`
- `showProgress`: `false`
- `position`: `top-right`

Code example:

```html
<ntv-toast variant="error"
  message="Critical error: action required."
  [duration]="0"
  [dismissible]="true"
  [showProgress]="false"
  (closed)="onToastClosed()">
</ntv-toast>
```

### 5. Custom Colours

- Category: Configuration
- Component type: universal
- Layout: vertical
- Gap: 0.75rem
- Component tag: ntv-toast

Toast with brand-specific custom colour overrides

#### Instance 1: Custom Brand Colours

- Label: Custom Brand Colours

Config entries:
- `variant`: `info`
- `message`: `Custom branded notification with your colour palette.`
- `duration`: `0`
- `customBackgroundColor`: `#1a1a2e`
- `customTextColor`: `#e0e0e0`
- `customIconColor`: `#f5a623`
- `customProgressColor`: `#f5a623`
- `position`: `top-right`

Code example:

```html
<ntv-toast variant="info"
  message="Custom branded notification."
  [duration]="0"
  customBackgroundColor="#1a1a2e"
  customTextColor="#e0e0e0"
  customIconColor="#f5a623"
  customProgressColor="#f5a623">
</ntv-toast>
```

### 6. DRY Config Pattern

- Category: Configuration
- Component type: universal
- Layout: vertical
- Gap: 0.75rem
- Component tag: ntv-toast

Using the config object to configure the toast

#### Instance 1: Config Object

- Label: Config Object

Config entries:
- `config`: `{"variant":"success","message":"Export complete! Your file is ready to download.","duration":0,"dismissible":true,"showProgress":true,"position":"top-right"}`

Code example:

```html
toastConfig: ToastConfig = {
  variant: 'success',
  message: 'Export complete! Your file is ready to download.',
  duration: 0,
  dismissible: true,
  showProgress: true,
  position: 'top-right',
};
<ntv-toast [config]="toastConfig" (closed)="onClosed()"></ntv-toast>
```
