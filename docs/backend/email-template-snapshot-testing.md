# Email Template Snapshot Testing

## Why snapshot testing?

Email templates are stored in the database (created via Django migrations) and rendered by the **CHES (Common Hosted Email Service)** API at send time.

Snapshot tests protect against **unintentional template changes** by storing a baseline of each template's rendered output. Any change to a template's content, structure, variables, or subject line produces a test failure with a clear diff showing exactly what changed.

## How it works

Test files live in `bc_obps/common/tests/email_snapshots/`:

1. **`template_test_contexts.py`** contains `TEMPLATE_CONTEXTS` — a registry mapping every template name to a set of representative context variables. This is the authoritative list of all templates in the system.

2. **`test_email_template_snapshots.py`** contains:
   - `test_template_body_snapshot` — renders each template with its context values using simple string replacement (mimicking CHES behavior) and compares against a stored snapshot.
   - `test_template_subject_snapshot` — compares each template's subject line against a stored snapshot.
   - `test_all_templates_are_covered` — fails if a template exists in the database but is missing from `TEMPLATE_CONTEXTS`.
   - `test_no_stale_template_entries` — fails if `TEMPLATE_CONTEXTS` references a template that no longer exists in the database.

3. **`__snapshots__/`** contains the auto-generated snapshot files managed by [syrupy](https://github.com/syrupy-project/syrupy). These are committed to version control and serve as the baseline.

## When tests fail

| Scenario                 | Which test fails                 | What to do                                                                                                               |
| ------------------------ | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Template body changed    | `test_template_body_snapshot`    | If intentional, update snapshots. If not, revert the change.                                                             |
| Template subject changed | `test_template_subject_snapshot` | If intentional, update snapshots. If not, revert the change.                                                             |
| New template added       | `test_all_templates_are_covered` | Add the template and its context variables to `TEMPLATE_CONTEXTS` in `template_test_contexts.py`, then update snapshots. |
| Template removed         | `test_no_stale_template_entries` | Remove the entry from `TEMPLATE_CONTEXTS` in `template_test_contexts.py`, then update snapshots.                         |

## Updating snapshots

### After an intentional template change

If you modify an existing template's body or subject in a migration, the snapshot tests will fail because the rendered output no longer matches the stored baseline. To update:

```bash
make update_email_snapshots
```

This regenerates the snapshot file at `common/tests/email_snapshots/__snapshots__/test_email_template_snapshots.ambr`. **Commit the updated snapshot file in the same PR** as the template change so the full diff is visible during code review.

### After adding a new template

1. Add a new entry to `TEMPLATE_CONTEXTS` in `bc_obps/common/tests/email_snapshots/template_test_contexts.py` with the template name and representative values for all its context variables.
2. Update snapshots:

```bash
make update_email_snapshots
```

3. Commit both the updated `template_test_contexts.py` and the regenerated snapshot file.

### After removing a template

1. Remove the corresponding entry from `TEMPLATE_CONTEXTS` in `template_test_contexts.py`.
2. Update snapshots:

```bash
make update_email_snapshots
```

3. Commit both the updated `template_test_contexts.py` and the regenerated snapshot file.

## Running the tests

```bash
make pythontests ARGS="-k email_snapshots"
```
