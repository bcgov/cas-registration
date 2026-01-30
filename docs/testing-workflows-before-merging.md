# Testing GitHub Actions Workflows Before Merging

When modifying reusable or scheduled workflows (e.g., `nightly.yaml`, `schemaspy.yaml`), you often can't test changes directly because:

- **Scheduled workflows** (`on: schedule`) always run from the default branch.
- **`workflow_dispatch`** only works for workflows that already exist on the default branch.
- **Reusable workflows** (`on: workflow_call`) can't be triggered directly.

## Recommended Approach: Temporary Push-Triggered Workflow

Create a temporary workflow file on your feature branch that triggers on `push` and calls the reusable workflow you're testing.

### 1. Create the temporary workflow

Add a file like `.github/workflows/test-my-fix.yaml`:

```yaml
# Temporary workflow - delete before merging.
name: Test My Fix

on:
  push:
    branches:
      - my-feature-branch

jobs:
  test-job:
    uses: ./.github/workflows/the-reusable-workflow.yaml
    secrets: inherit
```

### 2. Commit and push

Push the temporary workflow along with your fixes. The workflow runs automatically on push, using the reusable workflow files **from your branch** (not from `develop`).

### 3. Check results

**Using the GitHub UI:**

1. Go to the repository on GitHub.
2. Click the **Actions** tab.
3. Find your workflow name (e.g., "Test My Fix") in the left sidebar.
4. Click into the run to see step-by-step logs and status.
5. If a run was canceled by a concurrent push, click **Re-run all jobs** to retry.

**Using the GitHub CLI (optional):**

```bash
gh run list --workflow=test-my-fix.yaml
gh run watch
```

### 4. Clean up

Delete the temporary workflow file before merging your PR.

## Limitations

- **`github.event_name`** will be `push`, not `schedule`. Conditionals that check for `schedule` (e.g., disabling Happo) won't activate. For those, verify the logic by reading the code; the conditional behavior itself is deterministic.
- **Concurrency settings** in the reusable workflow may cancel runs if you push multiple times quickly. Wait for a run to finish or re-run from the Actions tab.
- **Timeouts** from the reusable workflow still apply. If a full checkout replaces a sparse checkout, you may need to increase the timeout.
