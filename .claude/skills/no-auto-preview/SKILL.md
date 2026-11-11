---
name: no-auto-preview
description: Enforces that Claude does NOT start, restart, or otherwise run this repo's dev/preview server (mcp__Claude_Browser__preview_start, `npm run start`, `npm run start:ssr:dev`, `ng serve`, or any equivalent) to verify a UI/frontend change, UNLESS the user explicitly asks for it in that same message (e.g. "run it", "start the server", "show me in the browser"). Use this every time Claude is about to verify a UI, template, style, or frontend behavior change in the programmatic-reports repo - before calling preview_start or any Bash command that launches the app. The user in this project has repeatedly and explicitly said they want to be the one who runs and tests the app themselves.
---

# No auto-preview

In this repo, the user runs and tests the app themselves. Do not launch the dev/preview server as part of verifying a change unless the user's own message, in that turn, explicitly asks for it.

## Why

The user has said this multiple times in this project, including once mid-task, correcting Claude for launching the preview server right after they'd asked to hold off. Re-launching it anyway - even "just to double-check" - repeats the same mistake and wastes their time re-explaining it.

## What this means concretely

- Don't call `mcp__Claude_Browser__preview_start`, `mcp__Claude_Browser__navigate`, or any Bash command that runs `npm run start*` / `ng serve` as a way to verify a change, unless the user's current message explicitly asked for that (e.g. "run it", "start the server", "show me", "test it in the browser").
- Static verification is still expected and welcome: `npx tsc --noEmit`, `npm run build`, linting, unit tests. Run these freely - they don't touch a running server and don't conflict with the user's preference.
- If a preview server happens to already be running (started by the user or earlier in the session with explicit permission) and the user asks you to check something in it, that's fine - the rule is about _starting/restarting_ it unprompted, not about using one that's already up at the user's direction.
- When you finish a change, say it's ready for the user to test themselves - mention what you verified statically (e.g. "type-check and build pass clean") - and stop there. Don't add "let me just confirm in the browser" as a next step.
- If you're unsure whether the user's message counts as an explicit ask, treat it as not explicit and skip launching the server - the user can always ask.
