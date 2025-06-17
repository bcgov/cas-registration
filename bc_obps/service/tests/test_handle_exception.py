import pytest
import json
from django.http import HttpRequest
from django.db.utils import InternalError, ProgrammingError, DatabaseError
from django.core.exceptions import ValidationError, ObjectDoesNotExist
from ninja.responses import Response
from unittest.mock import patch
from compliance.service.bc_carbon_registry.exceptions import BCCarbonRegistryError
from compliance.service.exceptions import ComplianceInvoiceError
from registration.constants import UNAUTHORIZED_MESSAGE
from common.exceptions import UserError
from service.error_service.handle_exception import ExceptionHandler, ExceptionResponse, handle_exception


@pytest.fixture
def mock_request():
    return HttpRequest()


@pytest.fixture
def mock_settings():
    with patch("service.error_service.handle_exception.settings") as mock:
        mock.DEBUG = "True"
        mock.SENTRY_ENVIRONMENT = "prod"
        yield mock


class TestExceptionHandler:
    def test_debug_log_exception_debug_true(self, mock_settings, capsys):
        ExceptionHandler.debug_log_exception()
        captured = capsys.readouterr()
        assert "ERROR START" in captured.out
        assert "ERROR END" in captured.out

    def test_debug_log_exception_debug_false(self, mock_settings, capsys):
        mock_settings.DEBUG = "False"
        ExceptionHandler.debug_log_exception()
        captured = capsys.readouterr()
        assert captured.out == ""

    @patch("service.error_service.handle_exception.capture_exception")
    @patch("service.error_service.handle_exception.set_tag")
    def test_capture_sentry_exception_prod(self, mock_set_tag, mock_capture, mock_settings):
        exc = Exception("Test")
        event_id = ExceptionHandler.capture_sentry_exception(exc, "test_tag")
        mock_set_tag.assert_called_once_with("test_tag", True)
        mock_capture.assert_called_once_with(exc)
        assert event_id is not None

    def test_capture_sentry_exception_non_prod(self, mock_settings):
        mock_settings.SENTRY_ENVIRONMENT = "dev"
        result = ExceptionHandler.capture_sentry_exception(Exception("Test"), "test_tag")
        assert result is None

    def test_get_response_body_string_message(self):
        exc = Exception("Test")
        config = ExceptionResponse("Static message", 400)
        body = ExceptionHandler.get_response_body(exc, config)
        assert body == {"message": "Static message"}

    def test_get_response_body_callable_message(self):
        exc = Exception("Test")
        config = ExceptionResponse(lambda e: str(e), 400)
        body = ExceptionHandler.get_response_body(exc, config)
        assert body == {"message": "Test"}

    def test_handle_unauthorized(self, mock_request):
        exc = Exception(UNAUTHORIZED_MESSAGE)
        response = ExceptionHandler.handle(mock_request, exc)
        assert response.status_code == 401
        assert json.loads(response.content) == {"message": UNAUTHORIZED_MESSAGE}

    @patch("service.error_service.handle_exception.generate_useful_error", return_value="Validation error")
    def test_handle_validation_error(self, mock_request):
        exc = ValidationError("Invalid")
        response = ExceptionHandler.handle(mock_request, exc)
        assert response.status_code == 422
        assert json.loads(response.content) == {"message": "Validation error"}

    @patch("service.error_service.handle_exception.ExceptionHandler.capture_sentry_exception", return_value="12345")
    @patch("service.error_service.handle_exception.logger.critical")
    @pytest.mark.parametrize(
        "exception_type,exception_message",
        [
            (InternalError, "DB error"),
            (ProgrammingError, "Programming error"),
            (DatabaseError, "Database error"),
        ],
    )
    def test_handle_database_errors(self, mock_logger, mock_request, exception_type, exception_message):
        exc = exception_type(exception_message)
        response = ExceptionHandler.handle(mock_request, exc)
        assert response.status_code == 500
        assert json.loads(response.content)["message"].startswith("Internal Server Error.")
        assert "Reference ID: 12345" in json.loads(response.content)["message"]
        mock_logger.assert_called()

    @patch("service.error_service.handle_exception.ExceptionHandler.capture_sentry_exception", return_value="67890")
    @patch("service.error_service.handle_exception.logger.critical")
    def test_handle_unexpected_error(self, mock_logger, mock_request):
        exc = Exception("Unexpected")
        response = ExceptionHandler.handle(mock_request, exc)
        assert response.status_code == 500
        assert json.loads(response.content) == {"message": "Unexpected"}
        mock_logger.assert_called_with("Unexpected error. Sentry Reference ID: 67890", exc_info=True)

    def test_handle_object_does_not_exist(self, mock_request):
        exc = ObjectDoesNotExist("Not found")
        response = ExceptionHandler.handle(mock_request, exc)
        assert response.status_code == 404
        assert json.loads(response.content) == {"message": "Not Found"}

    def test_handle_user_error(self, mock_request):
        exc = UserError("User error")
        response = ExceptionHandler.handle(mock_request, exc)
        assert response.status_code == 400
        assert json.loads(response.content) == {"message": "User error"}

    def test_handle_permission_error(self, mock_request):
        exc = PermissionError("No permission")
        response = ExceptionHandler.handle(mock_request, exc)
        assert response.status_code == 403
        assert json.loads(response.content) == {"message": "Permission denied."}

    def test_handle_bc_carbon_registry_error(self, mock_request):
        exc = BCCarbonRegistryError("BC Carbon Registry error")
        response = ExceptionHandler.handle(mock_request, exc)
        assert response.status_code == 400
        assert json.loads(response.content) == {
            "message": "The system cannot connect to the external application. Please try again later. If the problem persists, contact GHGRegulator@gov.bc.ca for help."
        }

    def test_handle_compliance_invoice_error(self, mock_request):
        exc = ComplianceInvoiceError("missing_data", "Required invoice data is missing")
        response = ExceptionHandler.handle(mock_request, exc)
        assert response.status_code == 400
        assert json.loads(response.content) == {
            "message": "An unexpected error occurred while generating your compliance invoice. Please try again, or contact support if the problem persists."
        }


def test_global_handle_exception(mock_request):
    exc = Exception("Test")
    with patch.object(
        ExceptionHandler, "handle", return_value=Response({"message": "Test"}, status=400)
    ) as mock_handle:
        response = handle_exception(mock_request, exc)
        mock_handle.assert_called_once_with(mock_request, exc)
        assert response.status_code == 400
        assert json.loads(response.content) == {"message": "Test"}
