# 🤖 AI User Story Generator

Transforms raw, unstructured business requirements into structured user stories, acceptance criteria, and technical execution guides directly inside a GitHub issue.

The workflow generates:

- Parsed business requirements and scoping rationale
- INVEST-compliant user stories
- Given/When/Then acceptance criteria
- Technical execution guides (architecture, data, security, testing)
- Assumptions and open questions

## Usage

Create a GitHub issue containing a raw business need, feature idea, or requirement notes.

When deployed, add the label:

`AI User Story`

The workflow inspects the issue and codebase, structures the requirements, and updates the issue body with the refined specification.

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
gh aw validate ai-user-story-generator

```

Compile the final workflow before committing:

```
gh aw compile ai-user-story-generator

```

Do not manually edit:

`.github/workflows/ai-user-story-generator.lock.yml`

It is generated from compiling:

`.github/workflows/ai-user-story-generator.md`

## Testing

Use `gh aw trial` to test the local, unmerged workflow.

### 1. Create a Test Issue

Create an issue containing raw requirement notes or feature descriptions.

Example:

`[https://github.com/bcgov/cas-registration/issues/5270](https://github.com/bcgov/cas-registration/issues/5270)`

No special label is required when using `gh aw trial`.

### 2. Dry Run

Preview the trial without executing the workflow:

```
gh aw trial ./.github/workflows/ai-user-story-generator.md \
  --logical-repo bcgov/cas-registration \
  --trigger-context https://github.com/bcgov/cas-registration/issues/5270 \
  --dry-run

```

## Production Trigger

After the workflow is merged, normal execution uses the GitHub issue label:

`AI User Story`

```
Raw Business Requirement / Notes
              ↓
      AI User Story label
              ↓
       Agentic Workflow
              ↓
Inspect requirement + codebase
              ↓
Deconstruct into INVEST user stories
              ↓
Draft technical execution guide
              ↓
Update issue body with structured specification

```

## Security

The workflow is restricted to:

- Read-only repository access
- Read-only pull-request access
- Write access limited strictly to updating the triggering issue's body
- Treating issue and requirement content as untrusted input
