---
tags:
  - component-docs
  - ntv360
  - component-pantry
  - accordion
---

# Component: Accordion

Read this file after selecting it from the component index. It is optimized for quick component lookup and implementation support.

## Summary
- Tag: `ntv-accordion`
- Slug: `accordion`
- Package: `@ntv360/component-pantry`
- Source: `component-pantry/accordion/accordion.manifest.ts`
- Playground controls: 7
- Properties: 9
- Demos: 6

## Description
A simple accordion component with ng-content projection for header and body.

## Features
- Named content projection - Use `slot="header"` and `slot="body"` for flexible content
- Multiple visual variants - Default, bordered, flush
- Flexible sizing - Small (sm), medium (md), large (lg)
- Toggle functionality - Expand/collapse with smooth animations
- Exclusive groups - Only one accordion open at a time when sharing a group name
- Custom icons and styling - Optional expand/collapse chevron
- Accessibility - ARIA attributes, keyboard support
- Config object pattern - DRY configuration support

## Playground Controls
| Control | Type | Default | Label | Description | Options | Content |
| --- | --- | --- | --- | --- | --- | --- |
| `variant` | `select` | `default` | Variant | Visual style variant of the accordion | default, bordered, flush | no |
| `size` | `select` | `md` | Size | Size of the accordion | sm, md, lg | no |
| `initialOpen` | `boolean` | `false` | Initial Open | Whether the accordion is initially open |  | no |
| `animated` | `boolean` | `true` | Animated | Whether to show smooth animations |  | no |
| `showIcons` | `boolean` | `true` | Show Icons | Whether to show expand/collapse icons |  | no |
| `disabled` | `boolean` | `false` | Disabled | Whether the accordion is disabled |  | no |
| `group` | `text` | `undefined` | Group | Group name for exclusive behavior (only one open at a time) |  | no |

## Properties
| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `variant` | `AccordionVariant` | no | `'default'` | Visual style variant |
| `size` | `AccordionSize` | no | `'md'` | Size of the accordion |
| `animated` | `boolean` | no | `true` | Whether to show smooth animations |
| `showIcons` | `boolean` | no | `true` | Whether to show expand/collapse icons |
| `initialOpen` | `boolean` | no | `false` | Initial open state |
| `disabled` | `boolean` | no | `false` | Whether the accordion is disabled |
| `group` | `string \| undefined` | no | `undefined` | Group name for exclusive behavior |
| `config` | `AccordionConfig` | no | `undefined` | Configuration object |
| `accordionToggle` | `EventEmitter<boolean>` | no | `N/A` | Emitted when accordion is toggled |

## Demos
### 1. Basic Usage

- Category: Usage
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-accordion

Simple accordion with header and body content

#### Instance 1: Simple Accordion

- Label: Simple Accordion

Config entries:
- `variant`: `default`
- `size`: `md`
- `initialOpen`: `false`

Rendered HTML example:

```html
<ntv-accordion variant="default" size="md">
  <div slot="header">What is Angular?</div>
  <div slot="body">
    Angular is a platform and framework for building single-page client applications using HTML and TypeScript.
    It implements core and optional functionality as a set of TypeScript libraries.
  </div>
</ntv-accordion>
```

Code example:

```html
<ntv-accordion variant="default" size="md">
  <div slot="header">Click to expand</div>
  <div slot="body">Your content here</div>
</ntv-accordion>
```

### 2. Variants

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-accordion

Visual style variants

#### Instance 1: Default

- Label: Default

Config entries:
- `variant`: `default`

Rendered HTML example:

```html
<ntv-accordion variant="default">
  <div slot="header">Default variant</div>
  <div slot="body">Clean default styling with minimal borders.</div>
</ntv-accordion>
```

#### Instance 2: Bordered

- Label: Bordered

Config entries:
- `variant`: `bordered`

Rendered HTML example:

```html
<ntv-accordion variant="bordered" [initialOpen]="true">
  <div slot="header">Bordered variant</div>
  <div slot="body">Accordion with visible borders for clearer separation.</div>
</ntv-accordion>
```

#### Instance 3: Flush

- Label: Flush

Config entries:
- `variant`: `flush`

Rendered HTML example:

```html
<ntv-accordion variant="flush">
  <div slot="header">Flush variant</div>
  <div slot="body">Flush styling with no outer borders, ideal for nested layouts.</div>
</ntv-accordion>
```

### 3. Sizes

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-accordion

Size options (sm, md, lg)

#### Instance 1: Small

- Label: Small

Config entries:
- `size`: `sm`

Rendered HTML example:

```html
<ntv-accordion size="sm">
  <div slot="header">Small accordion</div>
  <div slot="body">Compact spacing and typography.</div>
</ntv-accordion>
```

#### Instance 2: Medium

- Label: Medium

Config entries:
- `size`: `md`

Rendered HTML example:

```html
<ntv-accordion size="md">
  <div slot="header">Medium accordion</div>
  <div slot="body">Standard spacing for most use cases.</div>
</ntv-accordion>
```

#### Instance 3: Large

- Label: Large

Config entries:
- `size`: `lg`

Rendered HTML example:

```html
<ntv-accordion size="lg" [initialOpen]="true">
  <div slot="header">Large accordion</div>
  <div slot="body">Generous spacing and larger typography for better readability.</div>
</ntv-accordion>
```

### 4. Exclusive Group

- Category: Examples
- Component type: accordion-group-demo
- Layout: vertical
- Gap: 0.5rem
- Component tag: ntv-accordion

Only one accordion open at a time when sharing a group

#### Instance 1: Exclusive Accordions

- Label: Exclusive Accordions

Config entries:
- `variant`: `bordered`
- `group`: `faq-group`

Rendered HTML example:

```html
<div class="space-y-2">
  <ntv-accordion variant="bordered" group="faq-group" [initialOpen]="true">
    <div slot="header">First question</div>
    <div slot="body">Answer to the first question. Opening another will close this one.</div>
  </ntv-accordion>
  <ntv-accordion variant="bordered" group="faq-group">
    <div slot="header">Second question</div>
    <div slot="body">Answer to the second question.</div>
  </ntv-accordion>
  <ntv-accordion variant="bordered" group="faq-group">
    <div slot="header">Third question</div>
    <div slot="body">Answer to the third question.</div>
  </ntv-accordion>
</div>
```

Code example:

```html
<ntv-accordion variant="bordered" group="faq-group">
  <div slot="header">Question 1</div>
  <div slot="body">Answer 1</div>
</ntv-accordion>
<ntv-accordion variant="bordered" group="faq-group">
  <div slot="header">Question 2</div>
  <div slot="body">Answer 2</div>
</ntv-accordion>
```

### 5. Options

- Category: Examples
- Component type: universal
- Layout: horizontal
- Gap: 1rem
- Component tag: ntv-accordion

With and without icons, with and without animation

#### Instance 1: Without Icons

- Label: Without Icons

Config entries:
- `showIcons`: `false`

Rendered HTML example:

```html
<ntv-accordion [showIcons]="false">
  <div slot="header">No expand icon</div>
  <div slot="body">Cleaner look without chevron icon.</div>
</ntv-accordion>
```

#### Instance 2: Without Animation

- Label: Without Animation

Config entries:
- `animated`: `false`

Rendered HTML example:

```html
<ntv-accordion [animated]="false">
  <div slot="header">Instant toggle</div>
  <div slot="body">Opens and closes instantly without animation.</div>
</ntv-accordion>
```

### 6. Config Pattern

- Category: Configuration
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-accordion

Using the DRY config object pattern

#### Instance 1: Config Object

- Label: Config Object

Config entries:
- `config`: `{"variant":"bordered","size":"md","animated":true,"showIcons":true,"initialOpen":false}`

Rendered HTML example:

```html
<ntv-accordion [config]="{ variant: 'bordered', size: 'md', animated: true, showIcons: true }">
  <div slot="header">Configured via config</div>
  <div slot="body">All options set through a single config object.</div>
</ntv-accordion>
```

Code example:

```html
accordionConfig = {
  variant: 'bordered',
  size: 'md',
  animated: true,
  showIcons: true
};
<ntv-accordion [config]="accordionConfig">
  <div slot="header">Header</div>
  <div slot="body">Content</div>
</ntv-accordion>
```
