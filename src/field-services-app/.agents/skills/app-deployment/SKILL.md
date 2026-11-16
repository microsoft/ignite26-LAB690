---
name: app-deployment
description: "Use before remote Rayfin writes: validate, confirm the Fabric target, preview with the installed CLI, deploy, and verify the actual app."
---
# App deployment

This guidance does not authorize deployment. Keep current auth, UI, and enabled services unless the user requested changes.

1. Read installed `@microsoft/rayfin-guide` metadata and its `app-backend/deploy.md`, plus `npx rayfin up --help`. Complete applicable static gates from [app-validation](../app-validation/SKILL.md).
2. Obtain approval for the real workspace/item and operation. Check the active deployment without exposing environment files or credentials. Never select an unrelated workspace, create capacity, approve identity takeover, or accept item reuse implicitly.
3. Preview using the confirmed target, then inspect the resolved workspace name/ID and planned operations:

   ```bash
   npx rayfin up -n --workspace-id <confirmed-id> --item-name <confirmed-name>
   ```

   Preview performs read-only remote lookups and may require login; it neither builds nor proves service availability. Do not run even this authenticated lookup for a guidance-only task.
4. Only after target/operation approval, deploy with the same explicit target:

   ```bash
   npx rayfin up --json --workspace-id <confirmed-id> --item-name <confirmed-name>
   npx rayfin up status
   ```

   Read the structured result, warnings, and each required service's outcome. For connectors, require a matching successful generation/apply outcome for each expected alias; inspect any skipped reason against its category contract. A documented non-GraphQL skip needs separate deployed invocation validation, not an automatic failure or automatic success.
5. Use the CLI-returned hosting URL for browser and persistence checks in [app-validation](../app-validation/SKILL.md). Check the actual Fabric host where relevant. Report unverified runtime behavior plainly.

Never pass `--force` without explicit destructive-change approval. Never place tokens/secrets in command arguments, chat, source, or logs. Use interactive sign-in and masked secret prompts.

Full `rayfin up` syncs project settings as well as schema and static content. Functions-only deployment does not apply its auth settings; Storage-only apply does not provision a backend. Use narrow subcommands only for the documented retry/explicit service-only request. `npm run dev` also applies remote settings/schema; do not describe it as a side-effect-free local command.
