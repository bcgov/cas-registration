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

Each version folder contains the relevant code for that version. New features and updates will be implemented in the `v2` folders while the `v1` folders will maintain the existing codebase.

## API Endpoints

### New API Endpoints

1. **For Updated Endpoints**: If an existing API endpoint is being updated or enhanced, place the new version of the endpoint in the `api/v2` folder. The endpoint **MUST** start with `/v2/...`.

   Example:

   ```markdown
   # Old endpoint (v1)

   "/business_structures"

   # New endpoint (v2)

   "/v2/business_structures"
   ```

2. **For Completely New Endpoints**: If a new endpoint is being introduced, it can be placed in the `api/v1` folder if it doesn't conflict with existing endpoints. Otherwise, use the `api/v2` folder.

## Services

When adding new functions to existing services (Classes), name the new functions with the `_v2` suffix if they have the same name as existing functions.

### Example

Suppose you have a service class in `user_service.py`:

```python
# user_service.py (v1)
class UserDataAccessService:
    def get_user_operator_by_user(user_guid: UUID):
        # Existing implementation
```

If you need to add a new function with the same name, use the `_v2` suffix:

```python
# user_service.py (v2)
class UserDataAccessService:
    def get_user_operator_by_user_v2(user_guid: UUID):
        # New implementation
```

If significant changes are made to the service layers, consider creating `v1` and `v2` sub-folders for the service layers as well.
