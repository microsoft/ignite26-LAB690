---
name: rayfin
description: "Use for Rayfin entities, permissions, queries, auth, client composition, configuration, CLI, or optional service setup in Field Services."
---
# Rayfin in Field Services

## Read the installed version first

Run commands from this app's workspace root. Use the installed `npx rayfin` CLI, not an unversioned package download. Rayfin additions use `^2.0.0`; scaffolding commands use `npm create @microsoft/rayfin@^2.0.0`.

Read the owning installed package's `package.json`, resolve `rayfinDocs.dir`, and open `index.md` followed by the needed page. npm may put a dependency under its owning workspace's `node_modules`, not the root.

| Topic | Owning package / documentation |
| --- | --- |
| CLI, auth, deployment, limitations | `@microsoft/rayfin-guide`: `known-limitations.md`, `auth/overview.md`, `app-backend/deploy.md` |
| Decorators and policies | `@microsoft/rayfin-core`: `decorators.md`, `permissions.md` |
| Queries, mutations, paging | `@microsoft/rayfin-data` |
| Client composition | `@microsoft/rayfin-client` |
| Local Vite routing and CLI-brokered sign-in | `@microsoft/rayfin-local-dev` |
| Optional Functions | [rayfin-functions](../rayfin-functions/SKILL.md) and guide `functions/index.md` |
| Optional Storage | [rayfin-storage](../rayfin-storage/SKILL.md) and guide `storage/index.md` |

The CLI has no docs root; use the installed guide. Only if indexes do not identify a page, use `npx rayfin docs search '<topic>'` or the already configured Rayfin MCP. For a missing package, use version-matched package discovery; do not install unrelated packages just to search. If docs and CLI help disagree, inspect the installed implementation and report the discrepancy.

## Preserve the app

- Keep decorated entities in `packages/data/src/`, registered in `schema.ts` and exported from `index.ts`. Browser-safe contracts and `FieldServiceSchema` belong in `packages/shared/src/index.ts`; never import entity runtime classes into the browser.
- Preserve `@field-services/*`, `ServiceContainer`, and the synchronous factory in `packages/frontend/src/services/rayfin/RayfinClientService.ts`. Extend its existing `RayfinClient.create` services map, retain `runtimeConfig`, `browserSession({ storage: true })`, and `dataService<FieldServiceSchema>()`, and infer its type with `ReturnType`. Do not replace it with a client subclass or an asynchronous global accessor.
- Keep current Fabric auth, protected hosting, redirect URIs, and the DEV-only dynamic broker import. Leave `externalEntraExchange: true` and loopback-bound Vite intact. Public assets would not authorize public data.
- Preserve styles in `packages/frontend/src/styles/theme.css`, existing UI components, and seed/reset invariants in [AGENTS.md](../../../AGENTS.md). View switching is not role authorization.
- Functions and Storage are disabled until requested. Do not enable services merely because their skills exist.

## Model and query safely

Read `known-limitations.md` before entity/query work. Use TC39 Stage 3 decorators, not `experimentalDecorators` or `emitDecoratorMetadata`. Give every entity explicit permissions; omission is not a safe deny-all default. Review policies server-side, not through UI filters.

Use the typed data client, explicit selections, and bounded paginated collection reads. Re-read required fields after partial mutation responses; normalize wire dates at the service boundary. Follow the installed decorator options and reserved GraphQL names rather than guessing. Keep entity and shared contract changes consistent.

For existing Fabric sources use [rayfin-connectors](../rayfin-connectors/SKILL.md), not a new app-owned schema. Verify source identity and returned data before UI integration. Surface configuration/auth/permission failures explicitly, never as sample rows or endless loading.

## Workflow

Install at the app root with one lockfile and dependencies owned by their consuming packages. Use [app-validation](../app-validation/SKILL.md) and [app-deployment](../app-deployment/SKILL.md). `npm run dev` is Fabric-backed and may apply remote settings/schema; it is not a read-only local preview. Never run destructive apply/reset commands without owner approval.
