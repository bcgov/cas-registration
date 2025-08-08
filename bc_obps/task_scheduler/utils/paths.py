import importlib
from typing import Callable


def get_function_path(func: Callable) -> str:
    """Generate the correct function path for both regular functions and class methods."""
    # Get the module name
    module_name = func.__module__

    # Get the function name - handle different types of callables
    if hasattr(func, '__qualname__'):
        # Class method, static method, or bound method
        qualname = func.__qualname__

        # Handle different qualname formats
        if '.' in qualname:
            # Class method: "ClassName.method_name"
            return f"{module_name}.{qualname}"
        else:
            # Regular function or static method
            return f"{module_name}.{func.__name__}"
    elif hasattr(func, '__self__') and func.__self__ is not None:
        # Bound method
        # Get the class name from the bound object
        class_name = func.__self__.__class__.__name__
        return f"{module_name}.{class_name}.{func.__name__}"
    else:
        # Regular function
        return f"{module_name}.{func.__name__}"


def resolve_function_from_path(function_path: str) -> Callable:
    """
    Resolve a function from its path string dynamically.

    Args:
        function_path: Path to the function (e.g., "module.submodule.Class.method")

    Returns:
        The callable function

    Raises:
        ValueError: If the path is invalid or doesn't resolve to a callable
    """
    parts = function_path.split('.')

    if len(parts) < 2:
        raise ValueError(f"Invalid function path format: {function_path}")

    # Start with the first part as the module
    current_obj = importlib.import_module(parts[0])

    # Traverse through the remaining parts
    for part in parts[1:]:
        current_obj = getattr(current_obj, part)

    # Ensure we have a callable function
    if not callable(current_obj):
        raise ValueError(f"Path {function_path} does not resolve to a callable function")

    return current_obj
