@lab.Title

# Get Started

> [!TIP]
> As you follow the instructions in this pane, whenever you see a `icon`, you can use it to copy text from the instruction pane into the virtual machine interface.

## Sign into Windows

In the virtual machine, sign into Windows using the following credentials:

- Username: +++@lab.VirtualMachine(Win11-Pro-Base).Username+++
- Password: +++@lab.VirtualMachine(Win11-Pro-Base).Password+++

## Lab Overview

This lab demonstrates how to go from zero to production with a full-stack enterprise app using Fabric Apps, the Rayfin SDK, and the GitHub Copilot app. It shows how a managed backend in Microsoft Fabric can provide database, authentication, hosting, schema management, and deployment so builders can focus on product features instead of infrastructure plumbing.

The scenario centers on Contoso DIY, a home-improvement retailer expanding into home services. After customers choose products for projects like painting, hanging, or repairs, Contoso wants to connect them with qualified service pros who can complete the work in the field. To support this new business line, Contoso needs a work-order management app that allows:

- Managers to create work orders
- Managers to assign jobs to service pros
- Service pros to create profiles with their skills
- Service pros to accept and complete assigned jobs
- The business to track operational data and turn it into insights

Through the exercises, you'll explore how Contoso DIY:

- Bootstraps a production-ready field-services app from a template and uses Fabric Apps and Rayfin SDK to model service pros, work orders, authentication, data, and hosting declaratively
- Provisions a managed Fabric backend with a SQL database, authentication, and static hosting with a single command and no cloud configuration
- Uses the GitHub Copilot app and the Rayfin agent skill to add features across the schema and user interface, applying schema changes locally and in production without hand-writing migrations
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
- GitHub Copilot app

## Task 1: Sign in to Microsoft Fabric and create a workspace

1. In the virtual machine, open Microsoft Edge and navigate to the Microsoft Fabric portal at: `https://app.fabric.microsoft.com`.

1. When prompted to sign in, use the following credentials:

    - **Email**: +++@lab.CloudPortalCredential(User1).Username+++
    - **TAP**: +++@lab.CloudPortalCredential(User1).AccessToken+++

1. After a successful sign-in, you will land on the Microsoft Fabric homepage. **Keep this browser tab open** as you will need this active session for the next steps.

    > [!Important]
    > If the page title and icon in the bottom left corner of the page say "Power BI", you need to switch to the Fabric portal. Click on the **Power BI** icon in the bottom left corner, then select **Fabric** to switch to the Microsoft Fabric portal.

1. In the Fabric portal, select **Workspaces**, then **+ New workspace**.

1. For the workspace name, enter +++field-services-@lab.LabInstance.Id+++.

1. In the workspace's advanced settings, select the supported Fabric capacity supplied for the lab, then select **Apply**.

    > [!IMPORTANT]
    > If workspace creation or capacity selection fails, contact the instructor before continuing. Do not start a Fabric trial or use a personal subscription.

1. Confirm that the new workspace opens. Later commands in this lab already include this workspace name.

## Task 2: Sign in to GitHub through the lab SSO portal

In this exercise, you will sign in to GitHub through Contoso DIY's enterprise SSO portal. Contoso DIY purchases GitHub Enterprise for its organization, which includes managed access to GitHub Copilot for employees through the company's enterprise plan.

1. In a new browser tab, navigate to: `https://github.com/enterprises/skillable-events/sso`

1. On the Single Sign-On page, select **Continue** and sign in using the following credentials:

    - **Email**: +++@lab.CloudPortalCredential(User1).Username+++
    - **TAP**: +++@lab.CloudPortalCredential(User1).AccessToken+++

    > [!Tip]
    > Since you already used these credentials to sign in to Microsoft Fabric, you may not be prompted to enter them again and will be signed in automatically.

1. After a successful sign-in, you will be redirected to the GitHub homepage. **Keep this browser tab open** as you will need this active session for the next steps.

## Task 3: Sign in to the GitHub Copilot app

The GitHub Copilot app is the desktop app you'll use in this lab to work with GitHub Copilot: it runs the commands, writes the code, and shows you each change.

1. In the virtual machine, open the **GitHub Copilot app** from the taskbar.

1. In the GitHub Copilot app, select **Sign in to GitHub**. This will copy the device code to your clipboard and open a browser window for authentication.

1. If prompted with a dialog asking for permission to access your GitHub account, select **Authorize GitHub** to continue.

1. In the browser window that opens, use the active GitHub SSO session from Task 2 to complete the sign-in if asked, then paste your device code when prompted with **Ctrl+V** and press **Enter**.

1. Return to the GitHub Copilot app. When asked to start with a local folder or a repository, select **Continue** and confirm that it is ready for you to start a conversation.

---

## Verify Your Setup

1. In the GitHub Copilot app, start a new chat and enter the following prompt, then press **Enter**:

    ```text
    Check that Node.js, npm, Git, and PowerShell 7 are installed on this machine and report their versions. Don't install or change anything.
    ```

1. Confirm that Node.js reports version 24 and the other tools report installed versions.

> [!Note]
> This lab uses Rayfin **^2.0.0**. The create command in Exercise 2 downloads it, so you don't need a global Rayfin installation.

Select **Next →** to start the second exercise.

===

# Exercise 2: Bootstrap App from Template

In this exercise, you'll ask the GitHub Copilot app to create a new Rayfin project from the **Field Services** template, save it to a Git repository, and open it as a project.

The template handles the setup for you, so you can focus on the lab.

> [!TIP]
> In this lab environment, the template is available locally at **C:\LabFiles\template\field-services-app**. The **rayfin** CLI knows how to find it by name.

## Task 1: Bootstrap a new Rayfin project from the Field Services template

1. In the GitHub Copilot app, start a new chat.

1. Enter the following prompt, then press **Enter**:

    ```text
    Create a new Rayfin app in my user profile folder by running this command:
    npm create -y @microsoft/rayfin@^2.0.0 -- --project-name field-services-app --template "C:/LabFiles/template/field-services-app" --workspace "field-services-@lab.LabInstance.Id"
    When it's ready, initialize a Git repository in the field-services-app folder and commit all files with the message "Initial commit - bootstrap from template". Then open the folder as a project in the GitHub Copilot app.
    ```

    > [!TIP]
    > When GitHub Copilot asks for permission to run a command or edit files, review the proposed action, then approve it.

1. Watch the agent work. The Rayfin create command will:

    - Create a new folder called **field-services-app** in your user profile folder.
    - Copy the template files into the new **field-services-app** folder.
    - Record your Fabric workspace display name for later CLI commands.
    - Run `npm install` in the new project folder to pull dependencies (this can take a couple of minutes on first run).

    Then the agent initializes a Git repository, commits the starter code, and adds the **field-services-app** folder as a project in the GitHub Copilot app.

    > [!Note]
    > This lab uses Rayfin **^2.0.0**. The prompts in this lab use `@^2.0.0` in every `npm create` command and `^2.0.0` for Rayfin package additions, and keep Rayfin packages version-matched. Inside the generated project, `npx rayfin` runs the installed CLI.

    The create command does not provision the Fabric backend. You will do that with `npx rayfin dev` in Exercise 4.

1. While the agent is working, open File Explorer and go to the **data** folder at **C:\LabFiles\template\field-services-app** to see the original prompt and dataset used to generate this template. This will give you a better understanding of how the app was built and ideas on how to customize it later in the lab.

1. Confirm that the agent reports that the project was created and committed, and that the **field-services-app** project appears in the left panel of the GitHub Copilot app.

    > [!Note]
    > The initial commit matters: in later exercises, you review each change the agent makes as a clean diff against this starting point.

## Task 2: Open a session in the project

In this task, you open a working session in the **field-services-app** project and ask GitHub Copilot for a first look at the generated project.

1. In the left panel of the GitHub Copilot app, hover over the **field-services-app** project and select **+** (**New session**).

    !IMAGE[github-copilot-new-session.png](instructions359717/github-copilot-new-session.png)

1. Below the chat input area, select **New worktree** and change it to **Current checkout**.

    !IMAGE[github-copilot-new-worktree.png](instructions359717/github-copilot-new-worktree.png)

    > [!TIP]
    > By default, the GitHub Copilot app creates a new worktree for each session, so you can work on several features at once. In this lab, you work on one feature at a time, and the deployment details Rayfin saves in your project folder aren't committed, so always work in the current checkout.

1. Enter the following prompt, then press **Enter**:

    ```text
    Read AGENTS.md and give me a short overview of this project's structure and main folders. Don't change any code.
    ```

1. If a confirmation dialog asks whether you trust the repository, select **A. Always trust repository** to continue.

1. Read the overview. The project structure should look something like this:

    - **packages/data/**: Rayfin data model (entity classes and schema)
    - **packages/shared/**: Browser-safe record contracts shared by the frontend
    - **packages/frontend/**: React + TypeScript frontend
    - **rayfin/**: Rayfin backend configuration (*rayfin.yml*)
    - **data/**: Seed data and **the original prompt + dataset used to generate this template** (worth a look if you're curious how it was built)
    - **package.json**: Declares the npm workspaces and root scripts such as **build** and **dev**.

    > [!Note]
    > The agent's wording varies. If something in the overview isn't clear, ask a follow-up question in the same session.

1. In the top-right corner of the GitHub Copilot app, select the **Toggle panel** button.

    !IMAGE[github-copilot-toggle-panel.png](instructions359717/github-copilot-toggle-panel.png)

1. In the right panel, select **+** (**Open in panel**), then select **Files**. You'll use this panel to browse the project files in the next exercise.

    !IMAGE[github-copilot-files-panel.png](instructions359717/github-copilot-files-panel.png)

    > [!TIP]
    > To read the code more comfortably, you can alternatively select **Open in VS Code** in the session header. It opens the **field-services-app** project in Visual Studio Code. If Visual Studio Code asks whether you trust the authors, select **Yes, I trust the authors**.

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
> Skim the files. You do not need to understand every line yet. Browse them in the **Files** panel you opened in Exercise 2. If you closed it, select the **Toggle panel** button in the top-right corner of the GitHub Copilot app, select **+** (**Open in panel**), then select **Files**.

## Task 1: Explore the project structure

1. In the **Files** panel of the GitHub Copilot app, review the files and folders of the **field-services-app** project.

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

The backend entity definitions and schema are in **packages/data/src/**, not **src/data/**.

If either question is unclear, review Task 2 and Task 3 before continuing.

Continue with **Next →** to run the App locally.

===

# Exercise 4: Run the App Locally

In this exercise, you will run the Field Services app locally.

You will **provision a Fabric backend** and start the **frontend dev server** locally with one command.

Then you will sign in, create a Service Pro profile, complete a work order, and test the manager view.

> [!Note]
> In this lab, you use the same signed-in account to switch between the Service Pro and manager views. Switching views is not an authorization boundary. In a production app, roles would be assigned to authenticated identities and enforced server-side rather than selected by the user.

## Task 1: Start the development session

The **rayfin dev** command provisions a missing managed backend (database, auth, data API) in your Fabric workspace, applies your schema, and starts the frontend locally. It does not publish the static frontend; you will do that in Exercise 5.

1. In the left panel of the GitHub Copilot app, select the session you created in Exercise 2 under the **field-services-app** project.

1. Enter the following prompt, then press **Enter**:

    ```text
    Open a terminal in the canvas view so I can watch its output. In that terminal, set the RAYFIN_ENCRYPTION_FALLBACK_ENABLED environment variable to "true", then start the Rayfin development session by running:
    npx rayfin dev --workspace "field-services-@lab.LabInstance.Id"
    Leave it running, and give me the local frontend URL when it's ready.
    ```

    > [!IMPORTANT]
    > The `RAYFIN_ENCRYPTION_FALLBACK_ENABLED` variable permits plaintext token storage, because the lab VM's OS keychain is unavailable. Use it only in the lab VM, and do not share the stored tokens. The prompts in this lab that run Rayfin commands set it for you.

1. The agent opens a **Terminal** panel on the right and runs the command in it. On the first run, the CLI will:

    - Open a browser to sign you in to Microsoft Entra. Authentication will be automatic since you already have an active SSO session from Exercise 1. If you're asked to pick an account, select **@lab.CloudPortalCredential(User1).Username**.
    - **Create a Fabric App item** in the workspace you created in Exercise 1.
    - **Provision a managed SQL database** for your data model.
    - **Apply your schema** to that database.
    - **Generate a publishable key** for the new backend.
    - **Wire your frontend** to the new backend by writing the connection details and key into *packages/frontend/.env.local*.
    - **Start the local frontend** using the template's Vite development server.

1. Watch the terminal panel for progress on each step. The first run takes a couple of minutes.

1. Wait for the agent to report the local frontend URL, and leave the development session running in the terminal panel.

> [!TIP]
> The CLI saves the deployment details to **rayfin/.deployments.json** so subsequent **rayfin dev** and **rayfin up** runs reuse the same backend. Keep the generated environment files private and don't commit credentials or keys.

> [!Note]
> `npx rayfin` uses the project's installed CLI, and `npx rayfin --version` should report the locked 2.x version. If an older version appears, ask your lab instructor for help: the template's Rayfin packages must be updated together, and updating a global CLI alone doesn't change the project's version.

## Task 2: Open the local frontend

The frontend is the React app that users interact with. **rayfin dev** has already started it; you do not need to start a separate development server.

1. In Microsoft Edge, open a new tab and go to the local frontend URL reported by the agent, usually `http://localhost:5173`.

1. The Vite local-development plugin uses the Rayfin CLI's Microsoft sign-in to establish the app session automatically, so you don't need a separate email and password. If the CLI prompts you to sign in, use the same Microsoft account you used for Fabric:

    - **Email**: +++@lab.CloudPortalCredential(User1).Username+++
    - **TAP**: +++@lab.CloudPortalCredential(User1).AccessToken+++

1. Confirm that the app opens.

    > [!Tip]
    > If automatic sign-in fails, review the error displayed in the app. Check that **rayfin/rayfin.yml** contains `externalEntraExchange: true` under **services > auth > fabric**, then ask Copilot to restart the development session in the terminal panel.

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

1. In the GitHub Copilot app, select the **Terminal** panel running the development session, then press **Ctrl+C** to stop it.

Continue with **Next →** to deploy the app to production.

===

# Exercise 5: Deploy and verify the hosted app on Microsoft Fabric

In Exercise 4, you ran **npx rayfin dev** to provision the Rayfin backend in Microsoft Fabric and run the frontend locally. That command did not publish the static frontend.

In this exercise, you will ask GitHub Copilot to run **rayfin up** to build and publish the frontend to Microsoft Fabric's managed static hosting, apply any pending backend changes, and verify the live app using the same workspace and backend.

You will:

- Open the hosted app URL generated by **rayfin up**
- Sign in with Microsoft Fabric
- Confirm that the hosted app uses the same backend, database, and schema as the app you tested locally
- Optionally inspect the deployed app and SQL Database items in the Microsoft Fabric portal

## Task 1: Deploy and open the live app

1. In the **field-services-app** session, enter the following prompt, then press **Enter**:

    ```text
    Deploy this app to my Fabric workspace by running this command, without running prior checks or a dry run:
    npx rayfin up --workspace "field-services-@lab.LabInstance.Id"
    Set the RAYFIN_ENCRYPTION_FALLBACK_ENABLED environment variable to "true" for Rayfin commands. Return the static hosting URL of the deployed app when done.
    ```

1. Wait for the agent to report that the CLI built and published the frontend and applied any pending backend changes.

1. In the agent's response, find the **static hosting URL** printed by the CLI.

    > [!TIP]
    > If you missed the hosting URL, ask Copilot to run `npx rayfin up status` to print the current deployment details.

1. Open the hosting URL in a new Microsoft Edge tab. The app shows the same sign-in experience as your local frontend, because both use the same Fabric backend.

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

1. Open the **field-services-@lab.LabInstance.Id** workspace you created in Exercise 1.

1. Confirm that the workspace contains a **Fabric data app** item and a **SQL Database** item. The **ServicePros** and **WorkOrders** tables are stored in the SQL Database item.

1. Select the Fabric SQL Database item to open it, and in the left explorer, expand the **field-services-app** database and then expand **dbo > Tables** to see the **ServicePros** and **WorkOrders** tables.

1. Select each table to see the data contained within it.

    !IMAGE[fabric-sql-tables.png](instructions345417/fabric-sql-tables.png)

Continue with **Next →** to seed data for analysis.

===

# Exercise 6: Seed data for analysis

In this exercise, seed the deployed backend with a richer dataset for the comments feature and analysis-focused steps that follow.

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

1. Confirm that the completion message reports the current totals. Your own profile, exercise work orders, and edits are preserved, so totals may be higher than the sample counts.

    > [!Alert]
    > Do **not** select **Reset app data** to load the sample. Reset permanently removes every profile, work order, and comment in this app, including your exercise work. If an approved reset is interrupted, type `RESET <current-app-item-id>` again and select **Resume reset**. **Discard checkpoint** forgets saved progress but does not undo changes.

## Task 2: Validate the seeded dataset in the app

After the restore operation completes, confirm that the larger dataset is visible in the app.

1. Select **Manager** in the app navigation bar to review all sample service pros and work orders.

    > [!Note]
    > The **Jobs** view shows only your own assignments and unassigned jobs. The synthetic Service Pros are not additional login accounts.

1. Confirm that the sample records include 92 pending/unassigned, 15 assigned, 8 in progress, 755 completed, 112 needing follow-up, and 58 cancelled work orders. The initial job and your exercise records add to these totals.

1. Use the status filters and open a few records to verify that the seeded data includes varied skills, locations, and operational states.

1. Return to **Jobs** and confirm that your profile and earlier work orders are still present.

You will add the comments feature in Exercise 7.

Continue with **Next →** to add a feature with GitHub Copilot.

===

# Exercise 7: Add a feature with GitHub Copilot

In the previous exercises, you deployed the Field Services app to Microsoft Fabric and seeded it with sample data. In this exercise, use the GitHub Copilot app to implement a schema-backed comments feature for work orders.

The comments feature gives each work order a conversation thread where service pros and managers can discuss job details over time. Implementing this feature requires changes across the Rayfin data model, permissions, typed data access, and React user interface.

By completing this exercise, you will:

- Review the project-specific agent instructions that guide GitHub Copilot.
- Start a GitHub Copilot session in the Field Services app project.
- Generate a Rayfin-backed **Comment** entity and comments user interface.
- Review the generated schema, permission, data access, and frontend changes.
- Apply the schema update to the Microsoft Fabric backend.
- Redeploy the app and validate the comments workflow locally and in the hosted app.

## Task 1: Review the project agent instructions

The app template includes agent instructions that help GitHub Copilot generate Rayfin code that follows the project's conventions.

The Rayfin agent skill provides domain guidance for entities, decorators, permissions, schema updates, and typed client usage. The project-level **AGENTS.md** file adds repository-specific context, including architecture notes, important files, and implementation conventions.

1. In the **Files** panel of the GitHub Copilot app, open **AGENTS.md** at the project root.

1. Review the guidance so you understand the context GitHub Copilot will use while editing this project.

1. Open **package.json** and confirm that **@microsoft/rayfin-mcp** is listed in the development dependencies.

    > [!Tip]
    > The template installs the Rayfin agent skill automatically. If you start from a blank project in the future, install the agent files by running `npx rayfin init ai-files install` from the project folder.

## Task 2: Start a GitHub Copilot session

Start a new session in the app project so GitHub Copilot can read the project files, agent instructions, and Rayfin configuration with a fresh context.

1. In the left panel of the GitHub Copilot app, hover over the **field-services-app** project and select **+** (**New session**).

1. Below the chat input area, make sure that **Current checkout** is selected. If it shows **New worktree**, select it and change it to **Current checkout**.

1. In the chat input area, select **Interactive** (mode) to switch to **Plan** mode. Since this feature involves multiple changes to the app, Plan mode helps you review and approve them before they are applied.

    !IMAGE[github-copilot-switch-to-plan-mode.png](instructions359717/github-copilot-switch-to-plan-mode.png)

## Task 3: Generate the comments feature

Use GitHub Copilot to generate the comments feature without applying the backend schema change yet.

1. Make sure that the development session from Exercise 4 isn't running. If a **Terminal** panel is still running `npx rayfin dev`, select it and press **Ctrl+C**. A running development session can apply schema changes to the backend as soon as Copilot edits them; stopping it lets you review backend changes before applying them.

1. In the new session, enter the following implementation request, then press **Enter**:

    ```text
    Implement a comments feature for work orders. Comments should provide a history of interventions so service pros and the manager can communicate about a work order. Each comment must include an id, userId, createdAt, workOrderId, and content. Keep the comments section collapsed by default. Let the attendee add comments from the assigned service-pro experience and reply from the manager experience using the same signed-in account. These are switchable demonstration views, not independently authorized roles. Preserve authenticated backend access; do not treat the view switch as authorization or add a second account requirement. Generate the code, but do not apply the backend schema change yet.

    Use ^2.0.0 for Rayfin package additions and @^2.0.0 in every npm create command, rather than latest or prerelease tags. Use the project's installed CLI and keep participating Rayfin packages version-matched.

    Preserve the existing RayfinClient.create composition with browserSession and dataService. Select every field the comments UI needs, convert wire dates at the service boundary, and do not treat partial mutation responses as complete records.
    ```

1. Once the plan is generated, review the proposed changes and the task list in the **Plan** canvas on the right panel, then select **Approve and implement this plan** to start the implementation.

    > [!Note]
    > When you approve the plan, GitHub Copilot automatically switches to **Autopilot** mode to implement the changes. In this mode, it doesn't ask you questions and carries out the tasks as specified until the work is complete.

1. As the implementation runs, confirm that GitHub Copilot is making changes consistent with the request, including:

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

Before applying backend changes, review the files generated by GitHub Copilot.

1. Select the **Changes** button above the chat input area to see the files that the agent modified.

    !IMAGE[github-copilot-changes-button.png](instructions359717/github-copilot-changes-button.png)

1. Review each changed file.

1. Confirm that the implementation includes a comment entity, schema registration, shared contract, data access updates, and user interface updates. Expected changes include:

    - A new file under **packages/data/src/**, such as **WorkOrderComment.ts**
    - An update to **packages/data/src/schema.ts**
    - An update to **packages/shared/src/index.ts**
    - New or updated files under **packages/frontend/src/components/**, **packages/frontend/src/pages/**, **packages/frontend/src/hooks/**, or **packages/frontend/src/services/**
    - A comments user interface that is collapsed by default

> [!Note]
> The implementation should rely on Rayfin decorators, schema generation, permission policies, and the typed client. You should not need to create a hand-written REST endpoint, migration script, or authorization middleware for this feature.

## Task 5: Apply the schema update and redeploy

After reviewing the implementation, ask Copilot to apply the schema and publish the app in one deployment:

1. In the same session, enter the following prompt, then press **Enter**:

    ```text
    Apply the reviewed changes to this app's existing Fabric deployment with npx rayfin up. This command applies pending schema changes and publishes the frontend, so do not run a separate database apply command. Do not drop or rename existing tables or columns, reset data, or force destructive changes. If a destructive change is reported, stop and show me the details. Confirm that deployment succeeds and report any errors.
    Set the RAYFIN_ENCRYPTION_FALLBACK_ENABLED environment variable to "true" for Rayfin commands.
    ```

1. Confirm that deployment completes successfully and creates the comments table, such as **WorkOrderComments**.

    !IMAGE[fabric-workordercomments-table.png](instructions345417/fabric-workordercomments-table.png)

## Task 6: Validate the comments workflow

Test the comments feature from both the local development app and the hosted app.

1. In the same session, enter the following prompt, then press **Enter**:

    ```text
    Open a terminal in the canvas view so I can watch its output. In that terminal, set the RAYFIN_ENCRYPTION_FALLBACK_ENABLED environment variable to "true", then start the Rayfin development session by running:
    npx rayfin dev --workspace "field-services-@lab.LabInstance.Id"
    Leave it running, and give me the local frontend URL when it's ready.
    ```

1. In Microsoft Edge, open the local app at the URL reported by the agent, such as `http://localhost:5173`.

1. Open a work order assigned to your Service Pro profile.

1. Expand the new **Comments** section.

1. Add a comment to the work order.

1. Select **Manager** in the app navigation bar.

1. Open the same work order and confirm that you can see the comment thread using the same signed-in account.

1. Add a reply from the manager view.

1. Select **Jobs** and confirm that the reply appears in the same thread.

1. Reload the page and expand the **Comments** section again to confirm that the comments persist.

1. Open the live hosting URL from Exercise 5 and repeat a quick smoke test to confirm that the deployed app also includes the comments feature.

1. *(Optional)* Add comments to several work orders for richer analysis in Exercise 8.

1. In the GitHub Copilot app, select the **Terminal** panel running the development session, then press **Ctrl+C** to stop it.

## Task 7: Refine the implementation if needed

If the feature does not work as expected, ask GitHub Copilot in the same session to make a targeted fix. Include the observed behavior, error message, or screenshot details in your follow-up prompt.

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

After GitHub Copilot applies a fix, review the proposed changes, then repeat the relevant validation steps from Task 5 and Task 6.

You have completed the feature implementation and validation workflow for the Field Services app.

Continue with **Next →** to add a semantic-model dashboard to the app.

===

# Exercise 8: Add a Semantic-Model Dashboard to the App

In Exercise 6, you seeded the database with a realistic production dataset, then added comments in Exercise 7. In this exercise, you will turn that operational data into insights and bring them back into the app.

The Microsoft Fabric SQL Database provisioned by Rayfin is a first-class citizen in your Fabric workspace. You will build a Power BI semantic model over it, then use Rayfin's **Semantic Model connector** and the GitHub Copilot app to add an operational dashboard to the existing Field Services app. The dashboard queries the semantic model through the connector rather than reading the operational tables directly.

By completing this exercise, you will:

- Build a semantic model over the service pro, work order, and comments tables.
- Register the semantic model as a Rayfin connector in the app.
- Use GitHub Copilot to add a dashboard that queries the semantic model.
- Deploy the app and verify the dashboard locally and in the hosted app.

## Task 1: Build a Semantic model

A semantic model gives a clean, well-described view of your data - including table relationships, friendly column names, and descriptions - that apps and tools can query consistently.

1. Navigate to the Microsoft Fabric portal and open the **field-services-@lab.LabInstance.Id** workspace you created in Exercise 1.

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
    > Adding descriptions is optional but highly recommended. Clear names and descriptions help GitHub Copilot and other tools understand your data and write accurate queries.

1. Confirm that the model can query the seeded data. Refresh it if its storage mode requires a refresh.

1. With the **FieldServices** semantic model open, look at the URL in the browser address bar. It should look like `https://app.fabric.microsoft.com/groups/<workspace-id>/datasets/<semantic-model-item-id>/...`, and contains the **workspace ID** and the **semantic model item ID** the connector needs. Keep this tab open; you'll copy the URL in the next task.

## Task 2: Connect the semantic model to the app

Ask GitHub Copilot to register the semantic model as a Rayfin connector in the existing **field-services-app** project, and to read the model's metadata before it writes any query.

1. In the GitHub Copilot app, open a new session in the **field-services-app** project, and make sure it uses **Current checkout**.

1. Enter the following prompt, but don't press **Enter** yet:

    ```text
    Add a Rayfin connector for my FieldServices semantic model to this app by running:
    npx rayfin connector add --type fabric-semanticmodel --workspace-id "<workspace-id>" --item-id "<semantic-model-item-id>" --name fieldservicesmodel --operations executeQuery
    Take the workspace ID and semantic model item ID from the URL below. Then run the version-matched package installation command printed by the CLI, and inspect the model with npx rayfin connector inspect --name fieldservicesmodel. If metadata inspection fails with a DAX query error, inspect each table with npx rayfin connector inspect --name fieldservicesmodel --entity "<table-name>" --rows 1.
    List the model's tables, columns, relationships, and measures. Set the RAYFIN_ENCRYPTION_FALLBACK_ENABLED environment variable to "true" for Rayfin commands. Don't change the app code yet.
    Semantic model URL: <replace with your semantic model URL>
    ```

1. Go back to the Microsoft Fabric tab with the semantic model open, copy the URL from the address bar, and paste it in place of the placeholder at the end of the prompt. Press **Enter** to continue.

1. Watch the agent work. It adds the **fieldservicesmodel** connector, installs the version-matched connector packages, and inspects the model.

    > [!Important]
    > Keep connector and SDK packages on the same release within **^2.0.0**. Do not substitute moving tags or prereleases.

1. Read the agent's summary. It should list the **ServicePros**, **WorkOrders**, and **WorkOrderComments** tables with their actual column names, including the columns you renamed in Task 1.

1. In the **Files** panel, open **rayfin/rayfin.yml** and review the new connector entry. Confirm that it points to your semantic model and uses delegated authentication: queries run as the signed-in user, who must have Build and Read permissions on the model.

1. Open **rayfin/connectors/fieldservicesmodel/schema.ts** and review it. This file is generated, so keep it unchanged.

> [!Note]
> The connector requires the Fabric Apps workload and the **Semantic Model Execute Queries REST API** tenant setting to be enabled. If queries fail with a tenant or permission error, ask your lab instructor for help. To learn more, see the [Rayfin Semantic Model connector documentation](https://rayfin.ai/docs/connectors/semantic-models).

## Task 3: Add the dashboard with GitHub Copilot

1. In the same session, select **Interactive** (mode) in the chat input area to switch to **Plan** mode.

1. Enter the following implementation request, then press **Enter**:

    ```text
    Add an operational dashboard to the existing Field Services app, reachable from the manager view. Use the registered fieldservicesmodel Semantic Model connector.

    Read the project instructions, Rayfin guidance, generated connector schema, and semantic model metadata before editing. Inspect the model before writing DAX; do not guess table, column, or measure names.

    Use ^2.0.0 for Rayfin package additions and @^2.0.0 in every npm create command, rather than latest or prerelease tags. Use the project's installed CLI and keep participating Rayfin packages version-matched.

    Show total work orders, work orders by status, and work orders by assigned service pro. Obtain every dashboard metric from the semantic model through the connector, not from direct database queries or mock data.

    Extend the existing RayfinClient.create composition with connectorsService from @microsoft/rayfin-connectors while preserving browserSession, dataService<FieldServiceSchema>(), the app's schema, authentication, data operations, and comments feature. Register services.connectors with connectorsService<GeneratedConnectorsSchema>({ configs: { fieldservicesmodel: connectorConfig }, runtime: { fieldservicesmodel: fabricSemanticModel() } }), using the actual generated schema type and connectorConfig exports. Import fabricSemanticModel from @microsoft/rayfin-connector-fabric-semanticmodel. Infer the client type from the factory; do not use the removed ConnectorsRayfinClient. Keep fieldservicesmodel as the connector key throughout, and keep source declarations under top-level connectors in rayfin.yml.

    Use executeQuery for DAX, check result.status, and map result.table.columns to the row-major result.table.rows. Set an explicit resultSetRowCountLimit and reject responses that exceed it rather than silently truncating them. Show loading, empty, and error states; show connector error details and requestId instead of substituting zero values or sample data.

    Reuse the app's components and styling. Keep the existing Fabric sign-in flow and do not add credentials, access tokens, or direct Execute Queries REST API calls. Generate the changes for review; do not deploy yet.
    ```

1. Once the plan is generated, review the proposed changes and the task list in the **Plan** canvas, then select **Approve and implement this plan**.

1. Wait for the agent to finish. This can take several minutes.

1. Select the **Changes** button above the chat input area and review the changed files. Confirm that:

    - The dashboard gets its data through the **fieldservicesmodel** connector.
    - The connector configuration, generated types, client options, and runtime registration all use the same **fieldservicesmodel** key.
    - The existing profile, work-order, and comments workflows remain intact.

## Task 4: Deploy and verify the dashboard

1. In the same session, enter the following prompt, then press **Enter**:

    ```text
    Deploy the connector configuration and the dashboard to this app's existing Fabric deployment with npx rayfin up. Set the RAYFIN_ENCRYPTION_FALLBACK_ENABLED environment variable to "true" for Rayfin commands. Confirm that deployment succeeds and report any errors.
    ```

1. Wait for the agent to report a successful deployment.

1. Enter the following prompt to start the local development session, then press **Enter**:

    ```text
    Open a terminal in the canvas view so I can watch its output. In that terminal, set the RAYFIN_ENCRYPTION_FALLBACK_ENABLED environment variable to "true", then start the Rayfin development session by running:
    npx rayfin dev --workspace "field-services-@lab.LabInstance.Id"
    Leave it running, and give me the local frontend URL when it's ready.
    ```

1. In Microsoft Edge, open the local app at the URL reported by the agent, select **Manager** in the app navigation bar, and open the new dashboard.

1. Confirm that the total work-order count, the breakdown by status, and the breakdown by Service Pro look consistent with the seeded data from Exercise 6, accounting for unassigned orders.

1. Open the live hosting URL from Exercise 5 and repeat the checks in the hosted app. A successful local query alone does not verify the deployed connector.

1. Confirm that any failed query is shown as an error rather than as an empty dashboard or zero counts.

1. Verify the row limit locally and in the hosted app with a query that exceeds it. Treat an over-limit response as an error even if the connector reports success.

    > [!Tip]
    > If a query fails, check the connector's workspace and item IDs, the signed-in user's permissions on the semantic model, and the actual DAX field names. Use the connector's error category, message, and request ID to investigate, or paste these details in the same session and ask GitHub Copilot for a targeted fix.

You have completed the loop from operational app data to a semantic model and back to an in-app dashboard.

Continue with **Next →** for the conclusion of the lab and next steps.

===

# You're done 🎉

In one lab session you just:

1. Bootstrapped a full-stack Fabric App from a template.
2. Ran it locally with **rayfin CLI**.
3. Deployed it to Microsoft Fabric with one command.
4. Added a real schema-backed feature using the GitHub Copilot app and the rayfin agent skill.
5. Pushed the change back to production with the same one-command deploy.
6. Seeded production data, built a Fabric semantic model over it, and used the Rayfin Semantic Model connector to bring insights back into the app with a dashboard.

No infrastructure scripts. No migration files written by hand. No bespoke auth plumbing. **From zero to a deployed, data-driven enterprise app - using a managed backend, decorators, and coding agents.**

I hope you enjoyed the lab and are excited about the possibilities of building with Microsoft Fabric and Rayfin SDK. The tools and patterns you saw here are designed to help you build faster, smarter, and more maintainable applications on top of Microsoft Fabric's powerful data and AI capabilities.

To keep exploring, check out:

- [Rayfin documentation](https://aka.ms/rayfin)
- [Microsoft Fabric documentation](https://learn.microsoft.com/fabric/)
- [GitHub Copilot app documentation](https://docs.github.com/copilot/concepts/copilot-surfaces/github-copilot-app)
