# Exercise 4: Run the app locally

In this exercise, provision a Fabric backend, start the frontend, and try the service-pro and manager experiences.

For this lab, use the same signed-in account to switch between both demonstration views. Switching views is not an authorization boundary. In a production app, roles would be assigned to authenticated identities and enforced server-side rather than selected by the user.

## Task 1: Provision the backend

1. Open a terminal in the `field-services-app` project directory.
2. Run:

    ```shell
    npx rayfin up
    ```

    > [!IMPORTANT]
    > On some VMs, Rayfin reports **Login failed: OS keychain is not available and plaintext token storage is not enabled.** If you see this error, run `$env:RAYFIN_ENCRYPTION_FALLBACK_ENABLED = "true"` in the same PowerShell terminal to allow plaintext token storage for the current session, then retry the command.

3. When asked to choose a Fabric workspace for the deployment, select **Use new workspace**, then validate the capacity.
4. Follow the sign-in prompts for Microsoft Fabric using your lab account. The CLI creates the workspace, provisions the backend services configured by the project, applies the data schema, and generates the frontend configuration in `packages/frontend/.env.local`.
5. Wait for the command to finish and note the deployment details it reports. Keep generated environment files and deployment settings private; do not commit credentials or keys.

`npx rayfin` uses the project's installed CLI. Check that `npx rayfin --version` reports the locked 2.x version. If an older version appears, update the template's Rayfin dependencies together using the [reference app's update instructions](../src/field-services-app/README.md#update-rayfin-packages), then retry. Updating a global CLI alone does not update the project's installed version.

## Task 2: Start the frontend

1. In the project directory, start the development server:

    ```shell
    npm run dev
    ```

2. Open the local URL printed by the terminal, usually `http://localhost:5173`.
3. The Vite local-dev plugin uses the Rayfin CLI's Microsoft sign-in to establish the app session automatically. Complete any CLI sign-in prompt with your lab account. No separate email/password account is needed.
4. Confirm that the app opens. If automatic sign-in fails, review the displayed error and check that `services.auth.fabric.externalEntraExchange: true` has been deployed before retrying.

## Task 3: Try the service-pro experience

1. Confirm you are signed in with your lab account. If the sign-in page is shown, use the Microsoft sign-in button to retry.
2. If prompted to allow the app to use your Fabric credentials, review the prompt and accept it only for the lab app.
3. Create a service-pro profile with your name and relevant skills, for example `painting, hanging, drilling`.
4. Open the Jobs view. If a sample work order is available, accept it and mark it complete.

## Task 4: Try the manager experience

1. Select **Manager** in the app navigation. For direct navigation, use `/manager/` on the actual local URL printed by Vite.
2. Create a work order and assign it to your service-pro profile.
3. Return to the Jobs view and confirm the assigned work order appears.
4. Stop the development server with `Ctrl+C`.

Continue to [Verify the production deployment](05-deploy.md).
