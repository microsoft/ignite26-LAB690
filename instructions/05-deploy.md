# Exercise 5: Verify the production deployment

The `npx rayfin up` command uses the project's installed experimental CLI to provision and update the deployment associated with your Fabric workspace. In this exercise, verify the hosted app and inspect the items created for it.

## Task 1: Open the hosted app

1. Find the static hosting URL in the output from `npx rayfin up`. If needed, run `npx rayfin up status` from the project directory to display the deployment details.
2. Open the hosting URL in a browser. The app should show the same sign-in experience as the local frontend.
3. Sign in and confirm that your service-pro profile and work orders are visible.
4. Open the `/manager/` path on the hosted app and create a work order.

## Task 2: Inspect the Fabric deployment

1. Open [Microsoft Fabric](https://app.fabric.microsoft.com) and select the workspace you created for this lab.
2. Confirm that the deployment created a Fabric app and a SQL Database item.
3. Open the database and inspect the service-pro and work-order tables.

The local and hosted frontends should use the same deployed backend. Follow your organization's guidance for keeping or removing the resources after the lab.

Continue to [Add a feature with GitHub Copilot CLI](06-new-feature.md).
