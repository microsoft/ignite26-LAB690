# Exercise 4: Run the app locally

In this exercise, provision a Fabric backend, start the frontend, and try the service-pro and manager experiences.

For this lab, use the same signed-in account to switch between both demonstration views. Switching views is not an authorization boundary. In a production app, roles would be assigned to authenticated identities and enforced server-side rather than selected by the user.

## Task 1: Provision the backend

1. Open a terminal in the `field-services-app` project directory.
2. Run:

    ```shell
    npx @microsoft/rayfin@experimental up
    ```

3. Follow the sign-in prompts for Microsoft Fabric using your lab account. The CLI provisions the backend services configured by the project, applies the data schema, and generates the frontend configuration in `packages/frontend/.env.local`.
4. Wait for the command to finish and note the deployment details it reports. Keep generated environment files and deployment settings private; do not commit credentials or keys.

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
