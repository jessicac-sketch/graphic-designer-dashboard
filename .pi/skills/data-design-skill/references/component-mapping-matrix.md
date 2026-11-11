# Feature Concept to Component Mapping Matrix

Use this matrix to identify the ideal `@ntv360/component-pantry` component based on the concept or feature idea requested by the user.

## Component Selector Matrix

| Feature / Concept Idea | Recommended Component | Rationale & Design Tip |
| --- | --- | --- |
| **FAQ / Collapsible Accordion** | `ntv-accordion` | Projection-based. Good for nested FAQ sections. Use `flush` variant inside cards. |
| **Search/Filter with huge lists** | `ntv-autocomplete` | Supports lazy filtering, multi-select tags, and custom option templating. |
| **Page navigation path** | `ntv-breadcrumbs` | Perfect for showing location depth (Home > Subpage > Detail). |
| **General actions (Submit, Cancel, Save)**| `ntv-button` | Use variant classes (`primary`, `outline`, `danger`) to indicate hierarchy. Supports `loading` states. |
| **Schedules, bookings, time-slots** | `ntv-calendar-base` | Full interactive calendar wrapper. Good for date-heavy event panels. |
| **Content grouping, widgets, blocks** | `ntv-card` | The foundational shell. Combine with other components inside it. |
| **Media sliders, image slideshows** | `ntv-carousel` | Combines navigation slides with gallery thumbnail grids automatically. |
| **Time-range selection, range filters** | `ntv-date-range-picker` | Integrates two date pickers into a clean start/end input set. |
| **Specific date pickers** | `ntv-date-picker` | Standard popover calendar input for birthdays, single-day schedules. |
| **Breakdown of resources (e.g., storage)** | `ntv-donut-graph` | Ideal for representing percentage parts of a whole (under 6 categories). |
| **Data trends over time (Sales, Traffic)** | `ntv-graph` | High-fidelity bar/line chart. Supports multi-series and monthly/yearly filtering. |
| **Comparative progress rows** | `app-horizontal-graph` | Shows item lists with progress + remaining bars (e.g., target tracking). |
| **Single key metric (Uptime, Uptime %)** | `ntv-radial-graph` | Radial progress ring focusing on a single high-priority KPI. |
| **Interactive settings (On/Off, Enable)** | `ntv-toggle-button` | Switch toggle. More premium than standard checkbox for single settings. |
| **Data grid, multi-row lists with actions**| `ntv-table` | High-density grid with sorting, filtering, columns configuration, and actions. |
| **Tabbed pages/views within one card** | `ntv-tabs` | Navigation bar for toggling between sub-panels in a single container. |
| **Step-by-step forms, wizards** | `ntv-stepper` | Guiding users through onboarding or multi-step configuration inputs. |
| **Form text blocks / code editors** | `ntv-textarea` | Custom sizing, word counting, form validation support. |
| **User Notifications, action alerts** | `ntv-toast` | Temporary alerts with progress indicators. Place in a global overlay layout. |
| **Drawer menus, filters slide-in** | `ntv-offcanvas` | Slides from left/right edges. Great for responsive sidebars or filters. |
| **Rich information overlays** | `ntv-popover` | Floating popovers anchored to icons/text for deep context without modals. |
| **File attachments, drag-and-drop** | `ntv-uploader` | Rich file validations, duplicate detection, inline renaming. |
| **Grid/list of assets, media feed** | `ntv-thumbnail-gallery` | Excellent grid layouts for media assets, folders, or document cards. |
| **Individual media cards with hover** | `ntv-thumbnail-preview` | Individual cards with quick-actions overlay, selection state, and lightboxes. |
