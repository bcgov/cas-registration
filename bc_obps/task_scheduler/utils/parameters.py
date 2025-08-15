import inspect
import json
from typing import Any, Callable, Dict, Tuple
from django.core.serializers.json import DjangoJSONEncoder


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
        serialized_params[str(key)] = json.loads(json.dumps(value, cls=DjangoJSONEncoder))

    # Process positional arguments for standalone functions
    sig = inspect.signature(func)
    param_names = list(sig.parameters.keys())

    # Map positional args to their parameter names
    for i, arg in enumerate(args):
        if i < len(param_names):
            param_name = param_names[i]
            serialized_params[param_name] = json.loads(json.dumps(arg, cls=DjangoJSONEncoder))

    return serialized_params
