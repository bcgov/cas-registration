# Squashed Migrations — Testing Guide

This guide explains how to verify that squashed migrations produce exactly the same database
schema and seed data as the original migrations.

> **Scope:** This guide currently covers the `registration`, `reporting` and `compliance`
> apps, whose migrations have been squashed. The same approach and tooling (`snapshot_db`,
> `SquashIntegrityTestBase`) can be applied to any other Django app in this project if its
> migrations are squashed in the future.

> **Snapshots are not committed.** The generated `db_snapshot.json` files are local
> artifacts of this manual process. Generate them when you need to verify a squash, then
> delete them — do not check them in. The integrity tests stay `@unittest.skip`-ed on the
> branch for the same reason: without a snapshot present they cannot run in CI.

---

## Overview

The verification workflow has two phases:

1. **Generate a baseline snapshot** from the original (pre-squash) migrations.
2. **Run the integrity tests** on the squash branch to confirm the output matches.

The `snapshot_db` management command (at `common/management/commands/snapshot_db.py`)
handles snapshot generation. The integrity tests live at:

- `bc_obps/registration/tests/migration/test_registration_squashed_db_integrity.py`
- `bc_obps/reporting/tests/migration/test_reporting_squashed_db_integrity.py`
- `bc_obps/compliance/tests/migration/test_compliance_squashed_db_integrity.py`

---

## Step 1: Generate a baseline snapshot (original migrations)

Check out the branch or commit that contains the **original, pre-squash migrations** and run:

```bash
cd bc_obps
dropdb registration && createdb registration
poetry run python manage.py migrate

# Generate snapshots for all three apps
poetry run python manage.py snapshot_db --apps registration,reporting,compliance
```

This writes three files:

- `registration/fixtures/snapshots/db_snapshot.json`
- `reporting/fixtures/snapshots/db_snapshot.json`
- `compliance/fixtures/snapshots/db_snapshot.json`

Keep these snapshot files for Step 2.

---

## Step 2: Run the integrity tests (squash branch)

Switch to the squash branch, then:

1. Remove the `@unittest.skip` decorator from the integrity test files so they actually run.

2. Set up a clean database and apply the **squashed** migrations:

```bash
cd bc_obps
dropdb registration && createdb registration
poetry run python manage.py migrate
```

3. Run the integrity tests:

```bash
poetry run pytest registration/tests/migration/test_registration_squashed_db_integrity.py \
       reporting/tests/migration/test_reporting_squashed_db_integrity.py \
       compliance/tests/migration/test_compliance_squashed_db_integrity.py -v
```

If all three tests pass, the squashed migrations are equivalent to the originals.

When you are done, restore the `@unittest.skip` decorators and delete the generated
snapshot files.

---

## How the integrity tests work

`SquashIntegrityTestBase` (in `common/tests/squash_integrity_base.py`) loads the JSON
snapshot generated in Step 1 and compares it against the live database state produced by
the squashed migrations. It checks:

- Table structure (columns, types, constraints)
- Seed / fixture data

Any divergence causes the test to fail with a diff showing exactly what changed.

### Extending to other apps

To add integrity testing for a new app:

1. Create a snapshot fixture directory: `<app>/fixtures/snapshots/`.
2. Run `snapshot_db --apps <app>` before squashing to generate `<app>/fixtures/snapshots/db_snapshot.json`.
3. Create a test file (e.g., `<app>/tests/migration/test_<app>_squashed_db_integrity.py`) that subclasses `SquashIntegrityTestBase` and points to the new snapshot.
4. Follow the same two-step workflow above.
