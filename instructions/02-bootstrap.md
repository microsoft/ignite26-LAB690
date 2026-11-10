# Exercise 2: Bootstrap the app from a template

In this exercise, create a Rayfin project from the Field Services template and make an initial Git commit.

## Task 1: Create the Rayfin project

1. Open a terminal in the directory where you want the project.
2. Run the Rayfin create command with the Field Services template and your Fabric workspace URL. Replace `<template-path>` with the template path supplied for the lab and `<workspace-uri>` with the URL you copied in Exercise 1:

    ```shell
    npm create -y @microsoft/rayfin@experimental -- --project-name field-services-app --template "<template-path>" --workspace-uri "<workspace-uri>"
    ```

3. Wait for the CLI to create the project and install its dependencies.
4. If the template includes a `data/` directory with its app specification or seed data, review it to understand how the starter app was generated.

This lab uses Rayfin's `experimental` release channel. Use `@experimental` for project creation and Rayfin package additions; keep SDK and connector dependencies matched to the experimental CLI's generated installation guidance. In the generated project, use `npx rayfin` to run the installed CLI, not `npx @microsoft/rayfin@experimental`.

## Task 2: Open the project and make the initial commit

1. Open the project in Visual Studio Code:

    ```shell
    code field-services-app
    ```

2. Review the generated files and accept the workspace trust prompt if it appears.
3. In the project terminal, initialize Git, stage the project, and commit the starter files:

    ```shell
    git init
    git add .
    git commit -m "Initial commit - bootstrap from template"
    ```

Continue to [Explore the app template](03-explore-template.md).
