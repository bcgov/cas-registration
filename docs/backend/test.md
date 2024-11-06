# Testing Overview

We use Pytest and Django's TestCase classes for testing. We aim to cover as much of the backend codebase as possible with unit tests for endpoints (these cover services and data access services as well), data models and utilities. All tests are located in the `tests` directory within each Django app. Test's function names should be descriptive and follow the naming convention `test_<name>`, for example, `test_get_user_by_guid`. If the test name does not contain `test`, the test runner will not pick up the test.

Endpoint tests are located in the `tests/endpoints` directory. Test files in this directory should mirror the structure of the `api` directory. For example, the tests for the `registration/api/operations.py` endpoint should be located in `tests/endpoints/test_operations.py`.

## Running Tests

The easiest way to run these tests locally is by using commands from the Makefile in the bc_obps directory. The Makefile contains commands to run tests, generate coverage reports, and more. Below are some common commands to run tests:

```shell
> make pythontests              # standard pytest run
> make pythontests_verbose      # run pytest with verbose output (helpful for troubleshooting unit tests)
> make pythontests_watch        # adds a watcher that can run pytest in the background; unit tests will re-run whenever changes to a Python file are detected
> make pythontests_coverage     # run pytest with coverage report
> make pythontests ARGS='registration/tests/<file_name.py>' # run pytest for a specific file
> make pythontests ARGS='-k <TestClassname>' # run pytest for a specific class, e.g. make pythontests ARGS='-k TestNaicsCodeEndpoint'
> make pythontests ARGS='-k <test_name>' # run pytest for a specific test, e.g. make pythontests ARGS='-k test_get_method_for_200_status' (note: if any tests have the same name, even if they're within different classes, this command will run them all)
> make pythontests ARGS='--lf'  # run pytest with the --last-failed flag to re-run only the tests that failed in the last run
```

## Testing Helpers

We have some testing helpers in the `tests/utils` directory of each Django app. These helpers are used to mock data and objects for testing purposes. For example, in the `registration` app, we have a helper called `TestUtils` that contains the following methods:

- mock user roles for get, post, and put requests
- mock postal codes
- authorize a user as belonging to an operator
- create mock operations

To use the helpers, import them from `utils` and use like this:

```python
TestUtils.mock_postal_code()
```

## Writing backend tests using mock

We use the `mock` library (a.k.a. `unittest.mock`) to patch calls made in our backend. For examples of this in our codebase, search for the keyphrase `mocker.patch`.

When mocking calls, it's very important to insert your patch in the correct place - namely, patch where an object is _called_ (looked up), not where it is defined. For a more detailed explanation, see [Where to patch](https://docs.python.org/3/library/unittest.mock.html#id6).

It's also important to understand the difference between patching a function - done with `patch()` - and patching an object - done with `patch.object()`. Again, refer to unittest.mock's [online docs](https://docs.python.org/3/library/unittest.mock.html#patch) for more detail.

## Testing Django Models

When testing Django models, we use the `BaseTestCase` class from the `bc_obps.common.tests.utils.helpers` module. This base test case provides several utility methods to streamline the testing of model fields, ensuring that they meet the expected criteria for labels, maximum lengths, and relationship counts. Below are the key components and their purposes:

### Key Components of `BaseTestCase`

1. **`field_data`**:

   - This attribute should be overridden in the child class. It contains a list of tuples where each tuple represents a field's name, expected label, expected maximum length, and expected relations count.
   - Example:

     ```python
     field_data = [
         ('name', 'Name', 255, None),
         ('description', 'Description', 500, None),
         ('tags', None, None, 3)
     ]
     ```

2. **`assertFieldLabel(self, instance, field_name, expected_label)`**:

   - This method asserts that the label of a given field matches the expected label.
   - If the field is a `ManyToOneRel` or `ManyToManyRel`, it checks the verbose name of the related model instead.
     **Note:** This is particularly relevant if you are using Django views or the Django admin interface, where the field labels are displayed to the user. For example, if you have a field named `first_name`, you may want to display it as `First Name` in the admin interface.

3. **`assertFieldMaxLength(self, instance, field_name, expected_max_length)`**:

   - This method asserts that the maximum length of a given field matches the expected maximum length.

4. **`assertHasMultipleRelationsInField(self, instance, field_name, expected_relations_count)`**:

   - This method asserts that the number of relations in a field matches the expected relations count.

5. **`test_field_labels_and_max_lengths(self)`**:

   - This test method iterates through the `field_data` list and uses subtests to check each field's label, maximum length, and relations count based on the provided data.

6. **`test_field_data_length(self)`**:
   - This test method checks that the number of fields in the model matches the number of fields in the `field_data` list, ensuring completeness in the testing data.

### Example Usage

To use the `BaseTestCase`, create a child class and override the `field_data` attribute. Additionally, define a `test_object` attribute pointing to the instance of the model being tested.

```python
from bc_obps.common.tests.utils.helpers import BaseTestCase
from myapp.models import MyModel

class MyModelTestCase(BaseTestCase):
    field_data = [
        ('name', 'Name', 255, None),
        ('description', 'Description', 500, None),
        ('tags', None, None, 3)
    ]

    @classmethod
    def setUpTestData(cls):
        cls.test_object = MyModel.objects.create(name='Test', description='Test Description')
        cls.test_object.tags.set([1, 2, 3])

```

In this example, `MyModelTestCase` inherits from `BaseTestCase`, and the `field_data` list is defined with the expected field attributes. The `setUpTestData` method sets up the test data for the `test_object` model instance, allowing the tests to run using this data.

## Endpoint Permission Testing

Our endpoint permission testing framework automatically verifies access restrictions for each role on specified endpoints. By following a simple setup, we ensure new endpoints are correctly tested for role permissions, and the system will notify us if any endpoints lack coverage.

### Adding New Endpoints for Testing

To add a new endpoint to the test suite, update the `endpoints_to_test` dictionary in the test configuration. This dictionary is organized by roles, with each role having a list of endpoints it has access to. For each new endpoint, specify:

- `method`: The HTTP method (`get`, `post`, etc.).
- `endpoint_name`: The endpoint name (must match the endpoint's URL pattern name).
- `kwargs` (optional): Any URL parameters required by the endpoint, such as `id`s.

Here’s an example of how to add a new endpoint for a role:

```python
{
    "method": "get",
    "endpoint_name": "new_endpoint_name",
    "kwargs": {"item_id": random_uuid},
}
```

### Ensuring All Endpoints are Covered

The test suite includes a check to confirm all endpoints are covered in the endpoints_to_test dictionary. If any new endpoints are added but not included in endpoints_to_test, the test will fail and list the untested endpoints, helping us maintain comprehensive testing coverage.

### Excluding Certain Endpoints

For endpoints that don’t require permission checks, add them to the exclusion_list within the test_all_api_endpoints_are_permission_tested function. Common examples are endpoints open to all users or those managed by other teams.
