/** Node Imports */
import { existsSync } from 'node:fs';
import { join } from 'node:path';

/** Third Party Imports */
import express from 'express';

/** Local Imports */
import { SERVER_CONFIG } from './config/environment.config.js';
import { validateOrigin } from './middleware/origin.middleware.js';
import { requireAuth } from './middleware/require-auth.middleware.js';
import { resolveDateZone } from './middleware/resolve-date-zone.middleware.js';
import { securityHeaders } from './middleware/security.middleware.js';
import authRoutes from './routes/auth.routes.js';
import libraryRoutes from './routes/library.routes.js';
import mediaFilesRoutes from './routes/media-files.routes.js';
import { httpClient } from './services/http-client.service.js';

/**
 * Location of the compiled Angular SPA.
 * In production the BFF bundle lives at dist/internal-tool-boilerplate/server/server.mjs,
 * so the browser build sits next to it at dist/internal-tool-boilerplate/browser.
 * Override with BROWSER_DIST_DIR if deploying the assets elsewhere.
 */
const browserDistFolder =
    process.env['BROWSER_DIST_DIR'] || join(import.meta.dirname, '../browser');

const app = express();

/**
 * Disable X-Powered-By header
 * Prevents information disclosure about Express.
 */
app.disable('x-powered-by');

/**
 * Security Headers Middleware
 * Applies security headers to all responses (NCA-3.5 compliance).
 */
app.use(securityHeaders);

/**
 * BFF Middleware Configuration
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Request logging middleware (development only)
 */
if (SERVER_CONFIG.ENABLE_LOGGING) {
    app.use((req, _res, next) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
        next();
    });
}

/**
 * BFF API Routes - Auth
 * Deliberately unauthenticated - the login page must work while logged out.
 */
app.use('/api/auth', authRoutes);

/**
 * BFF API Routes - Media Files
 * Served from the in-memory dummy dataset (services/data-store.service.ts).
 * Requires a valid session - see `requireAuth`.
 */
app.use('/api/media-files', requireAuth, resolveDateZone, mediaFilesRoutes);

/**
 * BFF API Routes - Mini-Library
 * Served from the in-memory dummy library (services/library.service.ts).
 * Requires a valid session - see `requireAuth`.
 */
app.use('/api/library', requireAuth, libraryRoutes);

/**
 * BFF API Routes - Generic Proxy
 * Forwards all /api requests to the backend while hiding the backend URL.
 * Origin validation ensures only your frontend can use this proxy.
 */
const proxyHandler = async (req: express.Request, res: express.Response) => {
    try {
        const method = req.method.toLowerCase() as 'get' | 'post' | 'put' | 'patch' | 'delete';
        // Include /api prefix since backend expects the full path
        const endpoint = `/api${req.path}`;

        console.log({ data: req.body });

        let response;
        if (method === 'get' || method === 'delete') {
            response = await httpClient[method](endpoint);
        } else {
            response = await httpClient[method](endpoint, req.body);
        }

        res.json(response);
    } catch (error) {
        console.error(`[Proxy] Request failed: ${req.method} ${req.path}`, error);
        const statusCode = (error as any)?.response?.status || 500;
        const errorData = (error as any)?.response?.data || {
            error: 'proxy_error',
            errorDescription: 'Unable to complete request.',
        };
        res.status(statusCode).json(errorData);
    }
};

// Catch-all for the remaining API routes, registered before the SPA fallback
// so /api/* never falls through to index.html
app.use('/api', validateOrigin, (req, res, next) => {
    proxyHandler(req, res).catch(next);
});

/**
 * Serve the Angular SPA (production only).
 * During development the Angular dev server serves the app and proxies /api here.
 */
if (existsSync(browserDistFolder)) {
    const indexHtml = join(browserDistFolder, 'index.html');

    app.use(
        express.static(browserDistFolder, {
            maxAge: '1y',
            index: false,
            redirect: false,
        }),
    );

    /**
     * SPA fallback: any other GET request returns index.html so the
     * Angular router can resolve the route client-side.
     */
    app.get('/{*splat}', (_req, res) => {
        res.setHeader('Cache-Control', 'no-cache');
        res.sendFile(indexHtml);
    });
}

/**
 * Start the BFF server.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
app.listen(SERVER_CONFIG.PORT, (error) => {
    if (error) {
        throw error;
    }

    console.log(`BFF server listening on http://localhost:${SERVER_CONFIG.PORT}`);
});
