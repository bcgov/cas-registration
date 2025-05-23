import logging
import traceback
from typing import Union, Optional, Any, Callable
from dataclasses import dataclass
from django.conf import settings
from django.http import HttpRequest
from django.db.utils import InternalError, ProgrammingError, DatabaseError
from django.core.exceptions import ValidationError, ObjectDoesNotExist
from ninja.responses import Response
from sentry_sdk import set_tag, capture_exception
from compliance.service.bc_carbon_registry.exceptions import BCCarbonRegistryError
from registration.utils import generate_useful_error
from registration.constants import UNAUTHORIZED_MESSAGE
from common.exceptions import UserError

logger = logging.getLogger(__name__)


@dataclass
class ExceptionResponse:
    message: Optional[Union[str, Callable[[Any], Optional[str]]]]
    status: int
    sentry_tag: Optional[str] = None


class ExceptionHandler:
    EXCEPTION_MAP: dict[tuple[type[BaseException], ...], ExceptionResponse] = {
        (BCCarbonRegistryError,): ExceptionResponse("BC Carbon Registry features not available at this time", 400),
        (UserError,): ExceptionResponse(lambda exc: str(exc), 400),
        (ObjectDoesNotExist,): ExceptionResponse("Not Found", 404),
        (ValidationError,): ExceptionResponse(lambda exc: generate_useful_error(exc), 422),
        (PermissionError,): ExceptionResponse("Permission denied.", 403),
        (InternalError, ProgrammingError, DatabaseError): ExceptionResponse(
            "Internal Server Error.", 500, "database_error"
        ),
    }

    @staticmethod
    def debug_log_exception() -> None:
        """Log exception traceback in debug mode."""
        if settings.DEBUG != "True":
            return
        print("-" * 48 + "ERROR START" + "-" * 48)
        print(traceback.format_exc())
        print("-" * 48 + "ERROR END" + "-" * 48)

    @staticmethod
    def capture_sentry_exception(exc: Any, tag: Optional[str] = None) -> Optional[str]:
        """Capture exception in Sentry with optional tag."""
        if settings.SENTRY_ENVIRONMENT != "prod":
            return None
        if tag:
            set_tag(tag, True)
        return capture_exception(exc)

    @classmethod
    def get_response_body(cls, exc: BaseException, response_config: ExceptionResponse) -> dict:
        """Generate response body based on exception and config."""
        message = response_config.message
        if callable(message):
            message = message(exc)
        return {"message": message}

    @classmethod
    def handle(cls, request: HttpRequest, exc: Union[BaseException, type[BaseException]]) -> Response:
        """Handle exceptions and return appropriate API response."""
        cls.debug_log_exception()

        # Handle unauthorized access
        if exc.args and exc.args[0] == UNAUTHORIZED_MESSAGE:
            return Response({"message": UNAUTHORIZED_MESSAGE}, status=401)

        # Check mapped exceptions
        for exc_types, response_config in cls.EXCEPTION_MAP.items():
            if isinstance(exc, exc_types):
                body = cls.get_response_body(exc, response_config)

                # Handle Sentry for specific cases
                if response_config.sentry_tag:
                    event_id = cls.capture_sentry_exception(exc, response_config.sentry_tag)
                    if event_id:
                        body["message"] += f" Reference ID: {event_id}"
                        logger.critical(body["message"], exc_info=True)

                return Response(body, status=response_config.status)

        # Default: unexpected error
        event_id = cls.capture_sentry_exception(exc, "unexpected_error")
        message = str(exc)
        if event_id:
            logger.critical(f"Unexpected error. Sentry Reference ID: {event_id}", exc_info=True)

        return Response({"message": message}, status=400)


def handle_exception(request: HttpRequest, exc: Union[BaseException, type[BaseException]]) -> Response:
    """Global exception handler for Django Ninja API."""
    return ExceptionHandler.handle(request, exc)
