---
name: rayfin-functions
description: "Use only when requested to add trusted backend actions, external API calls, or Rayfin Functions; covers opt-in workspace setup, auth, typed invocation, and validation."
---
# Optional Functions

Functions are disabled in this lab. Do not install their dependencies, enable them, move seed/reset work server-side, or add feature UI for a guidance-only request.

## Read before setup

Use installed guide `functions/index.md`, `functions/writing-functions.md`, `functions/typegen.md`, `functions/invoking-from-frontend.md`, and `cli/functions/{init,dev-apply,deploy}.md`. Read `functions/secrets.md` and `functions/connections/index.md` for sensitive/external work. Resolve docs through package `rayfinDocs` metadata.

The 2.0.0 guide's init page describes a generic nested project. The installed 2.0.0 CLI's `functions init --help` additionally supports `--path` and npm workspaces; use that verified surface here. Require this app's Node >=22.13.0, Azure Functions Core Tools for local hosting, and an approved Fabric deployment for backend access.

## Opt in without replacing the app

After explicit feature approval, run from the app root:

```bash
npx rayfin functions init --path packages/functions
```

This writes files, enables Functions, installs/builds, generates types, and may refresh agent files. It is not a preview. Review the diff and retain this app's curated guidance, MCP pin, auth/data configuration, and lockfile ownership. Do not use `--force`. The existing `packages/*` workspace glob covers the new package.

- Keep `src/function_app.ts`, generated `src/types.ts`, `host.json`, and local host settings in `packages/functions/`. Rename the generated generic package to `@field-services/functions`; retain `private`, ESM, and its actual emitted `main` path (`dist/src/function_app.js` in the 2.0.0 CLI scaffold).
- The server dependency is `@microsoft/fabric-user-data-functions`, matched to CLI 2.0.0 by initialization. Use `^2.0.0` for subsequent lab additions. Preserve the existing TypeScript 5 toolchain; do not copy scaffold TypeScript 6 settings.
- Install the frontend adapter at the root with `npm install @microsoft/rayfin-functions@^2.0.0 --workspace @field-services/frontend`. Add `@field-services/shared: "*"` to Functions when consuming its contracts, and `@field-services/functions: "*"` to frontend for a type-only contract export. Reconcile all installs with one root `package-lock.json`; do not maintain a nested lockfile.
- Keep Functions scripts `build: tsc --build` and `build:watch: tsc --build --watch`. Add its project to root `tsconfig.json` references and the serial root build after shared and before frontend. Add a Functions reference to `../shared` when importing shared types; do not point at the configuration-only `rayfin/` project.
- Export `./types` from the Functions package with `types: "./dist/src/types.d.ts"`; frontend imports only `AppFunctionsSchema` from `@field-services/functions/types` with `import type`. Add `../functions` to frontend's TypeScript project references so clean builds produce that declaration first. Never load `function_app` or server dependencies in the browser. Keep generated contracts browser-safe.

Merge only the Functions block into `rayfin/rayfin.yml`:

```yaml
services:
  functions:
    enabled: true
    path: packages/functions
    auth:
      type: application
    buildCommand: npm run build
```

Do not replace other services. Full approved `npx rayfin up` is required to sync the remote auth/service setting; `up functions deploy` alone only uploads code.

## Register and authorize

Import `UserDataFunctions` and `type RayfinContext` from `@microsoft/fabric-user-data-functions`, not the frontend adapter:

```ts
import { UserDataFunctions } from '@microsoft/fabric-user-data-functions';

const udf = new UserDataFunctions();
udf.func('greet', (name: string): string => `Hello ${name}`, []);
```

Use `RayfinContext<FieldServiceSchema>` for caller-scoped data and `ctx.getDataClient()` so database policies apply. Validate input, bound work, stamp owner fields from `ctx.user.id`, and return safe typed results. Explicitly enforce any operation-specific authorization; sign-in or the manager view alone does not grant a privileged action.

External `ctx.Tokens` connections run as the app identity (currently the Fabric app item owner), not the invoking user. Declare audiences per the connection guide and grant that identity the required resource permissions; an audience declaration grants nothing. Keep tokens server-side. Do not use raw SQL to bypass caller policies.

Use `npx rayfin secret set <NAME>` with its masked prompt only for an approved target, then read `ctx.Secrets.NAME`. The CLI generates `src/secrets.generated.ts`; never edit it. Local secrets belong under `Values` in ignored `packages/functions/local.settings.json`. Never commit local settings or return/log secrets.

## Compose and prove

In the existing `RayfinClientService.ts` factory add `functions: functionsService<AppFunctionsSchema>()` from `@microsoft/rayfin-functions`, preserving runtime config, auth, and data. For this custom Vite client, follow the 2.0.0 invocation guide: `functionsBaseUrl: resolveRayfinFunctionsBaseUrl()` from `@microsoft/rayfin-local-dev` uses the adapter's local route and returns undefined in production. Preserve the current Vite plugin and loopback binding; do not hard-code a production local-host URL.

`client.functions.greet.invoke({ name })` returns output directly and throws on failure. Catch failures at the UI boundary and display actionable errors; do not turn failure into a successful empty result.

After an approved full deployment exists, `npx rayfin dev functions apply` runs the host and typegen watcher; `npm run dev:fabric` starts the frontend separately. Alternatively `npm run dev` starts both and applies backend state. Typegen runs during init/dev, not via a fictitious standalone command; never hand-edit `src/types.ts`.

Run serial typecheck/build/tests, then invoke a safe function through the browser and verify changed code, invalid inputs, permission denial, and host-down errors. A local host failure must not silently invoke deployed code. After an approved full deploy, invoke again at the actual hosting URL with the intended caller; verify any writes by reload and clean up only disposable test records. `npx rayfin up functions deploy` is for later code-only retries, not auth migration. Report platform/identity limitations rather than claiming local success proves deployment.
