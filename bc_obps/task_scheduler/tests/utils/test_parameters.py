from django.test import SimpleTestCase
from task_scheduler.utils.parameters import extract_function_parameters


class TestParameters(SimpleTestCase):
    def test_extract_function_parameters_kwargs_only(self):
        def test_function(param1, param2):
            pass

        args = ()
        kwargs = {"param1": "value1", "param2": "value2"}

        result = extract_function_parameters(args, kwargs, test_function)

        expected = {"param1": "value1", "param2": "value2"}
        self.assertEqual(result, expected)

    def test_extract_function_parameters_positional_args(self):
        def test_function(param1, param2, param3):
            pass

        args = ("value1", "value2")
        kwargs = {"param3": "value3"}

        result = extract_function_parameters(args, kwargs, test_function)

        expected = {"param1": "value1", "param2": "value2", "param3": "value3"}
        self.assertEqual(result, expected)

    def test_extract_function_parameters_mixed_args(self):
        def test_function(param1, param2, param3, param4):
            pass

        args = ("value1", "value2")
        kwargs = {"param3": "value3", "param4": "value4"}

        result = extract_function_parameters(args, kwargs, test_function)

        expected = {"param1": "value1", "param2": "value2", "param3": "value3", "param4": "value4"}
        self.assertEqual(result, expected)

    def test_extract_function_parameters_extra_kwargs(self):
        def test_function(param1):
            pass

        args = ()
        kwargs = {"param1": "value1", "extra_param": "extra_value"}

        result = extract_function_parameters(args, kwargs, test_function)

        expected = {"param1": "value1", "extra_param": "extra_value"}
        self.assertEqual(result, expected)

    def test_extract_function_parameters_more_args_than_params(self):
        def test_function(param1):
            pass

        args = ("value1", "extra_value")
        kwargs = {}

        result = extract_function_parameters(args, kwargs, test_function)

        expected = {"param1": "value1"}
        self.assertEqual(result, expected)
