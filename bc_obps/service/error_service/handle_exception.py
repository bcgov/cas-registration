"""
Module: handle_exception.py
Description: This module handles http exceptions.
"""
import traceback
from typing import Dict, Literal, Optional, Tuple
from django.http import Http404
from django.core.exceptions import ValidationError, ObjectDoesNotExist
from bc_obps.settings import DEBUG
from registration.utils import generate_useful_error
from registration.constants import UNAUTHORIZED_MESSAGE


def handle_exception(error: Exception) -> Tuple[Literal[400, 401, 403, 404, 422], Dict[str, Optional[str]]]:
    """
    This function handles exceptions for BCEIRS. Returns a 4xx status.
    """
    if DEBUG == "True":
        # Print the error in the console for easier debugging
        print("---------------------------------------------ERROR START-----------------------------------------------")
        print(traceback.format_exc())
        print("---------------------------------------------ERROR END-------------------------------------------------")
    if error.args and error.args[0] == UNAUTHORIZED_MESSAGE:
        return 401, {"message": UNAUTHORIZED_MESSAGE}
    if isinstance(error, (Http404, ObjectDoesNotExist)):
        return 404, {"message": "Not Found"}
    if isinstance(error, ValidationError):
        return 422, {"message": generate_useful_error(error)}
    if isinstance(error, PermissionError):
        return 403, {"message": "Permission denied."}
    return 400, {"message": str(error)}
