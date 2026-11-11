/**
 * Chart colors. They match the theme tokens in src/styles/_theme.scss: ECharts and
 * ApexCharts need literal values, not CSS variables, so keep the two in step.
 *
 * The first four keys are shared with gbp-management-tool-ui; the rest cover this app's
 * maps and multi-series charts.
 */
export const CHART_COLORS = {
    /** NTV360 orange (--app-brand): the highlighted series / selection */
    brand: '#f17f28',
    /** Secondary text (--app-content-secondary): axis labels, legends */
    secondary: '#c3ccd0',
    /** Muted text (--app-content-muted): minor labels, inactive items */
    muted: '#7d8c94',
    /** Borders and grid lines (--app-surface-border) */
    border: '#233b46',

    /** Primary text (--app-content-primary): titles, values, tooltips */
    primary: '#f5f8f9',
    /** Page background (--app-surface-base): chart canvas, map "ocean" */
    surfaceBase: '#01131f',
    /** Cards and panels (--app-surface-raised): tooltips, empty map regions */
    surfaceRaised: '#071f2b',
    /** Hover tint (--app-surface-hover): axis pointer shadows */
    hover: 'rgba(255, 255, 255, 0.04)',
    /** Loading overlay: the page background at 60% */
    mask: 'rgba(1, 19, 31, 0.6)',

    /** Sequential low → high scale for choropleths (navy to pale teal; orange stays for selection) */
    scale: ['#0f3443', '#2d6b80', '#8fc1cf'],

    /** Categorical palette for multi-series charts (e.g. one line per device), readable on navy */
    series: [
        '#60a5fa',
        '#4ade80',
        '#f472b6',
        '#facc15',
        '#a78bfa',
        '#2dd4bf',
        '#fb923c',
        '#c3ccd0',
    ],
} as const;
