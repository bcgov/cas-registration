# API Design

The goal of API design is to separate concerns as much as possible.

## Endpoints

Endpoints are app-specific (e.g. `registration/api/operators/{operator_id}/request-access`) and should contain as little logic as possible. They should only:

- handle role-based authorization using the authorize function
- handle http errors using the @handle_http_errors decorator
- send http responses
- use services

For example:

```python
@router.post(
    "/operators/{operator_id}/request-access",
    response={201: RequestAccessOut, custom_codes_4xx: Message},
    url_name="request_access",
    auth=authorize("industry_user"),
)
@handle_http_errors()
def request_access(request, payload: SelectOperatorIn):

    return 201, ApplicationAccessService.request_access(payload.operator_id, get_current_user_guid(request))
```

The /api file structure is designed to self-document URLs. This means:

- any file in the root of /api has a single-part path, e.g. `/api/operations` refers to the route `registration/api/operations`
- folders within /api that have the same name as files are prefaced with an underscore to avoid import collisions. E.g., `api/_operations/operation_id` refers to the route `registration/api/operations/{operation_id}`.

### Notes on Endpoints

- Most Endpoints leverage user data from the middleware (current_user) to identify the current user and their roles. This middleware looks for a user_guid in the request headers and sets the current user to the user with that guid. This way, we can have access to the user object wherever we have access to the request object.

## Services

We follow a service-oriented architecture, where every layer:

- Controls its data input and outputs
- Has one single responsibility

Two types of services can be developed:

- Services that are not app-specific and can be used by any BCIERS app are deployed in the `service` django-app.
- App-specific services (for example, data-providers for app-specific API endpoints) should live in `<appname>/service`.

## Database access services

The only things these services do are:

- access the database (query, create, etc.)
- ensure transactions are atomic using the @transaction.atomic() decorator when required (not needed for GET)
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
        return user_operator, created
```

## Intermediary services

Sometimes, an endpoint needs to do something more complicated than simply call a database access service and return data. In these cases, we create custom services. For example, in the registration app, when a brand-new operator wants to request access, we need to create operator and user_operator records at the same time. These intermediary services do some or all the following things, depending on the business logic required:

- if multiple database services are called, ensure they're atomic using the @transaction.atomic() decorator
- check if users should be allowed to do things (in the regisration app, role-based authentication is handled in the endpoints, but anything more specific (e.g., if an operator already has an admin, subsequent users can't request admin access) is handled in an intermediary service)

## Creating a New API Endpoint

When creating a new API endpoint, you need to define several key components to ensure the endpoint is functional, secure, and well-documented. Here are the steps and elements required to create a new endpoint:

1. **Define the Route**: Specify the HTTP method (GET, POST, PUT, DELETE) and the endpoint path. The path should be self-documenting and follow the file structure conventions.([API endpoint best practices](https://restfulapi.net/resource-naming/))

2. **Authorization**: Use the `authorize` function and pass it to auth parameter of router to handle role-based authorization. This ensures that only users with the appropriate roles can access the endpoint.

3. **Error Handling**: Apply the `@handle_http_errors` decorator to manage HTTP errors.

4. **Service Calls**: Use services to handle the business logic and database interactions. Ensure that the service methods are designed to perform atomic transactions when necessary.

5. **Response Handling**: Define the response format and status codes. Use response models to ensure consistent and structured responses.

6. **Tags**: Use the tags parameter to group endpoints logically. Tags help with API documentation and make it easier to find related endpoints.

7. **URL Name**: Assign a unique `url_name` to the endpoint for reverse URL lookups and to maintain consistent naming conventions.

8. **Description**: Provide a detailed description of what the endpoint does. This helps with understanding the functionality and purpose of the endpoint.
