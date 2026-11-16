# AGENTS.md

## Project

Use `^2.0.0` for Rayfin package additions and `@^2.0.0` in every `npm create` command. The local `rayfin` binary comes from `@microsoft/rayfin-cli@^2.0.0`; update participating Rayfin packages together and commit the root lockfile.

React + TypeScript (Vite) work-order app backed by **Project Rayfin** with Radix-based UI components styled with Tailwind CSS.
Demonstrates Service Pro profile and work-order management with Fabric Entra authentication enabled for deployed Fabric environments.
The primary development path uses a Fabric backend and integrated Microsoft authentication through the Rayfin Vite local-dev plugin. Production uses Fabric Entra SSO.

## Quickstart

- Install at the app root: `npm install`
- Sign in: `npx rayfin login`
- Deploy to Fabric: `npm run rayfin:up -- --workspace <name> --item-name <name>`
- Frontend against the selected backend: `npm run dev`
- Do not install dependencies separately inside workspace packages.

## Agent workflow

- Read [Rayfin guidance](.agents/skills/rayfin/SKILL.md) before changing Rayfin code. Installed package documentation is authoritative: inspect the owning package's `package.json`, follow `rayfinDocs.dir`, read `index.md`, then the relevant page. CLI documentation comes from the directly installed `@microsoft/rayfin-guide`.
- Verify the intended source, workspace/item identity, schema, query shape, and real results before consuming source-backed data. Never invent identifiers or silently substitute sample data; the existing labelled demo seed is not a fallback for a missing source.
- Surface actionable configuration, sign-in, permission, and query errors rather than permanent loading states. Bound transient retries for new source integrations; preserve the explicitly documented seed/reset retry behavior below.
- Install from this app's npm workspace root, declare dependencies in the owning package, and maintain one root lockfile. Do not race installers or builds that share TypeScript outputs.
- Use [app-validation](.agents/skills/app-validation/SKILL.md) for targeted checks and applicable final checks. Build/CLI success does not prove browser behavior or persisted writes.
- Read [app-deployment](.agents/skills/app-deployment/SKILL.md) before remote writes. Confirm the workspace/item and preview with the installed CLI; `npm run dev` also applies remote backend state.
- For existing Fabric sources use [rayfin-connectors](.agents/skills/rayfin-connectors/SKILL.md); for semantic queries also use [dax-authoring](.agents/skills/dax-authoring/SKILL.md) and [query-design](.agents/skills/query-design/SKILL.md).
- Functions and Storage remain disabled. Only when explicitly requested, follow [rayfin-functions](.agents/skills/rayfin-functions/SKILL.md) or [rayfin-storage](.agents/skills/rayfin-storage/SKILL.md) for opt-in setup, permissions, integration, and validation. Guidance presence does not authorize service enablement or deployment.

## Common commands

| Command | Description |
| ------- | ----------- |
| `npx rayfin up` | Deploy to Microsoft Fabric |
| `npm run dev:fabric` | Start Vite frontend against Fabric backend |
| `npm run rayfin:dev` | Start a CLI-managed development session (Fabric by default) |
| `npm run rayfin:db` | Generate and apply database schema |
| `npm run dev` | Generate frontend environment config and start loopback Vite; does not deploy |
| `npm run build` | Build for production |
| `npm run seed:generate` | Generate large demo seed JSON |
| `npm run seed:validate` | Validate demo seed JSON |
| `npm run typecheck` | Check TypeScript project references |

## Repo map

- `packages/frontend/src/` – React UI, components, hooks, pages, and services
- `packages/data/src/` – Decorated entities, schema registration, and package entry point
- `packages/shared/src/index.ts` – Browser-safe record contracts and typed client schema
- `rayfin/rayfin.yml` – Rayfin configuration (auth and data enabled)
- Root `package.json` and lockfile – npm workspace orchestration and dependency installation

## UI (Radix-based shadcn/ui)

This project uses **Radix-based UI components** styled with **Tailwind CSS v4**.

- UI components live in `packages/frontend/src/components/ui/`
- Utility helper lives in `packages/frontend/src/lib/utils.ts` (`cn`)
- Add a component: `npx shadcn@latest add <component>`

Key config/files:

- Global styles + Tailwind import: `packages/frontend/src/styles/theme.css`
- Path alias `@/*` → frontend `src/*`: `packages/frontend/tsconfig.json`
- Vite plugins + alias: `packages/frontend/vite.config.ts`
- shadcn registry/config: `packages/frontend/components.json`

## Data model changes

- Edit/add entities in `packages/data/src/`, register them in `schema.ts`, and export them from `index.ts`.
- Keep browser-safe record contracts and `FieldServiceSchema` in `packages/shared/src/index.ts` aligned with entities. Frontend code imports types from `@field-services/shared`, not backend entity source.
- After entity/relationship changes, deploy with `npm run rayfin:up` using the intended workspace/item. Never force destructive changes without review.

## Architecture

### Service Layer

- **ServiceContainer**: Asynchronous bootstrap resolves runtime configuration before React mounts and then provides synchronous service access
- **RayfinClientService**: Composes the singleton with `RayfinClient.create`, `browserSession({ storage: true })`, and `dataService<FieldServiceSchema>()`; infer its type from the factory and dispose it only when resetting the owning service container
- **RayfinFieldService**: Service Pro and work-order CRUD via DataApi fluent interface

### Auth Service Layer

- **RayfinAuthService**: Fabric Entra authentication operations (production)
- **RayfinFabricAuthService**: Delegates to `@microsoft/rayfin-auth-provider-fabric` SDK for Entra flows
- **Local development**: `rayfinLocalDev({ autoLogin: true })` proxies backend requests and brokers the CLI's signed-in identity. Browser helpers must remain dynamically imported behind `import.meta.env.DEV`. Keep `externalEntraExchange: true` deployed and Vite bound to loopback.
- **RayfinPasswordAuthService**: Legacy local-backend email/password authentication, not required by the guided lab
- **AuthContext**: React context for auth state management

### Routing

- `/auth` – Public auth page (Fabric sign-in or email/password sign-in; redirects to `/` if authenticated)
- `/auth/callback` – Fabric Entra OAuth callback
- `/` – Protected service pro dashboard (redirects to `/auth` if not authenticated)
- `/manager/` – Authenticated manager demonstration view; not a separately authorized role
- `/_admin/` – Hidden protected DB data tools page for seed/reset operations

### Sample data and reset

- The seed generator defaults to `2026-04-30`, not the current date. Its baseline is 12 synthetic profiles and 1,040 work orders; keep expected results in the README aligned.
- `restoreSeedData` inserts missing deterministic UUIDs only. Never turn restore into a delete/overwrite operation; preserve attendee profiles, edits, and comments.
- Bulk operations use `BulkOperation` and `useBulkOperation` for browser-side checkpoints and a 20-second batch-start budget, not a hard request timeout. Retry timeout-only/throttling failures automatically with backoff and Retry-After support; retain original batch errors, stop on mixed/permanent failures, and allow pause during backoff. Keep checkpoints scoped to app/account, reconcile uncertain writes, preserve dependency phases, and require fresh reset confirmation on manual resume. Functions remain disabled.
- `resetDemoData` requires `RESET <current-app-item-id>`, deletes comments before orders and profiles, and recreates one initial job. No Fabric infrastructure is deleted. Obtain explicit owner approval before rehearsing reset against existing data.
- Authenticated comment deletion exists for demo reset, not role separation. The navigation switch and typed reset confirmation are UX safeguards, not authorization boundaries.

### Key files

- `packages/data/src/ServicePro.ts` – Service Pro profile entity
- `packages/data/src/WorkOrder.ts` – Work-order entity with optional service pro relationship
- `packages/frontend/src/services/ServiceContainer.ts` – Service bootstrap
- `packages/frontend/src/hooks/useFieldService.ts` – Service Pro/profile/work-order operations hook
- `packages/frontend/src/pages/Dashboard.tsx` – Service Pro and manager dashboards
- `packages/frontend/src/pages/AdminPage.tsx` – Hidden seed/reset admin data page

## Environment

- `packages/frontend/.env.local` – Frontend configuration (git-ignored, generated by `rayfin env --framework vite`)
- `rayfin/.env` – runtime + deployment env (written by `rayfin dev`/`rayfin up`)
- `rayfin/.deployments.json` – registry of all Fabric workspace deployments (written by `rayfin up`)

## Code conventions

- TypeScript strict mode; prefer small functional React components.
- Keep UI logic in `packages/frontend/src/`, data model code in `packages/data/src/`, and browser-safe contracts in `packages/shared/src/`.
- Services follow the singleton pattern via `ServiceContainer`.
- A localhost proxy URL does not mean the backend is Docker. Fabric metadata takes precedence when selecting the auth service.
- Data reads must select the fields consumers use. Convert `Date | string` wire dates at the service boundary and re-read required fields after partial mutations; never cast a partial result to a full record.
- Add connectors through `services.connectors: connectorsService(...)` on the existing client, preserving its auth and data services. Do not use the removed `ConnectorsRayfinClient`.

## Generated files (do not edit)

- `rayfin/.temp/` – Rayfin/DAB config generation output
- `packages/*/dist/` – Package build output
- `packages/frontend/.env.local` – Local environment configuration (git-ignored, script-managed)
