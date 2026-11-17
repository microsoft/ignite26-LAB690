# Exercise 4: Run the app locally

In this exercise, start a CLI-managed development session that provisions a Fabric backend and runs the frontend locally, then try the service-pro and manager experiences.

For this lab, use the same signed-in account to switch between both demonstration views. Switching views is not an authorization boundary. In a production app, roles would be assigned to authenticated identities and enforced server-side rather than selected by the user.

## Task 1: Start the development session

1. Open a terminal in the `field-services-app` project directory.
2. In the guided Windows VM, enable the token-storage fallback in the current PowerShell terminal before starting Rayfin:

    ```powershell
    $env:RAYFIN_ENCRYPTION_FALLBACK_ENABLED = "true"
    ```

    > [!IMPORTANT]
    > This permits plaintext token storage when the VM's OS keychain is unavailable. Use it only in the lab VM, and do not share the stored tokens. Repeat this step if you open a new PowerShell terminal.

3. Run the following command, replacing `<workspace-name>` with the exact display name you recorded in Exercise 1:

    ```shell
    npx rayfin dev --workspace "<workspace-name>"
    ```

4. Follow the sign-in prompts for Microsoft Fabric using your lab account. The CLI uses your existing workspace, provisions a missing app backend, applies the data schema, generates `packages/frontend/.env.local`, and starts the frontend.
5. Wait for the local frontend URL to appear and leave the command running. Keep generated environment files and deployment settings private; do not commit credentials or keys.

`rayfin dev` does not publish the static frontend. You will publish the hosted app with `rayfin up` in Exercise 5.

`npx rayfin` uses the project's installed CLI. Check that `npx rayfin --version` reports the locked 2.x version. If an older version appears, update the template's Rayfin dependencies together using the [reference app's update instructions](https://github.com/microsoft/ignite26-LAB690/blob/main/src/field-services-app/README.md#update-rayfin-packages), then retry. Updating a global CLI alone does not update the project's installed version.

## Task 2: Open the local frontend

1. Hold **Ctrl** and select the local URL printed in the Visual Studio Code terminal, usually `http://localhost:5173`, to open it in Visual Studio Code's browser. Alternatively, copy and paste the URL into a browser window. You do not need to start a separate development server.
2. The Vite local-dev plugin uses the Rayfin CLI's Microsoft sign-in to establish the app session automatically. Complete any CLI sign-in prompt with your lab account. No separate email/password account is needed.
3. Confirm that the app opens. If automatic sign-in fails, review the displayed error and check that `services.auth.fabric.externalEntraExchange: true` is configured before restarting `rayfin dev`.

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

Continue to Exercise 5 to deploy and verify the hosted app.
