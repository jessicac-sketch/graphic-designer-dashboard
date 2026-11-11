---
tags:
  - component-docs
  - ntv360
  - component-pantry
  - modal
---

# Component: Modal

Read this file after selecting it from the component index. It is optimized for quick component lookup and implementation support.

## Summary
- Tag: `ntv-modal`
- Slug: `modal`
- Package: `@ntv360/component-pantry`
- Source: `component-pantry/modal/modal.manifest.ts`
- Playground controls: 12
- Properties: 42
- Demos: 6

## Description
A highly configurable modal component with content projection support.

## Features
- **Content Projection** - Maximum flexibility for any content (forms, confirmations, custom content)
- **Multiple Variants** - Default, confirmation, success, error, loading
- **Flexible Sizing** - Small, medium, large, xlarge, confirmation, success, error, loading presets
- **Customizable Backdrop** - Blur, dark, none, glass, gradient
- **Accessibility** - Full ARIA support, keyboard navigation, focus management
- **Animation Support** - Configurable transitions and animations
- **Confirmation Dialogs** - Built-in layout with confirm/cancel buttons
- **Success/Error Alerts** - Lottie animations with status messaging
- **Loading State** - Loading indicator with optional message
- **DRY Configuration** - Config object pattern reduces template verbosity
- **Backward Compatibility** - Individual properties still supported

## Playground Controls
| Control | Type | Default | Label | Description | Options | Content |
| --- | --- | --- | --- | --- | --- | --- |
| `variant` | `select` | `default` | Variant | Modal display variant | default, confirmation, loading, success, error | no |
| `size` | `select` | `medium` | Size | Modal size preset | small, medium, large, xlarge, confirmation, success, error, loading | no |
| `position` | `select` | `center` | Position | Vertical position on screen | center, top, bottom | no |
| `backdrop` | `select` | `blur` | Backdrop | Backdrop style | blur, dark, none, glass, gradient | no |
| `closable` | `boolean` | `true` | Closable | Whether the modal shows a close button |  | no |
| `closeOnBackdrop` | `boolean` | `true` | Close on Backdrop | Whether clicking backdrop closes the modal |  | no |
| `closeOnEscape` | `boolean` | `true` | Close on Escape | Whether Escape key closes the modal |  | no |
| `showHeader` | `boolean` | `true` | Show Header | Whether to show the header section |  | no |
| `showFooter` | `boolean` | `false` | Show Footer | Whether to show the footer section |  | no |
| `headerTitle` | `text` | `Modal Title` | Header Title | Title text in the modal header |  | no |
| `scrollable` | `boolean` | `false` | Scrollable | Whether modal content is scrollable |  | no |
| `fullscreen` | `boolean` | `false` | Fullscreen | Whether modal is fullscreen |  | no |

## Properties
| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `size` | `ModalSizeVariant` | no | `'medium'` | Modal size preset |
| `variant` | `ModalVariant` | no | `'default'` | Modal display variant |
| `position` | `ModalPosition` | no | `'center'` | Vertical position on screen |
| `backdrop` | `ModalBackdrop` | no | `'blur'` | Backdrop style |
| `closable` | `boolean` | no | `true` | Whether the modal shows a close button |
| `closeOnBackdrop` | `boolean` | no | `true` | Whether clicking backdrop closes the modal |
| `closeOnEscape` | `boolean` | no | `true` | Whether Escape key closes the modal |
| `fullscreen` | `boolean` | no | `false` | Whether modal is fullscreen |
| `scrollable` | `boolean` | no | `false` | Whether content is scrollable |
| `centered` | `boolean` | no | `true` | Whether modal is centered vertically |
| `showHeader` | `boolean` | no | `true` | Whether to show the header |
| `showFooter` | `boolean` | no | `false` | Whether to show the footer |
| `headerTitle` | `string` | no | `''` | Header title text |
| `headerSubtitle` | `string` | no | `''` | Header subtitle text |
| `customClass` | `string` | no | `''` | Additional CSS classes |
| `animation` | `boolean` | no | `true` | Whether to show animations |
| `preventClose` | `boolean` | no | `false` | Prevent all closing actions |
| `grayBackground` | `boolean` | no | `true` | Whether to show gray backdrop |
| `modalWidth` | `string` | no | `''` | Custom modal width (overrides size preset) |
| `modalHeight` | `string` | no | `''` | Custom modal height |
| `confirmationTitle` | `string` | no | `'Confirm to Delete'` | Title for confirmation modal |
| `confirmationMessage` | `string` | no | `'Are you sure you want to delete this item?'` | Message for confirmation modal |
| `confirmButtonText` | `string` | no | `'Confirm'` | Confirm button text |
| `cancelButtonText` | `string` | no | `'Back'` | Cancel button text |
| `confirmButtonColor` | `string` | no | `'#8dcb2c'` | Confirm button color |
| `cancelButtonColor` | `string` | no | `'#f3f4f6'` | Cancel button color |
| `isLoading` | `boolean` | no | `false` | Whether confirm button is in loading state |
| `loadingText` | `string` | no | `'Processing...'` | Loading text when isLoading is true |
| `customIcon` | `string` | no | `''` | Custom icon SVG string for the modal |
| `alertTitle` | `string` | no | `''` | Title text for success/error alert variant |
| `alertDescription` | `string` | no | `''` | Description text for success/error alert variant |
| `alertButtonText` | `string` | no | `'OK'` | Button text for success/error alert variant |
| `loadingTitleInput` | `string` | no | `''` | Title text for loading variant modal |
| `loadingMessageInput` | `string` | no | `''` | Message text for loading variant modal |
| `config` | `ModalConfig` | no | `undefined` | Configuration object combining all modal settings |
| `isVisible` | `boolean` | no | `false` | Controls modal visibility |
| `modalOpen` | `EventEmitter<void>` | no | `N/A` | Emitted when modal opens |
| `modalClose` | `EventEmitter<void>` | no | `N/A` | Emitted when modal closes |
| `backdropClick` | `EventEmitter<void>` | no | `N/A` | Emitted on backdrop click |
| `escapeKey` | `EventEmitter<void>` | no | `N/A` | Emitted when Escape is pressed |
| `confirmClick` | `EventEmitter<void>` | no | `N/A` | Emitted when confirm button is clicked |
| `cancelClick` | `EventEmitter<void>` | no | `N/A` | Emitted when cancel button is clicked |

## Demos
### 1. Basic Usage

- Category: Usage
- Component type: modal-demo
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-modal

Simple modal with header and content projection

#### Instance 1: Default Modal

- Label: Default Modal

Config entries:
- `headerTitle`: `Modal Title`
- `headerSubtitle`: `Optional subtitle`
- `size`: `medium`
- `variant`: `default`

Rendered HTML example:

```html
<ntv-modal [isVisible]="true" headerTitle="Modal Title" size="medium">
  <div style="padding: 1rem;">
    <p>This is the main content area. You can put any content here including forms, text, or other components.</p>
  </div>
</ntv-modal>
```

Code example:

```html
<ntv-modal [isVisible]="showModal" headerTitle="Modal Title" (modalClose)="showModal = false">
  <div>Your content here</div>
</ntv-modal>
```

### 2. Sizes

- Category: Examples
- Component type: modal-demo
- Layout: horizontal
- Gap: 1rem
- Component tag: ntv-modal

Predefined size options

#### Instance 1: Small

- Label: Small

Config entries:
- `size`: `small`
- `headerTitle`: `Small Modal`

#### Instance 2: Medium

- Label: Medium

Config entries:
- `size`: `medium`
- `headerTitle`: `Medium Modal`

#### Instance 3: Large

- Label: Large

Config entries:
- `size`: `large`
- `headerTitle`: `Large Modal`

#### Instance 4: XLarge

- Label: XLarge

Config entries:
- `size`: `xlarge`
- `headerTitle`: `Extra Large Modal`

### 3. Variants

- Category: Examples
- Component type: modal-demo
- Layout: horizontal
- Gap: 1rem
- Component tag: ntv-modal

Modal display variants

#### Instance 1: Default

- Label: Default

Config entries:
- `variant`: `default`
- `headerTitle`: `Default`

#### Instance 2: Confirmation

- Label: Confirmation

Config entries:
- `variant`: `confirmation`
- `size`: `confirmation`
- `confirmationTitle`: `Confirm Action`
- `confirmationMessage`: `Are you sure you want to proceed?`

#### Instance 3: Success

- Label: Success

Config entries:
- `variant`: `success`
- `size`: `success`
- `alertTitle`: `Success!`
- `alertDescription`: `Your action was completed successfully.`
- `alertButtonText`: `OK`

#### Instance 4: Error

- Label: Error

Config entries:
- `variant`: `error`
- `size`: `error`
- `alertTitle`: `Error`
- `alertDescription`: `Something went wrong. Please try again.`
- `alertButtonText`: `Close`

### 4. Backdrop Styles

- Category: Examples
- Component type: modal-demo
- Layout: horizontal
- Gap: 1rem
- Component tag: ntv-modal

Different backdrop options

#### Instance 1: Blur

- Label: Blur

Config entries:
- `backdrop`: `blur`
- `headerTitle`: `Blur Backdrop`

#### Instance 2: Dark

- Label: Dark

Config entries:
- `backdrop`: `dark`
- `headerTitle`: `Dark Backdrop`

#### Instance 3: None

- Label: None

Config entries:
- `backdrop`: `none`
- `headerTitle`: `No Backdrop`

### 5. Confirmation Dialog

- Category: Examples
- Component type: modal-demo
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-modal

Delete confirmation with confirm/cancel buttons

#### Instance 1: Delete Confirmation

- Label: Delete Confirmation

Config entries:
- `variant`: `confirmation`
- `size`: `confirmation`
- `showHeader`: `false`
- `showFooter`: `false`
- `confirmationTitle`: `Confirm to Delete`
- `confirmationMessage`: `Are you sure you want to delete this item? This action cannot be undone.`
- `confirmButtonText`: `Delete`
- `cancelButtonText`: `Cancel`
- `confirmButtonColor`: `#dc2626`

Code example:

```html
<ntv-modal
  [isVisible]="showModal"
  variant="confirmation"
  size="confirmation"
  confirmationTitle="Confirm to Delete"
  confirmationMessage="Are you sure?"
  confirmButtonText="Delete"
  cancelButtonText="Cancel"
  (confirmClick)="onDelete(); showModal = false"
  (cancelClick)="showModal = false"
  (modalClose)="showModal = false">
</ntv-modal>
```

### 6. Config Pattern

- Category: Configuration
- Component type: modal-demo
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-modal

Using the DRY config object pattern

#### Instance 1: Config Object

- Label: Config Object

Config entries:
- `config`: `{"variant":"default","size":"medium","headerTitle":"Configured Modal","headerSubtitle":"Using config object","closable":true,"closeOnBackdrop":true,"showHeader":true}`

Code example:

```html
modalConfig = {
  variant: 'default',
  size: 'medium',
  headerTitle: 'Configured Modal',
  closable: true,
  closeOnBackdrop: true
};
<ntv-modal [config]="modalConfig" [isVisible]="showModal" (modalClose)="showModal = false">
  <div>Content here</div>
</ntv-modal>
```
