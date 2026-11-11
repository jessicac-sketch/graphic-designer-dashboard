/**
 * Bundles the Express BFF (src/server) into a single ESM file that sits next to
 * the Angular browser build: dist/internal-tool-boilerplate/server/server.mjs
 *
 * Dependencies are bundled so the output can run without node_modules.
 */
import { build } from 'esbuild';

await build({
    entryPoints: ['src/server/main.ts'],
    outfile: 'dist/internal-tool-boilerplate/server/server.mjs',
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'esm',
    sourcemap: true,
    minify: process.env.NODE_ENV === 'production',
    tsconfig: 'tsconfig.server.json',
    // Allow bundled CommonJS dependencies (express, axios, dotenv) to use require() inside ESM output
    banner: {
        js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);",
    },
    logLevel: 'info',
});
