"""
Test endpoints for error tracking POC (Raygun and Better Stack).

These endpoints are for testing error tracking integrations.
"""

from django.http import HttpRequest
from ninja import Router
from typing import Literal, Tuple

router = Router()


@router.get(
    "/test-errors/backend",
    tags=["Error Testing"],
    description="Test endpoint to raise various types of errors for error tracking POC",
)
def test_backend_errors(
    request: HttpRequest,
    error_type: Literal["value_error", "runtime_error", "key_error", "attribute_error"] = "value_error",
) -> Tuple[Literal[500], dict]:
    """
    Raise a test error to test error tracking (Raygun/Better Stack).

    Args:
        error_type: Type of error to raise
            - value_error: ValueError
            - runtime_error: RuntimeError
            - key_error: KeyError
            - attribute_error: AttributeError
    """
    error_messages = {
        "value_error": "Test ValueError for error tracking POC",
        "runtime_error": "Test RuntimeError for error tracking POC",
        "key_error": "Test KeyError for error tracking POC",
        "attribute_error": "Test AttributeError for error tracking POC",
    }

    message = error_messages.get(error_type, "Test error for error tracking POC")

    if error_type == "value_error":
        raise ValueError(message)
    elif error_type == "runtime_error":
        raise RuntimeError(message)
    elif error_type == "key_error":
        test_dict = {}
        _ = test_dict["missing_key"]  # This will raise KeyError
    elif error_type == "attribute_error":
        test_obj = object()
        _ = test_obj.nonexistent_attribute  # This will raise AttributeError

    return 500, {"message": "This should not be reached"}
