---
tags:
  - component-docs
  - ntv360
  - component-pantry
  - stepper
---

# Component: Stepper

Read this file after selecting it from the component index. It is optimized for quick component lookup and implementation support.

## Summary
- Tag: `ntv-stepper`
- Slug: `stepper`
- Package: `@ntv360/component-pantry`
- Source: `component-pantry/stepper/stepper.manifest.ts`
- Playground controls: 6
- Properties: 15
- Demos: 5

## Description
A flexible stepper component that supports multiple variants and orientations.

## Features
- Multiple variants - default, progress, detailed, panel, vertical, vertical-reverse, breadcrumb, form, icon, numbered
- Layout direction - Horizontal or vertical based on variant
- Color customization - primary, accent, success, warning, danger, info
- Interactive step navigation - Clickable steps with event handling
- Step states - completed, active, disabled, error, warning
- Step descriptions - Optional descriptive text per step
- Config object pattern - DRY configuration
- Accessibility - Keyboard navigation support

## Playground Controls
| Control | Type | Default | Label | Description | Options | Content |
| --- | --- | --- | --- | --- | --- | --- |
| `variant` | `select` | `default` | Variant | Visual style variant of the stepper | default, progress, detailed, panel, vertical, vertical-reverse, breadcrumb, form, icon, numbered | no |
| `size` | `select` | `md` | Size | Size of step indicators | sm, md, lg | no |
| `stepperColor` | `select` | `accent` | Stepper Color | Color theme for stepper elements | primary, accent, success, warning, danger, info, white, neutral, neutral-dark | no |
| `clickable` | `boolean` | `false` | Clickable | Whether steps can be clicked |  | no |
| `showLabels` | `boolean` | `true` | Show Labels | Whether to display step labels |  | no |
| `showDescriptions` | `boolean` | `false` | Show Descriptions | Whether to display step descriptions |  | no |

## Properties
| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `steps` | `StepData[]` | yes | `[]` | Array of step data objects |
| `currentStep` | `number` | no | `0` | Zero-based index of active step |
| `variant` | `StepperVariant` | no | `'default'` | Visual variant |
| `size` | `StepperSize` | no | `'md'` | Size variant |
| `stepperColor` | `ColorVariant` | no | `'accent'` | Primary color theme |
| `labelColor` | `ColorVariant` | no | `'accent'` | Color theme for step labels |
| `descriptionColor` | `ColorVariant` | no | `'accent'` | Color theme for step descriptions |
| `clickable` | `boolean` | no | `false` | Whether steps can be clicked |
| `showLabels` | `boolean` | no | `true` | Whether to show step labels |
| `showDescriptions` | `boolean` | no | `false` | Whether to show descriptions |
| `allowSkipping` | `boolean` | no | `false` | Whether users can skip ahead |
| `animateProgress` | `boolean` | no | `false` | Whether to animate the progress bar transitions |
| `config` | `Partial<StepperConfig>` | no | `undefined` | Configuration object |
| `stepClick` | `EventEmitter<StepClickEvent>` | no | `N/A` | Emitted when a step is clicked |
| `stepChange` | `EventEmitter<number>` | no | `N/A` | Emitted when current step changes |

## Demos
### 1. Basic Usage

- Category: Usage
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-stepper

Simple stepper with steps array

#### Instance 1: Basic Stepper

- Label: Basic Stepper
- Variant: progress

Config entries:
- `steps`: `[{"id":"1","label":"Personal Info","description":"Enter your details","completed":true},{"id":"2","label":"Account Setup","description":"Create your account"},{"id":"3","label":"Confirmation","description":"Review and confirm"}]`
- `currentStep`: `1`

Code example:

```html
steps = [
  { id: '1', label: 'Personal Info', description: 'Enter details' },
  { id: '2', label: 'Account Setup', description: 'Create account' },
  { id: '3', label: 'Confirmation', description: 'Review' }
];
<ntv-stepper [steps]="steps" [currentStep]="1" variant="progress"></ntv-stepper>
```

### 2. Variants

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-stepper

Different visual styles

#### Instance 1: Default

- Label: Default
- Variant: default

Config entries:
- `steps`: `[{"id":"1","label":"Personal Info","description":"Enter your details","completed":true},{"id":"2","label":"Account Setup","description":"Create your account"},{"id":"3","label":"Confirmation","description":"Review and confirm"}]`
- `currentStep`: `1`

#### Instance 2: Progress

- Label: Progress
- Variant: progress

Config entries:
- `steps`: `[{"id":"1","label":"Personal Info","description":"Enter your details","completed":true},{"id":"2","label":"Account Setup","description":"Create your account"},{"id":"3","label":"Confirmation","description":"Review and confirm"}]`
- `currentStep`: `1`

#### Instance 3: Detailed

- Label: Detailed
- Variant: detailed

Config entries:
- `steps`: `[{"id":"1","label":"Personal Info","description":"Enter your details","completed":true},{"id":"2","label":"Account Setup","description":"Create your account"},{"id":"3","label":"Confirmation","description":"Review and confirm"}]`
- `currentStep`: `1`
- `showDescriptions`: `true`

#### Instance 4: Vertical

- Label: Vertical
- Variant: vertical

Config entries:
- `steps`: `[{"id":"1","label":"Personal Info","description":"Enter your details","completed":true},{"id":"2","label":"Account Setup","description":"Create your account"},{"id":"3","label":"Confirmation","description":"Review and confirm"}]`
- `currentStep`: `1`

### 3. With Descriptions

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-stepper

Stepper with step descriptions

#### Instance 1: Progress with Descriptions

- Label: Progress with Descriptions
- Variant: progress

Config entries:
- `steps`: `[{"id":"1","label":"Personal Info","description":"Enter your details","completed":true},{"id":"2","label":"Account Setup","description":"Create your account"},{"id":"3","label":"Confirmation","description":"Review and confirm"}]`
- `currentStep`: `0`
- `showDescriptions`: `true`

Code example:

```html
<ntv-stepper [steps]="steps" [currentStep]="0" variant="progress" [showDescriptions]="true"></ntv-stepper>
```

### 4. Colors

- Category: Examples
- Component type: universal
- Layout: horizontal
- Gap: 1rem
- Component tag: ntv-stepper

Color theme options

#### Instance 1: Primary

- Label: Primary

Config entries:
- `steps`: `[{"id":"1","label":"Personal Info","description":"Enter your details","completed":true},{"id":"2","label":"Account Setup","description":"Create your account"},{"id":"3","label":"Confirmation","description":"Review and confirm"}]`
- `currentStep`: `1`
- `stepperColor`: `primary`

#### Instance 2: Accent

- Label: Accent

Config entries:
- `steps`: `[{"id":"1","label":"Personal Info","description":"Enter your details","completed":true},{"id":"2","label":"Account Setup","description":"Create your account"},{"id":"3","label":"Confirmation","description":"Review and confirm"}]`
- `currentStep`: `1`
- `stepperColor`: `accent`

#### Instance 3: Success

- Label: Success

Config entries:
- `steps`: `[{"id":"1","label":"Personal Info","description":"Enter your details","completed":true},{"id":"2","label":"Account Setup","description":"Create your account"},{"id":"3","label":"Confirmation","description":"Review and confirm"}]`
- `currentStep`: `1`
- `stepperColor`: `success`

### 5. Config Pattern

- Category: Configuration
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-stepper

Using the config object

#### Instance 1: Config Object

- Label: Config Object

Config entries:
- `steps`: `[{"id":"1","label":"Personal Info","description":"Enter your details","completed":true},{"id":"2","label":"Account Setup","description":"Create your account"},{"id":"3","label":"Confirmation","description":"Review and confirm"}]`
- `currentStep`: `1`
- `config`: `{"variant":"progress","size":"md","stepperColor":"accent","clickable":true,"showDescriptions":true}`

Code example:

```html
stepperConfig = { variant: 'progress', clickable: true, showDescriptions: true };
<ntv-stepper [steps]="steps" [currentStep]="1" [config]="stepperConfig" (stepClick)="onStepClick($event)"></ntv-stepper>
```
