import logging
import traceback
import sentry_sdk
from typing import Union, Optional, Any
from django.conf import settings
from django.http import HttpRequest, Http404
from django.db.utils import InternalError, ProgrammingError, DatabaseError
from django.core.exceptions import ValidationError, ObjectDoesNotExist
from bc_obps.settings import DEBUG
from ninja.responses import Response
from registration.utils import generate_useful_error
from registration.constants import UNAUTHORIZED_MESSAGE


logger = logging.getLogger(__name__)


def capture_sentry_exception(exc: Any, tag: str = "unexpected_error") -> Optional[str]:
    event_id = sentry_sdk.capture_exception(exc)
    sentry_sdk.set_tag(tag, True)
    return event_id


def handle_exception(request: HttpRequest, exc: Union[BaseException, type[BaseException]]) -> Response:
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

    if isinstance(exc, (InternalError, ProgrammingError, DatabaseError)):
        msg = "Internal Server Error."
        if settings.SENTRY_ENVIRONMENT == "prod":
            event_id = capture_sentry_exception(exc, tag="database_error")
            msg += f" Reference ID: {event_id}"
        logger.critical(msg, exc_info=True)
        return Response({"message": msg}, status=500)

    # Default: catch-all error
    if settings.SENTRY_ENVIRONMENT == "prod":
        event_id = capture_sentry_exception(exc)
        logger.critical(f"Unexpected error. Sentry Reference ID: {event_id}", exc_info=True)

    return Response({"message": str(exc)}, status=400)
