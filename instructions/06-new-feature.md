# Exercise 6: Add a feature with GitHub Copilot CLI

In this exercise, use GitHub Copilot CLI to add a schema-backed comments feature to work orders. The feature gives service pros and managers a place to discuss job details.

## Task 1: Review the project guidance

1. If the template includes `AGENTS.md`, review its instructions for the project.
2. In `package.json`, check whether the template includes Rayfin-specific agent or MCP guidance.

## Task 2: Launch GitHub Copilot CLI

1. Open a terminal in the `field-services-app` directory.
2. Start GitHub Copilot CLI with `copilot`.
3. Use the CLI's available model and reasoning settings for your account. Review proposed actions rather than automatically approving all tool calls.

## Task 3: Generate the comments feature

Ask Copilot CLI to implement a comments feature with a prompt such as:

```text
Implement a comments feature for work orders. Comments should provide a history of interventions so service pros and the manager can communicate about a work order. Each comment must include an id, userId, createdAt, workOrderId, and content. Keep the comments section collapsed by default. Let the attendee add comments from the assigned service-pro experience and reply from the manager experience using the same signed-in account. These are switchable demonstration views, not independently authorized roles. Preserve authenticated backend access; do not treat the view switch as authorization or add a second account requirement. Generate the code, but do not apply the backend schema change yet.

Use Rayfin's experimental release channel for any Rayfin commands or package additions. Keep Rayfin dependencies version-matched; do not switch to latest or stable.
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

1. Exit Copilot CLI with `/exit`.
2. Review any schema changes before applying them. If they are appropriate, run:

    ```shell
    npx rayfin up db apply
    ```

3. If the command reports destructive changes, stop and review them before continuing.
4. Redeploy the updated app:

    ```shell
    npx rayfin up
    ```

## Task 6: Validate the comments workflow

1. Start the local app with `npm run dev`.
2. Open a work order assigned to your service-pro profile and add a comment.
3. Select **Manager** and confirm you can see and reply to the thread using the same signed-in account.
4. Select **Jobs** and confirm the reply appears. Reload the page and reopen the collapsed comments section to confirm persistence.
5. If time permits, repeat a quick check using the hosted app.

If the feature does not behave as expected, give Copilot CLI the observed behavior or error and ask for a targeted fix. Review the proposed changes, then repeat the relevant schema and workflow checks.

Continue to [Seed data for analysis](07-seed-data.md).
