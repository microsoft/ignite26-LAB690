@lab.Title

# Get Started

> [!TIP]
> As you follow the instructions in this pane, whenever you see a `icon`, you can use it to copy text from the instruction pane into the virtual machine interface.

## Sign into Windows

In the virtual machine, sign into Windows using the following credentials:

- Username: +++@lab.VirtualMachine(Win11-Pro-Base).Username+++
- Password: +++@lab.VirtualMachine(Win11-Pro-Base).Password+++

## Lab Overview

This lab demonstrates how to go from zero to production with a full-stack enterprise app using Fabric Apps, the Rayfin SDK, and GitHub Copilot CLI. It shows how a managed backend in Microsoft Fabric can provide database, authentication, hosting, schema management, and deployment so builders can focus on product features instead of infrastructure plumbing.

The scenario centers on Contoso DIY, a home-improvement retailer expanding into home services. After customers choose products for projects like painting, hanging, or repairs, Contoso wants to connect them with qualified service pros who can complete the work in the field. To support this new business line, Contoso needs a work-order management app that allows:

- Managers to create work orders
- Managers to assign jobs to service pros
- Service pros to create profiles with their skills
- Service pros to accept and complete assigned jobs
- The business to track operational data and turn it into insights

Through the exercises, you'll explore how Contoso DIY:

- Bootstraps a production-ready field-services app from a template and uses Fabric Apps and Rayfin SDK to model service pros, work orders, authentication, data, and hosting declaratively
- Provisions a managed Fabric backend with a SQL database, authentication, and static hosting with a single command and no cloud configuration
- Uses GitHub Copilot CLI and the Rayfin agent skill to add features across the schema and user interface, applying schema changes locally and in production without hand-writing migrations
- Seeds the deployed app with realistic data, builds a Microsoft Fabric semantic model over it, and uses the Rayfin Semantic Model connector to bring insights back into an in-app dashboard

You'll walk in the Contoso DIY team's shoes to build, ship, evolve, and analyze a real enterprise app. The exercises are designed to be completed in order because each step builds on the app, data model, deployment, and resources created in the previous exercises, so make sure you complete each exercise before moving on to the next one.

Select **Next →** to start the lab.

===

# Exercise 1: Setup Your Environment

Before you can build, deploy, and explore the work-order app, you need to get your environment ready by signing in to Microsoft Fabric, then GitHub and GitHub Copilot.

This lab uses a pre-configured virtual machine with all necessary tools installed. The already pre-installed tools include:

- Node.js 24
- npm
- PowerShell 7
- Git
- Visual Studio Code
- GitHub Copilot CLI

## Task 1: Sign in to Microsoft Fabric

1. In the virtual machine, open Microsoft Edge and navigate to the Microsoft Fabric portal at: `https://app.fabric.microsoft.com`.

1. When prompted to sign in, use the following credentials:

    - **Email**: +++@lab.CloudPortalCredential(User1).Username+++
    - **TAP**: +++@lab.CloudPortalCredential(User1).AccessToken+++

1. After a successful sign-in, you will land on the Microsoft Fabric homepage. **Keep this browser tab open** as you will need this active session for the next steps.

    > [!Important]
    > If the page title and icon in the bottom left corner of the page say "Power BI", you need to switch to the Fabric portal. Click on the **Power BI** icon in the bottom left corner, then select **Fabric** to switch to the Microsoft Fabric portal.

## Task 2: Sign in to GitHub through the lab SSO portal

In this exercise, you will sign in to GitHub through Contoso DIY's enterprise SSO portal. Contoso DIY purchases GitHub Enterprise for its organization, which includes managed access to GitHub Copilot for employees through the company's enterprise plan.

1. In a new browser tab, navigate to: `https://github.com/enterprises/skillable-events/sso`

1. On the Single Sign-On page, select **Continue** and sign in using the following credentials:

    - **Email**: +++@lab.CloudPortalCredential(User1).Username+++
    - **TAP**: +++@lab.CloudPortalCredential(User1).AccessToken+++

    > [!Tip]
    > Since you already used these credentials to sign in to Microsoft Fabric, you may not be prompted to enter them again and will be signed in automatically.

1. After a successful sign-in, you will be redirected to the GitHub homepage. **Keep this browser tab open** as you will need this active session for the next steps.

## Task 3: Sign in to GitHub Copilot in the terminal

1. In the virtual machine, from the taskbar, select **Windows Terminal** to open a new terminal window.

1. In the terminal, start the Copilot CLI by running: `copilot`.

1. When prompted with "Do you trust the files in this folder?", select **Yes, and remember this folder for future sessions** by navigating with the arrow keys and pressing Enter.

1. In the Copilot CLI, run `/update` to update to the latest version.

1. Run the following command in the Copilot CLI to start the login process: `/login`.

1. When prompted to choose a sign-in method, select **Github.com**.

1. Press any key to open the browser and sign in using the SSO session from Task 2. The device code is copied to your clipboard automatically, so paste it into the browser when asked.

1. After a successful sign-in, return to the terminal and confirm that you see "Signed in successfully" in the output.

1. Exit the Copilot CLI by running: `/exit`. You will start it again in the next exercise when you use it to generate code.

---

## Verify Your Setup

Navigate back to the Windows Terminal and run the following commands to verify that your environment is set up correctly:

```shell
node --version
npm --version
git --version
copilot --version
```

Confirm that Node.js reports version 24 and the other commands report installed versions.

> [!Note]
> This lab uses Rayfin **^2.0.0**. The create command in Exercise 2 downloads it, so you don't need a global Rayfin installation.

Select **Next →** to start the second exercise.

===

# Exercise 2: Bootstrap App from Template

In this exercise, you'll create a new Rayfin project from the **Field Services** template.

The template handles the setup for you, so you can focus on the lab.
> [!TIP]
> In this lab environment, the template is available locally at **C:\LabFiles\template\field-services-app**. The **rayfin** CLI knows how to find it by name.

## Task 1: Bootstrap a new Rayfin project from the Field Services template

1. From the open Windows Terminal, enter the following command then press **Enter** to bootstrap a new Rayfin project from the Field Services template.

    ```shell
    npm create -y @microsoft/rayfin@^2.0.0 -- --project-name field-services-app --template "C:/LabFiles/template/field-services-app"
    ```

    The CLI will then:
    - Create a new folder called **field-services-app** in your current directory.
    - Copy the template files into a new **field-services-app** folder.
    - Wire the project to your Fabric workspace using the `--workspace-uri` you provided.
    - Run `npm install` in the new project folder to pull dependencies (this can take a couple of minutes on first run).

    > [!Note]
    > This lab uses Rayfin **^2.0.0**. Use `@^2.0.0` in every `npm create` command and `^2.0.0` for Rayfin package additions, and keep Rayfin packages version-matched. Inside the generated project, use `npx rayfin` to run the installed CLI.

1. While the install is running, open the **data** folder at **C:\LabFiles\template\field-services-app** to see the original prompt and dataset used to generate this template. This will give you a better understanding of how the app was built and ideas on how to customize it later in the lab.

## Task 2: Explore the generated project and make your first commit

In this task, you will inspect the generated project, initialize a Git repository, and make your first commit. This is important for GitHub Copilot CLI in later exercises, as it will show you clean diffs and what it will be changing when you ask it to generate code.

1. Open the **field-services-app** folder in Visual Studio Code by running the following command in the terminal:

    ```shell
    code field-services-app
    ```

1. In the pop-up dialog in Visual Studio Code that appears asking if you trust the authors, select **Yes, I trust the authors**.

1. In the Visual Studio Code Explorer, expand the **field-services-app** folder that was created by the bootstrap command.

    !IMAGE[vscode-explorer.png](instructions345417/vscode-explorer.png)

1. Review the project structure. It should look something like this:

    - **packages/data/**: Rayfin data model (entity classes and schema)
    - **packages/shared/**: Browser-safe record contracts shared by the frontend
    - **packages/frontend/**: React + TypeScript frontend
    - **rayfin/**: Rayfin backend configuration (*rayfin.yml*)
    - **data/**: Seed data and **the original prompt + dataset used to generate this template** (worth a look if you're curious how it was built)
    - **package.json**: Declares the npm workspaces and root scripts such as **build** and **dev**.

1. Open the terminal in Visual Studio Code by right-clicking in an empty space of the editor area's tabs bar and select **New Terminal** to open a terminal pane. Alternatively, you can select **View > Terminal** from the top menu.

1. In the Visual Studio Code terminal, run this command to initialize a new Git repository:

    ```shell
    git init
    ```

1. Next, add all the files to the staging area with this command:

    ```shell
    git add .
    ```

1. Finally, make your first commit with this command:

    ```shell
    git commit -m "Initial commit - bootstrap from template"
    ```

Continue with **Next →** to explore the codebase.

===

# Exercise 3: Explore the App Template

In this exercise, you will quickly inspect the app you created in Exercise 2.

You will look at:

- the main project folders
- the Rayfin configuration file
- the Rayfin data model
- the frontend files you may use later

> [!Tip]
> Skim the files. You do not need to understand every line yet.

## Task 1: Explore the project structure

1. In Visual Studio Code, expand the **field-services-app** folder.

1. Notice these files and folders:

    | Folder / file | Why it matters |
    | --- | --- |
    | **rayfin/rayfin.yml** | Turns Rayfin managed services on or off. |
    | **packages/data/src/** | Defines and registers the backend data model. |
    | **packages/shared/src/** | Contains browser-safe record contracts and the typed client schema. |
    | **packages/frontend/src/** | Contains the React + TypeScript frontend. |
    | **packages/frontend/src/services/** | Connects the frontend to Rayfin auth and data. |
    | **packages/frontend/src/pages/** | Contains the main app pages. |
    | **packages/frontend/vite.config.ts** | Configures Vite and the integrated local-development auth plugin. |
    | **data/** | Contains the original app spec and seed dataset. |
    | **package.json** | Declares the npm workspaces and root scripts such as *dev*, *build*, and *test*. Each package owns its dependencies. |
    | **AGENTS.md** | Gives guidance for AI coding agents. |

    We will review the Rayfin configuration and data model in more detail in the next tasks, review the rest of the files lightly for now.

1. Ignore the generated configuration files for now. You will come back to the important files later.

## Task 2: Explore the Rayfin YAML configuration

The **rayfin/rayfin.yml** file tells Rayfin which services this app uses.

1. Open **rayfin/rayfin.yml**.

1. Find the **services** section.

1. Notice these services:

    | Service | What it does in this app |
    | --- | --- |
    | **auth** | Two providers are enabled: **password** (used for local development) and **fabric** (Microsoft Entra SSO, used when deployed to Microsoft Fabric). |
    | **data** | Creates a managed SQL database for the app. |
    | **storage** | Is turned off in this template, but can be enabled for blob storage. |
    | **staticHosting** | Hosts the built frontend from *packages/frontend/dist/* after deployment. |

1. Do not edit this file yet. For now, just learn where the settings live.

## Task 3: Explore the Data Model

The **packages/data/src/** folder defines the database tables for this app.

1. Open **packages/data/src/**.

1. You should see these files:

    - **schema.ts**
    - **ServicePro.ts**
    - **WorkOrder.ts**

1. Open **schema.ts** and review the imports and the **schema** array. Remember this rule: every entity must be imported and added to the **schema** array.

1. Open **ServicePro.ts** and review the **ServicePro** class and notice these decorators:

    - **@entity()** creates a database table.
    - **@role('authenticated', '*')** allows signed-in users to create, read, update, and delete rows.
    - **@uuid()**, **@text(...)**, and **@date()** define columns.
    - **user_id** stores the signed-in user's identity from auth.

    > [!Note]
    > **user_id** is **@text()** because auth provider user IDs are strings. It is not a relationship to another Rayfin entity.

1. Open **WorkOrder.ts** and review the **WorkOrder** class and notice that it has similar decorators to **ServicePro**, but also has some new ones:

    - **@set(...)** limits *status* to known values, such as **pending** and **completed**.
    - **@one(() => ServicePro, { optional: true })** links a work order to a service pro.
    - **servicePro_id** stores the selected service pro ID for the app to read and write.

1. Remember this rule: these TypeScript entity classes are the source of truth for the database schema.

1. Open **packages/shared/src/index.ts**. These record contracts keep frontend data access typed without importing the decorated backend classes into the browser. Keep them aligned when you change an entity.

## Task 4 (Optional): Explore the Frontend Code

You do not need to understand the full frontend in this exercise.

1. Open **packages/frontend/src/**.

1. If you have time, look at these files:

    - **services/ServiceContainer.ts**: singleton that bootstraps the Rayfin client and selects the right auth provider for the environment.
    - **services/rayfin/RayfinFieldService.ts**: CRUD operations for *ServicePro* and *WorkOrder* using the typed Rayfin data API.

1. Keep these ideas in mind:

    - The frontend uses types generated from the Rayfin schema.
    - If you change a field in **packages/data/src/**, TypeScript can help find frontend code that needs updating.
    - The app does not use a hand-written REST client.

---

## Knowledge Check

@lab.ActivityGroup(check1)

If either question is unclear, review Task 2 and Task 3 before continuing.

Continue with **Next →** to run the App locally.

===

# Exercise 4: Run the App Locally

In this exercise, you will run the Field Services app locally.

You will:

- **Provision a Fabric backend** for the app with one command
- Start the **frontend dev server** locally

Then you will sign in, create a Service Pro profile, complete a work order, and test the manager view.

> [!Note]
> In this lab, you use the same signed-in account to switch between the Service Pro and manager views. Switching views is not an authorization boundary. In a production app, roles would be assigned to authenticated identities and enforced server-side rather than selected by the user.

## Task 1: Provision the Fabric backend

The **rayfin up** command provisions a managed backend (database, auth, data API) in your Fabric workspace and wires your local frontend to talk to it.

1. Use the VS Code terminal from the previous exercise. It should already be in the **field-services-app** folder.

1. Provision the Fabric backend by running:

    ```shell
    npx rayfin up
    ```

    > [!IMPORTANT]
    > Rayfin tool may report an error like **Login failed: OS keychain is not available and plaintext token storage is not enabled.** because of the VM environment. If you run into this, run `$env:RAYFIN_ENCRYPTION_FALLBACK_ENABLED = "true"` in the terminal to enable plaintext token storage for the current session, then retry the command.

1. When asked to choose a Fabric workspace for the deployment, select **Use new workspace**, then validate the capacity.

1. As this is your first time deploying, the CLI will:

    - Open a browser to sign you in to Microsoft Entra. Authentication will be automatic since you already have an active SSO session from Exercise 1.
    - **Create a Fabric App item** in the workspace you wired up at bootstrap.
    - **Provision a managed SQL database** for your data model.
    - **Apply your schema** to that database.
    - **Generate a publishable key** for the new backend.
    - **Wire your frontend** to the new backend by writing the connection details and key into *packages/frontend/.env.local*.

1. Watch the terminal for progress on each step. The first run takes a couple of minutes.

1. When the command finishes, the CLI prints the deployment details, including the backend URL.

> [!TIP]
> The CLI saves the deployment details to **rayfin/.deployments.json** so subsequent **rayfin up** runs update the same deployment instead of creating a new one. Keep the generated environment files private and don't commit credentials or keys.

> [!Note]
> `npx rayfin` uses the project's installed CLI. Check that `npx rayfin --version` reports the locked 2.x version. If an older version appears, ask your lab instructor for help: the template's Rayfin packages must be updated together, and updating a global CLI alone doesn't change the project's version.

## Task 2: Start the frontend

The frontend is the React app that users interact with.

1. In the same terminal, start the Vite dev server:

    ```shell
    npm run dev
    ```

    Because **rayfin up** already wrote the backend URL and publishable key into **packages/frontend/.env.local**, Vite picks them up automatically. Your locally-served frontend talks to the freshly provisioned Fabric backend with no extra configuration.

1. Copy the local frontend URL shown in the terminal, which should be similar to `http://localhost:5173`, and open it in a new browser tab.

1. The Vite local-development plugin uses the Rayfin CLI's Microsoft sign-in to establish the app session automatically, so you don't need a separate email and password. If the CLI prompts you to sign in, use the same Microsoft account you used for Fabric:

    - **Email**: +++@lab.CloudPortalCredential(User1).Username+++
    - **TAP**: +++@lab.CloudPortalCredential(User1).AccessToken+++

1. Confirm that the app opens.

    > [!Tip]
    > If automatic sign-in fails, review the error displayed in the app. Check that **rayfin/rayfin.yml** contains `externalEntraExchange: true` under **services > auth > fabric**, and that it was deployed with `npx rayfin up` before retrying.

## Task 3: Sign up as a Service Pro

1. Confirm that you are signed in with your lab account. If the sign-in page is shown instead, select the **Sign in with Microsoft** button to retry.

1. If a Microsoft Fabric dialog pops up asking you to allow the app to use your Microsoft Fabric credentials, select **Accept** to continue.

1. You should land in the Service Pro First Access view where you can create your profile.

1. Create your Service Pro profile by entering your name and relevant skills.

1. For the skills, enter a few relevant skills such as:

    ```text
    painting, hanging, drilling
    ```

1. Complete the profile creation by selecting **Create Profile**.

1. After your profile is created, you should see the **Jobs** view. If a sample work order is available, use it to test the next steps.

1. Accept the work order by selecting the **Accept job** button on the work order card.

1. Mark the work order complete by selecting the **Mark done** button on the work order card.

## Task 4: Explore the manager view

The same app also includes a manager view.

1. Select **Manager** in the app navigation bar. You can also navigate directly to `/manager/` on the local URL printed by Vite, such as `http://localhost:5173/manager/`.

1. Review the manager view and create a new work order by completing the form and selecting **Create order**.

1. Assign the work order to your Service Pro profile.

1. Select **Jobs** in the top navigation bar.

1. Confirm that the assigned work order appears for the Service Pro.

1. Back in the Visual Studio Code terminal, stop the Vite dev server by pressing **Ctrl+C**.

Continue with **Next →** to deploy the app to production.

===

# Exercise 5: Verify the Production Deployment on Microsoft Fabric

In Exercise 4, you ran **npx rayfin up** to provision the Rayfin backend in Microsoft Fabric. That command also built the frontend by running **npm run build:fabric**, uploaded the compiled app to Microsoft Fabric's managed static hosting, and deployed the schema.

In this exercise, you will verify the live deployment created by **rayfin up**. There is no separate production publishing step for this lab: each **rayfin up** updates the deployment associated with your selected Microsoft Fabric workspace.

You will:

- Open the hosted app URL generated by **rayfin up**
- Sign in with Microsoft Fabric
- Confirm that the hosted app uses the same backend, database, and schema as the app you tested locally
- Optionally inspect the deployed app and SQL Database items in the Microsoft Fabric portal

## Task 1: Open the live app

1. In the terminal output from the `npx rayfin up` command you ran in Exercise 4, find the **static hosting URL** printed by the CLI. The URL should look similar to `https://<random-prefix>.webapp.rayfin….com`.

    !IMAGE[rayfin-up.png](instructions345417/rayfin-up.png)

    > [!TIP]
    > If you missed the hosting URL, run `npx rayfin up status` from the **field-services-app** folder to print the current deployment details.

1. Open the hosting URL in a new browser tab. The app shows the same sign-in experience as your local frontend, because both use the same Fabric backend.

1. If the sign-in page is shown, select **Sign in with Microsoft** and accept the Microsoft Fabric credentials prompt if it appears.

1. After authentication completes, confirm that you land in the Service Pro view.

1. Confirm that you can see the same profile and work orders you created in the previous exercise. This verifies that the hosted app is using the same database as the app you tested locally.

1. Select **Manager** in the app navigation bar (or append `/manager/` to the hosting URL) and create a couple of new work orders.

At this point, you have verified that the app is live. Any user with access to your Microsoft Fabric workspace can open the hosted app and use the deployed backend.

> [!Tip]
> **Need separate dev and production environments?** Run `npx rayfin up` against a second Microsoft Fabric workspace to create a separate deployment with its own backend, database, and frontend. Then switch between deployments anytime with `npx rayfin up switch`. Each deployment is tracked independently in **rayfin/.deployments.json**.

## Task 2: Inspect the deployment in Fabric

Let's take a look at the deployed app and database in the Microsoft Fabric portal.

1. Open the Microsoft Fabric portal at `https://app.fabric.microsoft.com`.

1. Find the workspace created for the Field Services app deployment in Exercise 4 and open it, should be named something like **field-services-app-123456**.

1. Confirm that the workspace contains a **Fabric data app** item and a **SQL Database** item. The **ServicePros** and **WorkOrders** tables are stored in the SQL Database item.

1. Select the Fabric SQL Database item to open it, and in the left explorer, expand the **field-services-app** database and then expand **dbo > Tables** to see the **ServicePros** and **WorkOrders** tables.

1. Select each table to see the data contained within it.

    !IMAGE[fabric-sql-tables.png](instructions345417/fabric-sql-tables.png)

Continue with **Next →** to update the app with a new feature.

===

# Exercise 6: Add a Feature with Copilot CLI

In the previous exercises, you deployed the Field Services app to Microsoft Fabric and confirmed that the hosted app uses the same Rayfin backend as your local development experience. In this exercise, you will use GitHub Copilot CLI to implement a schema-backed comments feature for work orders.

The comments feature gives each work order a conversation thread where service pros and managers can discuss job details over time. Implementing this feature requires changes across the Rayfin data model, permissions, typed data access, and React user interface.

By completing this exercise, you will:

- Review the project-specific agent instructions that guide GitHub Copilot CLI.
- Launch GitHub Copilot CLI from the Field Services app project.
- Generate a Rayfin-backed **Comment** entity and comments user interface.
- Review the generated schema, permission, data access, and frontend changes.
- Apply the schema update to the Microsoft Fabric backend.
- Redeploy the app and validate the comments workflow locally and in the hosted app.

## Task 1: Review the project agent instructions

The app template includes agent instructions that help GitHub Copilot CLI generate Rayfin code that follows the project's conventions.

The Rayfin agent skill provides domain guidance for entities, decorators, permissions, schema updates, and typed client usage. The project-level **AGENTS.md** file adds repository-specific context, including architecture notes, important files, and implementation conventions.

1. In Visual Studio Code, Open **AGENTS.md** at the project root.

1. Review the guidance so you understand the context GitHub Copilot CLI will use while editing this project.

1. Open **package.json** and confirm that **@microsoft/rayfin-mcp** is listed in the development dependencies.

    > [!Tip]
    > The template installs the Rayfin agent skill automatically. If you start from a blank project in the future, install the agent files by running `npx rayfin init ai-files install` from the project folder.

## Task 2: Launch GitHub Copilot CLI

Start GitHub Copilot CLI from the app project folder so it can read the project files, agent instructions, and Rayfin configuration.

1. Open a terminal in Visual Studio Code.

1. Launch GitHub Copilot CLI:

    ```shell
    copilot
    ```

1. Use the model and reasoning settings available for your account. When GitHub Copilot CLI asks to edit files or run commands, review each proposed action before approving it.

## Task 3: Generate the comments feature

Use GitHub Copilot CLI to generate the comments feature without applying the backend schema change yet.

1. In the GitHub Copilot CLI prompt, paste the following implementation request:

    ```text
    Implement a comments feature for work orders. Comments should provide a history of interventions so service pros and the manager can communicate about a work order. Each comment must include an id, userId, createdAt, workOrderId, and content. Keep the comments section collapsed by default. Let the attendee add comments from the assigned service-pro experience and reply from the manager experience using the same signed-in account. These are switchable demonstration views, not independently authorized roles. Preserve authenticated backend access; do not treat the view switch as authorization or add a second account requirement. Generate the code, but do not apply the backend schema change yet.

    Use ^2.0.0 for Rayfin package additions and @^2.0.0 in every npm create command, rather than latest or prerelease tags. Use the project's installed CLI and keep participating Rayfin packages version-matched.

    Preserve the existing RayfinClient.create composition with browserSession and dataService. Select every field the comments UI needs, convert wire dates at the service boundary, and do not treat partial mutation responses as complete records.
    ```

1. Review the plan and allow GitHub Copilot CLI to apply the code changes.

1. As the implementation runs, confirm that GitHub Copilot CLI is making changes consistent with the request, including:

    - A new **WorkOrderComment** entity under **packages/data/src/**
    - An update to **packages/data/src/schema.ts** that registers the new entity
    - A matching record contract in **packages/shared/src/index.ts**
    - Authenticated backend access, with comments available in both the Service Pro and manager views
    - React user interface changes that add a collapsed-by-default **Comments** section to work-order details
    - Typed Rayfin client calls that fetch and create comments

    > [!Note]
    > Your entity could be named **Comment** or **WorkOrderComment** or something similar. The important part is that it includes the required fields and is properly registered in the schema. For purposes of this lab, the instructions will refer to it as **WorkOrderComment**, but the actual name may vary.

    > [!Note]
    > The lab deliberately allows one account to try both views. In production, roles would be assigned to authenticated identities and enforced server-side rather than selected by the user.

## Task 4: Review the generated implementation

Before applying backend changes, review the files generated by GitHub Copilot CLI.

1. Open the Visual Studio Code Source Control view.

    !IMAGE[vscode-source-control.png](instructions345417/vscode-source-control.png)

1. Review each changed file.

1. Confirm that the implementation includes a comment entity, schema registration, shared contract, data access updates, and user interface updates.

1. If you prefer the terminal, run `git status` or `git diff` from the **field-services-app** folder to inspect the same changes. Expected changes include:

    - A new file under **packages/data/src/**, such as **WorkOrderComment.ts**
    - An update to **packages/data/src/schema.ts**
    - An update to **packages/shared/src/index.ts**
    - New or updated files under **packages/frontend/src/components/**, **packages/frontend/src/pages/**, **packages/frontend/src/hooks/**, or **packages/frontend/src/services/**
    - A comments user interface that is collapsed by default

> [!Note]
> The implementation should rely on Rayfin decorators, schema generation, permission policies, and the typed client. You should not need to create a hand-written REST endpoint, migration script, or authorization middleware for this feature.

## Task 5: Apply the schema update and redeploy

The implementation request asked GitHub Copilot CLI to generate code without applying backend changes. To test the feature, apply the new schema to the Microsoft Fabric backend and redeploy the app.

1. Exit GitHub Copilot CLI by typing `/exit` in the prompt.

1. In a terminal in the **field-services-app** folder, apply the database schema update:

    ```shell
    npx rayfin up db apply
    ```

1. Confirm that the command completes successfully and creates the new **WorkOrderComments** table.

    !IMAGE[fabric-workordercomments-table.png](instructions345417/fabric-workordercomments-table.png)

    > [!Note]
    > If the command warns about destructive changes, stop and review the listed operations before continuing. Adding a new entity should not require dropping or renaming existing columns.

1. Deploy the updated backend API metadata and frontend:

    ```shell
    npx rayfin up
    ```

    > [!Note]
    > The full `rayfin up` flow can also apply pending database migrations. In this lab, you applied the database change first so the schema update is visible as a separate step.

## Task 6: Validate the comments workflow

Test the comments feature from both the local development app and the hosted app.

1. Start the local Vite dev server if it's not already running:

    ```shell
    npm run dev
    ```

1. Open the local app at the Vite dev server URL, such as `http://localhost:5173`.

1. Open a work order assigned to your Service Pro profile.

1. Expand the new **Comments** section.

1. Add a comment to the work order.

1. Select **Manager** in the app navigation bar.

1. Open the same work order and confirm that you can see the comment thread using the same signed-in account.

1. Add a reply from the manager view.

1. Select **Jobs** and confirm that the reply appears in the same thread.

1. Reload the page and expand the **Comments** section again to confirm that the comments persist.

1. Open the live hosting URL from Exercise 5 and repeat a quick smoke test to confirm that the deployed app also includes the comments feature.

## Task 7: Refine the implementation if needed

If the feature does not work as expected, use GitHub Copilot CLI to make a targeted fix. Include the observed behavior, error message, or screenshot details in your follow-up prompt.

Example follow-up prompts:

```text
The Comments section is not collapsed by default. Please fix it.
```

```text
This error appears when I post a comment: <paste the error message>. Please fix it.
```

```text
The manager view cannot see comments on assigned work orders. Please review the data access and fix the issue.
```

After GitHub Copilot CLI applies a fix, review the proposed changes, then repeat the relevant validation steps from Task 5 and Task 6.

You have completed the feature implementation and validation workflow for the Field Services app.

Continue with **Next →** to Seed Data for Analysis.

===

# Exercise 7: Seed Data for Analysis

In Exercise 6, you implemented and deployed a schema-backed comments feature. In this exercise, you will seed the backend with a richer dataset for the analysis-focused steps that follow.

Seeding data provides a realistic set of service pros, work orders, and statuses so the next analysis-focused exercises have meaningful data to query.

By completing this exercise, you will:

- Use the built-in admin experience to seed the database.
- Confirm that the app now includes a larger, more realistic dataset.
- Optionally add additional comments to improve downstream analysis scenarios.

## Task 1: Open the admin page and seed the database

The template includes an authenticated admin page at `/_admin/` that can restore a fixed sample dataset from **packages/frontend/src/data/field-service-seed.json**.

1. In the hosted app, navigate directly to `/_admin/` by appending it to the hosting URL.

1. Confirm that the admin page is accessible while you are signed in.

1. Check the workspace and app item IDs shown on the page, and confirm that they identify your app.

1. Select **Restore sample data**. This adds missing records from a fixed dataset of 12 synthetic Service Pros and 1,040 work orders spanning April 30, 2025 through April 30, 2026.

1. Wait for the operation to complete.

    > [!Important]
    > Browser-side chunks continue automatically and save a resume position after confirmed operations. Timeouts and throttling retry automatically with backoff; the page shows when it is waiting. To interrupt safely, select **Pause after current batch**, including while waiting to retry. After a pause, reload, or other error, return in the same browser, app, and account and select **Resume restore**. Stable record IDs prevent duplicates, and records are not skipped or overwritten. Chunks stop starting new batches after 20 seconds; in-flight requests and verification can take longer.
    > !IMAGE[Requesterror.png](instructions345417/Requesterror.png)

1. Confirm that the completion message reports the current totals. Your own profile, exercise work orders, edits, and comments are preserved, so totals may be higher than the sample counts.

    > [!Alert]
    > Do **not** select **Reset app data** to load the sample. Reset permanently removes every profile, work order, and comment in this app, including your exercise work. If an approved reset is interrupted, type `RESET <current-app-item-id>` again and select **Resume reset**. **Discard checkpoint** forgets saved progress but does not undo changes.

## Task 2: Validate the seeded dataset in the app

After the restore operation completes, confirm that the larger dataset is visible in the app.

1. Select **Manager** in the app navigation bar to review all sample service pros and work orders.

    > [!Note]
    > The **Jobs** view shows only your own assignments and unassigned jobs. The synthetic Service Pros are not additional login accounts.

1. Confirm that the sample records include 92 pending/unassigned, 15 assigned, 8 in progress, 755 completed, 112 needing follow-up, and 58 cancelled work orders. The initial job and your exercise records add to these totals.

1. Use the status filters and open a few records to verify that the seeded data includes varied skills, locations, and operational states.

1. Return to **Jobs** and confirm that your profile and earlier comments are still present.

## Task 3: (Optional) Add more comments for richer analysis

If time permits, add comments to multiple work orders so downstream analysis has richer conversational data.

1. Open several work orders in both Service Pro and manager views.

1. Add one or more comments per work order.

1. Confirm that each thread is visible from both the Service Pro and manager views.

You now have a production-deployed app with a realistic dataset ready for analysis.

Continue with **Next →** to add a semantic-model dashboard to the app.

===

# Exercise 8: Add a Semantic-Model Dashboard to the App

In Exercise 7, you seeded the database with a realistic production dataset. In this exercise, you will turn that operational data into insights and bring them back into the app.

The Microsoft Fabric SQL Database provisioned by Rayfin is a first-class citizen in your Fabric workspace. You will build a Power BI semantic model over it, then use Rayfin's **Semantic Model connector** and GitHub Copilot CLI to add an operational dashboard to the existing Field Services app. The dashboard queries the semantic model through the connector rather than reading the operational tables directly.

By completing this exercise, you will:

- Build a semantic model over the service pro, work order, and comments tables.
- Register the semantic model as a Rayfin connector in the app.
- Use GitHub Copilot CLI to add a dashboard that queries the semantic model.
- Deploy the app and verify the dashboard locally and in the hosted app.

## Task 1: Build a Semantic model

A semantic model gives a clean, well-described view of your data - including table relationships, friendly column names, and descriptions - that apps and tools can query consistently.

1. Navigate to the Microsoft Fabric portal and open the workspace that was created for this lab.

1. Select **+ New item** from the top menu and in the dialog, search and select **Semantic model**.

1. In the semantic model creation experience, select **OneLake catalog** as the data source type.

    !IMAGE[fabric-create-semantic-model.png](instructions345417/fabric-create-semantic-model.png)

1. Select the SQL Database item and select **Connect**.

    !IMAGE[fabric-select-sql-database.png](instructions345417/fabric-select-sql-database.png)

1. Provide a name for the semantic model, in this case, `FieldServices`.

1. Select the **ServicePros**, **WorkOrders**, and **WorkOrderComments** tables to include in the model and select **Confirm** to create the model.

    > [!Tip]
    > If you don't see the **WorkOrderComments** table when creating a semantic model please wait a few minutes, refresh your page and create the semantic model again.

    !IMAGE[fabric-select-tables-semantic-model.png](instructions345417/fabric-select-tables-semantic-model.png)

    > [!Note]
    > This process will take a few minutes to complete.

1. Define the relationship between the **ServicePros** and **WorkOrders** tables by dragging the **servicePro_id** column from **WorkOrders** onto the **id** column in **ServicePros**.

1. In the **New relationship** dialog, set **Cardinality** to **Many to one (*:1)** and **Cross-filter direction** to **Single**. Confirm that **ServicePros** is on the **one** side and **Make this relationship active** is selected. Leave **Assume referential integrity** cleared because work orders can be unassigned, then select **Save**.

1. Define the relationship between the **WorkOrderComments** and **WorkOrders** tables by dragging the **workOrderId** column from **WorkOrderComments** onto the **id** column in **WorkOrders**.

1. Set **Cardinality** to **Many to one (*:1)** and **Cross-filter direction** to **Single**, with **WorkOrders** on the **one** side. Keep the relationship active and select **Save**.

    > [!Important]
    > Check the relationship settings explicitly. Direct Lake can infer the wrong cardinality from the current row counts.

1. Rename key columns to clear, readable labels. For the following tables, rename these columns:

    a. ServicePros:
    - **id** → `ServiceProId`

    b. WorkOrders:
    - **id** → `WorkOrderId`
    - **scheduledAt** → `ScheduledDate`

    To rename a column, select it in the **Data** view, then expand each table to view its columns. Right-click the column and select **Rename**.

1. Select each table and add descriptions to the tables from the **Properties** pane. The descriptions are as follows:

    - ServicePros: `Service professionals who perform jobs at customer locations. Each has a set of skills and may be assigned to work orders.`
    - WorkOrders: `Work orders for field service jobs. Each has a status, may be assigned to a Service Pro, and has a scheduled date.`
    - WorkOrderComments: `Comments on work orders. Each comment is associated with a single work order and includes content, the authoring user, and a timestamp.`

    !IMAGE[fabric-add-table-descriptions.png](instructions345417/fabric-add-table-descriptions.png)

    > [!Tip]
    > Adding descriptions is optional but highly recommended. Clear names and descriptions help GitHub Copilot CLI and other tools understand your data and write accurate queries.

1. Confirm that the model can query the seeded data. Refresh it if its storage mode requires a refresh.

1. Record the IDs the connector needs. With the **FieldServices** semantic model open, copy the URL from the browser address bar. It should look like `https://app.fabric.microsoft.com/groups/<workspace-id>/datasets/<semantic-model-item-id>/...`. Note the **workspace ID** and the **semantic model item ID**, for example in Notepad.

## Task 2: Connect the semantic model to the app

Register the semantic model as a Rayfin connector in the existing **field-services-app** project.

1. Return to a terminal in Visual Studio Code in the **field-services-app** folder. Do not create a second app or replace the Field Services template.

1. Add a connector named **fieldservicesmodel**. Replace `<workspace-id>` and `<semantic-model-item-id>` with the values you recorded in Task 1:

    ```shell
    npx rayfin connector add --type fabric-semanticmodel --workspace-id "<workspace-id>" --item-id "<semantic-model-item-id>" --name fieldservicesmodel --operations executeQuery
    ```

1. Run the version-matched package installation command printed by the CLI.

    > [!Important]
    > Keep connector and SDK packages on the same release within **^2.0.0**. Do not substitute moving tags or prereleases.

1. Open **rayfin/rayfin.yml** and review the new connector entry. Confirm that it points to your semantic model and uses delegated authentication: queries run as the signed-in user, who must have Build and Read permissions on the model.

1. Open **rayfin/connectors/fieldservicesmodel/schema.ts** and review it. This file is generated, so keep it unchanged.

1. Inspect the model before writing any queries:

    ```shell
    npx rayfin connector inspect --name fieldservicesmodel
    ```

    If metadata inspection fails with a DAX query error, inspect each table with a bounded sample. Replace `<table-name>` with the actual name shown in the model:

    ```shell
    npx rayfin connector inspect --name fieldservicesmodel --entity "<table-name>" --rows 1
    ```

    Note the actual table, column, and measure names, including the columns you renamed in Task 1.

> [!Note]
> The connector requires the Fabric Apps workload and the **Semantic Model Execute Queries REST API** tenant setting to be enabled. If queries fail with a tenant or permission error, ask your lab instructor for help. To learn more, see the [Rayfin Semantic Model connector documentation](https://rayfin.ai/docs/connectors/semantic-models).

## Task 3: Add the dashboard with Copilot CLI

1. Launch GitHub Copilot CLI from the **field-services-app** folder:

    ```shell
    copilot
    ```

1. In the GitHub Copilot CLI prompt, paste the following implementation request:

    ```text
    Add an operational dashboard to the existing Field Services app, reachable from the manager view. Use the registered fieldservicesmodel Semantic Model connector.

    Read the project instructions, Rayfin guidance, generated connector schema, and semantic model metadata before editing. Inspect the model before writing DAX; do not guess table, column, or measure names.

    Use ^2.0.0 for Rayfin package additions and @^2.0.0 in every npm create command, rather than latest or prerelease tags. Use the project's installed CLI and keep participating Rayfin packages version-matched.

    Show total work orders, work orders by status, and work orders by assigned service pro. Obtain every dashboard metric from the semantic model through the connector, not from direct database queries or mock data.

    Extend the existing RayfinClient.create composition with connectorsService from @microsoft/rayfin-connectors while preserving browserSession, dataService<FieldServiceSchema>(), the app's schema, authentication, data operations, and comments feature. Register services.connectors with connectorsService<GeneratedConnectorsSchema>({ configs: { fieldservicesmodel: connectorConfig }, runtime: { fieldservicesmodel: fabricSemanticModel() } }), using the actual generated schema type and connectorConfig exports. Import fabricSemanticModel from @microsoft/rayfin-connector-fabric-semanticmodel. Infer the client type from the factory; do not use the removed ConnectorsRayfinClient. Keep fieldservicesmodel as the connector key throughout, and keep source declarations under top-level connectors in rayfin.yml.

    Use executeQuery for DAX, check result.status, and map result.table.columns to the row-major result.table.rows. Set an explicit resultSetRowCountLimit and reject responses that exceed it rather than silently truncating them. Show loading, empty, and error states; show connector error details and requestId instead of substituting zero values or sample data.

    Reuse the app's components and styling. Keep the existing Fabric sign-in flow and do not add credentials, access tokens, or direct Execute Queries REST API calls. Generate the changes for review; do not deploy yet.
    ```

1. Review the plan and allow GitHub Copilot CLI to apply the code changes.

1. Open the Visual Studio Code Source Control view and review the changed files. Confirm that:

    - The dashboard gets its data through the **fieldservicesmodel** connector.
    - The connector configuration, generated types, client options, and runtime registration all use the same **fieldservicesmodel** key.
    - The existing profile, work-order, and comments workflows remain intact.

## Task 4: Deploy and verify the dashboard

1. Exit GitHub Copilot CLI by typing `/exit` in the prompt.

1. Deploy the connector configuration and the dashboard:

    ```shell
    npx rayfin up
    ```

1. Start the local Vite dev server:

    ```shell
    npm run dev
    ```

1. Open the local app, select **Manager** in the app navigation bar, and open the new dashboard.

1. Confirm that the total work-order count, the breakdown by status, and the breakdown by Service Pro look consistent with the seeded data from Exercise 7, accounting for unassigned orders.

1. Open the live hosting URL from Exercise 5 and repeat the checks in the hosted app. A successful local query alone does not verify the deployed connector.

1. Confirm that any failed query is shown as an error rather than as an empty dashboard or zero counts.

1. Verify the row limit locally and in the hosted app with a query that exceeds it. Treat an over-limit response as an error even if the connector reports success.

    > [!Tip]
    > If a query fails, check the connector's workspace and item IDs, the signed-in user's permissions on the semantic model, and the actual DAX field names. Use the connector's error category, message, and request ID to investigate, or give these details to GitHub Copilot CLI and ask for a targeted fix.

You have completed the loop from operational app data to a semantic model and back to an in-app dashboard.

Continue with **Next →** for the conclusion of the lab and next steps.

===

# You're done 🎉

In one lab session you just:

1. Bootstrapped a full-stack Fabric App from a template.
2. Ran it locally with **rayfin CLI**.
3. Deployed it to Microsoft Fabric with one command.
4. Added a real schema-backed feature using the GitHub Copilot CLI and the rayfin agent skill.
5. Pushed the change back to production with the same one-command deploy.
6. Seeded production data, built a Fabric semantic model over it, and used the Rayfin Semantic Model connector to bring insights back into the app with a dashboard.

No infrastructure scripts. No migration files written by hand. No bespoke auth plumbing. **From zero to a deployed, data-driven enterprise app - using a managed backend, decorators, and coding agents.**

I hope you enjoyed the lab and are excited about the possibilities of building with Microsoft Fabric and Rayfin SDK. The tools and patterns you saw here are designed to help you build faster, smarter, and more maintainable applications on top of Microsoft Fabric's powerful data and AI capabilities.

To keep exploring, check out:

- [Rayfin documentation](https://aka.ms/rayfin)
- [Microsoft Fabric documentation](https://learn.microsoft.com/fabric/)
- [GitHub Copilot CLI documentation](https://docs.github.com/copilot/how-tos/use-copilot-agents/use-copilot-in-the-cli)
