# Exercise 5: Deploy and verify the hosted app

In Exercise 4, `npx rayfin dev` provisioned the backend and ran the frontend locally without publishing it. In this exercise, ask Copilot to run `npx rayfin up` to publish the frontend to the same Fabric workspace, verify the hosted app, and inspect its items.

## Task 1: Deploy and open the hosted app

1. In the **field-services-app** session, enter the following prompt, replacing `<workspace-name>` with the exact display name you recorded in Exercise 1:

    ```text
    Deploy this app to my Fabric workspace by running this command, without running prior checks or a dry run:
    npx rayfin up --workspace "<workspace-name>"
    Return the static hosting URL of the deployed app when done.
    ```

    If you needed the `RAYFIN_ENCRYPTION_FALLBACK_ENABLED` setting in Exercise 4, include it in this prompt too.

2. Wait for the agent to report that the CLI built and published the frontend and applied any pending backend changes.
3. Find the static hosting URL in the agent's response. If needed, ask Copilot to run `npx rayfin up status` to display the deployment details.
4. Open the hosting URL in a browser. The app should show the same sign-in experience as the local frontend.
5. Sign in and confirm that your service-pro profile and work orders are visible.
6. Open the `/manager/` path on the hosted app and create a work order.

## Task 2: Inspect the Fabric deployment

1. Open [Microsoft Fabric](https://app.fabric.microsoft.com) and select the workspace you created in Exercise 1.
2. Confirm that the deployment created a Fabric app and a SQL Database item.
3. Open the database, expand **dbo > Tables**, and inspect the **ServicePros** and **WorkOrders** tables.

The local and hosted frontends should use the same deployed backend. Follow your organization's guidance for keeping or removing the resources after the lab.

Continue to [Seed data for analysis](06-seed-data.md).
