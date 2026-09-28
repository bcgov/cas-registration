# 🤖 AI Business Requirements Vetting

Evaluates a GitHub issue against the existing codebase before development begins.

The workflow identifies:

- Existing vs requested behaviour
- Assumptions and requirement gaps
- Edge cases and dependencies
- INVEST concerns
- Clarifying questions
- Technical impact
- Suggested acceptance criteria

## Usage

Create a GitHub issue containing a business requirement, meeting transcript, or both.

When deployed, add the label:

`AI Business Requirements Vetting`

The workflow inspects the issue and codebase and posts the analysis as an issue comment.

## Development Workflow

The workflow does **not** need to be merged into `main` before testing.

Use:

```
Modify
  ↓
Validate
  ↓
Dry Run
  ↓
Trial
  ↓
Inspect / Refine
  ↓
Compile
  ↓
PR / Merge
```

Validate changes:

```
gh aw validate ai-business-requirements-vetting
```

Compile the final workflow before committing:

```
gh aw compile ai-business-requirements-vetting
```

Do not manually edit:

`.github/workflows/ai-business-requirements-vetting.lock.yml`

It is generated from compiling:

`.github/workflows/ai-business-requirements-vetting.md`

## Testing

Use `gh aw trial` to test the local, unmerged workflow.

### 1. Create a Test Issue

Create an issue containing a business requirement, meeting transcript, or both.

Example:

`https://github.com/bcgov/cas-registration/issues/5269`

No special label is required when using `gh aw trial`.

### 2. Dry Run

Preview the trial without executing the workflow:

```
gh aw trial ./.github/workflows/ai-business-requirements-vetting.md \
  --logical-repo bcgov/cas-registration \
  --trigger-context https://github.com/bcgov/cas-registration/issues/5269 \
  --dry-run
```

## Production Trigger

After the workflow is merged, normal execution uses the GitHub issue label:

`AI Business Requirements Vetting`

```
GitHub Issue / Meeting Transcript
              ↓
AI Business Requirements label
              ↓
Agentic Workflow
              ↓
Inspect requirement + codebase
              ↓
Identify gaps / assumptions / edge cases
              ↓
INVEST review
              ↓
Issue comment
```

## Security

The workflow is restricted to:

- Read-only repository access
- Read-only issue and pull-request access
- A single approved issue-comment output
- Treating issue and transcript content as untrusted input
