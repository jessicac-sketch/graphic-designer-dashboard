# Beautiful Data Visualization Guidelines (ApexCharts & SVGs)

Follow these design rules to ensure charts look premium, modern, and aligned with state-of-the-art dashboards.

## 1. Typography
- Always override default charts typography to match the main app font.
- Set `fontFamily: 'Inter, Outfit, system-ui, sans-serif'` in your charts option config.
- Font weights: Titles should be medium (`500` or `600`), axis labels should be light/normal (`400`).

## 2. Cohesive Color Palettes
Avoid plain, saturated CSS colors (pure red, green, blue). Use curated hex codes from the palettes below:

### Indigo / Violet (Default Tech Palette)
- Primary Series: `#6366F1` (Indigo 500)
- Secondary Series: `#8B5CF6` (Violet 500)
- Accent Series: `#EC4899` (Pink 500)

### Emerald / Teal (Financial, Positive Metrics)
- Primary Series: `#10B981` (Emerald 500)
- Secondary Series: `#0D9488` (Teal 600)
- Accent Series: `#06B6D4` (Cyan 500)

### Amber / Orange (Warning, High Attention Metrics)
- Primary Series: `#F59E0B` (Amber 500)
- Secondary Series: `#F97316` (Orange 500)
- Accent Series: `#EF4444` (Red 500)

## 3. Line & Area Charts Styling
To make line and area charts feel premium:
- **Stroke Curve:** Set `stroke: { curve: 'smooth', width: 3 }` instead of straight lines.
- **Area Fills (Gradients):** For Area/Line charts, use smooth semi-transparent gradients to fill the area under the curve:
  ```javascript
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.4,
      opacityTo: 0.05,
      stops: [0, 90, 100]
    }
  }
  ```
- **Grid Lines:** Keep grid lines very subtle. Never use dark solid lines.
  ```javascript
  grid: {
    borderColor: '#f1f5f9', // light slate grey
    strokeDashArray: 4,      // dashed lines
    xaxis: { lines: { show: false } }, // only keep horizontal lines
    yaxis: { lines: { show: true } }
  }
  ```
- **Markers:** Hide markers under normal states and show/enlarge them on hover:
  ```javascript
  markers: {
    size: 0,
    hover: { size: 6 }
  }
  ```

## 4. Don't Overcrowd
- **X/Y Axis:** Limit the number of grid lines and axis ticks. Hide borders on axes: `axisBorder: { show: false }` and `axisTicks: { show: false }`.
- **Legends:** Keep legends clean and position them systematically (e.g., top-right for dashboards, bottom for narrow panels).
- **Data Labels:** Turn off data labels on lines/bars unless specifically requested. Use sleek tooltips instead.

## 5. Component Configuration Links
When mapping custom data design concepts to the Component Pantry, apply these styling options to:
- `ntv-graph` (Line & Bar ApexCharts wrapper): Configure its `colors` property and properties in `GraphConfig`.
- `ntv-donut-graph` (Donut ApexCharts wrapper): Use custom color palettes (`colors` list) matching the themes above.

## 6. Chart Wrapper CSS Rules

When writing SCSS for containers and wrappers around chart components:

- **BEM naming required** — chart wrapper containers must follow BEM naming (e.g. `.campaign-stats__chart`, `.dashboard-card__graph-wrapper`).
- **No hardcoded hex colors in SCSS** — consume color tokens from `tailwind.config.js` via `@apply` or CSS variables. The color palettes in sections 2–3 above are for ApexCharts `colors` arrays only (JavaScript config), not for SCSS.
- **`::ng-deep` is never used** to style colors on `ntv-graph`, `ntv-donut-graph`, or `ntv-radial-graph`. Chart colors are controlled via the component's `colors` input array (JavaScript), not CSS overrides.
- **Dynamic colors via `[style.*]`** — if a chart wrapper needs a runtime color (e.g. status-based background), use `[style.background]="card.color"` data binding. Static `style=""` inline attributes are not allowed.

