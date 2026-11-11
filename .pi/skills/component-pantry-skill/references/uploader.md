---
tags:
  - component-docs
  - ntv360
  - component-pantry
  - uploader
---

# Component: Uploader

Read this file after selecting it from the component index. It is optimized for quick component lookup and implementation support.

## Summary
- Tag: `ntv-uploader`
- Slug: `uploader`
- Package: `@ntv360/component-pantry`
- Source: `component-pantry/uploader/uploader.manifest.ts`
- Playground controls: 2
- Properties: 5
- Demos: 1

## Description
A drag-and-drop media upload panel supporting images and videos. Handles file validation, duplicate detection, inline renaming, progress tracking, and Transloadit integration.

## Playground Controls
| Control | Type | Default | Label | Description | Options | Content |
| --- | --- | --- | --- | --- | --- | --- |
| `duplicateResults` | `textarea` | `[]` | Duplicate Results (JSON) | Array of DuplicateResult objects returned from the parent duplicate check |  | no |
| `uploadConfig` | `textarea` | `{"provider":"transloadit","transloadit":{"key":"DEMO_KEY","templateId":"DEMO_TEMPLATE"}}` | Upload Config (JSON) | Provider configuration — transloadit or filestack |  | no |

## Properties
| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `duplicateResults` | `DuplicateResult[]` | no | `[]` | Duplicate check results returned by the parent after filesSelected emission. Each entry contains fileId, isDuplicate, and optional suggestedName. |
| `uploadConfig` | `UploadConfig \| null` | no | `null` | Upload provider configuration. Supports transloadit (full) and filestack (stub). |
| `filesSelected` | `EventEmitter<UploadFile[]>` | no | `-` | Output: emitted immediately after the user selects or drops files, before upload begins. Use this to trigger duplicate checking. |
| `uploadConfirmed` | `EventEmitter<UploadFile[]>` | no | `-` | Output: emitted when the user clicks the Upload button. The parent calls the upload service. |
| `close` | `EventEmitter<void>` | no | `-` | Output: emitted when the user clicks Close or Continue (after success). Use to hide the uploader. |

## Demos
### 1. Default Uploader

- Category: Examples
- Component type: custom
- Layout: vertical
- Gap: N/A
- Component tag: ntv-uploader

Drag-and-drop uploader with validation, duplicate detection, and Transloadit integration.

#### Instance 1

Rendered HTML example:

```html
<ntv-uploader
  [duplicateResults]="[]"
  [uploadConfig]="{ provider: 'transloadit', transloadit: { key: 'DEMO_KEY', templateId: 'DEMO_TEMPLATE' } }"
  (filesSelected)="onFilesSelected($event)"
  (uploadConfirmed)="onUploadConfirmed($event)"
  (close)="showUploader = false"
/>
```
