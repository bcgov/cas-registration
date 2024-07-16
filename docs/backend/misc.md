# Miscellaneous

Some miscellaneous information, tips, and tricks related to the backend.

## Debugging Django using Shell Plus

[Shell Plus](https://django-extensions.readthedocs.io/en/latest/shell_plus.html) is a Django extension that allows you to run a shell with all of your Django models and settings pre-loaded. This is useful for debugging and testing.
You can run Shell Plus with the following command:

```bash
> python manage.py shell_plus
```

## `custom_reverse_lazy` Function

This utility function facilitates flexible URL reversal in Django by allowing the reverse of a URL. It's particularly useful for dynamic parameter URLs and avoids hardcoding. Additionally, it leverages the `url_name` defined on each API endpoint for URL reversal, ensuring consistency.

For example, to reverse the URL for the `get_operation` API endpoint with a dynamic parameter `operation_id`:

```python
custom_reverse_lazy("get_operation", kwargs={"operation_id": operation_instance_1.id})
```

This will return the URL for the `get_operation` endpoint with the `operation_id` parameter.

**NOTE:** By default, `url_name` is the name of the operation (the function responsible for each endpoint). However, we can assign a different name if desired.

## Using `apps.get_model()` in Django Migrations

When writing migrations in Django, it's recommended to use the [**`apps.get_model()`**](https://docs.djangoproject.com/en/5.0/ref/applications/#django.apps.apps.get_model) method to retrieve models rather than importing the model classes directly. This approach helps avoid issues that can arise from changes in the codebase over time.

### Reasons to Use `apps.get_model()`

1. **Model Changes**: If the model changes after the migration is written, importing the model directly can lead to errors. `apps.get_model()` fetches the model as it was defined at the time the migration was created, ensuring consistency.
2. **Dependency Management**: Direct model imports can lead to circular dependencies. Using `apps.get_model()` helps manage dependencies more effectively by decoupling the migration from the current state of the models.
3. **Historical Accuracy**: Migrations need to represent the state of the models at the time they were created. Using `apps.get_model()` ensures that the migration operates on the historical version of the model, preventing errors that could occur if the model changes.

### Example Usage

```python
def my_migration_function(apps, schema_editor):
    MyModel = apps.get_model('myapp', 'MyModel')
    # perform operations on MyModel
```

Reference: <https://codereview.doctor/features/django/best-practice/avoid-model-imports-in-migrations>
