# Exercise 1: Set up your environment

Before building and deploying the work-order app, sign in to GitHub Copilot and Microsoft Fabric and verify your tools and assigned workspace.

## Guided lab environment

The guided session uses:

- A preconfigured Windows virtual machine delivered through Skillable.
- A lab-provided GitHub account with GitHub Copilot access.
- A lab-provided Microsoft account.
- A pre-provisioned Fabric workspace assigned to you for the lab.

Open the Skillable lab and use its connection instructions to sign in to the Windows VM. Use the account and workspace details supplied with your lab environment. You do not need to create a workspace, start a Fabric trial, or use a personal subscription for the guided session. If the assigned workspace is missing or unavailable, contact the instructor before continuing.

Do not add passwords, access tokens, or other secrets to the repository or paste them into Copilot prompts.

## Set up your own environment

For self-paced learning, prepare:

| Requirement | Purpose |
| --- | --- |
| Node.js 24 and npm | Run the app tooling and Rayfin CLI. |
| Git | Clone the lab and commit the generated app before making changes. |
| Visual Studio Code | Edit the app and review Copilot's changes. |
| GitHub Copilot CLI and an account with access | Complete the agent-assisted exercises. |
| A Microsoft account with access to Fabric | Deploy the app and create its semantic model. |
| A Fabric workspace on supported Fabric capacity | Host the app, SQL Database, and semantic model. |

Use the official installation instructions for [Node.js](https://nodejs.org/en/download), [Git](https://git-scm.com/downloads), [Visual Studio Code](https://code.visualstudio.com/download), and [GitHub Copilot CLI](https://docs.github.com/copilot/how-tos/use-copilot-agents/use-copilot-in-the-cli).

You need Contributor, Member, or Admin permissions in the workspace. Arrange capacity and tenant settings with your Fabric administrator before starting. Creating or using cloud resources may incur costs; do not assume that a trial or your personal account provides all required capabilities.

The Fabric Apps workload and the Semantic Model Execute Queries REST API tenant setting must be enabled. The account using the dashboard needs Build and Read permissions on the semantic model hosted on Fabric or Power BI capacity. See the [semantic model connector prerequisites](https://learn.microsoft.com/en-us/fabric/apps/data-apps-template#prerequisites).

Clone this repository and open it in Visual Studio Code. Exercise 2 creates a separate app project; the included `src/field-services-app/` is a completed reference with comments already implemented, not the pre-comments starter.

## Sign in to GitHub and Copilot CLI

1. Open a browser in your development environment. For the guided session, sign in with the lab-provided GitHub account using the sign-in instructions supplied with the lab. For self-paced learning, use your own account with Copilot access.
2. Open a terminal and run `copilot`.
3. If prompted to sign in, run `/login` and complete the browser flow.
4. Confirm the CLI reports that you are signed in with the intended account and can submit a prompt. If access is denied, resolve the account's Copilot entitlement before continuing.
5. Exit with `/exit`.

## Sign in to Microsoft Fabric

1. Open [Microsoft Fabric](https://app.fabric.microsoft.com). For the guided session, sign in with the lab-provided Microsoft account. For self-paced learning, use the account authorized for your Fabric workspace.
2. Open **Workspaces** and select your assigned workspace. Self-paced attendees can use a dedicated workspace prepared with their administrator.
3. Confirm that the workspace is the one assigned for this lab and that you have the required role. Do not select another attendee's workspace.
4. Copy its URL. It should resemble `https://app.fabric.microsoft.com/groups/<workspace-id>`. Keep the workspace ID and URL available for Exercise 2.

The GitHub account authorizes Copilot; the Microsoft account authorizes Fabric. Signing in to one does not sign you in to the other. When Rayfin later requests Microsoft sign-in, use the same Microsoft account and tenant as this workspace.

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
- Fabric opens your assigned workspace using the intended Microsoft account.
- You have the workspace URL and access to the lab starter template.

If a prerequisite fails, resolve it before creating or deploying the app.

Continue to [Bootstrap the app from a template](02-bootstrap.md).

## Organizer preparation

Prepare and rehearse the following before attendees start:

| Area | Required preparation |
| --- | --- |
| VM image | Install Node.js 24, npm, Git, Visual Studio Code, and Copilot CLI; make command-line tools available in a fresh terminal. |
| GitHub access | Assign lab accounts with working Copilot access and supply the correct sign-in flow. Verify CLI authorization is permitted. |
| Microsoft access | Assign lab Microsoft accounts and supply the tenant-specific sign-in flow, including any required MFA steps. |
| Fabric workspaces | Pre-provision the assigned workspaces, attach supported capacity, and grant the lab accounts the required workspace role. |
| Tenant configuration | Enable Fabric Apps and Semantic Model Execute Queries for the lab accounts. Confirm that the intended semantic-model workflow and Build/Read permissions work. |
| Starter files | Make the pre-comments Field Services starter available and document its exact path in Exercise 2. The imported completed reference is not a substitute for this starter. |
| Connectivity | Allow the VM to reach GitHub/Copilot, npm, Microsoft sign-in, Fabric, and the generated Rayfin app endpoints. Verify with the actual lab network policy. |
| Git identity | Configure a suitable commit identity for each lab account so the initial commit succeeds without attendee troubleshooting. |
| Rehearsal | Use a representative attendee account to bootstrap, deploy, sign in, create data, and query the semantic model through the deployed connector. Administrator access alone is not a sufficient check. |
| Resource lifecycle | Define workspace assignment, isolation, reset, and cleanup ownership. Attendees must not be asked to delete shared resources. |

The guided VM delivery platform is Skillable. Before publication, confirm the account/credential delivery location, exact sign-in instructions, workspace assignment mechanism, starter path, and cleanup policy. Those delivery details are not yet specified in this repository.
