# Exercise 1: Set up your environment

Before building and deploying the work-order app, sign in to GitHub Copilot and Microsoft Fabric and verify your tools.

## Guided lab environment

The guided session uses:

- A preconfigured Windows virtual machine delivered through Skillable.
- A lab-provided GitHub account with GitHub Copilot access.
- A lab-provided Microsoft account.
- Permission to create Fabric workspaces on the lab's Fabric capacity.

Open the Skillable lab and use its connection instructions to sign in to the Windows VM. Use the account details supplied with your lab environment. You do not need to create a workspace manually, start a Fabric trial, or use a personal subscription for the guided session: `rayfin up` creates a new workspace for the app in Exercise 4. If workspace creation or capacity selection fails, contact the instructor before continuing.

Do not add passwords, access tokens, or other secrets to the repository or paste them into Copilot prompts.

## Set up your own environment

For self-paced learning, prepare:

| Requirement | Purpose |
| --- | --- |
| Node.js 24 and npm | Run the app tooling and Rayfin CLI. |
| Current stable PowerShell 7 on Windows | Run the lab commands in `pwsh`, rather than the older Windows PowerShell. |
| Git | Clone the lab and commit the generated app before making changes. |
| Visual Studio Code | Edit the app and review Copilot's changes. |
| GitHub Copilot CLI and an account with access | Complete the agent-assisted exercises. |
| A Microsoft account with access to Fabric | Deploy the app and create its semantic model. |
| Permission to create Fabric workspaces on supported Fabric capacity | Let `rayfin up` create the workspace that hosts the app, SQL Database, and semantic model. |

Use the official installation instructions for [Node.js](https://nodejs.org/en/download), [Git](https://git-scm.com/downloads), [Visual Studio Code](https://code.visualstudio.com/download), and [GitHub Copilot CLI](https://docs.github.com/copilot/how-tos/use-copilot-agents/use-copilot-in-the-cli).

On Windows, install or update [PowerShell 7](https://learn.microsoft.com/powershell/scripting/install/installing-powershell-on-windows) and open a fresh PowerShell 7 terminal. Update npm to the current release supported by Node.js 24 using the [npm update instructions](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm). In the guided environment, these updates should already be included in the VM image; contact the instructor if they are missing.

You need permission to create Fabric workspaces and assign them to a supported Fabric capacity; `rayfin up` creates the app's workspace in Exercise 4. Arrange capacity and tenant settings with your Fabric administrator before starting. Creating or using cloud resources may incur costs; do not assume that a trial or your personal account provides all required capabilities.

The Fabric Apps workload and the Semantic Model Execute Queries REST API tenant setting must be enabled. The account using the dashboard needs Build and Read permissions on the semantic model hosted on Fabric or Power BI capacity. See the [semantic model connector prerequisites](https://learn.microsoft.com/en-us/fabric/apps/data-apps-template#prerequisites).

Clone this repository and open it in Visual Studio Code. Exercise 2 creates a separate app project; the included `src/field-services-app/` is a completed reference with comments already implemented. The pre-comments starter used in Exercise 2 is `template/field-services-app/`.

## Sign in to GitHub and Copilot CLI

1. Open a browser in your development environment. For the guided session, sign in with the lab-provided GitHub account using the sign-in instructions supplied with the lab. For self-paced learning, use your own account with Copilot access.
2. Open a terminal and run `copilot`.
3. If prompted to sign in, run `/login` and complete the browser flow.
4. Confirm the CLI reports that you are signed in with the intended account and can submit a prompt. If access is denied, resolve the account's Copilot entitlement before continuing.
5. Exit with `/exit`.

## Sign in to Microsoft Fabric

1. Open [Microsoft Fabric](https://app.fabric.microsoft.com). For the guided session, sign in with the lab-provided Microsoft account. For self-paced learning, use the account authorized for your Fabric capacity.
2. Confirm that the Microsoft Fabric home page opens. If the page title and icon in the bottom-left corner say **Power BI**, select that icon and switch to **Fabric**.
3. Keep this browser session open. You don't need to create a workspace: `rayfin up` creates one for the app in Exercise 4.

The GitHub account authorizes Copilot; the Microsoft account authorizes Fabric. Signing in to one does not sign you in to the other. When Rayfin later requests Microsoft sign-in, use the same Microsoft account and tenant you used for Fabric.

## Verify your tools

In a terminal, run:

```shell
node --version
npm --version
git --version
code --version
copilot --version
```

Confirm that Node.js reports version 24 and the other commands report installed versions. If `code` is not available in the terminal, open Visual Studio Code from the Start menu and use **File > Open Folder**.

On Windows, also run `pwsh --version` and confirm that it reports the current stable PowerShell 7 release. Use that shell for the remaining exercises.

Verify Git has a commit identity:

```shell
git config user.name
git config user.email
```

In the guided VM, these should be configured for the lab account. For a self-paced app project, set missing identity values in that project's Git repository before its first commit. Do not configure another person's identity.

This lab uses the Rayfin `experimental` release channel. The create command in Exercise 2 downloads it; no global Rayfin installation or Docker installation is required for the Fabric-backed path. npm must be able to reach the public npm registry.

## Ready to continue

Before Exercise 2, confirm:

- Your tools are available and Git has a commit identity.
- Copilot CLI accepts a prompt using the intended GitHub account.
- Fabric opens using the intended Microsoft account.
- You have access to the lab starter template.

If a prerequisite fails, resolve it before creating or deploying the app.

Continue to [Bootstrap the app from a template](02-bootstrap.md).

## Organizer preparation

Prepare and rehearse the following before attendees start:

| Area | Required preparation |
| --- | --- |
| VM image | Install Node.js 24, the current npm release supported by Node.js 24, current stable PowerShell 7, Git, Visual Studio Code, and Copilot CLI. Update the image rather than relying on attendee upgrades; verify `node --version`, `npm --version`, and `pwsh --version` in a fresh PowerShell 7 terminal. |
| GitHub access | Assign lab accounts with working Copilot access and supply the correct sign-in flow. Verify CLI authorization is permitted. |
| Microsoft access | Assign lab Microsoft accounts and supply the tenant-specific sign-in flow, including any required MFA steps. |
| Fabric workspaces | Allow the lab accounts to create workspaces and assign them to the lab's supported Fabric capacity. `rayfin up` creates each attendee's workspace (named like `field-services-app-123456`) when they select **Use new workspace**. |
| Tenant configuration | Enable Fabric Apps and Semantic Model Execute Queries for the lab accounts. Confirm that the intended semantic-model workflow and Build/Read permissions work. |
| Starter files | Install the pre-comments starter from `template/field-services-app/` to `C:\LabFiles\template\field-services-app` with the [VM update script](../scripts/README.md). Refresh all of its Rayfin packages together on the experimental channel using the [reference app's update instructions](../src/field-services-app/README.md#update-rayfin-packages), include the updated lockfile, and verify the installed CLI meets the static-hosting minimum of `1.35.1`. The imported completed reference is not a substitute for this starter. |
| Skillable instructions | Use LAB690 for the current lab identity. Preserve original-source attribution links, but remove stale lab identifiers from attendee instructions and platform configuration. |
| Knowledge checks | Rehearse every knowledge check in Skillable with an attendee account and confirm that the intended correct answers validate. The platform questions, answer keys, and validation rules are not stored in this repository and must be corrected in Skillable. |
| Connectivity | Allow the VM to reach GitHub/Copilot, npm, Microsoft sign-in, Fabric, and the generated Rayfin app endpoints. Verify with the actual lab network policy. |
| Git identity | Configure a suitable commit identity for each lab account so the initial commit succeeds without attendee troubleshooting. |
| Rehearsal | Use a representative attendee account to bootstrap, deploy, sign in, create data, and query the semantic model through the deployed connector. Administrator access alone is not a sufficient check. |
| Resource lifecycle | Define cleanup ownership for the workspaces created by `rayfin up`, along with isolation and reset. Attendees must not be asked to delete shared resources. |

The guided VM delivery platform is Skillable. Before publication, confirm the account/credential delivery location, exact sign-in instructions, workspace creation and capacity selection, starter path, and cleanup policy. Those delivery details are not yet specified in this repository.
