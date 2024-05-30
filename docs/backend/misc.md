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
