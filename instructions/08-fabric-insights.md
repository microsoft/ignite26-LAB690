# Exercise 8: Add a semantic-model dashboard to the app

Build a Microsoft Fabric semantic model over the work-order data, then use Rayfin's Semantic Model connector to add a dashboard to the existing Field Services app. The dashboard queries the semantic model through the connector rather than reading the operational tables directly.

## Task 1: Build a semantic model

1. In the Fabric portal, open the workspace you created in Exercise 1.
2. Create a semantic model using the deployed SQL Database as its data source.
3. Include the service-pro, work-order, and comments tables available in your database.
4. Define active, single-direction relationships from work orders to service pros and from comments to work orders. Set each relationship to **Many to one (*:1)**, with the parent table's identifier on the **one** side. Check these settings explicitly: Direct Lake can infer the wrong cardinality from the current row counts. Leave **Assume referential integrity** cleared because work orders can be unassigned.
5. Rename key columns with clear labels and add descriptions to the tables so the model's business meaning is clear.
6. Save the model as `FieldServices`. Confirm that it can query the seeded data and refresh it if its storage mode requires a refresh.
7. Record the model's workspace ID and semantic model item ID. The connector needs both identifiers.

Suggested descriptions:

- **Service pros:** Service professionals who perform jobs at customer locations. Each has a set of skills and may be assigned to work orders.
- **Work orders:** Field-service jobs with a status, an optional assigned service pro, and a scheduled date.
- **Work-order comments:** Comments associated with a work order, including content, author, and timestamp.

## Task 2: Connect the semantic model to the app

1. Return to a terminal in the existing `field-services-app` project. Do not create a second app or replace the Field Services template.
2. Add a connector named `fieldservicesmodel`, replacing the identifiers with the values from Task 1:

    ```shell
    npx rayfin connector add --type fabric-semanticmodel --workspace-id "<workspace-id>" --item-id "<semantic-model-item-id>" --name fieldservicesmodel --operations executeQuery
    ```

3. Run the version-matched package installation command printed by the installed 2.x CLI. Keep connector and SDK packages on the same release within `^2.0.0`; do not substitute moving tags or prereleases.
4. Review the generated connector entry in `rayfin/rayfin.yml`. Confirm that it points to your model and uses delegated authentication. Queries run as the signed-in user, who must have Build and Read permissions on the model.
5. Review `rayfin/connectors/fieldservicesmodel/schema.ts`. Keep this generated file unchanged.
6. Inspect the model before writing queries:

    ```shell
    npx rayfin connector inspect --name fieldservicesmodel
    ```

    If metadata inspection fails with a DAX query error, inspect each table with a bounded sample. Replace `<table-name>` with the actual name shown in the model:

    ```shell
    npx rayfin connector inspect --name fieldservicesmodel --entity "<table-name>" --rows 1
    ```

Use the actual table, column, and measure names from your model, including any renames made in Task 1. See the [Rayfin Semantic Model connector documentation](https://rayfin.ai/docs/connectors/semantic-models) for configuration and client wiring.

## Task 3: Add the dashboard with Copilot CLI

1. Start `copilot` in the app project.
2. Ask it to add the dashboard using the registered connector:

    ```text
    Add an operational dashboard to the existing Field Services app, reachable from the manager view. Use the registered fieldservicesmodel Semantic Model connector.

    Read the project instructions, Rayfin guidance, generated connector schema, and semantic model metadata before editing. Inspect the model before writing DAX; do not guess table, column, or measure names.

    Use ^2.0.0 for Rayfin package additions and @^2.0.0 in every npm create command, rather than latest or prerelease tags. Use the project's installed CLI and keep participating Rayfin packages version-matched.

    Show total work orders, work orders by status, and work orders by assigned service pro. Obtain every dashboard metric from the semantic model through the connector, not from direct database queries or mock data.

    Extend the existing RayfinClient.create composition with connectorsService from @microsoft/rayfin-connectors while preserving browserSession, dataService<FieldServiceSchema>(), the app's schema, authentication, data operations, and comments feature. Register services.connectors with connectorsService<GeneratedConnectorsSchema>({ configs: { fieldservicesmodel: connectorConfig }, runtime: { fieldservicesmodel: fabricSemanticModel() } }), using the actual generated schema type and connectorConfig exports. Import fabricSemanticModel from @microsoft/rayfin-connector-fabric-semanticmodel. Infer the client type from the factory; do not use the removed ConnectorsRayfinClient. Keep fieldservicesmodel as the connector key throughout, and keep source declarations under top-level connectors in rayfin.yml.

    Use executeQuery for DAX, check result.status, and map result.table.columns to the row-major result.table.rows. Set an explicit resultSetRowCountLimit and reject responses that exceed it rather than silently truncating them. Show loading, empty, and error states; show connector error details and requestId instead of substituting zero values or sample data.

    Reuse the app's components and styling. Keep the existing Fabric sign-in flow and do not add credentials, access tokens, or direct Execute Queries REST API calls. Generate the changes for review; do not deploy yet.
    ```

3. Review the generated changes. Confirm that the dashboard uses the connector and that the existing profile, work-order, and comments workflows remain intact.
4. Confirm that connector configuration, generated types, client options, and runtime registration all use the same `fieldservicesmodel` key.

## Task 4: Deploy and verify the dashboard

1. Exit Copilot CLI with `/exit`, then deploy the connector configuration and dashboard:

    ```shell
    npx rayfin up
    ```

2. Start the local frontend with `npx rayfin dev --workspace "<workspace-name>"`, using the display name you recorded in Exercise 1, then sign in and open the dashboard from the manager view.
3. Confirm that the total work-order count matches a query against the semantic model. Compare the status and service-pro breakdowns with the same model, accounting for unassigned orders.
4. Open the hosted app and repeat the checks using an account with access to both the app and model. A successful developer-side query alone does not verify the deployed connector.
5. Confirm that failed queries are shown as errors rather than as an empty dashboard or zero counts.
6. Verify the row limit locally and in the hosted app with a query that exceeds it. Treat an over-limit response as an error even if the connector reports success.

If a query fails, check the connector's workspace and item IDs, the tenant setting, the signed-in user's model permissions, and the actual DAX field names. Use the connector's error category, message, and request ID to investigate.

You have completed the loop from operational app data to a semantic model and back to an in-app dashboard.

Continue to the [Conclusion](09-conclusion.md).
