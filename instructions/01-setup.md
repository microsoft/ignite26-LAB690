# Exercise 1: Set up your environment

Before building and deploying the work-order app, sign in to Microsoft Fabric, then GitHub Copilot, and verify your tools.

## Guided lab environment

The guided session uses:

- A preconfigured Windows virtual machine delivered through Skillable.
- A lab-provided GitHub account with GitHub Copilot access.
- A lab-provided Microsoft account.
- Permission to create Fabric workspaces on the lab's Fabric capacity.

Open the Skillable lab and use its connection instructions to sign in to the Windows VM. Use the account details supplied with your lab environment. Create your own Fabric workspace below using the lab's capacity; do not start a Fabric trial or use a personal subscription for the guided session. If workspace creation or capacity selection fails, contact the instructor before continuing.

Do not add passwords, access tokens, or other secrets to the repository or paste them into Copilot prompts.

## Set up your own environment

For self-paced learning, prepare:

| Requirement | Purpose |
| --- | --- |
| Node.js 24 and npm | Run the app tooling and Rayfin CLI. |
| Current stable PowerShell 7 on Windows | Run the lab commands in `pwsh`, rather than the older Windows PowerShell. |
| Git | Clone the lab and commit the generated app before making changes. |
| GitHub Copilot app and an account with Copilot access | Complete the agent-assisted exercises. The app runs the lab commands, browses the code, and reviews Copilot's changes. |
| Visual Studio Code (optional) | Read the code outside the GitHub Copilot app. |
| A Microsoft account with access to Fabric | Deploy the app and create its semantic model. |
| Permission to create Fabric workspaces on supported Fabric capacity | Create the workspace that hosts the app, SQL Database, and semantic model. |

Use the official installation instructions for [Node.js](https://nodejs.org/en/download), [Git](https://git-scm.com/downloads), the [GitHub Copilot app](https://docs.github.com/copilot/get-started/quickstart-copilot-app), and optionally [Visual Studio Code](https://code.visualstudio.com/download).

On Windows, install or update [PowerShell 7](https://learn.microsoft.com/powershell/scripting/install/installing-powershell-on-windows) and open a fresh PowerShell 7 terminal. Update npm to the current release supported by Node.js 24 using the [npm update instructions](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm). In the guided environment, these updates should already be included in the VM image; contact the instructor if they are missing.

You need permission to create a Fabric workspace and assign it to a supported Fabric capacity in this exercise. Arrange capacity and tenant settings with your Fabric administrator before starting. Creating or using cloud resources may incur costs; do not assume that a trial or your personal account provides all required capabilities.

The Fabric Apps workload and the Semantic Model Execute Queries REST API tenant setting must be enabled. The account using the dashboard needs Build and Read permissions on the semantic model hosted on Fabric or Power BI capacity. See the [semantic model connector prerequisites](https://learn.microsoft.com/en-us/fabric/apps/data-apps-template#prerequisites).

Clone this repository and note the full path of its `template/field-services-app/` folder: Exercise 2 creates a separate app project from this pre-comments starter. The included `src/field-services-app/` is a completed reference with comments already implemented.

## Sign in to Microsoft Fabric

1. Open a browser in your development environment and go to [Microsoft Fabric](https://app.fabric.microsoft.com). For the guided session, sign in with the lab-provided Microsoft account. For self-paced learning, use the account authorized for your Fabric capacity.
2. Confirm that the Microsoft Fabric home page opens. If the page title and icon in the bottom-left corner say **Power BI**, select that icon and switch to **Fabric**.
3. Keep this browser session open.

## Create your Fabric workspace

1. In the Fabric portal, select **Workspaces**, then **+ New workspace**.
2. Enter a unique workspace name, such as `field-services-app-<unique-suffix>`, replacing `<unique-suffix>` with a value unique to you.
3. In the workspace's advanced settings, select the supported Fabric capacity supplied for the lab, then select **Apply**. For self-paced learning, use the capacity arranged with your administrator.
4. Confirm that the new workspace opens and record its exact display name. Replace `<workspace-name>` in later commands with this value, keeping the quotation marks. Use the display name, not the workspace URL or GUID.

## Sign in to GitHub and the GitHub Copilot app

1. Open a new browser tab. For the guided session, sign in with the lab-provided GitHub account using the sign-in instructions supplied with the lab. For self-paced learning, use your own account with Copilot access.
2. Open the GitHub Copilot app and select **Sign in to GitHub**. The app copies a device code to your clipboard and opens a browser window.
3. In the browser, authorize the app if prompted, paste the device code, and complete the sign-in with the intended GitHub account.
4. Return to the GitHub Copilot app. When asked to start with a local folder or a repository, select **Continue**.
5. Confirm that the app is signed in with the intended account and that you can start a conversation. If access is denied, resolve the account's Copilot entitlement before continuing.

The GitHub account authorizes Copilot; the Microsoft account authorizes Fabric. Signing in to one does not sign you in to the other. When Rayfin later requests Microsoft sign-in, use the same Microsoft account and tenant you used for Fabric.

## Verify your tools

1. In the GitHub Copilot app, start a new chat and enter the following prompt:

    ```text
    Check that Node.js, npm, and Git are installed on this machine and report their versions. On Windows, also check PowerShell 7. Report the Git user.name and user.email settings too. Don't install or change anything.
    ```

2. Confirm that Node.js reports version 24 and the other tools report installed versions. On Windows, confirm that PowerShell 7 reports the current stable release.
3. Confirm that Git has a commit identity. In the guided VM, it should be configured for the lab account. For a self-paced app project, set missing identity values in that project's Git repository before its first commit. Do not configure another person's identity.

This lab uses Rayfin `^2.0.0`. The create command in Exercise 2 downloads it; no global Rayfin installation or Docker installation is required for the Fabric-backed path. npm must be able to reach the public npm registry.

## Ready to continue

Before Exercise 2, confirm:

- Your tools are available and Git has a commit identity.
- The GitHub Copilot app accepts a prompt using the intended GitHub account.
- Fabric opens using the intended Microsoft account.
- Your Fabric workspace is created on supported capacity and you have recorded its display name.
- You have access to the lab starter template.

If a prerequisite fails, resolve it before creating or deploying the app.

Continue to [Bootstrap the app from a template](02-bootstrap.md).

## Organizer preparation

Prepare and rehearse the following before attendees start:

| Area | Required preparation |
| --- | --- |
| VM image | Install Node.js 24, the current npm release supported by Node.js 24, current stable PowerShell 7, Git, Visual Studio Code, and the GitHub Copilot app. Update the image rather than relying on attendee upgrades; verify `node --version`, `npm --version`, and `pwsh --version` in a fresh PowerShell 7 terminal. |
| GitHub access | Assign lab accounts with working Copilot access and supply the correct sign-in flow. Verify that the GitHub Copilot app policy is enabled and that the app's device sign-in is permitted. |
| Microsoft access | Assign lab Microsoft accounts and supply the tenant-specific sign-in flow, including any required MFA steps. |
| Fabric workspaces | Allow the lab accounts to create their own workspaces in Exercise 1 and assign them to the lab's supported Fabric capacity. Each attendee records the workspace display name for the create and dev commands. |
| Tenant configuration | Enable Fabric Apps and Semantic Model Execute Queries for the lab accounts. Confirm that the intended semantic-model workflow and Build/Read permissions work. |
| Starter files | Install the pre-comments starter from `template/field-services-app/` to `C:\LabFiles\template\field-services-app` with the [VM update script](../scripts/README.md). Refresh all of its Rayfin packages together within `^2.0.0` using the [reference app's update instructions](../src/field-services-app/README.md#update-rayfin-packages), include the updated lockfile, and verify that `npx rayfin --version` reports the locked 2.x CLI version. The imported completed reference is not a substitute for this starter. |
| Skillable instructions | Use LAB690 for the current lab identity. Preserve original-source attribution links, but remove stale lab identifiers from attendee instructions and platform configuration. |
| Knowledge checks | Rehearse every knowledge check in Skillable with an attendee account and confirm that the intended correct answers validate. The platform questions, answer keys, and validation rules are not stored in this repository and must be corrected in Skillable. |
| Connectivity | Allow the VM to reach GitHub/Copilot, npm, Microsoft sign-in, Fabric, and the generated Rayfin app endpoints. Verify with the actual lab network policy. |
| Git identity | Configure a suitable commit identity for each lab account so the initial commit succeeds without attendee troubleshooting. |
| Rehearsal | Use a representative attendee account to bootstrap, deploy, sign in, create data, and query the semantic model through the deployed connector. Administrator access alone is not a sufficient check. |
| Resource lifecycle | Define cleanup ownership for the workspaces attendees create in Exercise 1, along with isolation and reset. Attendees must not be asked to delete shared resources. |

The guided VM delivery platform is Skillable. Before publication, confirm the account/credential delivery location, exact sign-in instructions, workspace creation and capacity selection, starter path, and cleanup policy. Those delivery details are not yet specified in this repository.
