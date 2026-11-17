# Exercise 2: Bootstrap the app from a template

In this exercise, create a Rayfin project from the Field Services template and make an initial Git commit.

## Task 1: Create the Rayfin project

1. Open a terminal in the directory where you want the project.
2. Run the Rayfin create command with the Field Services template. Replace `<template-path>` with the template path supplied for the lab (`C:/LabFiles/template/field-services-app` in the guided VM, or `template/field-services-app` in this repository for self-paced learning). Replace `<workspace-name>` with the exact Fabric workspace display name you recorded in Exercise 1:

    ```shell
    npm create -y @microsoft/rayfin@^2.0.0 -- --project-name field-services-app --template "<template-path>" --workspace "<workspace-name>"
    ```

3. Wait for the CLI to create the project, record the workspace name, and install its dependencies. This command does not provision the Fabric backend; you will do that with `npx rayfin dev` in Exercise 4.
4. If the template includes a `data/` directory with its app specification or seed data, review it to understand how the starter app was generated.

This lab uses Rayfin `^2.0.0`. Use `@^2.0.0` in every `npm create` command and `^2.0.0` for Rayfin package additions; keep SDK and connector dependencies matched to the installed CLI's generated installation guidance. In the generated project, use `npx rayfin` to run the installed CLI rather than downloading another CLI version.

## Task 2: Open the project and make the initial commit

1. Open the project in Visual Studio Code:

    ```shell
    code field-services-app
    ```

2. If Visual Studio Code prompts you to sign in, select **GitHub** and use your lab GitHub account. If the browser asks permission to return to Visual Studio Code, allow it.
3. If prompted to trust the project, select **Yes, I trust the authors**. If a **Restricted Mode** banner appears instead, select **Manage**, then trust this project folder to enable editing and running the app.
4. Review the generated files.
5. In the project terminal, initialize Git, stage the project, and commit the starter files:

    ```shell
    git init
    git add .
    git commit -m "Initial commit - bootstrap from template"
    ```

Continue to Exercise 3 to explore the app template.
