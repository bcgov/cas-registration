import inspect
from typing import Any, Callable, Dict, Tuple
from .serialization import _serialize_value


def extract_function_parameters(args: Tuple[Any, ...], kwargs: Dict[str, Any], func: Callable) -> Dict[str, Any]:
    """
    Extract and serialize function parameters for retry task creation.
    Only works with standalone functions, not class methods.

    Args:
        args: Positional arguments passed to the function
        kwargs: Keyword arguments passed to the function
        func: The function being decorated

    Returns:
        Dictionary of serialized parameters ready for storage
    """
    serialized_params = {}

    # Process explicit keyword arguments
    for key, value in kwargs.items():
        serialized_params[str(key)] = _serialize_value(value)

    # Process positional arguments for standalone functions
    sig = inspect.signature(func)
    param_names = list(sig.parameters.keys())

    # Map positional args to their parameter names
    for i, arg in enumerate(args):
        if i < len(param_names):
            param_name = param_names[i]
            serialized_params[param_name] = _serialize_value(arg)

    return serialized_params
