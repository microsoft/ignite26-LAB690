# Field Services

Rayfin app for field operations: managers create and assign work orders, Service Pros accept jobs and mark them complete.

This is the completed reference app for Ignite 2026 LAB690, including work-order comments, adapted from the [original Build 2026 sample](https://github.com/microsoft/Build26-LAB514-ship-ai-apps-fast-with-a-managed-backend-in-microsoft-fabric/tree/92ccdaa/src/field-services-app). It is not the pre-comments starter used in the lab exercises, which lives in [`template/field-services-app`](../../template/field-services-app/), and does not yet include the semantic-model dashboard. Rayfin packages use `^2.0.0`; `npx rayfin` and the npm scripts below use the project's installed CLI.

## Profiles

- **Service Pros** use `/`, create a profile on first access, list skills such as `painting, plumbing, hanging`, accept matching jobs, and mark their own jobs done. Profile editing lives at `/profile`.
- **Manager** uses `/manager/` to create work orders, assign Service Pros, and track status.

Both are demonstration views available to the same signed-in attendee. Switching views is not an authorization boundary; production roles would be assigned to identities and enforced server-side.

## Workspace structure

The app follows the npm workspace pattern in Project Rayfin's Universal App sample:

| Path | Responsibility |
| --- | --- |
| `packages/frontend/` | React UI, Vite, authentication, and static output in `dist/` |
| `packages/data/src/` | Decorated entities and schema registration; `index.ts` is the package entry point |
| `packages/shared/src/index.ts` | Browser-safe record contracts and `FieldServiceSchema`, with no runtime entity imports |
| `rayfin/rayfin.yml` | Backend configuration and service paths relative to the app root |

Run npm commands from this app directory. Install once at the root; keep one root lockfile. The build compiles shared contracts, data, and frontend in order. When changing entities, keep their shared contracts aligned.

## Data model

The Rayfin schema is based on `data/work-orders.jsonc`:

- `ServicePro`: name, comma-separated skills, auth user id, audit dates.
- `WorkOrder`: customer, address, task, scheduled date, status, optional assigned service pro, note, audit dates.
- `WorkOrderComment`: author user id, work-order id, content, and creation date.

One unassigned example work order is seeded on first load when no work orders exist. Its ID and baseline dates are fixed.

## Admin data tools

The authenticated route `/_admin/` provides two distinct operations. These are demo tools for the signed-in lab account, not a separately authorized administrator role:

- **Restore sample data** adds only missing baseline records. Stable UUIDs derived from each seed key make retries repeatable. Existing profiles, work orders, assignments, edits, and comments are not overwritten or deleted.
- **Reset app data** permanently removes all comments, work orders, and Service Pro profiles in the current app, then recreates the initial unassigned job. The UI shows the workspace/app IDs and requires typing `RESET <current-app-item-id>`, including when resuming after interruption. It never deletes Fabric items, workspaces, or capacity. Close other tabs using this app; clearing the full dataset can take several minutes. This is not a transaction.

Both operations run in browser-side chunks, without enabling backend Functions. A chunk stops starting new five-record batches after 20 seconds; in-flight SDK requests, reset inventory reads, and final verification can take longer. Confirmed progress is saved in local storage, scoped to the workspace, app, and signed-in account. Request timeouts and HTTP 408, 429, and 504 responses retry automatically from saved progress, with exponential backoff from 2 to 30 seconds or a longer server-requested Retry-After delay. Retries continue until completion or pause; the page shows when it is waiting. Uncertain writes are checked against the database before retrying, not skipped. Other errors, including mixed timeout/non-timeout failures, stop visibly. Select **Pause after current batch** to stop (also while waiting to retry), then **Resume restore** or **Resume reset** to continue after pause, reload, or other errors. Web Locks prevent competing admin operations in tabs sharing the same browser origin; they do not coordinate other browsers or devices. **Discard checkpoint** only forgets progress; it does not undo writes. Restore checkpoints are rejected if the seed dataset changes.

Comments allow authenticated create/read/delete so the lab account can reset the demo. This is not a production manager/service-pro authorization model; production would enforce identity-based policies and controlled maintenance access server-side.

The large seed lives in `packages/frontend/src/data/field-service-seed.json`. Its fixed date range is April 30, 2025 through April 30, 2026, with 12 synthetic Service Pros and 1,040 work orders. Synthetic identities are data, not sign-in credentials. Your signed-in profile and the initial job are separate and are preserved by restore.

| Baseline status | Work orders |
| --- | ---: |
| Pending (unassigned) | 92 |
| Assigned | 15 |
| In progress | 8 |
| Completed | 755 |
| Needs follow-up | 112 |
| Cancelled | 58 |

These counts describe the sample records before edits, not necessarily the app totals. A fresh reset followed by restore contains 12 synthetic profiles and 1,041 orders because the initial pending job remains. Creating your profile adds one more profile.

Regenerate and validate it with:

```bash
npm run seed:generate
npm run seed:validate
```

Generation defaults to the fixed end date and reproduces the checked-in JSON byte-for-byte. To deliberately generate a different dataset, use `npm run seed:generate -- --end YYYY-MM-DD`; update expected results and rehearse again before distributing it.

## Run

```bash
npm install
npx rayfin login
npm run rayfin:up -- --workspace <your-workspace> --item-name <your-app-name>
npm run dev
```

Deployment is explicit; `npm run dev` only regenerates frontend environment configuration and starts Vite against the selected backend. Docker is not required.

## Update Rayfin packages

The checked-in lockfile resolves all `@microsoft/rayfin-*` packages to `2.0.0`. Keep the manifests on `^2.0.0` and update participating packages together. Project creation uses `npm create @microsoft/rayfin@^2.0.0`, not a moving release-channel tag.

Agent guidance starts in [AGENTS.md](AGENTS.md). The root development dependency `@microsoft/rayfin-guide@^2.0.0` makes version-matched CLI and service documentation available under `node_modules`; follow each package's `rayfinDocs` metadata for SDK documentation. The pinned [.mcp.json](.mcp.json) provides optional documentation-tool access. Functions and Storage guidance is opt-in only; both services remain disabled.

From this app directory, refresh the CLI, guide, MCP server, SDK, and local-development plugin together:

```shell
npm update --workspaces --include-workspace-root @microsoft/rayfin-cli @microsoft/rayfin-guide @microsoft/rayfin-mcp @microsoft/rayfin-auth @microsoft/rayfin-auth-provider-fabric @microsoft/rayfin-client @microsoft/rayfin-data @microsoft/rayfin-core @microsoft/rayfin-local-dev
npx rayfin --version
```

Commit the refreshed root `package-lock.json` with the template. Use `npm ci` when preparing the VM's template copy to install the locked versions. Apply the same update to the pre-comments starter in [`template/field-services-app`](../../template/field-services-app/), then republish the VM update (see [`scripts/README.md`](../../scripts/README.md)); updating this completed reference alone does not update the starter or the Skillable VM.

## Authentication and local development

Vite's `rayfinLocalDev({ autoLogin: true })` plugin serves runtime configuration and proxies backend requests. In development, the browser installs a brokered session obtained by the plugin through the Rayfin CLI's Microsoft sign-in. Use the intended lab account for `rayfin login`; there is no separate password account for this Fabric-backed flow. The browser-only helper is dynamically imported behind `import.meta.env.DEV` and is excluded from production.

The backend requires `services.auth.fabric.externalEntraExchange: true`; redeploy after changing it. Deployed authentication continues to use the Fabric SDK. Both environments use `resolveRayfinConfig`, not a hard-coded backend URL.

The client uses `RayfinClient.create` with `browserSession({ storage: true })` and `dataService<FieldServiceSchema>()`. Explicit selections describe the fields the UI receives, including only the assigned Service Pro's name and skills. The data service converts wire dates to `Date` and re-reads saved work orders and updated profiles instead of returning partial mutation responses as complete records. Resetting the service container disposes the client without signing out.

The generated frontend environment file is `packages/frontend/.env.local`. Do not copy credentials into it or commit it. Keep the dev server on loopback and use the URL Vite prints; its port follows the CLI-generated `VITE_PORT`. If authentication fails, the sign-in page displays the error. Check the CLI account, deployment, and external-exchange setting before retrying.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` / `npm run dev:frontend` | Generate environment configuration and start the loopback Vite frontend against the selected backend |
| `npm run dev:fabric` | Compatibility alias for `dev:frontend` |
| `npm run build` | Type-check and build |
| `npm run typecheck` | Check TypeScript project references |
| `npm test` | Run Vitest |
| `npm run seed:generate` | Generate large Field Services seed JSON |
| `npm run seed:validate` | Validate generated seed JSON |
| `npm run rayfin:up -- --workspace <name> --item-name <name>` | Deploy the backend, schema, and static frontend to the selected Fabric app |
| `npm run rayfin:dev` | Start a CLI-managed development session; Fabric is the default provider |
| `npm run rayfin:db` | Apply schema to the current development session |
