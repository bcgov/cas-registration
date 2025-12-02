from django.http import HttpRequest
from typing import Literal
from ninja import Query
from .router import router


@router.get("/test-sentry")
def test_sentry(
    request: HttpRequest,
    error_type: Literal["value", "runtime", "zero"] = Query("value", description="Type of error to raise"),
) -> None:
    if error_type == "value":
        raise ValueError("Test ValueError for Better Stack integration - Invalid value provided")
    elif error_type == "runtime":
        raise RuntimeError("Test RuntimeError for Better Stack integration - Runtime issue detected")
    elif error_type == "zero":
        _ = 10 / 0  # Raises ZeroDivisionError
    else:
        raise ValueError(f"Unknown error type: {error_type}")
