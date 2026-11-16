---
name: rayfin-connectors
description: "Use for discovering, adding, querying, authorizing, or troubleshooting existing Fabric sources, especially semantic-model dashboards."
---
# Existing Fabric sources

Read [rayfin](../rayfin/SKILL.md) first. App-owned records stay in `packages/data/src/`; connectors describe existing sources and must not replace the Field Services data service.

## Discover and prove the source

1. Read installed guide `cli/connectors/index.md`, then `npx rayfin connector types --json` for available types, operations, auth, and package versions. Do not infer platform availability from package presence. Held/unsupported types are blockers, not permission to hand-author a bypass.
2. Resolve the user's actual workspace/item with `npx rayfin connector search` and confirm ambiguous matches. Verify schema, measures, relationships, and permissions before writing queries. Never fabricate IDs or silently switch sources.
3. Read the matching category guide only: `cli/connectors/category-a-entities.md` routes SQL-backed entity work to the version-matched `@microsoft/rayfin-connector-fabric-graphql` docs; `cli/connectors/category-b-function-bridge.md` covers semantic-model operations. The Lakehouse SQL analytics connector reads SQL-visible data, not arbitrary files.
4. Follow `cli/connectors/add.md` and the installed command's help. `connector add` declares configuration and generates files but does not install dependencies. Install its version-matched packages from the app root into their consuming workspace, retaining this app's `^2.0.0` policy and root lockfile. Resolve incompatible catalog requirements explicitly rather than mixing releases.
5. Narrow operations to the requirement. Keep `connectors:` as an array, exact aliases consistent, and generated files intact. For SQL entities review server permissions and register runtime classes as required by the category guide; these are distinct from browser-safe app-owned contracts.

## Compose, do not replace

In the existing `RayfinClientService.ts` factory, add `connectors: connectorsService<AppConnectorsSchema>({ configs: connectorConfigs, runtime: connectorRuntimes })` from `@microsoft/rayfin-connectors`. Preserve auth, runtime configuration, and data. For semantic models import `fabricSemanticModel` from `@microsoft/rayfin-connector-fabric-semanticmodel` and register its factory result under the exact alias in `connectorRuntimes`; this decodes the response. Follow generated contracts and installed SDK docs for maps and imports.

Read [dax-authoring](../dax-authoring/SKILL.md) and [query-design](../query-design/SKILL.md). Store query inputs in a reviewed file inside the app root:

```json
{ "query": "EVALUATE ROW(\"Probe\", 1)", "resultSetRowCountLimit": 1 }
```

Invoke with `npx rayfin connector invoke <alias> executeQuery --file <probe.query.json>`. `--file` accepts JSON, not raw DAX. Check both invocation and normalized result status; a resolved call is not necessarily success. Inspect columns, types, values, row count, and any spilled output file. A CLI output preview is not a query row limit.

The semantic-model CLI default uses the developer's direct Power BI identity and can run before deployment. The browser uses the deployed function bridge and caller authorization; CLI success does not prove that route. Other connector types generally require deployment first. Follow [app-deployment](../app-deployment/SKILL.md) before remote writes, then execute the same bounded query in the signed-in deployed app. Surface Build-permission, consent, tenant-enablement, and query failures; never mask them with sample data. Do not assume `rayfin dev` alone wires deployed connectors.

Fabric IQ/chat and Data Agent integrations are separate capabilities, outside this lab refresh. Do not substitute them for a semantic-model query or each other.
