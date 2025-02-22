from unittest.mock import patch, MagicMock
from django.test import TestCase, RequestFactory
from django.http import HttpResponse
from model_bakery import baker
from rls.middleware.rls import RlsMiddleware


class TestRlsMiddleware(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.get_response_mock = MagicMock(return_value=HttpResponse("OK"))
        self.middleware = RlsMiddleware(self.get_response_mock)
        self.user = baker.make_recipe("registration.tests.utils.industry_operator_user")

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
        request = self.factory.get("/")
        request.current_user = self.user

        response = self.middleware(request)

        # Assert _set_user_context was called with the correct user GUID
        mock_set_user_context.assert_called_once_with(self.user)
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
        self.middleware._set_user_context(self.user)

        # Assert the database queries were executed with the correct parameters
        mock_cursor.assert_called_once()
        cursor_instance = mock_cursor().__enter__()
        cursor_instance.execute.assert_any_call('set my.guid = %s', [str(self.user.user_guid)])
        cursor_instance.execute.assert_any_call('set role %s', [self.user.app_role.role_name])

    @patch("rls.middleware.rls.connection.cursor")
    def test_set_user_context_logs_error_on_failure(self, mock_cursor):
        mock_cursor.side_effect = Exception("Database error")

        with self.assertLogs("rls.middleware.rls", level="ERROR") as log:
            self.middleware._set_user_context(self.user.user_guid)

        # Assert the error was logged
        self.assertIn("Failed to set user context: Database error", log.output[0])
