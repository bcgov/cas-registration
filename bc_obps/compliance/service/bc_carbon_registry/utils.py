import json
import logging

logger = logging.getLogger(__name__)


def log_error_message(exception: Exception) -> None:
    """
    Log error message from an exception object if it exists.

    Args:
        exception: The exception object to extract and log error message from
    """
    try:
        if not hasattr(exception, 'response'):
            logger.info("Exception has no response attribute")
            return
        response = getattr(exception, 'response', None)
        if not hasattr(response, '_content'):
            logger.info("Response has no _content attribute")
            return
        content = getattr(response, '_content', None)
        if not content:
            logger.info("Response content is empty or None")
            return
        # Parse the JSON
        error_data = json.loads(content)

        if not isinstance(error_data, list) or not error_data:
            logger.info("Response does not contain a valid error array")
            return

        first_error = error_data[0]
        if not isinstance(first_error, dict):
            logger.info("First error item is not a dictionary")
            return

        error_message = first_error.get('errorMessage')
        if error_message:
            logger.error("BCCR Error message from response: %s", error_message)
        else:
            logger.info("No errorMessage found in response")

    except (json.JSONDecodeError, AttributeError, IndexError, KeyError) as e:
        logger.info("Error parsing exception response: %s", str(e))
