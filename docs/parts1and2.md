# Registration Parts 1 and 2

## Front-end components (including E2E tests and Vi-tests)

TODO: This will be handled in https://github.com/bcgov/cas-registration/issues/1621

## API endpoints (including pytests)

TODO: This will be handled in https://github.com/bcgov/cas-registration/issues/1628

## Models and Model Tests

If possible, we want to use the same models for parts 1 and 2. We'll achieve this mainly with use of `null=True`.

You can find the models in `/cas-registration/bc_obps/registration/models.py` and the tests in `bc_obps/registration/tests/test_models.py`.

If you need to add something new, you can directly edit `/cas-registration/bc_obps/registration/models.py`:

- If you're creating a new table, add it as normal
- If you're adding a column to an existing table, it needs to be nullable so that reg part 1 can continue to use the existing table. Set `(null=True)` and `(blank=True)` (null is for the db and blank is for django forms)
- Create and run migrations
- Add tests to `bc_obps/registration/tests/test_models.py`

If data is no longer necessary for part 2 but existed in part 1:

- Set the column to nullable and blank in `/cas-registration/bc_obps/registration/models.py`
- Run migrations
- No test updates needed--we don't test if fields are mandatory or not

If you need to change something:

- See if it's possible to make the change in a way to make the existing models work for both parts 1 and 2. For example, in part 1 we have `operation_type` as a `CharField`, and in part 2 it will be a foreign key field to an `OperationType` models. We can add the part 1 types (they were selected via dropdown so only a few options) to to the `OperationType` model so that both parts 1 and 2 can use the foreign key table.
- If it's not possible to use the same models, we'll have to look into model versioning.

## Run/access Registration Parts 1 & 2 simultaneously in both local and DEV environments

TODO: This will be handled in https://github.com/bcgov/cas-registration/issues/1621
