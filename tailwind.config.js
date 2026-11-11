const fs = require('fs');

/**
 * @ntv360/component-pantry ships as an ESM package ("type": "module") but its
 * tailwind-preset.js is written in CJS syntax, so a plain require() silently
 * resolves to an empty object instead of throwing. Executing the file's source
 * manually as CJS sidesteps that interop mismatch.
 */
function loadCjsModule(filePath) {
    const mod = { exports: {} };
    const fn = new Function('module', 'exports', 'require', fs.readFileSync(filePath, 'utf8'));
    fn(mod, mod.exports, require);
    return mod.exports;
}

const pantryPreset = loadCjsModule(require.resolve('@ntv360/component-pantry/tailwind-preset.js'));

/** @type {import('tailwindcss').Config} */
module.exports = {
    presets: [pantryPreset],
    content: ['./src/**/*.{html,ts}', './node_modules/@ntv360/component-pantry/**/*.{mjs,css}'],
    darkMode: 'class', // Enable class-based dark mode for manual toggle control only
    theme: {
        extend: {
            // Small text sizes, in rem so they follow the user's browser / OS text size
            // (Tailwind's own text-xs / text-sm are rem too). Font size only, no line
            // height. `text-label`: the 11px mono labels; `text-micro`: the 10px tags.
            fontSize: {
                label: '0.6875rem',
                micro: '0.625rem',
            },
            fontFamily: {
                sans: ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                mono: ['DM Mono', 'ui-monospace', 'monospace'],
            },
            colors: {
                // App theme tokens (CSS variables in src/styles/_theme.scss)
                surface: {
                    base: 'var(--app-surface-base)',
                    raised: 'var(--app-surface-raised)',
                    border: 'var(--app-surface-border)',
                    hover: 'var(--app-surface-hover)',
                },
                field: {
                    bg: 'var(--app-field-bg)',
                    border: 'var(--app-field-border)',
                },
                status: {
                    good: 'var(--app-status-good)',
                    warn: 'var(--app-status-warn)',
                    crit: 'var(--app-status-crit)',
                },
                brand: {
                    DEFAULT: 'var(--app-brand)',
                    strong: 'var(--app-brand-strong)',
                    soft: 'var(--app-brand-soft)',
                },
                content: {
                    primary: 'var(--app-content-primary)',
                    secondary: 'var(--app-content-secondary)',
                    muted: 'var(--app-content-muted)',
                },

                // Toggle active color
                'toggle-active': 'var(--toggle-active-color, #8DCB2C)',
                // Temp still need validation
                porcelain: '#F3F3F5',
                platinum: '#E6E7EA', //currently used by hover stroke,
                lightGrey: '#D8DADF',
                milkWhite: 'FCFCFC', // used by: date in next month
                iron: '#C9CCD2', // used by: past date text,

                // Default theme colors (matching global.css variables)
                default: {
                    DEFAULT: '#c0c4cc',
                    primary: '#8dcb2c',
                    'primary-focused': '#7ab82a',
                    success: '#10b981',
                    danger: '#dc2626',
                    white: '#ffffff',
                    'white-focused': '#f9fafb',
                    'description-white': '#F8F8F9',
                },
                neutral: {
                    50: '#ffffff',
                    100: '#f9fafb',
                    200: '#F8F8F9',
                    300: '#999eaa',
                },
                'neutral-dark': {
                    50: '#f0f2f9',
                    100: '#d9e0f0',
                    200: '#b3c1e1',
                    300: '#8ca2d2',
                    400: '#6683c3',
                    500: '#4064b4',
                    600: '#091635',
                    700: '#071229',
                    800: '#050e1d',
                    900: '#030a11',
                },
                primary: {
                    30: '#f5f7fc',
                    50: '#f0f2f9',
                    100: '#d9e0f0',
                    200: '#b3c1e1',
                    300: '#8ca2d2',
                    400: '#6683c3',
                    500: '#4064b4',
                    600: '#091635',
                    700: '#071229',
                    800: '#050e1d',
                    900: '#030a11',
                    main: '#4064b4',
                },
                accent: {
                    30: '#fafff5',
                    50: '#f7fcf0',
                    100: '#e8f5d1',
                    200: '#d1eba3',
                    300: '#bae175',
                    400: '#a3d747',
                    500: '#8dcb2c',
                    600: '#71a223',
                    700: '#55791a',
                    800: '#395011',
                    900: '#1d2808',
                    main: '#8dcb2c',
                },
                description: {
                    600: '#6b7280', // gray-600
                    700: '#4b5563', // gray-700
                    500: '#9ca3af', // gray-500
                },
                info: {
                    50: '#f0f6ff',
                    100: '#d1e7ff',
                    200: '#a3cfff',
                    300: '#75b7ff',
                    400: '#479fff',
                    500: '#095af3',
                    600: '#0748c2',
                    700: '#053691',
                    800: '#032460',
                    900: '#011230',
                    main: '#095af3',
                },
                information: {
                    50: '#f0f6ff',
                    100: '#d1e7ff',
                    200: '#a3cfff',
                    300: '#75b7ff',
                    400: '#479fff',
                    500: '#095af3',
                    600: '#0748c2',
                    700: '#053691',
                    800: '#032460',
                    900: '#011230',
                    main: '#095af3',
                },
                alert: '#26A69A',
                success: {
                    50: '#f0fdf4',
                    100: '#dcfce7',
                    200: '#bbf7d0',
                    300: '#86efac',
                    400: '#4ade80',
                    500: '#3adb30',
                    600: '#16a34a',
                    700: '#15803d',
                    800: '#166534',
                    900: '#14532d',
                    main: '#3adb30',
                },
                warning: {
                    50: '#fffbeb',
                    100: '#fef3c7',
                    200: '#fde68a',
                    300: '#fcd34d',
                    400: '#fbbf24',
                    500: '#ffa500',
                    600: '#d97706',
                    700: '#b45309',
                    800: '#92400e',
                    900: '#78350f',
                    main: '#ffa500',
                },
                danger: {
                    50: '#fef2f2',
                    100: '#fee2e2',
                    200: '#fecaca',
                    300: '#fca5a5',
                    400: '#f87171',
                    500: '#e73535',
                    600: '#dc2626',
                    700: '#b91c1c',
                    800: '#991b1b',
                    900: '#7f1d1d',
                    main: '#e73535',
                },
                // Dark mode specific colors
                dark: {
                    bg: {
                        primary: '#1f2937', // gray-800
                        secondary: '#374151', // gray-700
                        tertiary: '#4b5563', // gray-600
                    },
                    text: {
                        primary: '#f9fafb', // gray-50
                        secondary: '#e5e7eb', // gray-200
                        tertiary: '#d1d5db', // gray-300
                        muted: '#9ca3af', // gray-400
                    },
                    border: {
                        primary: '#4b5563', // gray-600
                        secondary: '#6b7280', // gray-500
                    },
                    accent: {
                        primary: '#3b82f6', // blue-500
                        secondary: '#1d4ed8', // blue-700
                        hover: '#2563eb', // blue-600
                    },
                },
            },
        },
    },
    plugins: [],
};
