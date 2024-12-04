# Backend Structure Guidelines

## Overview

Our Django backend codebase is organized to support versioning for APIs, schemas, and tests. This structure allows us to introduce new features and improvements while keeping existing code available and stable in the production environment.

## Folder Structure

The backend code is organized into the following sub-folders:

- `api/v1/`
- `api/v2/`
- `schema/v1/`
- `schema/v2/`
- `tests/v1/`
- `tests/v2/`

Each version folder contains the relevant code for that version. New features and updates will be implemented in the `v2` folders while the `v1` folders will maintain the existing codebase. `v1` endpoints all start with `/v1/`.

## API Endpoints

### New API Endpoints

1. **For Existing Endpoints**: If a `v1` API endpoint can be used as-is, create a copy of the `v1` endpoint in the `v2` folder. (This will make it easier for us to retire `v1`).

   Example:

   ```markdown
   # Old endpoint (v1)

   "/business_structures"

   # New endpoint (v2)

   "/v2/business_structures"
   ```

Add correct versioning tags to the endpoints.

2. **For New Endpoints**: Create the new endpoint in the `v2` folder.

## Services

Like API endpoints, everything that `v1` uses should be in the `v1` folder with a `v1` prefix, and if it needs to be reused in `v2`, a copy of the service should be created in the `v2` folder (no prefix)

### Example

Suppose you have a service class in `user_service.py`:

```python
# user_service.py (v1)
class UserDataAccessServiceV1:
    def v1_get_user_operator_by_user(user_guid: UUID):
        # Existing implementation
```

In `v2`:

```python
# user_service.py (v2)
class UserDataAccessService:
    def get_user_operator_by_user_v2(user_guid: UUID):
        # New implementation
```

## Tests

The existing testing commands run both `v1` and `v2` tests. See [test.md](../backend/test.md) for more details. If tests in `v1` and `v2` have the same name, create an empty `__init__.py` in the folder that contains the test with the same name. Otherwise, pytest will complain.
