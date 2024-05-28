# API Design

The goal of API design is to separate concerns as much as possible.

## Endpoints

Endpoints are app-specific (e.g. `registration/api/operators/{operator_id}/request-access`) and should contain as little logic as possible. They should only:

- handle role-based authorization using the @authorize decorator
- handle http errors using the @handle_http_errors decorator (placed below @authorize or else it will catch auth errors)
- send http responses
- use services

For example:

```python
@router.post(
    "/operators/{operator_id}/request-access",
    response={201: RequestAccessOut, custom_codes_4xx: Message},
    url_name="request_access",
)
@authorize(["industry_user"], UserOperator.get_all_industry_user_operator_roles(), False)
@handle_http_errors()
def request_access(request, payload: SelectOperatorIn):

    return 201, ApplicationAccessService.request_access(payload.operator_id, get_current_user_guid(request))
```

The /api file structure is designed to self-document URLs. This means:

- any file in the root of /api has a single-part path, e.g. `/api/operations` refers to the route `registration/api/operations`
- folders within /api that have the same name as files are prefaced with an underscore to avoid import collisons. E.g., `api/_operations/operation_id` refers to the route `registration/api/operations/{operation_id}`.

## Services

Services are not app-specific and can be used by any BCIERS app. We have the following categories of services:

## Database access services

The only things these services do are:

- access the database (query, create, etc.)
- ensure transactions are atomic using the @transaction.atomic() decorator when required (not needed for GET)
- set audit columns
- return exceptions (rarely; usually we allow the default django error to be caught and handled in the endpoint by the @handle_http_errors decorator)

For example:

```python
@transaction.atomic()
    def get_or_create_user_operator(user_guid: UUID, operator_id: UUID) -> Tuple[UserOperator, bool]:
        "Function to create a user_operator"
        user = UserDataAccessService.get_by_guid(user_guid)
        operator = OperatorDataAccessService.get_operator_by_id(operator_id)
        user_operator, created = UserOperator.objects.get_or_create(
            user=user, operator=operator, status=UserOperator.Statuses.PENDING, role=UserOperator.Roles.PENDING
        )
        if created:
            user_operator.set_create_or_update(user.pk)
        return user_operator, created
```

## Intermediary services

Sometimes, an endpoint needs to do something more complicated than simply call a database access service and return data. In these cases, we create custom services. For example, in the registration app, when a brand-new operator wants to request access, we need to create operator and user_operator records at the same time. These intermediary services do some or all the following things, depending on the business logic required:

- if multiple database services are called, ensure they're atomic using the @transaction.atomic() decorator
- check if users should be allowed to do things (in the regisration app, role-based authentication is handled in the endpoints, but anything more specific (e.g., if an operator already has an admin, subsequent users can't request admin access) is handled in an intermediary service)
