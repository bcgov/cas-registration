# Developer Guidelines

(For development environment setup see [`developer-environment-setup`](./developer-environment-setup))

### Entity-Relationship Diagram (ERD) Generation

We use [Mermaid](https://mermaid-js.github.io/mermaid/) to create ERD diagrams for our data models. The [django-diagram](https://github.com/nick-solly/django-diagram) package enables the generation of ERD diagrams specific to our Django models.

To generate the most recent ERD diagram, navigate to the `bc_obps` directory (where the `manage.py` file is located) and execute the following command in your terminal:

```bash
poetry run python -m django_diagram --app=registration --output=../erd.md --settings=bc_obps.settings

```

### Audit Trail Implementation

Within our Django application, we employ the `TimeStampedModel` abstract data model to integrate audit columns into our various models. This model resides in `bc_obps/registration/models.py` and serves as the foundation for all data models requiring audit trails. It incorporates the following columns:

`created_at`: Captures the timestamp when an object is initially created.
`created_by`: Records the creator of the object.
`updated_at`: Indicates the timestamp of the object's last update.
`updated_by`: Stores the user who last modified the object.
`archived_at`: Documents the timestamp when an object is archived.
`archived_by`: Registers the user who initiated the archiving process.

This data model is equipped with two essential methods:

`set_create_or_update`: This method sets the necessary audit columns when creating a new object or updating an existing one. It requires the user initiating the modification as a parameter.

`set_archive`: Specifically designed for archiving objects, this method captures the archival details and requires the user initiating the archival process as a parameter.

Furthermore, a custom manager is implemented to filter out archived objects, ensuring a streamlined retrieval process focused only on active data.

## Profiling and Optimizing Endpoints

### Django Silk

[Django Silk](https://github.com/jazzband/django-silk) is a powerful profiling tool for Django applications. It allows developers to measure and analyze the performance of their Django views, routes and middlewares. Profiling your endpoints with Django Silk can help identify bottlenecks and optimize your code for better performance.
The information provided by Silk can be immensely helpful in identifying and resolving performance issues during the development phase.

To access Django Silk's profiling reports, follow these steps:

1. Ensure Django Silk is installed and configured in your project.([Installation Guide](https://github.com/jazzband/django-silk?tab=readme-ov-file#installation))

2. Start the Django development server:

   ```bash
   make run
   ```

3. Open your web browser and navigate to `http://127.0.0.1:8000/silk/requests/` to access the Silk request profiling dashboard.

4. Trigger the endpoint you want to profile within your application.

5. Refresh the Silk dashboard to view the profiling report for the triggered endpoint and you can see overall duration, duration of SQL queries, and total number of SQL queries executed for the endpoint.

   ![Django Silk Requests Dashboard](./images/silk_requests_dashboard.png)

6. By selecting a specific request, you can view detailed information about the request and response, including time metrics, SQL queries, Request and Response details, and etc.

   ![Django Silk Request Detail](./images/silk_request_detail.png)

7. By selecting the SQL tab on top left, you can view the SQL queries executed for the selected request and their execution times.

   ![Django Silk SQL Queries](./images/silk_sql_queries.png)

#### NOTE

Django Silk's profiler is accessible only in the local development environment.(DEBUG=True)

## Database Optimization

Optimizing database queries is crucial for improving the overall performance of a Django application. Django provides several techniques to optimize database queries and minimize the number of queries executed.

### Using `select_related`

[Django's `select_related`](https://docs.djangoproject.com/en/4.2/ref/models/querysets/#select-related) is a performance booster which results in a single more complex query but means later use of foreign-key relationships won’t require database queries.

```python
from django.db import models


class City(models.Model):
    # ...
    pass


class Person(models.Model):
    # ...
    hometown = models.ForeignKey(
        City,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )


class Book(models.Model):
    # ...
    author = models.ForeignKey(Person, on_delete=models.CASCADE)

# Hits the database with joins to the author and hometown tables.
b = Book.objects.select_related("author__hometown").get(id=4)
p = b.author  # Doesn't hit the database.
c = p.hometown  # Doesn't hit the database.

# Without select_related()...
b = Book.objects.get(id=4)  # Hits the database.
p = b.author  # Hits the database.
c = p.hometown  # Hits the database.

```

### Using `prefetch_related`

[Django's `prefetch_related`](https://docs.djangoproject.com/en/4.2/ref/models/querysets/#prefetch-related) serves a similar purpose to `select_related`, aiming to mitigate the issue of excessive database queries resulting from accessing related objects. However, the strategy employed by `prefetch_related` differs significantly.

```python
from django.db import models

class Author(models.Model):
    name = models.CharField(max_length=100)

class Genre(models.Model):
    name = models.CharField(max_length=50)

class Book(models.Model):
    title = models.CharField(max_length=100)
    author = models.ForeignKey(Author, on_delete=models.CASCADE)
    genres = models.ManyToManyField(Genre)
    published_at = models.DateTimeField()

class Publisher(models.Model):
    name = models.CharField(max_length=300)
    books = models.ManyToManyField(Book)

# Without prefetch_related, this hits the database with multiple queries.
publisher = Publisher.objects.get(name="BigBooks") # Hits the database.
related_books = publisher.books.all()  # Hits the database again to get the related books.

# Using prefetch_related()...
publisher = Publisher.objects.prefetch_related("books__author", "books__genres").get(name="BigBooks")
related_books = publisher.books.all()  # Doesn't hit the database for authors and genres, as they are included in the initial query.

```

### Using `.only()`

[Django's `.only()`](https://docs.djangoproject.com/en/4.2/ref/models/querysets/#only) method is a powerful tool for optimizing queries by allowing you to fetch only specific fields from the database, reducing the amount of data retrieved. This can be particularly useful when you are interested in a subset of fields and want to minimize the overhead associated with fetching unnecessary data.

Consider the following example with a Book model:

```python
from django.db import models

class Book(models.Model):
    title = models.CharField(max_length=100)
    author = models.CharField(max_length=100)
    published_at = models.DateTimeField()
    page_count = models.IntegerField()
    genre = models.CharField(max_length=50)


# Without using .only(), this fetches all fields from the database.
all_books = Book.objects.all()

# Using .only() to fetch only specific fields - title and author.
selected_fields_books = Book.objects.only('title', 'author').all()
```

This optimization becomes more noticeable when dealing with larger datasets or when only a subset of fields is required for a particular operation. By utilizing .only(), you can enhance the performance of your Django application by minimizing unnecessary data transfer from the database.

### Optimizing Django-Ninja Schema

When defining Pydantic schemas for Django-Ninja, explicitly include only the fields that are essential for processing or need to be included in the response. Avoid adding unnecessary fields to minimize the data transmitted over the network and improve the overall efficiency of your API.

In the following example, the `OperationListOut` schema is defined to include only the essential fields from the `Operation` model to be used on the client side.(Operations Table)

```python
from ninja import ModelSchema

class OperationListOut(ModelSchema):
    operator: str = Field(..., alias="operator.legal_name")
    bc_obps_regulated_operation: Optional[str] = Field(None, alias="bc_obps_regulated_operation.id")

    class Config:
        model = Operation
        model_fields = ['id', 'name', 'bcghg_id', 'submission_date', 'status']
```

### Debugging Django using Shell Plus

[Shell Plus](https://django-extensions.readthedocs.io/en/latest/shell_plus.html) is a Django extension that allows you to run a shell with all of your Django models and settings pre-loaded. This is useful for debugging and testing.
You can run Shell Plus with the following command:

```bash
> python manage.py shell_plus
```

## Common Utils

### `custom_reverse_lazy` Function

This utility function facilitates flexible URL reversal in Django by allowing the reverse of a URL. It's particularly useful for dynamic parameter URLs and avoids hardcoding. Additionally, it leverages the `url_name` defined on each API endpoint for URL reversal, ensuring consistency.

For example, to reverse the URL for the `get_operation` API endpoint with a dynamic parameter `operation_id`:

```python
custom_reverse_lazy("get_operation", kwargs={"operation_id": operation_instance_1.id})
```

This will return the URL for the `get_operation` endpoint with the `operation_id` parameter.

## API Design

The goal of API design is to separate concerns as much as possible.

### Endpoints

Endpoints are app-specific (e.g. `registration/api/select-operator/request-access`) and should contain as little logic as possible. They should only:

- handle role-based authorization using the @authorize decorator
- handle http errors using the @handle_http_errors decorator (placed below @authorize or else it will catch auth errors)
- send http responses
- use services

For example:

```
@router.post(
    "/select-operator/request-access",
    response={201: RequestAccessOut, custom_codes_4xx: Message},
    url_name="request_access",
)
@authorize(["industry_user"], UserOperator.get_all_industry_user_operator_roles(), False)
@handle_http_errors()
def request_access(request, payload: SelectOperatorIn):

    return 201, ApplicationAccessService.request_access(payload.operator_id, get_current_user_guid(request))
```

### Services

Services are not app-specific and can be used by any BCIERS app. We have the following categories of services:

### Database access services

The only things these services do are:

- access the database (query, create, etc.)
- ensure transactions are atomic using the @transaction.atomic() decorator when required (not needed for GET)
- set audit columns
- return exceptions (rarely; usually we allow the default django error to be caught and handled in the endpoint by the @handle_http_errors decorator)

For example:

```
@transaction.atomic()
    def get_or_create_user_operator(user_guid: UUID, operator_id: UUID) -> Tuple[UserOperator, bool]:
        "Function to create a user_operator"
        user = UserDataAccessService.get_user_by_guid(user_guid)
        operator = OperatorDataAccessService.get_operator_by_id(operator_id)
        user_operator, created = UserOperator.objects.get_or_create(
            user=user, operator=operator, status=UserOperator.Statuses.PENDING, role=UserOperator.Roles.PENDING
        )
        if created:
            user_operator.set_create_or_update(user.pk)
        return user_operator, created
```

### Intermediary services

Sometimes, an endpoint needs to do something more complicated than simply call a database access service and return data. In these cases, we create custom services. For example, in the registration app, when a brand-new operator wants to request access, we need to create operator and user_operator records at the same time. These intermediary services do some or all the following things, depending on the business logic required:

- if multiple database services are called, ensure they're atomic using the @transaction.atomic() decorator
- check if users should be allowed to do things (in the regisration app, role-based authentication is handled in the endpoints, but anything more specific (e.g., if an operator already has an admin, subsequent users can't request admin access) is handled in an intermediary service)

## Email Notifications

Email notifications are an essential part of the application's communication strategy. They provide users with important information, updates, and alerts. We use CHES (Common Hosted Email Service) to send email notifications to users.
To send real emails, you need to set up CHES credentials in your environment variables. You can find the required CHES credentials in the 1Password document `OBPS backend ENV`.

You also need to set up the `EmailService` singleton object (like `email_service = EmailService()`) in the `.py` file to access the `EmailService` object.

**Note**: Make sure to not send real emails in the development environment by commenting out the CHES credentials in the `bc_obps/.env` file.
