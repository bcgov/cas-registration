import traceback
from typing import Union
from django.http import HttpRequest, Http404
from django.db.utils import InternalError, ProgrammingError
from django.core.exceptions import ValidationError, ObjectDoesNotExist
from bc_obps.settings import DEBUG
from ninja.responses import Response
from registration.utils import generate_useful_error
from registration.constants import UNAUTHORIZED_MESSAGE


def handle_exception(request: HttpRequest, exc: Union[Exception, type[Exception]]) -> Response:
    """
    Global exception handler for Django Ninja API.
    """

    if DEBUG == "True":
        # Print the error in the console for easier debugging
        print("---------------------------------------------ERROR START-----------------------------------------------")
        print(traceback.format_exc())
        print("---------------------------------------------ERROR END-------------------------------------------------")

    if exc.args and exc.args[0] == UNAUTHORIZED_MESSAGE:
        return Response({"message": UNAUTHORIZED_MESSAGE}, status=401)

    if isinstance(exc, (ObjectDoesNotExist, Http404)):
        return Response({"message": "Not Found"}, status=404)

    if isinstance(exc, ValidationError):
        return Response({"message": generate_useful_error(exc)}, status=422)

    if isinstance(exc, PermissionError):
        return Response({"message": "Permission denied."}, status=403)

    if isinstance(exc, (InternalError, ProgrammingError)):
        return Response({"message": "Internal Server Error"}, status=500)

    return Response({"message": str(exc)}, status=400)
