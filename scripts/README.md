# Lab VM update scripts

The Skillable VM can't clone this private repository, so `publish-lab-vm-update.mjs` packages the lab files into a self-contained PowerShell script. It uploads the script as a secret gist and prints one command to paste in PowerShell on the VM.

## What the VM update does

Files are installed under `C:\LabFiles`.

| Step | Source | Result on the VM |
| --- | --- | --- |
| App template | `template/field-services-app` | Replaces `C:\LabFiles\template\field-services-app`. Files not in the repo are deleted. |
| npm (latest) | npm registry | Updates the global npm to the latest version. Node.js isn't changed, so the update fails if the installed Node.js is too old for the latest npm. |
| Rayfin CLI cache | Template `package-lock.json` | Runs `npx -y @microsoft/rayfin-cli@<version> --version` with the CLI version pinned in the template's lockfile, so bootstrap reuses the npm cache. |
| Version stamp | Build info | Writes `C:\LabFiles\lab-files.json` with the commit the files came from. |

Updating npm writes to the Node.js folder, usually `C:\Program Files\nodejs`. If the npm step reports a permission error, open PowerShell as administrator and run the command again.

To change which files go to the VM, edit `GROUPS` in `publish-lab-vm-update.mjs`. To change the npm or Rayfin steps, edit the `Lab-specific steps` region in `lab-vm-update.template.ps1`.

## Publish an update

You need Node.js 22 or later, Git, the GitHub CLI signed in (`gh auth status`), and PowerShell 7 (`pwsh`) to test locally.

1. Build the script and run it locally the way the VM does, in a temporary lab folder:

    ```shell
    node scripts/publish-lab-vm-update.mjs --no-upload
    pwsh -NoProfile -Command '$env:LAB_FILES_DIR = Join-Path ([IO.Path]::GetTempPath()) "labfiles-test"; Get-Content -Raw scripts/dist/lab-vm-update.ps1 | Invoke-Expression'
    ```

    Every row of the results table must show `OK`. The test run only reports which npm version it would install, so your own npm is left unchanged. Check the files in the target folder, then delete the `labfiles-test` folder.

2. Publish:

    ```shell
    node scripts/publish-lab-vm-update.mjs
    ```

    The publisher uploads the script as a secret gist, deletes the gists from earlier runs, and prints the command to run on the VM:

    ```powershell
    [Net.ServicePointManager]::SecurityProtocol='Tls12'; irm <gist-raw-url> | iex
    ```

3. Paste the command in a PowerShell window on the VM. Every row must show `OK`.

A secret gist is unlisted, not private: anyone with the URL can download it, so never package secrets. Once the VM image is final, delete the last gist with `gh gist delete <id> --yes`.
