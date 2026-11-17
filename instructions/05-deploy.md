# Exercise 5: Deploy and verify the hosted app

In Exercise 4, `npx rayfin dev` provisioned the backend and ran the frontend locally without publishing it. In this exercise, use `npx rayfin up` to publish the frontend to the same Fabric workspace, verify the hosted app, and inspect its items.

## Task 1: Deploy and open the hosted app

1. In the project directory, run the following command, replacing `<workspace-name>` with the exact display name you recorded in Exercise 1:

    ```shell
    npx rayfin up --workspace "<workspace-name>"
    ```

2. Wait for the CLI to build and publish the frontend and apply any pending backend changes.
3. Find the static hosting URL in the command output. If needed, run `npx rayfin up status` from the project directory to display the deployment details.
4. Open the hosting URL in a browser. The app should show the same sign-in experience as the local frontend.
5. Sign in and confirm that your service-pro profile and work orders are visible.
6. Open the `/manager/` path on the hosted app and create a work order.

## Task 2: Inspect the Fabric deployment

1. Open [Microsoft Fabric](https://app.fabric.microsoft.com) and select the workspace you created in Exercise 1.
2. Confirm that the deployment created a Fabric app and a SQL Database item.
3. Open the database, expand **dbo > Tables**, and inspect the **ServicePros** and **WorkOrders** tables.

The local and hosted frontends should use the same deployed backend. Follow your organization's guidance for keeping or removing the resources after the lab.

Continue to Exercise 6 to seed data for analysis.
