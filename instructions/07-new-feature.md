# Exercise 7: Add a feature with GitHub Copilot

In this exercise, use GitHub Copilot CLI or GitHub Copilot App to add a schema-backed comments feature to work orders. The feature gives service pros and managers a place to discuss job details.

## Task 1: Review the project guidance

1. If the template includes `AGENTS.md`, review its instructions for the project.
2. In `package.json`, check whether the template includes Rayfin-specific agent or MCP guidance.

## Task 2: Launch GitHub Copilot CLI

> [!NOTE]
> If you prefer, open the existing **field-services-app** folder in GitHub Copilot App and use the same prompts and review steps. You do not need to run the CLI as well.

1. Open a terminal in the `field-services-app` directory.
2. Start GitHub Copilot CLI with `copilot`.
3. Use the CLI's available model and reasoning settings for your account. Review proposed actions rather than automatically approving all tool calls.

    > [!TIP]
    > *(Optional)* In this trusted lab project, run `/yolo` to let the CLI act without asking for each tool permission. This allows file changes and command execution without individual approval; leave it off if you want to review each action.

## Task 3: Generate the comments feature

1. In a separate project terminal, start `npx rayfin dev --workspace "<workspace-name>"` and confirm the existing app opens. In a new PowerShell terminal on the lab VM, first set `$env:RAYFIN_ENCRYPTION_FALLBACK_ENABLED = "true"`.
2. Stop the development session with **Ctrl+C** before Copilot changes the schema so that you can review backend changes before applying them.

Ask Copilot to implement a comments feature with a prompt such as:

```text
Implement a comments feature for work orders. Comments should provide a history of interventions so service pros and the manager can communicate about a work order. Each comment must include an id, userId, createdAt, workOrderId, and content. Keep the comments section collapsed by default. Let the attendee add comments from the assigned service-pro experience and reply from the manager experience using the same signed-in account. These are switchable demonstration views, not independently authorized roles. Preserve authenticated backend access; do not treat the view switch as authorization or add a second account requirement. Generate the code, but do not apply the backend schema change yet.

Use ^2.0.0 for Rayfin package additions and @^2.0.0 in every npm create command, rather than latest or prerelease tags. Use the project's installed CLI and keep participating Rayfin packages version-matched.

Preserve the existing RayfinClient.create composition with browserSession and dataService. Select every field the comments UI needs, convert wire dates at the service boundary, and do not treat partial mutation responses as complete records.
```

Review the plan and generated changes. Look for:

- A new comment entity registered in the Rayfin schema.
- Authenticated backend access, with comments available in both demonstration workflows.
- Typed data access to read and create comments.
- A comments section in the work-order UI that is collapsed by default.

The lab deliberately allows one account to try both views. In production, roles would be assigned to authenticated identities and enforced server-side rather than selected by the user.

## Task 4: Review the changes

Before updating the backend, inspect the changed files in Visual Studio Code's Source Control view or with `git diff`. Confirm that the implementation uses the project's Rayfin schema, permission, and typed-client patterns rather than adding an unrelated endpoint or migration mechanism.

## Task 5: Apply the schema and redeploy

After reviewing the changes, ask Copilot to apply and deploy them:

```text
Apply the reviewed changes to this app's existing Fabric deployment with npx rayfin up. This command applies pending schema changes and publishes the frontend, so do not run a separate database apply command. Do not drop or rename existing tables or columns, reset data, or force destructive changes. If a destructive change is reported, stop and show me the details. Confirm that deployment succeeds and report any errors.
```

## Task 6: Validate the comments workflow

1. In the separate project terminal, start the local app with `npx rayfin dev --workspace "<workspace-name>"`, using the display name you recorded in Exercise 1.
2. Open a work order assigned to your service-pro profile and add a comment.
3. Select **Manager** and confirm you can see and reply to the thread using the same signed-in account.
4. Select **Jobs** and confirm the reply appears. Reload the page and reopen the collapsed comments section to confirm persistence.
5. If time permits, repeat a quick check using the hosted app.
6. *(Optional)* Add comments to several work orders for richer analysis in Exercise 8.

If the feature does not behave as expected, give Copilot CLI the observed behavior or error and ask for a targeted fix. Review the proposed changes, then repeat the relevant schema and workflow checks.

Continue to Exercise 8 to add a semantic-model dashboard to the app.
