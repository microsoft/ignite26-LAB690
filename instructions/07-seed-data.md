# Exercise 7: Seed data for analysis

In this exercise, create a richer dataset of service pros and work orders for the semantic model and in-app dashboard that follow.

## Task 1: Seed the database

1. Open the hosted app and sign in.
2. Navigate to `/_admin/`.
3. Check the workspace and app item IDs shown on the page. Confirm they identify your assigned app.
4. Select **Restore sample data** and wait for the operation to finish. This adds missing records from a fixed dataset of 12 synthetic Service Pros and 1,040 work orders spanning April 30, 2025 through April 30, 2026. Browser-side chunks continue automatically and save a resume position after confirmed operations.
5. Confirm the completion message reports the current totals. Your own profile, exercise work orders, edits, and comments are preserved, so totals may be higher than the sample counts. Timeouts and throttling retry automatically with backoff; the page shows when it is waiting. To interrupt safely, select **Pause after current batch**, including while waiting to retry. After a pause, reload, or other error, select **Resume restore** in the same browser, app, and account. Stable record IDs let retries reconcile writes whose responses timed out without skipping or overwriting records.

Do not select **Reset app data** to load the sample. Reset permanently removes every profile, work order, and comment in this app, including your exercise work. It requires typing `RESET <current-app-item-id>` and is intended only for an explicitly approved restart. Close other tabs using the app; a full reset can take several minutes. If paused or interrupted, return to this page in the same browser and account, type the confirmation again, and select **Resume reset**. **Discard checkpoint** forgets progress but does not undo changes. Chunks stop starting new batches after 20 seconds; in-flight requests, the initial reset inventory, and final verification can take longer. These tools still use browser-side SDK calls; backend Functions remain disabled. Platform-owned workspace/capacity cleanup is separate.

## Task 2: Validate the dataset

1. Open the **Manager** view to review all sample service pros and work orders. The Jobs view shows only your assignments and unassigned jobs; synthetic Service Pros are not additional login accounts.
2. Confirm that sample records include 92 pending/unassigned, 15 assigned, 8 in progress, 755 completed, 112 needing follow-up, and 58 cancelled work orders before edits. The initial job and your exercise records add to these totals.
3. Use the status filters and open a few records to check varied skills, locations, and operational states.
4. Return to **Jobs** and confirm your profile and earlier comments are still present. Repeating restore should not change record counts or replace your changes.

## Task 3 (Optional): Add comments

If time permits, add comments to several work orders in both the service-pro and manager experiences. Confirm that the assigned service pro and manager can see the same thread.

Continue to [Add a semantic-model dashboard to the app](08-fabric-insights.md).
