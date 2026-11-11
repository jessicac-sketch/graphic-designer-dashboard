# Authentication

The template ships with a **single demo account** and no external identity provider, so it runs out of the box. There is no sign-up page.

## Demo account

| Email              | Password   |
| ------------------ | ---------- |
| `demo@example.com` | `demo1234` |

Built-in defaults - they work with no `.env` file. Override them with `DEMO_EMAIL` / `DEMO_PASSWORD` in `.env.dev` (or `.env.production`) and restart the BFF.

## How it works

- The Angular app calls the BFF's `/api/auth/*` endpoints; it never talks to an identity provider directly.
- `POST /api/auth/login` checks the credentials against `DEMO_EMAIL` / `DEMO_PASSWORD` (`src/server/config/environment.config.ts`, defaults in `.env.example`).
- On success the BFF sets an **httpOnly** session cookie (`app_session`): the user and an expiry, signed with `SESSION_SECRET` (HMAC SHA-256) - `src/server/services/session.service.ts`. The browser never sees or stores a token.
- `requireAuth` (`src/server/middleware/require-auth.middleware.ts`) protects `/api/media-files/*`: it verifies the cookie's signature and expiry on every request and sets `req.user`.
- Angular's `authGuard`/`guestGuard` gate routes by calling `GET /api/auth/session`. The app is a client-side SPA, so every `/api/*` call comes straight from the browser and carries the cookie automatically.

## Endpoints

| Method | Path                | Purpose                                               |
| ------ | ------------------- | ----------------------------------------------------- |
| POST   | `/api/auth/login`   | `{ email, password }` → signs in, sets session cookie |
| POST   | `/api/auth/logout`  | Clears the session cookie                             |
| GET    | `/api/auth/session` | Returns the current user, or 401                      |

## Environment

| Variable            | Default (development)  | Notes                                   |
| ------------------- | ---------------------- | --------------------------------------- |
| `DEMO_EMAIL`        | `demo@example.com`     |                                         |
| `DEMO_PASSWORD`     | `demo1234`             |                                         |
| `SESSION_SECRET`    | a fixed dev-only value | **Required** when `NODE_ENV=production` |
| `SESSION_TTL_HOURS` | `12`                   |                                         |

## Plugging in a real provider

Keep the endpoints, the cookie and the guards - only the credential check changes:

1. In `AuthController.login`, verify `{ email, password }` with your provider (Supabase Auth, Cognito, Auth0, your own users table...) instead of comparing against the demo account.
2. Either keep `sessionService` (issue the cookie once the provider confirms the user), or let the provider's server SDK manage its own httpOnly cookies and replace `sessionService.read` in `requireAuth` / `AuthController.session` with the provider's "get user from request" call.
3. Remove the `DEMO_*` variables and add the provider's to `.env.example` and `environment.config.ts`.
