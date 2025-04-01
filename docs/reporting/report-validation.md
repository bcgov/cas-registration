# Report Validation

## Pattern

The report validation pattern follows a plugin architecture.
Plugins are then automatically discovered and collected by the validation service, run in a sequence, and errors are then aggregated and returned.

## Adding a new validation plugin

- Report validators must be python modules in the `reporting/service/report_validation/validators` folders.
- They must contain a `validate` function returning a dictionary of errors
- They must be registered in the **init**.py file to be discovered by the validation service

#### To add a new validator:

- Create a `name_of_validator.py` file in `reporting/service/report_validation/validators`
- In `name_of_validator.py`, create a `validate` function such as:

```py
def validate(report_version: ReportVersion): dict[str, ReportValidationError]:
    ...do_stuff()
    return {...}
```

- In `reporting/service/report_validation/validators/__init__.py`, import the validator and add it to the **all** array

## Validate a report version

The `ReportValidationService` class collects the validation plugins at startup time.
To validate a report version, call `validate_report_version(version_id)`, and the service will iterate through the registered validation plugins.

A dictionary of `ReportValidationError` objects is returned, with keys determined by the validation plugins.

Error severity (`Severity.WARNING`, `Severity.ERROR`) is also determined by the implementation of the plugins, and can be used on the backend or frontend to throw exceptions or display appropriate warning or error messages.
