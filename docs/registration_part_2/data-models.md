# Data Model Guidelines

## Overview

Ideally, our Django models will support both v1 and v2. We'll achieve this mainly with use of `null=True`, but in some cases more may be required.

## Adding New Tables and Columns

If you need to add something new, you can directly edit the model files (in `bc_obps/registration/models`):

- If you're creating a new table, create a new file for it
- If you're adding a column to an existing table, it needs to be nullable so that v1 can continue to use the existing table. Set `(null=True)` and `(blank=True)` (null is for the db and blank is for django forms)
- Create and run migrations
- Add tests to the v2 test folder. The testing commands in [test.md](../backend/test.md) run the tests for both v1 and v2

## Removing Columns

If data is no longer necessary for v2 but existed in v1:

- Set the column to nullable and blank in the model file
- Run migrations
- Check if that field is being referenced anywhere in the codebase. If it is, we must remove that reference to avoid breaking the app
- No test updates needed--we don't test if fields are mandatory or not

## Updating New Tables and Columns

If you need to change something:

- See if it's possible to make the change in a way to make the existing models work for both v1 and v2. For example, in v1 we have `operation_type` as a `CharField`, and in v2 it will be a foreign key field to an `OperationType` models. We can add the v1 types (they were selected via dropdown so only a few options) to to the `OperationType` model so that both v1 and v2 can use the foreign key table.
- If it's not possible to use the same models, we'll have to look into field or model versioning. E.g. of field versioning: We have `data_field`. We create `data_field_1`. Once we are done with v2, we can remove `data_field` and rename `data_field_1` to `data_field`.

## Mock data

v1 and v2 have separate fixtures. This is so that we can keep the v1 e2e tests running while allowing v2 testers to see more accurate data. For example, the only allowed operation.status in v2 are NOT STARTED, DRAFT, and REGISTERED. v1 had additional statuses that are still supported but can't be assigned, and it's confusing for testers to see these old statues.

v1 fixtures are stored in `bc_obps/registration/fixtures/mock/v1`. They can be loaded with the v1-specific make command `loadfixtures_v1`, and the v1 e2e tests run this command.

v2 fixtures are in `bc_obps/registration/fixtures/mock/`. The model tests, v2 e2e tests, and make `loadfixtures` point to this directory.
