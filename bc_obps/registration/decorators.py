import traceback
from typing import Any, Callable
from service.error_service.handle_exception import handle_exception
from functools import wraps


def handle_http_errors() -> Callable[[Callable[..., Any]], Callable[..., Any]]:
    """
    Decorator to wrap a function in a try-except block and handle exceptions.

    """

    def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
        @wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            try:
                return func(*args, **kwargs)
            except Exception as e:
                print(traceback.format_exc())
                return handle_exception(e)

        return wrapper

    return decorator
