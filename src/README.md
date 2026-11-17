# Source

[`field-services-app/`](field-services-app/) contains the completed Field Services reference app for Ignite 2026 LAB690 (the end state of the lab). The lab starter, without work-order comments, is in [`../template/field-services-app/`](../template/field-services-app/). Both are adapted from the [original Build 2026 sample](https://github.com/microsoft/Build26-LAB514-ship-ai-apps-fast-with-a-managed-backend-in-microsoft-fabric/tree/92ccdaa/src/field-services-app).

The app includes the comments feature, so it is a completed reference rather than the pre-comments starter required by Exercise 7. It does not yet include the semantic-model dashboard described in Exercise 8.

Rayfin dependencies use `^2.0.0`, with resolved versions recorded in the lockfile. See the [app README](field-services-app/README.md) for architecture and development commands.

The reference uses npm workspaces under `packages/frontend`, `packages/data`, and `packages/shared`. Run installation, build, deployment, and development commands from `field-services-app/`; local Fabric authentication is integrated with the Rayfin CLI through the Vite local-dev plugin.
