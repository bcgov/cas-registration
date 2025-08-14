from unittest.mock import MagicMock
from django.test import SimpleTestCase, TestCase
from task_scheduler.utils.paths import get_function_path, resolve_function_from_path


class TestGetFunctionPath(SimpleTestCase):
    def test_get_function_path_regular_function(self):
        def test_function():
            pass

        result = get_function_path(test_function)

        # The path will include the test module name, not __main__
        self.assertIn("test_function", result)
        self.assertIn("test_paths", result)

    def test_get_function_path_class_method(self):
        class TestClass:
            def test_method(self):
                pass

        result = get_function_path(TestClass.test_method)

        self.assertIn("TestClass.test_method", result)
        self.assertIn("test_paths", result)

    def test_get_function_path_static_method(self):
        class TestClass:
            @staticmethod
            def test_static_method():
                pass

        result = get_function_path(TestClass.test_static_method)

        self.assertIn("test_static_method", result)
        self.assertIn("test_paths", result)

    def test_get_function_path_bound_method(self):
        class TestClass:
            def test_method(self):
                pass

        instance = TestClass()
        result = get_function_path(instance.test_method)

        self.assertIn("TestClass.test_method", result)
        self.assertIn("test_paths", result)

    def test_get_function_path_with_module(self):
        mock_function = MagicMock()
        mock_function.__module__ = "test.module"
        mock_function.__name__ = "test_function"
        mock_function.__qualname__ = "test_function"

        result = get_function_path(mock_function)

        self.assertEqual(result, "test.module.test_function")

    def test_get_function_path_class_method_with_module(self):
        mock_method = MagicMock()
        mock_method.__module__ = "test.module"
        mock_method.__name__ = "test_method"
        mock_method.__qualname__ = "TestClass.test_method"

        result = get_function_path(mock_method)

        self.assertEqual(result, "test.module.TestClass.test_method")

    def test_get_function_path_bound_method_with_module(self):
        mock_bound_method = MagicMock()
        mock_bound_method.__module__ = "test.module"
        mock_bound_method.__name__ = "test_method"
        mock_bound_method.__self__ = MagicMock()
        mock_bound_method.__self__.__class__.__name__ = "TestClass"

        result = get_function_path(mock_bound_method)

        self.assertEqual(result, "test.module.TestClass.test_method")


class TestResolveFunctionFromPath(SimpleTestCase):
    def test_resolve_function_from_path_simple_function(self):
        # Test with a known Django function instead of a local function
        function_path = "django.test.TestCase.setUp"

        result = resolve_function_from_path(function_path)

        self.assertEqual(result, TestCase.setUp)

    def test_resolve_function_from_path_invalid_format(self):
        with self.assertRaises(ValueError) as context:
            resolve_function_from_path("invalid")

        self.assertIn("Invalid function path format", str(context.exception))

    def test_resolve_function_from_path_nonexistent_module(self):
        with self.assertRaises(ImportError):
            resolve_function_from_path("nonexistent.module.function")

    def test_resolve_function_from_path_nonexistent_function(self):
        with self.assertRaises(AttributeError):
            resolve_function_from_path("django.test.TestCase.test_nonexistent")

    def test_resolve_function_from_path_not_callable(self):
        with self.assertRaises(ValueError) as context:
            resolve_function_from_path("django.test.TestCase.__module__")

        self.assertIn("does not resolve to a callable function", str(context.exception))

    def test_resolve_function_from_path_class_method(self):
        # Test with a known Django method
        function_path = "django.test.TestCase.setUpClass"

        result = resolve_function_from_path(function_path)

        self.assertEqual(result, TestCase.setUpClass)

    def test_resolve_function_from_path_single_part(self):
        with self.assertRaises(ValueError) as context:
            resolve_function_from_path("function")

        self.assertIn("Invalid function path format", str(context.exception))
