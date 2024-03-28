"""
Module: handle_exception.py
Description: This module handles http exceptions.
"""
from django.http import Http404
from django.core.exceptions import ValidationError
from registration.utils import generate_useful_error


def handle_exception(error):
    """
    This function handles exceptions for BCEIRS. Returns a 4xx status.
    """
    # brianna this is catching backend errors so far
    if isinstance(error, ValidationError):
        # return 422, {"message": generate_useful_error(error)}
        # brianna generate_useful_error not working well with handle_http
        return 422, {"message": str(error)}
    if isinstance(error, Http404):
        return 404, {"message": "Not Found"}
    return 400, {"message": str(error)}
