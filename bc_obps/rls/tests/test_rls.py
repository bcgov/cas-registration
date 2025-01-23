from unittest.mock import patch, MagicMock
from uuid import uuid4
from django.test import TestCase, RequestFactory
from django.http import HttpResponse
from registration.models import User
from rls.middleware.rls import RlsMiddleware


class TestRlsMiddleware(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.get_response_mock = MagicMock(return_value=HttpResponse("OK"))
        self.middleware = RlsMiddleware(self.get_response_mock)

    @patch(
        "rls.middleware.rls.settings.MIDDLEWARE",
        [
            "registration.middleware.current_user.CurrentUserMiddleware",
            "rls.middleware.rls.RlsMiddleware",
        ],
    )
    def test_middleware_order_correct(self):
        # No exception should be raised when the middleware order is correct
        RlsMiddleware(self.get_response_mock)

    @patch(
        "rls.middleware.rls.settings.MIDDLEWARE",
        [
            "rls.middleware.rls.RlsMiddleware",
            "registration.middleware.current_user.CurrentUserMiddleware",
        ],
    )
    def test_middleware_order_incorrect(self):
        with self.assertRaises(RuntimeError):
            RlsMiddleware(self.get_response_mock)

    @patch("rls.middleware.rls.RlsMiddleware._set_user_context")
    def test_user_context_set_for_authenticated_user(self, mock_set_user_context):
        user_guid = uuid4()
        user = User(user_guid=user_guid)
        request = self.factory.get("/")
        request.current_user = user

        response = self.middleware(request)

        # Assert _set_user_context was called with the correct user GUID
        mock_set_user_context.assert_called_once_with(user_guid)
        # Assert response is passed correctly
        self.assertEqual(response.content, b"OK")

    @patch("rls.middleware.rls.RlsMiddleware._set_user_context")
    def test_user_context_not_set_for_anonymous_user(self, mock_set_user_context):
        request = self.factory.get("/")
        request.current_user = None

        response = self.middleware(request)

        # Assert _set_user_context was not called
        mock_set_user_context.assert_not_called()
        # Assert response is passed correctly
        self.assertEqual(response.content, b"OK")

    @patch("rls.middleware.rls.connection.cursor")
    def test_set_user_context_executes_set_query(self, mock_cursor):
        user_guid = uuid4()

        self.middleware._set_user_context(user_guid)

        # Assert the database query was executed with the correct parameters
        mock_cursor.assert_called_once()
        mock_cursor().__enter__().execute.assert_called_once_with("set my.guid = %s", [str(user_guid)])

    @patch("rls.middleware.rls.connection.cursor")
    def test_set_user_context_logs_error_on_failure(self, mock_cursor):
        mock_cursor.side_effect = Exception("Database error")
        user_guid = uuid4()

        with self.assertLogs("rls.middleware.rls", level="ERROR") as log:
            self.middleware._set_user_context(user_guid)

        # Assert the error was logged
        self.assertIn("Failed to set user context: Database error", log.output[0])
