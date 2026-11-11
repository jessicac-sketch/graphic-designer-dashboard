---
tags:
  - component-docs
  - ntv360
  - component-pantry
  - table
---

# Component: Table

Read this file after selecting it from the component index. It is optimized for quick component lookup and implementation support.

## Summary
- Tag: `ntv-table`
- Slug: `table`
- Package: `@ntv360/component-pantry`
- Source: `component-pantry/table/table.manifest.ts`
- Playground controls: 7
- Properties: 17
- Demos: 6

## Description
A highly configurable table component with filtering, sorting, and advanced features.

## Features
- Column definitions - Flexible column configuration with field, header, visibility
- Filtering - Text, number, date, select filters per column
- Draggable columns - Reorder columns via drag and drop
- Draggable rows - Reorder rows via drag and drop
- Expandable rows - Custom expandable content per row
- Lockable rows - Pin rows to top
- Checkbox selection - Select multiple rows
- Pagination - Built-in pagination with show more
- Custom templates - header, body, expandedContent templates
- Column settings - Visibility toggles, localStorage persistence

## Playground Controls
| Control | Type | Default | Label | Description | Options | Content |
| --- | --- | --- | --- | --- | --- | --- |
| `tableTitle` | `text` | `` | Title | Optional title above the table |  | no |
| `filterEnabled` | `boolean` | `false` | Filter Enabled | Enable column filters |  | no |
| `columnDraggable` | `boolean` | `false` | Column Draggable | Allow column reordering |  | no |
| `rowDraggable` | `boolean` | `false` | Row Draggable | Allow row reordering |  | no |
| `hasCheckBox` | `boolean` | `false` | Has Checkbox | Enable row selection |  | no |
| `hasIndex` | `boolean` | `false` | Has Index | Show row index column |  | no |
| `expandableRows` | `boolean` | `false` | Expandable Rows | Enable expandable row content |  | no |

## Properties
| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `columns` | `TableColumn[]` | yes | `[]` | Column definitions |
| `data` | `Record<string, unknown>[]` | no | `[]` | Table data (modifiable) |
| `value` | `Record<string, unknown>[]` | no | `[]` | Original source data |
| `filterEnabled` | `boolean` | no | `false` | Enable column filters |
| `columnDraggable` | `boolean` | no | `false` | Enable column reordering |
| `rowDraggable` | `boolean` | no | `false` | Enable row reordering |
| `expandableRows` | `boolean` | no | `false` | Enable expandable rows |
| `hasCheckBox` | `boolean` | no | `false` | Enable row selection |
| `hasIndex` | `boolean` | no | `false` | Show row index column |
| `tableTitle` | `string` | no | `' '` | Title above table |
| `tableHeight` | `TableHeight` | no | `'600px'` | Table wrapper height |
| `showItemCount` | `boolean` | no | `true` | Show item count |
| `showColumnSettings` | `boolean` | no | `true` | Show column settings icon |
| `dataChange` | `EventEmitter<Record<string, unknown>[]>` | no | `N/A` | Emitted when data changes |
| `columnReorder` | `EventEmitter<ColumnReorderEvent>` | no | `N/A` | Emitted when column is reordered |
| `rowReorder` | `EventEmitter<RowReorderEvent>` | no | `N/A` | Emitted when row is reordered |
| `selectedRowsChange` | `EventEmitter<Record<string, unknown>[]>` | no | `N/A` | Emitted when selection changes |

## Demos
### 1. Basic Usage

- Category: Usage
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-table

Simple table with columns and data

#### Instance 1: Basic Table

- Label: Basic Table

Config entries:
- `columns`: `[{"field":"name","header":"Name"},{"field":"email","header":"Email"},{"field":"role","header":"Role"}]`
- `data`: `[{"name":"John Doe","email":"john@example.com","role":"Admin"},{"name":"Jane Smith","email":"jane@example.com","role":"User"},{"name":"Bob Wilson","email":"bob@example.com","role":"Editor"}]`
- `tableHeight`: `300px`

Code example:

```html
columns = [
  { field: 'name', header: 'Name' },
  { field: 'email', header: 'Email' },
  { field: 'role', header: 'Role' }
];
<ntv-table [columns]="columns" [data]="data"></ntv-table>
```

### 2. With Filters

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-table

Table with column filtering enabled

#### Instance 1: Filterable Table

- Label: Filterable Table

Config entries:
- `columns`: `[{"field":"name","header":"Name","filter":true,"filterType":"text"},{"field":"email","header":"Email","filter":true,"filterType":"text"},{"field":"role","header":"Role","filter":true,"filterType":"select","filterOptions":["Admin","User","Editor"]}]`
- `data`: `[{"name":"John Doe","email":"john@example.com","role":"Admin"},{"name":"Jane Smith","email":"jane@example.com","role":"User"},{"name":"Bob Wilson","email":"bob@example.com","role":"Editor"}]`
- `filterEnabled`: `true`
- `tableHeight`: `300px`

Code example:

```html
<ntv-table [columns]="columns" [data]="data" [filterEnabled]="true"></ntv-table>
```

### 3. With Row Index

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-table

Table with row number column

#### Instance 1: Table with Index

- Label: Table with Index

Config entries:
- `columns`: `[{"field":"name","header":"Name"},{"field":"email","header":"Email"},{"field":"role","header":"Role"}]`
- `data`: `[{"name":"John Doe","email":"john@example.com","role":"Admin"},{"name":"Jane Smith","email":"jane@example.com","role":"User"},{"name":"Bob Wilson","email":"bob@example.com","role":"Editor"}]`
- `hasIndex`: `true`
- `tableHeight`: `300px`

### 4. With Checkbox Selection

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-table

Table with row selection

#### Instance 1: Selectable Rows

- Label: Selectable Rows

Config entries:
- `columns`: `[{"field":"name","header":"Name"},{"field":"email","header":"Email"},{"field":"role","header":"Role"}]`
- `data`: `[{"name":"John Doe","email":"john@example.com","role":"Admin"},{"name":"Jane Smith","email":"jane@example.com","role":"User"},{"name":"Bob Wilson","email":"bob@example.com","role":"Editor"}]`
- `hasCheckBox`: `true`
- `lockIdentifierField`: `name`
- `tableHeight`: `300px`

Code example:

```html
<ntv-table [columns]="columns" [data]="data" [hasCheckBox]="true" lockIdentifierField="name" (selectedRowsChange)="onSelectionChange($event)"></ntv-table>
```

### 5. Draggable Columns

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-table

Table with column reordering

#### Instance 1: Reorderable Columns

- Label: Reorderable Columns

Config entries:
- `columns`: `[{"field":"name","header":"Name"},{"field":"email","header":"Email"},{"field":"role","header":"Role"}]`
- `data`: `[{"name":"John Doe","email":"john@example.com","role":"Admin"},{"name":"Jane Smith","email":"jane@example.com","role":"User"},{"name":"Bob Wilson","email":"bob@example.com","role":"Editor"}]`
- `columnDraggable`: `true`
- `tableHeight`: `300px`

### 6. Custom Title

- Category: Examples
- Component type: universal
- Layout: vertical
- Gap: 1rem
- Component tag: ntv-table

Table with custom title

#### Instance 1: Titled Table

- Label: Titled Table

Config entries:
- `columns`: `[{"field":"name","header":"Name"},{"field":"email","header":"Email"},{"field":"role","header":"Role"}]`
- `data`: `[{"name":"John Doe","email":"john@example.com","role":"Admin"},{"name":"Jane Smith","email":"jane@example.com","role":"User"},{"name":"Bob Wilson","email":"bob@example.com","role":"Editor"}]`
- `tableTitle`: `Team Members`
- `tableHeight`: `300px`

Code example:

```html
<ntv-table [columns]="columns" [data]="data" tableTitle="Team Members"></ntv-table>
```
