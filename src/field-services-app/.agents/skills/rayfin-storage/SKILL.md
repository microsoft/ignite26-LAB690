---
name: rayfin-storage
description: "Use only when requested to add file/image/document storage; covers opt-in Fabric setup, folder policies, browser-safe composition, and durable operation checks."
---
# Optional Storage

Storage is disabled in this lab. Do not enable it, install its dependencies, or add upload UI for a guidance-only request.

Read installed guide `storage/index.md`, Core `permissions.md`, and the version-matched `@microsoft/rayfin-storage` package's `rayfinDocs` index before implementation. This guidance was checked against 2.0.0. Storage is remote-only and requires Data. Confirm availability in the intended Fabric environment; an unavailable service is a blocker, not permission to create an emulator, use browser storage as a database, or substitute another upload backend.

## Opt-in setup

After feature approval, inspect the current Data and auth configuration; preserve enabled Data, MSSQL, entity paths, auth, and localhost settings. From the app root:

```bash
npx rayfin storage init --path packages/storage --dry-run --output json
npx rayfin storage init --path packages/storage
```

The preview validates local setup without installing, writing files, or contacting Fabric. Initialization enables required services, adds dependencies and declarations, and compiles locally; it does not deploy. The custom-workspace client owner must be unique (currently `packages/frontend` declares `@microsoft/rayfin-client`); there is no client-path override. Stop on ambiguous ownership and use the guide's manual setup rather than guessing.

Name the resulting package `@field-services/storage`, preserving its generated exports and build scripts. Keep runtime folders under `packages/storage/rayfin/storage/` and its registered `schema.ts`. The `packages/*` workspace glob covers it. Verify:

- `@microsoft/rayfin-core@^2.0.0` belongs to the declarations package; `@microsoft/rayfin-storage@^2.0.0` belongs to frontend. Install/reconcile at the app root with one root lockfile, not nested installs.
- `services.storage` has `enabled: true`, `path: packages/storage`, and `buildCommand: npm run build`, without replacing Data/auth blocks.
- The package build includes the actual runtime schema. Add the generated project (`packages/storage/rayfin/tsconfig.json` in this layout) to root typecheck references and the workspace build to the serial root build before frontend. Keep the existing TypeScript/decorator settings.
- Initialization may report manual client integration: source generation alone does not complete this app's customized service composition. Preserve authored schemas and review every changed manifest/config file.

## Declare and register folders

In `packages/storage/rayfin/storage/Attachment.ts`, for example:

```ts
import { blob, mb, role, StorageObject } from '@microsoft/rayfin-core';

@blob({ name: 'attachments', maxSize: mb(10) })
@role('authenticated', '*', {
  policy: (claims, item) => claims.sub.eq(item.owner_id),
})
export class Attachment extends StorageObject {}
```

In sibling `schema.ts`:

```ts
import { Attachment } from './Attachment.js';
export const schema = [Attachment];
```

The runtime array is authoritative; unregistered classes are not deployed. Choose limits, allowed content types, and least-privilege operations for the feature; this owner-only CRUD example is not a mandate to grant every operation. Every folder needs authenticated permissions; anonymous Storage is unsupported. Intrinsic owner/id/path fields are server-managed. Paths organize objects, not access control. Keep the default conflict error unless overwrite is explicitly required and authorized.

## Browser-safe client integration

Add a structural folder map to `packages/shared/src/index.ts`, such as `export type FieldServiceStorageSchema = { attachments: object }` for a folder with no custom fields. Keep its exact key aligned with `@blob({ name })`. For custom metadata, use matching browser-safe field shapes; never import decorated folder classes or a runtime schema into frontend.

In the existing `RayfinClientService.ts` factory import `storageService` from `@microsoft/rayfin-storage` and the map type from `@field-services/shared`, then add `storage: storageService<FieldServiceStorageSchema>()` to services. Preserve auth, data, runtime configuration, and any already enabled connectors/functions. Do not create a second client/session.

Use the typed operations (here `file` is a validated browser `File`):

```ts
const folder = client.storage.attachments;
const path = file.name;
const uploaded = await folder.upload(path, file);
const page = await folder.list({ limit: 20 });
const downloaded = await folder.download(path);
const deleted = await folder.delete(path);
```

These are separate feature actions, not a sequence to auto-delete a user's upload. A root-level filename is the default; add directories only for a requirement, not as a security substitute. Validate names, size, and content types. Upload returns `{ object, correlationId }`; list returns `{ items, continuation, correlationId }` and must follow continuation pages when needed. Download returns a stream and content metadata: convert with `new Response(downloaded.stream).blob()` for an object URL, revoking the URL when no longer used. Delete resolves after durable completion; inspect its result and surface failures.

Send decorated custom metadata via upload options `{ fields: ... }`, never intrinsic fields. Listed custom fields are flattened onto each object and may be absent. Read the SDK docs for operation options/errors; do not build raw HTTP or SAS flows or persist signed URLs.

## Apply and verify

Use [app-deployment](../app-deployment/SKILL.md) for approved preview/full deployment. Default Fabric-backed `npm run dev` applies enabled Storage remotely; no Docker Storage exists. `npx rayfin dev storage apply` retries only Storage on an already initialized active Fabric deployment and rejects workspace-selection flags. `npx rayfin up storage apply` is a cloud configuration retry, not initial provisioning.

After serial typecheck/build/tests, verify upload, reload/list, download byte/content correctness, authorized delete, and absence after reload using disposable objects. Test another signed-in identity cannot list/download/delete owner-scoped files, plus signed-out, oversize/type-rejection, duplicate-name, and service-unavailable errors. Local Vite still accesses remote Storage; also exercise the deployed browser. Do not infer availability or permissions from initialization/build success.

Removing a folder declaration can permanently delete its objects after apply. Empty declarations skip apply and do not remove the last deployed folder. Never suggest force-removal without explicit reviewed data-loss approval.
