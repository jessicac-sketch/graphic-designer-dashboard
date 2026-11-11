/** Third Party Imports */
import type { NextFunction, Request, Response } from 'express';

/**
 * Security headers middleware.
 * Implements security headers as per penetration test findings (NCA-3.5).
 *
 * @remarks
 * Headers are applied in order of complexity:
 * - Simple headers: HSTS, X-Content-Type-Options (implemented first)
 * - Complex headers: CSP, Permissions Policy, Referrer Policy (implemented after testing)
 *
 * @param req - Express request
 * @param res - Express response
 * @param next - Next middleware function
 * @returns void
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
    // ============================================================================
    // SIMPLE HEADERS (No functional impact)
    // ============================================================================

    /**
     * Strict-Transport-Security (HSTS)
     * Forces HTTPS connections for 1 year, including subdomains.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security
     */
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

    /**
     * X-Content-Type-Options
     * Prevents MIME type sniffing attacks.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options
     */
    res.setHeader('X-Content-Type-Options', 'nosniff');

    /**
     * X-Frame-Options
     * Prevents clickjacking by allowing framing only from same origin.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options
     */
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');

    // ============================================================================
    // COMPLEX HEADERS (Test carefully before deployment)
    // ============================================================================

    /**
     * Content-Security-Policy (CSP)
     * Restricts sources for scripts, styles, images, etc.
     *
     * Current policy allows:
     * - Scripts: Same origin + inline (for Angular)
     * - Styles: Same origin + inline + unsafe-inline (for component styles)
     * - Images/media: Same origin + data URIs (add your media CDN here)
     * - Fonts: Same origin + data URIs
     * - Connect: Same origin + Font Awesome kit (add your backend here if the browser calls it)
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
     */
    const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://kit.fontawesome.com", // unsafe-eval needed for Angular dev mode
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://kit.fontawesome.com", // unsafe-inline needed for Angular component styles
        // blob: for the uploader's local previews; Filestack CDN for library files
        "img-src 'self' data: blob: https://cdn.filestackcontent.com",
        "media-src 'self' blob: https://cdn.filestackcontent.com",
        "font-src 'self' data: https://fonts.gstatic.com https://kit.fontawesome.com https://ka-p.fontawesome.com",
        // Filestack uploads: its API, then the file parts straight to its S3 buckets
        "connect-src 'self' https://ka-f.fontawesome.com https://ka-p.fontawesome.com https://*.filestackapi.com https://*.amazonaws.com",
        "frame-ancestors 'self'",
        "base-uri 'self'",
        "form-action 'self'",
    ].join('; ');
    res.setHeader('Content-Security-Policy', csp);

    /**
     * Permissions-Policy
     * Controls which browser features and APIs can be used.
     *
     * Disabled features:
     * - geolocation, microphone, camera (not needed)
     * - payment (not implemented)
     * - usb, serial, bluetooth (not needed)
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy
     */
    const permissionsPolicy = [
        'geolocation=()',
        'microphone=()',
        'camera=()',
        'payment=()',
        'usb=()',
    ].join(', ');
    res.setHeader('Permissions-Policy', permissionsPolicy);

    /**
     * Referrer-Policy
     * Controls how much referrer information is sent with requests.
     *
     * strict-origin-when-cross-origin:
     * - Same origin: Full URL
     * - Cross origin HTTPS: Origin only
     * - Cross origin HTTP (downgrade): No referrer
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy
     */
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    next();
}
