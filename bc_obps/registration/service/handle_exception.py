from registration.utils import (
    generate_useful_error,
)
from django.core.exceptions import ValidationError

from django.http import Http404


def handle_exception(error):
    if isinstance(error, ValidationError):
        return 422, {"message": generate_useful_error(error)}
    elif isinstance(error, Http404):
        return 404, {"message": "Not Found"}
    else:
        return 400, {"message": str(error)}
