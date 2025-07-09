import json
import logging
from unittest.mock import Mock, patch
from django.test import SimpleTestCase
from compliance.service.bc_carbon_registry.utils import log_error_message


class TestLogErrorMessage(SimpleTestCase):
    def setUp(self):
        self.logger = logging.getLogger('compliance.service.bc_carbon_registry.utils')
        self.logger.setLevel(logging.DEBUG)

    @patch('compliance.service.bc_carbon_registry.utils.logger')
    def test_log_error_message_with_valid_error_response(self, mock_logger):
        """Test logging when exception has valid error response."""
        # Create mock response with error content
        mock_response = Mock()
        mock_response._content = json.dumps([{'errorMessage': 'Test error message'}]).encode('utf-8')

        # Create mock exception with response
        mock_exception = Mock()
        mock_exception.response = mock_response

        # Call the function
        log_error_message(mock_exception)

        # Verify error was logged
        mock_logger.error.assert_called_once_with("BCCR Error message from response: %s", "Test error message")

    @patch('compliance.service.bc_carbon_registry.utils.logger')
    def test_log_error_message_with_no_response_attribute(self, mock_logger):
        """Test logging when exception has no response attribute."""
        # Create mock exception without response
        mock_exception = Mock()
        del mock_exception.response

        # Call the function
        log_error_message(mock_exception)

        # Verify debug was logged
        mock_logger.info.assert_called_with("Exception has no response attribute")

    @patch('compliance.service.bc_carbon_registry.utils.logger')
    def test_log_error_message_with_response_no_content(self, mock_logger):
        """Test logging when response has no _content attribute."""
        # Create mock response without _content
        mock_response = Mock()
        del mock_response._content

        # Create mock exception with response
        mock_exception = Mock()
        mock_exception.response = mock_response

        # Call the function
        log_error_message(mock_exception)

        # Verify debug was logged
        mock_logger.info.assert_called_with("Response has no _content attribute")

    @patch('compliance.service.bc_carbon_registry.utils.logger')
    def test_log_error_message_with_empty_content(self, mock_logger):
        """Test logging when response has empty content."""
        # Create mock response with empty content
        mock_response = Mock()
        mock_response._content = None

        # Create mock exception with response
        mock_exception = Mock()
        mock_exception.response = mock_response

        # Call the function
        log_error_message(mock_exception)

        # Verify debug was logged
        mock_logger.info.assert_called_with("Response content is empty or None")

    @patch('compliance.service.bc_carbon_registry.utils.logger')
    def test_log_error_message_with_invalid_json(self, mock_logger):
        """Test logging when response content is invalid JSON."""
        # Create mock response with invalid JSON
        mock_response = Mock()
        mock_response._content = b"invalid json content"

        # Create mock exception with response
        mock_exception = Mock()
        mock_exception.response = mock_response

        # Call the function
        log_error_message(mock_exception)

        # Verify debug was logged for JSON decode error
        mock_logger.info.assert_called_with(
            "Error parsing exception response: %s", "Expecting value: line 1 column 1 (char 0)"
        )

    @patch('compliance.service.bc_carbon_registry.utils.logger')
    def test_log_error_message_with_non_list_response(self, mock_logger):
        """Test logging when response is not a list."""
        # Create mock response with non-list JSON
        mock_response = Mock()
        mock_response._content = json.dumps({"key": "value"}).encode('utf-8')

        # Create mock exception with response
        mock_exception = Mock()
        mock_exception.response = mock_response

        # Call the function
        log_error_message(mock_exception)

        # Verify debug was logged
        mock_logger.info.assert_called_with("Response does not contain a valid error array")

    @patch('compliance.service.bc_carbon_registry.utils.logger')
    def test_log_error_message_with_empty_list_response(self, mock_logger):
        """Test logging when response is an empty list."""
        # Create mock response with empty list
        mock_response = Mock()
        mock_response._content = json.dumps([]).encode('utf-8')

        # Create mock exception with response
        mock_exception = Mock()
        mock_exception.response = mock_response

        # Call the function
        log_error_message(mock_exception)

        # Verify debug was logged
        mock_logger.info.assert_called_with("Response does not contain a valid error array")

    @patch('compliance.service.bc_carbon_registry.utils.logger')
    def test_log_error_message_with_non_dict_first_item(self, mock_logger):
        """Test logging when first item in response is not a dictionary."""
        # Create mock response with non-dict first item
        mock_response = Mock()
        mock_response._content = json.dumps(["not a dict"]).encode('utf-8')

        # Create mock exception with response
        mock_exception = Mock()
        mock_exception.response = mock_response

        # Call the function
        log_error_message(mock_exception)

        # Verify debug was logged
        mock_logger.info.assert_called_with("First error item is not a dictionary")

    @patch('compliance.service.bc_carbon_registry.utils.logger')
    def test_log_error_message_with_no_error_message_key(self, mock_logger):
        """Test logging when error item has no errorMessage key."""
        # Create mock response with dict but no errorMessage
        mock_response = Mock()
        mock_response._content = json.dumps([{"otherKey": "value"}]).encode('utf-8')

        # Create mock exception with response
        mock_exception = Mock()
        mock_exception.response = mock_response

        # Call the function
        log_error_message(mock_exception)

        # Verify debug was logged
        mock_logger.info.assert_called_with("No errorMessage found in response")

    @patch('compliance.service.bc_carbon_registry.utils.logger')
    def test_log_error_message_with_empty_error_message(self, mock_logger):
        """Test logging when errorMessage is empty."""
        # Create mock response with empty errorMessage
        mock_response = Mock()
        mock_response._content = json.dumps([{"errorMessage": ""}]).encode('utf-8')

        # Create mock exception with response
        mock_exception = Mock()
        mock_exception.response = mock_response

        # Call the function
        log_error_message(mock_exception)

        # Verify debug was logged
        mock_logger.info.assert_called_with("No errorMessage found in response")

    @patch('compliance.service.bc_carbon_registry.utils.logger')
    def test_log_error_message_with_multiple_errors(self, mock_logger):
        """Test logging when response has multiple errors (should log first one)."""
        # Create mock response with multiple errors
        mock_response = Mock()
        mock_response._content = json.dumps([{"errorMessage": "First error"}, {"errorMessage": "Second error"}]).encode(
            'utf-8'
        )

        # Create mock exception with response
        mock_exception = Mock()
        mock_exception.response = mock_response

        # Call the function
        log_error_message(mock_exception)

        # Verify only first error was logged
        mock_logger.error.assert_called_once_with("BCCR Error message from response: %s", "First error")

    @patch('compliance.service.bc_carbon_registry.utils.logger')
    def test_log_error_message_with_real_exception(self, mock_logger):
        """Test logging with a real exception object."""

        # Create a real exception-like object
        class CustomException(Exception):
            def __init__(self, response):
                self.response = response

        # Create mock response
        mock_response = Mock()
        mock_response._content = json.dumps([{'errorMessage': 'Real exception error'}]).encode('utf-8')

        # Create real exception
        exception = CustomException(mock_response)

        # Call the function
        log_error_message(exception)

        # Verify error was logged
        mock_logger.error.assert_called_once_with("BCCR Error message from response: %s", "Real exception error")
