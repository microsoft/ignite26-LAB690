# Exercise 3: Explore the app template

Quickly inspect the app generated in Exercise 2. Skim the files; you do not need to understand every line yet.

## Task 1: Explore the project structure

In the **Files** panel of the GitHub Copilot app, review the project folders and identify the corresponding files in your generated template. If you closed the panel, select the **Toggle panel** button in the top-right corner of the app, select **+** (**Open in panel**), then select **Files**.

| Folder or file | Why it matters |
| --- | --- |
| `rayfin/rayfin.yml` | Configures the Rayfin services used by the app. |
| `packages/data/src/` | Defines and registers the backend data model. |
| `packages/shared/src/` | Contains browser-safe record contracts and the typed client schema. |
| `packages/frontend/src/` | Contains the frontend application. |
| `packages/frontend/src/services/` | Connects the frontend to Rayfin authentication and data services. |
| `packages/frontend/src/pages/` | Contains the main app pages. |
| `packages/frontend/vite.config.ts` | Configures Vite and the integrated local-development auth plugin. |
| `data/` | May contain the app specification and seed data. |
| `package.json` | Declares npm workspaces and root commands; each package owns its dependencies. |
| `AGENTS.md` | Provides guidance for AI coding agents, when included by the template. |

## Task 2: Review the Rayfin configuration

1. Open `rayfin/rayfin.yml` and find its `services` section.
2. Note which authentication providers are enabled and how the app uses the data, storage, and static hosting services.
3. Do not change the configuration yet; later exercises rely on the template defaults.

## Task 3: Review the data model

1. Open the `packages/data/src/` directory (not `src/data/`) and find the schema file and the entity definitions for service pros and work orders.
2. Review the schema file. Every entity must be imported and included in the schema.
3. Review the entity definitions and note how decorators define tables, fields, and access rules. The `user_id` field associates a profile with its authenticated user; it is not necessarily a relationship to another Rayfin entity.
4. Find how work orders represent status and an optional assignment to a service pro.
5. Remember that the TypeScript entity definitions are the source of truth for the database schema.
6. Review `packages/shared/src/index.ts`. These contracts keep frontend data access typed without importing decorated backend classes into the browser. Keep them aligned when changing entities.

## Task 4 (Optional): Review the frontend

If time permits, inspect the frontend services and pages. Notice how the app uses Rayfin's typed client and how types derived from the schema help identify frontend code affected by a data-model change.

Continue to [Run the app locally](04-run-locally.md).
