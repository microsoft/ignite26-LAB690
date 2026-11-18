# Exercise 4: Run the app locally

In this exercise, ask GitHub Copilot to start a CLI-managed development session that provisions a Fabric backend and runs the frontend locally, then try the service-pro and manager experiences.

For this lab, use the same signed-in account to switch between both demonstration views. Switching views is not an authorization boundary. In a production app, roles would be assigned to authenticated identities and enforced server-side rather than selected by the user.

## Task 1: Start the development session

1. In the left panel of the GitHub Copilot app, select the **field-services-app** session you created in Exercise 2.
2. Ask Copilot to start the development session in a visible terminal, replacing `<workspace-name>` with the exact display name you recorded in Exercise 1:

    ```text
    Open a terminal in the canvas view so I can watch its output. In that terminal, start the Rayfin development session by running:
    npx rayfin dev --workspace "<workspace-name>"
    Leave it running, and give me the local frontend URL when it's ready.
    ```

    > [!IMPORTANT]
    > If Rayfin reports **Login failed: OS keychain is not available and plaintext token storage is not enabled.**, as expected in the lab VM, ask Copilot to set the `RAYFIN_ENCRYPTION_FALLBACK_ENABLED` environment variable to `"true"` for Rayfin commands, then retry. This permits plaintext token storage when the OS keychain is unavailable. Use it only when needed, such as in the lab VM, and do not share the stored tokens. Include the same instruction in later prompts that run Rayfin commands.

3. The agent opens a **Terminal** panel and runs the command in it. Follow the sign-in prompts for Microsoft Fabric using your lab account. The CLI uses your existing workspace, provisions a missing app backend, applies the data schema, generates `packages/frontend/.env.local`, and starts the frontend.
4. Wait for the agent to report the local frontend URL, and leave the development session running in the terminal panel. Keep generated environment files and deployment settings private; do not commit credentials or keys.

`rayfin dev` does not publish the static frontend. You will publish the hosted app with `rayfin up` in Exercise 5.

`npx rayfin` uses the project's installed CLI, and `npx rayfin --version` should report the locked 2.x version. If an older version appears, update the template's Rayfin dependencies together using the [reference app's update instructions](../src/field-services-app/README.md#update-rayfin-packages), then retry. Updating a global CLI alone does not update the project's installed version.

## Task 2: Open the local frontend

1. In your browser, open the local frontend URL reported by the agent, usually `http://localhost:5173`. You do not need to start a separate development server.
2. The Vite local-dev plugin uses the Rayfin CLI's Microsoft sign-in to establish the app session automatically. Complete any CLI sign-in prompt with your lab account. No separate email/password account is needed.
3. Confirm that the app opens. If automatic sign-in fails, review the displayed error and check that `services.auth.fabric.externalEntraExchange: true` is configured, then ask Copilot to restart the development session in the terminal panel.

## Task 3: Try the service-pro experience

1. Confirm you are signed in with your lab account. If the sign-in page is shown, use the Microsoft sign-in button to retry.
2. If prompted to allow the app to use your Fabric credentials, review the prompt and accept it only for the lab app.
3. Create a service-pro profile with your name and relevant skills, for example `painting, hanging, drilling`.
4. Open the Jobs view. If a sample work order is available, accept it and mark it complete.

## Task 4: Try the manager experience

1. Select **Manager** in the app navigation. For direct navigation, use `/manager/` on the actual local URL printed by Vite.
2. Create a work order and assign it to your service-pro profile.
3. Return to the Jobs view and confirm the assigned work order appears.
4. In the GitHub Copilot app, select the **Terminal** panel running the development session, then press **Ctrl+C** to stop it.

Continue to [Deploy and verify the hosted app](05-deploy.md).
