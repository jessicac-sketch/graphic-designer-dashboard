---
name: data-design-skill
description: Guides visual design, component selection (mapping concepts to Component Pantry components), and premium ApexCharts styling.
---

# Data & UX Design Skill

Use this skill when the user provides a high-level feature concept, raw data, or a UX problem and wants to know:
1. Which `@ntv360/component-pantry` component is the best fit.
2. How to design, lay out, and style that component beautifully.
3. How to structure and style data visualizations (e.g. ApexCharts/SVGs) effectively with premium visuals.

## Rules & Interaction Model
1. **Analyze the Concept:** Identify the core goal of the feature (e.g., comparison, trend tracking, single value status, high-density listing, multi-step action).
2. **Consult the Mapping Matrix:** Open `./references/component-mapping-matrix.md` to select the best match from the pantry.
3. **Apply Visual Design Guidelines:**
   - For regular components, suggest specific configurations (variants, spacing, colors) that make them look premium.
   - For charts (Donut, Graph, Radial, etc.), open `./references/chart-design-guidelines.md` and use the design guidelines (fonts, gradients, grid properties, and color palettes).
4. **Coordinate with Component Pantry Skill:** Once you have suggested the best component and design, recommend using the `component-pantry-skill` to look up the exact code implementation snippet and options.
5. **Respect Coding Standards:** Any SCSS or TypeScript generated for component wrappers must follow project standards. Refer to `ng-code-skill` → `styling-standards.md` and `ts-standards.md` for the rules.

## Quick Core Suggestions
- **For Data Over Time (Trends):** Suggest `ntv-graph` (Line/Bar) with smooth curves, gradient area fills, and high-quality colors (e.g. Violet/Indigo theme).
- **For Parts-of-a-Whole Breakdown:** Suggest `ntv-donut-graph` with a clean color palette. Keep categories under 6.
- **For Single High-Priority KPI:** Suggest `ntv-radial-graph` with custom percentages or status colors (Teal for success, Amber for warning).
- **For High-Density Tabular Information:** Suggest `ntv-table` configured with column filtering and sorting options.
- **For Dynamic File Uploading UI:** Suggest `ntv-uploader` in an overlay container.

> **Pipeline:** Once the component and design are decided, hand off to `component-pantry-skill` for exact API and implementation details, then `ng-code-skill` for code quality enforcement.

Refer to the files in `./references/` for detailed guides and design specifications.
