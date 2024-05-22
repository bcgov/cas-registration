# Mypy

Mypy is a static type checker for Python. It aims to combine the benefits of dynamic (or "duck") typing and static typing. Mypy can type-check your code and find potential errors before you run your program. For more information on getting started with Mypy, you can refer to the [Mypy documentation](https://mypy.readthedocs.io/en/stable/getting_started.html).

## Django-stubs

Django-stubs is a collection of type stubs for Django, allowing you to use Mypy to check your Django code. It provides type hints for Django’s core features, making it easier to catch errors early and improving the overall development experience.
We added Django-stubs to our project to enhance type checking for our Django codebase. By doing this, we can catch potential issues early in the development process, improving code quality and reducing bugs.

## Make Target for Mypy

We have added a `make` target named `make mypy` which allows developers to run Mypy from within the `bc_obps` folder. This target simplifies the process of running Mypy, ensuring that our codebase adheres to the specified type annotations.

## Limitations with ModelSchemas

We cannot add types to Django-ninja `ModelSchemas` because they are generated at runtime and cannot be typed. For more information, refer to the discussion [here](https://github.com/vitalik/django-ninja/issues/259).

## Excluding Tests from Static Type Checking

We do not run static type checking on tests. Our tests are focused on verifying functionality, and we only want to check production code for type correctness.

## Type Ignoring and No Type Checking

### `# type: ignore[attr-defined]`

In some places, we use `# type: ignore[attr-defined]` because of using Django-ninja `ModelSchema`. This directive tells Mypy to ignore attribute definition errors, which are common when dealing with dynamically generated models.

### `@typing.no_type_check`

We use `@typing.no_type_check` on some functions to disable type checking for those specific functions. This is useful when type checking is not feasible or would require significant changes to the code that are not currently practical.
