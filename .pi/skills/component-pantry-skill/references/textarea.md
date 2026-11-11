---
tags:
  - component-docs
  - ntv360
  - component-pantry
  - textarea
---

# Component: Textarea

Read this file after selecting it from the component index. It is optimized for quick component lookup and implementation support.

## Summary
- Tag: `ntv-textarea`
- Slug: `textarea`
- Package: `@ntv360/component-pantry`
- Source: `component-pantry/textarea/textarea.manifest.ts`
- Playground controls: 12
- Properties: 16
- Demos: 7

## Description
A purpose-built multiline textarea component that mirrors the Input component's API while being optimized for longer text input.

## Features
- Multiline text input - Purpose-built for descriptions, comments, and long-form content
- Flexible sizing - Extra-small (xs), small (sm), medium (md), large (lg), extra-large (xl)
- Visual variants - Default, primary, success, error states + custom hex color support
- Enhanced UX - Clear button, placeholder text, character count display
- Form integration - Full reactive forms support with ControlValueAccessor
- Accessibility - ARIA labels, proper focus management
- Validation display - Error messages, info text, required field indicators
- Customizable styling - Border radius (none, sm, md, lg, xl), custom colors
- Character limit - Optional maxlength with character counter
- DRY configuration - Config object pattern reduces template verbosity
- Backward compatibility - Individual properties still supported

## Playground Controls
| Control | Type | Default | Label | Description | Options | Content |
| --- | --- | --- | --- | --- | --- | --- |
| `label` | `text` | `null` | Label | Label text displayed above the textarea |  | no |
| `placeholder` | `text` | `Enter your text...` | Placeholder | Placeholder text shown when textarea is empty |  | no |
| `size` | `select` | `md` | Size | Size variant of the textarea | xs, sm, md, lg, xl | no |
| `variant` | `select` | `default` | Variant | Visual variant (default, primary, success, error) or custom hex color | default, primary, success, error | no |
| `disabledInput` | `boolean` | `false` | Disabled | Whether the textarea is disabled |  | no |
| `clearable` | `boolean` | `false` | Clearable | Whether to show a clear button when textarea has value |  | no |
| `required` | `boolean` | `false` | Required | Whether the field is required |  | no |
| `borderRadius` | `select` | `md` | Border Radius | Border radius of the textarea | none, sm, md, lg, xl | no |
| `showCharacterCount` | `boolean` | `false` | Show Character Count | Whether to show character count (useful with maxlength) |  | no |
| `maxlength` | `number` | `null` | Max Length | Maximum number of characters allowed |  | no |
| `info` | `text` | `null` | Info | Informational text displayed below the textarea |  | no |
| `error` | `text` | `null` | Error | Error message text |  | no |

## Properties
| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `id` | `string` | no | `''` | Unique identifier for the textarea element |
| `placeholder` | `string` | no | `'Enter your text...'` | Placeholder text displayed when textarea is empty |
| `required` | `boolean` | no | `false` | Whether the field is required |
| `disabledInput` | `boolean` | no | `false` | Whether the textarea is disabled |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | no | `'md'` | Size variant of the textarea |
| `borderRadius` | `'none' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| string` | no | `'md'` | Border radius style of the textarea |
| `clearable` | `boolean` | no | `false` | Whether to show a clear button when textarea has value |
| `variant` | `string` | no | `'default'` | Visual variant (default, primary, success, error) or custom hex color for theming |
| `label` | `string \| null` | no | `null` | Label text displayed above the textarea |
| `info` | `string \| null` | no | `null` | Informational text displayed below the textarea |
| `error` | `string \| null` | no | `null` | Error message text |
| `showError` | `boolean` | no | `true` | Whether to display error messages |
| `maxlength` | `number \| null` | no | `null` | Maximum number of characters allowed |
| `showCharacterCount` | `boolean` | no | `false` | Whether to show character count (useful with maxlength) |
| `config` | `Partial<TextareaConfig>` | no | `undefined` | Configuration object combining all textarea settings |
| `inputCleared` | `EventEmitter<boolean>` | no | `N/A` | Emits when the textarea is cleared |

## Demos
### 1. Basic Usage

- Category: Usage
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-textarea

Simple textarea with label and placeholder

#### Instance 1: Basic Textarea

- Label: Basic Textarea

Config entries:
- `label`: `Description`
- `placeholder`: `Enter your text...`

Code example:

```html
<ntv-textarea label="Description" placeholder="Enter your text..."></ntv-textarea>
```

### 2. Sizes

- Category: Examples
- Component type: universal
- Layout: horizontal
- Gap: 1rem
- Component tag: ntv-textarea

Size options (xs, sm, md, lg, xl)

#### Instance 1: Small

- Label: Small

Config entries:
- `placeholder`: `Small textarea...`

#### Instance 2: Medium

- Label: Medium

Config entries:
- `placeholder`: `Medium textarea...`

#### Instance 3: Large

- Label: Large

Config entries:
- `placeholder`: `Large textarea...`

### 3. With Clear Button

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-textarea

Textarea with clearable option

#### Instance 1: Clearable Textarea

- Label: Clearable Textarea

Config entries:
- `label`: `Comments`
- `placeholder`: `Type your comments...`
- `clearable`: `true`

Code example:

```html
<ntv-textarea label="Comments" placeholder="Type your comments..." [clearable]="true"></ntv-textarea>
```

### 4. Character Count

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-textarea

Textarea with maxlength and character counter

#### Instance 1: With Character Limit

- Label: With Character Limit

Config entries:
- `label`: `Bio (max 140 characters)`
- `placeholder`: `Tell us about yourself...`
- `maxlength`: `140`
- `showCharacterCount`: `true`
- `clearable`: `true`

Code example:

```html
<ntv-textarea
  label="Bio (max 140 characters)"
  placeholder="Tell us about yourself..."
  [maxlength]="140"
  [showCharacterCount]="true"
  [clearable]="true">
</ntv-textarea>
```

### 5. States

- Category: Examples
- Component type: universal
- Layout: horizontal
- Gap: 1rem
- Component tag: ntv-textarea

Disabled, required, and error states

#### Instance 1: Disabled

- Label: Disabled

Config entries:
- `label`: `Disabled`
- `placeholder`: `Cannot edit`
- `disabledInput`: `true`

#### Instance 2: Required

- Label: Required

Config entries:
- `label`: `Required Field`
- `placeholder`: `This field is required`
- `required`: `true`

#### Instance 3: Error

- Label: Error

Config entries:
- `label`: `Error State`
- `placeholder`: `Invalid input`
- `error`: `This field is required`

### 6. Variants

- Category: Examples
- Component type: universal
- Layout: horizontal
- Gap: 1rem
- Component tag: ntv-textarea

Visual style variants

#### Instance 1: Default

- Label: Default

Config entries:
- `label`: `Default`
- `placeholder`: `Default styling...`
- `variant`: `default`

#### Instance 2: Primary

- Label: Primary

Config entries:
- `label`: `Primary`
- `placeholder`: `Primary styling...`
- `variant`: `primary`

#### Instance 3: Success

- Label: Success

Config entries:
- `label`: `Success`
- `placeholder`: `Success styling...`
- `variant`: `success`

#### Instance 4: Error

- Label: Error

Config entries:
- `label`: `Error`
- `placeholder`: `Error styling...`
- `variant`: `error`

### 7. Config Pattern

- Category: Configuration
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-textarea

Using the DRY config object pattern

#### Instance 1: Config Object

- Label: Config Object

Config entries:
- `config`: `{"label":"Feedback","placeholder":"Share your feedback...","size":"lg","required":true,"clearable":true,"maxlength":500,"showCharacterCount":true}`

Code example:

```html
textareaConfig = {
  label: 'Feedback',
  placeholder: 'Share your feedback...',
  size: 'lg',
  required: true,
  clearable: true,
  maxlength: 500,
  showCharacterCount: true
};
<ntv-textarea [config]="textareaConfig"></ntv-textarea>
```
