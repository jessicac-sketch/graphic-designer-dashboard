# Security Headers Implementation

## Overview

This document describes the HTTP security headers implemented in response to penetration test findings (NCA-3.5).

## Implemented Headers

### 1. Strict-Transport-Security (HSTS) ✅

**Value:** `max-age=31536000; includeSubDomains`

**Purpose:** Forces browsers to use HTTPS for 1 year, including all subdomains.

**Impact:** ✅ No functional issues

---

### 2. X-Content-Type-Options ✅

**Value:** `nosniff`

**Purpose:** Prevents browsers from MIME-sniffing responses away from declared content-type.

**Impact:** ✅ No functional issues

---

### 3. X-Frame-Options ✅

**Value:** `SAMEORIGIN`

**Purpose:** Prevents clickjacking by only allowing the site to frame itself.

**Impact:** ✅ No functional issues

---

### 4. Content-Security-Policy (CSP) ⚠️

**Value:**

```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://kit.fontawesome.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://kit.fontawesome.com;
img-src 'self' data:;
media-src 'self';
font-src 'self' data: https://fonts.gstatic.com https://kit.fontawesome.com https://ka-p.fontawesome.com;
connect-src 'self' https://ka-f.fontawesome.com https://ka-p.fontawesome.com;
frame-ancestors 'self';
base-uri 'self';
form-action 'self'
```

**Purpose:** Restricts sources for scripts, styles, images, and other resources.

**Current Policy:**

- ✅ Scripts from same origin + inline (Angular requires this) + FontAwesome Kit
- ✅ Styles from same origin + inline (component styles) + Google Fonts + FontAwesome
- ✅ Images and media from same origin + data URIs (add your media CDN when you have one)
- ✅ Fonts from same origin + Google Fonts + FontAwesome CDN
- ✅ API connections to same origin (the BFF) + FontAwesome CDN
- ⚠️ `unsafe-eval` enabled (needed for Angular dev mode)

**Impact:** ⚠️ Test thoroughly before production

**Production Hardening:**

- Remove `unsafe-eval` from `script-src` (requires Angular production build)
- Consider removing `unsafe-inline` with nonce-based CSP

---

### 5. Permissions-Policy ✅

**Value:**

```
geolocation=(),
microphone=(),
camera=(),
payment=(),
usb=()
```

**Purpose:** Disables browser features not needed by the application.

**Impact:** ✅ No functional issues (features not used)

**Note:** `bluetooth` and `serial` features removed as they are not valid Permissions-Policy directives in current browsers.

---

### 6. Referrer-Policy ✅

**Value:** `strict-origin-when-cross-origin`

**Purpose:** Controls how much referrer information is sent with requests.

**Behavior:**

- Same origin → Full URL
- Cross origin (HTTPS) → Origin only
- Cross origin (HTTP downgrade) → No referrer

**Impact:** ✅ No functional issues

---

## Implementation Location

**File:** `src/server/middleware/security.middleware.ts`

**Applied:** All responses via Express middleware in `src/server/main.ts`

---

## Testing Checklist

### Before Deployment

- [ ] Test simple headers first (HSTS, X-Content-Type-Options, X-Frame-Options)
- [ ] Verify HTTPS redirection works with HSTS
- [ ] Test CSP doesn't break Angular application
- [ ] Verify images load from any media CDN you added to `img-src` / `media-src`
- [ ] Check browser console for CSP violations

### Production Hardening

- [ ] Remove `unsafe-eval` from CSP (production build only)
- [ ] Consider nonce-based CSP for inline scripts
- [ ] Review CSP violations in production logs
- [ ] Add CSP reporting endpoint

---

## Verification

### Check Headers in Browser

1. Open DevTools → Network tab
2. Reload page
3. Click any request
4. View Response Headers
5. Verify all security headers are present

### Check Headers via curl

```bash
curl -I https://your-domain.com
```

Expected output:

```
HTTP/2 200
strict-transport-security: max-age=31536000; includeSubDomains
x-content-type-options: nosniff
x-frame-options: SAMEORIGIN
content-security-policy: default-src 'self'; ...
permissions-policy: geolocation=(), ...
referrer-policy: strict-origin-when-cross-origin
```

---

## CSP Violation Reporting

To monitor CSP violations, add reporting:

```typescript
const csp = [
    // ... existing directives
    'report-uri /api/csp-report',
    'report-to csp-endpoint',
].join('; ');
```

---

## References

- [MDN: HTTP Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers)
- [OWASP Security Headers](https://owasp.org/www-project-secure-headers/)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [securityheaders.com](https://securityheaders.com/) - Test your headers

---

**Last Updated:** 2026-06-02  
**Compliance:** NCA-3.5 Penetration Test Findings
