---
name: angular-app-harness
description: >
  Guides Angular app work (building, extending, scaffolding) in this workspace.
  Use when writing Angular components, services, routing, SSR/BFF, security
  headers, or any code that must follow the WARP architecture and project
  coding standards.
---

# Angular App Harness

## Core Defaults (always apply)
- Standalone Angular components only — no NgModules
- SSR/BFF-safe: use `isPlatformBrowser()` for browser-only APIs
- Zoneless change detection via `provideZonelessChangeDetection()`
- Use `signal()` / `computed()` / `inject()` — not constructor injection
- Follow existing repo patterns before introducing new ones
- Minimal diff — boring, smallest-safe change wins

## How to Use
1. Identify the topic(s) for the task from the Reference Index below.
2. Open **only** the matching file(s) from `./references/` — do not load all at once.
3. Apply the rules found there to the task at hand.
4. When in conflict: **repo implementation > this skill > generic Angular best practices**.

## Reference Index

| Topic | When to Load | File |
|---|---|---|
| Angular coding rules, component/routing/state patterns | Any Angular component/service work | [dev-rule.md](./references/dev-rule.md) |
| WARP folder structure, path aliases, import ordering | New features, scaffolding, import fixes | [warp.md](./references/warp.md) |
| UI design, brand tokens, Component Pantry usage rules | Building/updating UI screens | [design.md](./references/design.md) |
| SCSS/BEM, JSDoc, TypeScript strict standards | Styling or writing TypeScript code | [standards.md](./references/standards.md) |
| BFF MVC pattern (routes/controllers/services) | Adding/modifying server-side BFF code | [bff-architecture.md](./references/bff-architecture.md) |
| BFF complete code example | Need to see a full working BFF feature | [bff-implementation-example.md](./references/bff-implementation-example.md) |
| HTTP security headers, CSP, middleware config | Security or server middleware work | [security-headers.md](./references/security-headers.md) |
