---
name: app-validation
description: "Use for targeted static checks, browser behavior, authentication, and safe persistence validation in Field Services."
---
# App validation

Use the smallest check covering the change during development. For runtime changes, run applicable final checks serially from the app root:

```bash
npm run typecheck
npm run build
npm test
npm run seed:validate
```

The build type-checks shared/data/frontend projects; do not relax it or race it with typecheck because outputs are shared. There is no root lint command or capability validator. For focused tests, forward a Vitest selector with `npm test -- <test-file-or-pattern>`. Documentation-only changes need link, command, and consistency checks, not a runtime build.

Dependency changes require checking installation/lockfile consistency and documentation discovery. On the maintainer's macOS environment run Node/npm via `zsh -ilc '<command>'` to use the normal login profile.

## Browser and auth

For runtime changes, use the actual localhost URL Vite prints or the direct hosting URL returned by an approved deployment. Verify the Fabric host too when embedded behavior is affected. Starting `npm run dev` may apply remote state; obtain the intended target first.

- Check `/`, `/profile`, `/manager/`, and affected routes. Preserve the starter's missing lab features; do not assume the reference's completed exercises exist.
- Verify loading settles, configuration/sign-in/permission/query errors are actionable, and retry recovers without weakening auth.
- Test valid-session reload, stale-session handling, standalone sign-in, and actual Fabric embedded handoff as applicable. Local auto-login cannot prove deployed signed-out behavior.
- Trace a displayed value to its real query response. Check date/currency/percentage formatting, empty results, row limits, and overflow errors.
- Exercise keyboard access, visible focus, responsive layout, and relevant browser console errors.

## Persistence

For changed app-owned record behavior, create a clearly identified disposable test row, reload, update, reload, delete that row, then reload again. Verify server permissions separately; optimistic UI state is not persistence evidence.

Do not invoke demo reset as a validation shortcut. It requires explicit owner approval and `RESET <current-app-item-id>`. Restore must remain missing-ID-only and preserve edits; keep account/app-scoped checkpoints, dependency phases, uncertain-write reconciliation, pause/resume, and documented retry behavior. Manager navigation is not a role boundary.

Report separately what was statically checked, exercised locally, and verified in a deployed browser. Do not claim browser/persistence success from a build, CLI health response, or hosting URL alone.
