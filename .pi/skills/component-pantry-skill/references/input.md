---
tags:
  - component-docs
  - ntv360
  - component-pantry
  - input
---

# Component: Input

Read this file after selecting it from the component index. It is optimized for quick component lookup and implementation support.

## Summary
- Tag: `ntv-input`
- Slug: `input`
- Package: `@ntv360/component-pantry`
- Source: `component-pantry/input/input.manifest.ts`
- Playground controls: 15
- Properties: 26
- Demos: 9

## Description
A comprehensive and flexible input component with extensive customization and form integration capabilities.

## Features
- Multiple input types - Text, password, email, number with automatic validation
- Flexible sizing - Extra-small (xs), small (sm), medium (md), large (lg), extra-large (xl)
- Visual variants - Default, primary, success, danger states + custom hex color support
- Enhanced UX - Clear button, password visibility toggle, placeholder text
- Form integration - Full reactive forms support with ControlValueAccessor
- Accessibility - ARIA labels, proper focus management, screen reader support
- Validation display - Error messages, info text, required field indicators
- Customizable styling - Border radius (none, sm, md, lg, xl), custom colors, size variations
- Icon support - Left and right icon slots for enhanced UI
- Multiline - Textarea mode with optional character count
- DRY configuration - Config object pattern reduces template verbosity
- Backward compatibility - Individual properties still supported

## Playground Controls
| Control | Type | Default | Label | Description | Options | Content |
| --- | --- | --- | --- | --- | --- | --- |
| `label` | `text` | `null` | Label | Label text displayed above the input |  | no |
| `placeholder` | `text` | `Enter your text...` | Placeholder | Placeholder text shown when input is empty |  | no |
| `type` | `select` | `text` | Type | Input type (text, password, email, number) | text, password, email, number | no |
| `size` | `select` | `md` | Size | Size variant of the input | xs, sm, md, lg, xl | no |
| `variant` | `select` | `default` | Variant | Visual variant (default, primary, success, danger) or custom hex color | default, primary, success, danger | no |
| `disabledInput` | `boolean` | `false` | Disabled | Whether the input is disabled |  | no |
| `clearable` | `boolean` | `false` | Clearable | Whether to show a clear button when input has value |  | no |
| `readonly` | `boolean` | `false` | Readonly | Whether the input is readonly |  | no |
| `required` | `boolean` | `false` | Required | Whether the input field is required |  | no |
| `borderRadius` | `select` | `md` | Border Radius | Border radius of the input | none, sm, md, lg, xl | no |
| `multiline` | `boolean` | `false` | Multiline | Whether the input should be multiline (textarea) |  | no |
| `showCharCount` | `boolean` | `false` | Show Character Count | Whether to show character count (useful with maxLength) |  | no |
| `maxLength` | `number` | `null` | Max Length | Maximum allowed length for the input value |  | no |
| `info` | `text` | `null` | Info | Informational text displayed below the input |  | no |
| `error` | `text` | `null` | Error | Error message text |  | no |

## Properties
| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `type` | `'text' \| 'password' \| 'email' \| 'number'` | no | `'text'` | The input type |
| `id` | `string` | no | `''` | Unique identifier for the input element |
| `placeholder` | `string` | no | `'Enter your text...'` | Placeholder text displayed when input is empty |
| `required` | `boolean` | no | `false` | Whether the input field is required |
| `disabledInput` | `boolean` | no | `false` | Whether the input is disabled |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | no | `'md'` | Size variant of the input |
| `borderRadius` | `'none' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| string` | no | `'md'` | Border radius style of the input |
| `clearable` | `boolean` | no | `false` | Whether to show a clear button when input has value |
| `readonly` | `boolean` | no | `false` | Whether the input is readonly |
| `variant` | `string` | no | `'default'` | Visual variant (default, primary, success, danger) or custom hex color for theming |
| `borderColor` | `string \| null` | no | `null` | Border color for the input |
| `hoverBorderColor` | `string \| null` | no | `null` | Border color on hover |
| `focusBorderColor` | `string \| null` | no | `null` | Border color on focus |
| `textColor` | `string \| null` | no | `null` | Text color for the input |
| `placeholderColor` | `string \| null` | no | `null` | Placeholder text color |
| `label` | `string \| null` | no | `null` | Label text displayed above the input |
| `info` | `string \| null` | no | `null` | Informational text displayed below the input |
| `error` | `string \| null` | no | `null` | Error message text |
| `showError` | `boolean` | no | `true` | Whether to display error messages |
| `minValue` | `number \| null` | no | `null` | Minimum allowed value for number type inputs |
| `maxValue` | `number \| null` | no | `null` | Maximum allowed value for number type inputs |
| `maxLength` | `number \| null` | no | `null` | Maximum allowed length for the input value |
| `multiline` | `boolean` | no | `false` | Whether the input should be multiline (textarea) |
| `showCharCount` | `boolean` | no | `false` | Whether to show character count (useful with maxLength) |
| `config` | `Partial<InputConfig>` | no | `undefined` | Configuration object combining all input settings |
| `inputCleared` | `EventEmitter<boolean>` | no | `N/A` | Emits when the input is cleared |

## Demos
### 1. Basic Usage

- Category: Usage
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-input

Simple text input with label and placeholder

#### Instance 1: Basic Input

- Label: Basic Input

Config entries:
- `label`: `Email Address`
- `placeholder`: `Enter your email...`

Code example:

```html
<ntv-input label="Email Address" placeholder="Enter your email..."></ntv-input>
```

### 2. Input Types

- Category: Examples
- Component type: universal
- Layout: horizontal
- Gap: 1rem
- Component tag: ntv-input

Different input type options

#### Instance 1: Text

- Label: Text

Config entries:
- `type`: `text`
- `placeholder`: `Enter text...`

#### Instance 2: Email

- Label: Email

Config entries:
- `type`: `email`
- `placeholder`: `Enter email...`

#### Instance 3: Password

- Label: Password

Config entries:
- `type`: `password`
- `placeholder`: `Enter password...`

#### Instance 4: Number

- Label: Number

Config entries:
- `type`: `number`
- `placeholder`: `Enter number...`

### 3. Sizes

- Category: Examples
- Component type: universal
- Layout: horizontal
- Gap: 1rem
- Component tag: ntv-input

Size options (xs, sm, md, lg, xl)

#### Instance 1: XS

- Label: XS

Config entries:
- `placeholder`: `Extra small`

#### Instance 2: Small

- Label: Small

Config entries:
- `placeholder`: `Small input`

#### Instance 3: Medium

- Label: Medium

Config entries:
- `placeholder`: `Medium input`

#### Instance 4: Large

- Label: Large

Config entries:
- `placeholder`: `Large input`

#### Instance 5: XL

- Label: XL

Config entries:
- `placeholder`: `Extra large`

### 4. With Clear Button

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-input

Input with clearable option

#### Instance 1: Clearable Input

- Label: Clearable Input

Config entries:
- `label`: `Search`
- `placeholder`: `Type to search...`
- `clearable`: `true`

Code example:

```html
<ntv-input label="Search" placeholder="Type to search..." [clearable]="true"></ntv-input>
```

### 5. States

- Category: Examples
- Component type: universal
- Layout: horizontal
- Gap: 1rem
- Component tag: ntv-input

Disabled, readonly, and error states

#### Instance 1: Disabled

- Label: Disabled

Config entries:
- `label`: `Disabled`
- `placeholder`: `Cannot edit`
- `disabledInput`: `true`

#### Instance 2: Readonly

- Label: Readonly

Config entries:
- `label`: `Readonly`
- `placeholder`: `Read only`
- `readonly`: `true`

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
- Component tag: ntv-input

Visual style variants (default, primary, success, danger)

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

#### Instance 4: Danger

- Label: Danger

Config entries:
- `label`: `Danger`
- `placeholder`: `Danger styling...`
- `variant`: `danger`

### 7. Border Radius

- Category: Examples
- Component type: universal
- Layout: horizontal
- Gap: 1rem
- Component tag: ntv-input

Border radius options

#### Instance 1: None

- Label: None

Config entries:
- `label`: `No Radius`
- `placeholder`: `Sharp corners...`
- `borderRadius`: `none`

#### Instance 2: Small

- Label: Small

Config entries:
- `label`: `Small`
- `placeholder`: `Small rounded...`
- `borderRadius`: `sm`

#### Instance 3: Medium

- Label: Medium

Config entries:
- `label`: `Medium`
- `placeholder`: `Medium rounded...`
- `borderRadius`: `md`

#### Instance 4: Large

- Label: Large

Config entries:
- `label`: `Large`
- `placeholder`: `Large rounded...`
- `borderRadius`: `lg`

### 8. Multiline (Textarea)

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-input

Multiline textarea with optional character count

#### Instance 1: Textarea

- Label: Textarea

Config entries:
- `label`: `Description`
- `placeholder`: `Enter description...`
- `multiline`: `true`

Code example:

```html
<ntv-input label="Description" placeholder="Enter description..." [multiline]="true"></ntv-input>
```

#### Instance 2: With Character Count

- Label: With Character Count

Config entries:
- `label`: `Bio (max 100)`
- `placeholder`: `Tell us about yourself...`
- `multiline`: `true`
- `showCharCount`: `true`
- `maxLength`: `100`

Code example:

```html
<ntv-input label="Bio" [multiline]="true" [showCharCount]="true" [maxLength]="100"></ntv-input>
```

### 9. Config Pattern

- Category: Configuration
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-input

Using the DRY config object pattern to reduce template verbosity

#### Instance 1: Config Object

- Label: Config Object

Config entries:
- `config`: `{"label":"Email","placeholder":"email@example.com","type":"email","size":"lg","required":true,"clearable":true}`

Code example:

```html
inputConfig = {
  label: 'Email',
  placeholder: 'email@example.com',
  type: 'email',
  size: 'lg',
  required: true,
  clearable: true
};
<ntv-input [config]="inputConfig"></ntv-input>
```
