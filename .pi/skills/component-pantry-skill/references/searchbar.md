---
tags:
  - component-docs
  - ntv360
  - component-pantry
  - searchbar
---

# Component: Searchbar

Read this file after selecting it from the component index. It is optimized for quick component lookup and implementation support.

## Summary
- Tag: `ntv-searchbar`
- Slug: `searchbar`
- Package: `@ntv360/component-pantry`
- Source: `component-pantry/searchbar/searchbar.manifest.ts`
- Playground controls: 10
- Properties: 20
- Demos: 7

## Description
A searchbar component that combines an input field with a search button and optional autocomplete suggestions.

## Features
- Built on top of the Input component - Inherits styling and accessibility
- Search button with minimum character validation - Configurable threshold
- Optional autocomplete - Dropdown suggestions from data source
- Configurable minimum character requirement - Enable/disable search button
- Search icon positioning - Left or right within input
- Responsive design - Stacks on mobile
- Keyboard support - Enter to search, Escape to dismiss results
- Disabled and loading states
- Clear button option - Reset search with one click
- Customizable styling - Size, variant, border radius, button color
- Event emissions - selectedValue, searchValueChange, buttonClick

## Playground Controls
| Control | Type | Default | Label | Description | Options | Content |
| --- | --- | --- | --- | --- | --- | --- |
| `placeholder` | `text` | `Search...` | Placeholder | Placeholder text for the search input |  | no |
| `minCharacters` | `number` | `3` | Min Characters | Minimum characters required to enable search button |  | no |
| `size` | `select` | `md` | Size | Size of the search input and button | xs, sm, md, lg, xl | no |
| `variant` | `select` | `default` | Variant | Visual variant (inherited from Input component) | default, primary, success, danger | no |
| `borderRadius` | `select` | `md` | Border Radius | Border radius of searchbar components | none, sm, md, lg, xl, full | no |
| `buttonBgColor` | `text` | `#8DCB2C` | Button Color | Background color of the search button |  | no |
| `disabled` | `boolean` | `false` | Disabled | Whether the searchbar is disabled |  | no |
| `showClearButton` | `boolean` | `false` | Show Clear Button | Whether to show the clear/remove button |  | no |
| `enableAutoComplete` | `boolean` | `false` | Enable Autocomplete | Whether to show autocomplete suggestions |  | no |
| `hideOuterSearchButton` | `boolean` | `false` | Hide Search Button | Whether to hide the outer search button |  | no |

## Properties
| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `label` | `string` | no | `''` | Label for the search input |
| `showLabel` | `boolean` | no | `true` | Whether to show the label |
| `hideOuterSearchButton` | `boolean` | no | `false` | Whether to hide the outer search button |
| `searchIconPosition` | `string` | no | `'left'` | Position of search icon (left or right) |
| `enableAutoComplete` | `boolean` | no | `false` | Whether to enable autocomplete suggestions |
| `showClearButton` | `boolean` | no | `false` | Whether to show the clear button |
| `placeholder` | `string` | no | `'Search...'` | Placeholder text for the search input |
| `minCharacters` | `number` | no | `3` | Minimum characters required to enable search button |
| `showMinCharacters` | `boolean` | no | `false` | Whether to show min characters in placeholder |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | no | `'md'` | Size of the search input |
| `buttonBgColor` | `string` | no | `'#8DCB2C'` | Background color of the search button |
| `borderRadius` | `'none' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | no | `'md'` | Border radius of searchbar components |
| `variant` | `SearchbarVariant` | no | `'default'` | Visual variant of the searchbar |
| `disabled` | `boolean` | no | `false` | Whether the searchbar is disabled |
| `isLoading` | `boolean` | no | `false` | Loading state of the searchbar |
| `skipFiltering` | `boolean` | no | `false` | Skip client-side filtering (for API search) |
| `data` | `Location[]` | no | `[]` | Data source for search results (id, title, description) |
| `selectedValue` | `EventEmitter<Location>` | no | `N/A` | Emitted when a result is selected |
| `searchValueChange` | `EventEmitter<string>` | no | `N/A` | Emitted when search input value changes |
| `buttonClick` | `EventEmitter<void>` | no | `N/A` | Emitted when search button is clicked |

## Demos
### 1. Basic Usage

- Category: Usage
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-searchbar

Simple searchbar with search button and location data

#### Instance 1: Default Searchbar

- Label: Default Searchbar

Config entries:
- `placeholder`: `Search locations...`
- `minCharacters`: `2`
- `data`: `[{"id":"1","title":"London","description":"United Kingdom"},{"id":"2","title":"Tokyo","description":"Japan"},{"id":"3","title":"Paris","description":"France"},{"id":"4","title":"Dubai","description":"United Arab Emirates"},{"id":"5","title":"Singapore","description":"Singapore"},{"id":"6","title":"Los Angeles","description":"United States"},{"id":"7","title":"Barcelona","description":"Spain"},{"id":"8","title":"Toronto","description":"Canada"},{"id":"9","title":"Berlin","description":"Germany"},{"id":"10","title":"Eiffel Tower","description":"France"},{"id":"11","title":"Statue of Liberty","description":"United States"},{"id":"12","title":"Taj Mahal","description":"India"}]`

Code example:

```html
<ntv-searchbar
  placeholder="Search locations..."
  [minCharacters]="2"
  [data]="locationData"
  (buttonClick)="onSearch()"
  (selectedValue)="onSelect($event)"
  (searchValueChange)="onValueChange($event)">
</ntv-searchbar>
```

### 2. Sizes

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-searchbar

Size options (xs, sm, md, lg, xl)

#### Instance 1: Small

- Label: Small

Config entries:
- `placeholder`: `Search (sm)...`
- `minCharacters`: `2`
- `data`: `[{"id":"1","title":"London","description":"United Kingdom"},{"id":"2","title":"Tokyo","description":"Japan"},{"id":"3","title":"Paris","description":"France"},{"id":"4","title":"Dubai","description":"United Arab Emirates"},{"id":"5","title":"Singapore","description":"Singapore"},{"id":"6","title":"Los Angeles","description":"United States"},{"id":"7","title":"Barcelona","description":"Spain"},{"id":"8","title":"Toronto","description":"Canada"},{"id":"9","title":"Berlin","description":"Germany"},{"id":"10","title":"Eiffel Tower","description":"France"},{"id":"11","title":"Statue of Liberty","description":"United States"},{"id":"12","title":"Taj Mahal","description":"India"}]`

#### Instance 2: Medium

- Label: Medium

Config entries:
- `placeholder`: `Search (md)...`
- `minCharacters`: `2`
- `data`: `[{"id":"1","title":"London","description":"United Kingdom"},{"id":"2","title":"Tokyo","description":"Japan"},{"id":"3","title":"Paris","description":"France"},{"id":"4","title":"Dubai","description":"United Arab Emirates"},{"id":"5","title":"Singapore","description":"Singapore"},{"id":"6","title":"Los Angeles","description":"United States"},{"id":"7","title":"Barcelona","description":"Spain"},{"id":"8","title":"Toronto","description":"Canada"},{"id":"9","title":"Berlin","description":"Germany"},{"id":"10","title":"Eiffel Tower","description":"France"},{"id":"11","title":"Statue of Liberty","description":"United States"},{"id":"12","title":"Taj Mahal","description":"India"}]`

#### Instance 3: Large

- Label: Large

Config entries:
- `placeholder`: `Search (lg)...`
- `minCharacters`: `2`
- `data`: `[{"id":"1","title":"London","description":"United Kingdom"},{"id":"2","title":"Tokyo","description":"Japan"},{"id":"3","title":"Paris","description":"France"},{"id":"4","title":"Dubai","description":"United Arab Emirates"},{"id":"5","title":"Singapore","description":"Singapore"},{"id":"6","title":"Los Angeles","description":"United States"},{"id":"7","title":"Barcelona","description":"Spain"},{"id":"8","title":"Toronto","description":"Canada"},{"id":"9","title":"Berlin","description":"Germany"},{"id":"10","title":"Eiffel Tower","description":"France"},{"id":"11","title":"Statue of Liberty","description":"United States"},{"id":"12","title":"Taj Mahal","description":"India"}]`

### 3. Variants

- Category: Examples
- Component type: universal
- Layout: horizontal
- Gap: 1rem
- Component tag: ntv-searchbar

Visual style variants

#### Instance 1: Default

- Label: Default
- Variant: default

Config entries:
- `placeholder`: `Default variant`
- `minCharacters`: `1`
- `data`: `[{"id":"1","title":"London","description":"United Kingdom"},{"id":"2","title":"Tokyo","description":"Japan"},{"id":"3","title":"Paris","description":"France"},{"id":"4","title":"Dubai","description":"United Arab Emirates"},{"id":"5","title":"Singapore","description":"Singapore"},{"id":"6","title":"Los Angeles","description":"United States"},{"id":"7","title":"Barcelona","description":"Spain"},{"id":"8","title":"Toronto","description":"Canada"},{"id":"9","title":"Berlin","description":"Germany"},{"id":"10","title":"Eiffel Tower","description":"France"},{"id":"11","title":"Statue of Liberty","description":"United States"},{"id":"12","title":"Taj Mahal","description":"India"}]`

#### Instance 2: Primary

- Label: Primary
- Variant: primary

Config entries:
- `placeholder`: `Primary variant`
- `minCharacters`: `1`
- `data`: `[{"id":"1","title":"London","description":"United Kingdom"},{"id":"2","title":"Tokyo","description":"Japan"},{"id":"3","title":"Paris","description":"France"},{"id":"4","title":"Dubai","description":"United Arab Emirates"},{"id":"5","title":"Singapore","description":"Singapore"},{"id":"6","title":"Los Angeles","description":"United States"},{"id":"7","title":"Barcelona","description":"Spain"},{"id":"8","title":"Toronto","description":"Canada"},{"id":"9","title":"Berlin","description":"Germany"},{"id":"10","title":"Eiffel Tower","description":"France"},{"id":"11","title":"Statue of Liberty","description":"United States"},{"id":"12","title":"Taj Mahal","description":"India"}]`

#### Instance 3: Success

- Label: Success
- Variant: success

Config entries:
- `placeholder`: `Success variant`
- `minCharacters`: `1`
- `data`: `[{"id":"1","title":"London","description":"United Kingdom"},{"id":"2","title":"Tokyo","description":"Japan"},{"id":"3","title":"Paris","description":"France"},{"id":"4","title":"Dubai","description":"United Arab Emirates"},{"id":"5","title":"Singapore","description":"Singapore"},{"id":"6","title":"Los Angeles","description":"United States"},{"id":"7","title":"Barcelona","description":"Spain"},{"id":"8","title":"Toronto","description":"Canada"},{"id":"9","title":"Berlin","description":"Germany"},{"id":"10","title":"Eiffel Tower","description":"France"},{"id":"11","title":"Statue of Liberty","description":"United States"},{"id":"12","title":"Taj Mahal","description":"India"}]`

#### Instance 4: Danger

- Label: Danger
- Variant: danger

Config entries:
- `placeholder`: `Danger variant`
- `minCharacters`: `1`
- `data`: `[{"id":"1","title":"London","description":"United Kingdom"},{"id":"2","title":"Tokyo","description":"Japan"},{"id":"3","title":"Paris","description":"France"},{"id":"4","title":"Dubai","description":"United Arab Emirates"},{"id":"5","title":"Singapore","description":"Singapore"},{"id":"6","title":"Los Angeles","description":"United States"},{"id":"7","title":"Barcelona","description":"Spain"},{"id":"8","title":"Toronto","description":"Canada"},{"id":"9","title":"Berlin","description":"Germany"},{"id":"10","title":"Eiffel Tower","description":"France"},{"id":"11","title":"Statue of Liberty","description":"United States"},{"id":"12","title":"Taj Mahal","description":"India"}]`

### 4. Minimum Characters

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-searchbar

Different minimum character requirements

#### Instance 1: Min 1 Character

- Label: Min 1 Character

Config entries:
- `placeholder`: `Search (min 1 char)...`
- `minCharacters`: `1`
- `data`: `[{"id":"1","title":"London","description":"United Kingdom"},{"id":"2","title":"Tokyo","description":"Japan"},{"id":"3","title":"Paris","description":"France"},{"id":"4","title":"Dubai","description":"United Arab Emirates"},{"id":"5","title":"Singapore","description":"Singapore"},{"id":"6","title":"Los Angeles","description":"United States"},{"id":"7","title":"Barcelona","description":"Spain"},{"id":"8","title":"Toronto","description":"Canada"},{"id":"9","title":"Berlin","description":"Germany"},{"id":"10","title":"Eiffel Tower","description":"France"},{"id":"11","title":"Statue of Liberty","description":"United States"},{"id":"12","title":"Taj Mahal","description":"India"}]`

#### Instance 2: Min 3 Characters (Default)

- Label: Min 3 Characters (Default)

Config entries:
- `placeholder`: `Search (min 3 chars)...`
- `minCharacters`: `3`
- `data`: `[{"id":"1","title":"London","description":"United Kingdom"},{"id":"2","title":"Tokyo","description":"Japan"},{"id":"3","title":"Paris","description":"France"},{"id":"4","title":"Dubai","description":"United Arab Emirates"},{"id":"5","title":"Singapore","description":"Singapore"},{"id":"6","title":"Los Angeles","description":"United States"},{"id":"7","title":"Barcelona","description":"Spain"},{"id":"8","title":"Toronto","description":"Canada"},{"id":"9","title":"Berlin","description":"Germany"},{"id":"10","title":"Eiffel Tower","description":"France"},{"id":"11","title":"Statue of Liberty","description":"United States"},{"id":"12","title":"Taj Mahal","description":"India"}]`

#### Instance 3: Min 5 Characters

- Label: Min 5 Characters

Config entries:
- `placeholder`: `Search (min 5 chars)...`
- `minCharacters`: `5`
- `data`: `[{"id":"1","title":"London","description":"United Kingdom"},{"id":"2","title":"Tokyo","description":"Japan"},{"id":"3","title":"Paris","description":"France"},{"id":"4","title":"Dubai","description":"United Arab Emirates"},{"id":"5","title":"Singapore","description":"Singapore"},{"id":"6","title":"Los Angeles","description":"United States"},{"id":"7","title":"Barcelona","description":"Spain"},{"id":"8","title":"Toronto","description":"Canada"},{"id":"9","title":"Berlin","description":"Germany"},{"id":"10","title":"Eiffel Tower","description":"France"},{"id":"11","title":"Statue of Liberty","description":"United States"},{"id":"12","title":"Taj Mahal","description":"India"}]`

### 5. With Autocomplete

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-searchbar

Searchbar with autocomplete suggestions enabled

#### Instance 1: Autocomplete Enabled

- Label: Autocomplete Enabled

Config entries:
- `placeholder`: `Search cities or landmarks...`
- `minCharacters`: `2`
- `enableAutoComplete`: `true`
- `showClearButton`: `true`
- `data`: `[{"id":"1","title":"London","description":"United Kingdom"},{"id":"2","title":"Tokyo","description":"Japan"},{"id":"3","title":"Paris","description":"France"},{"id":"4","title":"Dubai","description":"United Arab Emirates"},{"id":"5","title":"Singapore","description":"Singapore"},{"id":"6","title":"Los Angeles","description":"United States"},{"id":"7","title":"Barcelona","description":"Spain"},{"id":"8","title":"Toronto","description":"Canada"},{"id":"9","title":"Berlin","description":"Germany"},{"id":"10","title":"Eiffel Tower","description":"France"},{"id":"11","title":"Statue of Liberty","description":"United States"},{"id":"12","title":"Taj Mahal","description":"India"}]`

Code example:

```html
<ntv-searchbar
  placeholder="Search cities or landmarks..."
  [minCharacters]="2"
  [enableAutoComplete]="true"
  [showClearButton]="true"
  [data]="locationData"
  (selectedValue)="onSelect($event)">
</ntv-searchbar>
```

### 6. States

- Category: Examples
- Component type: universal
- Layout: horizontal
- Gap: 1rem
- Component tag: ntv-searchbar

Disabled and loading states

#### Instance 1: Disabled

- Label: Disabled

Config entries:
- `placeholder`: `Disabled searchbar`
- `minCharacters`: `2`
- `data`: `[{"id":"1","title":"London","description":"United Kingdom"},{"id":"2","title":"Tokyo","description":"Japan"},{"id":"3","title":"Paris","description":"France"},{"id":"4","title":"Dubai","description":"United Arab Emirates"},{"id":"5","title":"Singapore","description":"Singapore"},{"id":"6","title":"Los Angeles","description":"United States"},{"id":"7","title":"Barcelona","description":"Spain"},{"id":"8","title":"Toronto","description":"Canada"},{"id":"9","title":"Berlin","description":"Germany"},{"id":"10","title":"Eiffel Tower","description":"France"},{"id":"11","title":"Statue of Liberty","description":"United States"},{"id":"12","title":"Taj Mahal","description":"India"}]`

#### Instance 2: Enabled

- Label: Enabled

Config entries:
- `placeholder`: `Enabled searchbar`
- `minCharacters`: `2`
- `data`: `[{"id":"1","title":"London","description":"United Kingdom"},{"id":"2","title":"Tokyo","description":"Japan"},{"id":"3","title":"Paris","description":"France"},{"id":"4","title":"Dubai","description":"United Arab Emirates"},{"id":"5","title":"Singapore","description":"Singapore"},{"id":"6","title":"Los Angeles","description":"United States"},{"id":"7","title":"Barcelona","description":"Spain"},{"id":"8","title":"Toronto","description":"Canada"},{"id":"9","title":"Berlin","description":"Germany"},{"id":"10","title":"Eiffel Tower","description":"France"},{"id":"11","title":"Statue of Liberty","description":"United States"},{"id":"12","title":"Taj Mahal","description":"India"}]`

### 7. Border Radius

- Category: Examples
- Component type: universal
- Layout: horizontal
- Gap: 1rem
- Component tag: ntv-searchbar

Border radius options

#### Instance 1: Medium

- Label: Medium

Config entries:
- `borderRadius`: `md`
- `placeholder`: `Medium radius`
- `minCharacters`: `1`
- `data`: `[{"id":"1","title":"London","description":"United Kingdom"},{"id":"2","title":"Tokyo","description":"Japan"},{"id":"3","title":"Paris","description":"France"},{"id":"4","title":"Dubai","description":"United Arab Emirates"},{"id":"5","title":"Singapore","description":"Singapore"},{"id":"6","title":"Los Angeles","description":"United States"},{"id":"7","title":"Barcelona","description":"Spain"},{"id":"8","title":"Toronto","description":"Canada"},{"id":"9","title":"Berlin","description":"Germany"},{"id":"10","title":"Eiffel Tower","description":"France"},{"id":"11","title":"Statue of Liberty","description":"United States"},{"id":"12","title":"Taj Mahal","description":"India"}]`

#### Instance 2: Large

- Label: Large

Config entries:
- `borderRadius`: `lg`
- `placeholder`: `Large radius`
- `minCharacters`: `1`
- `data`: `[{"id":"1","title":"London","description":"United Kingdom"},{"id":"2","title":"Tokyo","description":"Japan"},{"id":"3","title":"Paris","description":"France"},{"id":"4","title":"Dubai","description":"United Arab Emirates"},{"id":"5","title":"Singapore","description":"Singapore"},{"id":"6","title":"Los Angeles","description":"United States"},{"id":"7","title":"Barcelona","description":"Spain"},{"id":"8","title":"Toronto","description":"Canada"},{"id":"9","title":"Berlin","description":"Germany"},{"id":"10","title":"Eiffel Tower","description":"France"},{"id":"11","title":"Statue of Liberty","description":"United States"},{"id":"12","title":"Taj Mahal","description":"India"}]`

#### Instance 3: Full

- Label: Full

Config entries:
- `borderRadius`: `full`
- `placeholder`: `Fully rounded`
- `minCharacters`: `1`
- `data`: `[{"id":"1","title":"London","description":"United Kingdom"},{"id":"2","title":"Tokyo","description":"Japan"},{"id":"3","title":"Paris","description":"France"},{"id":"4","title":"Dubai","description":"United Arab Emirates"},{"id":"5","title":"Singapore","description":"Singapore"},{"id":"6","title":"Los Angeles","description":"United States"},{"id":"7","title":"Barcelona","description":"Spain"},{"id":"8","title":"Toronto","description":"Canada"},{"id":"9","title":"Berlin","description":"Germany"},{"id":"10","title":"Eiffel Tower","description":"France"},{"id":"11","title":"Statue of Liberty","description":"United States"},{"id":"12","title":"Taj Mahal","description":"India"}]`
