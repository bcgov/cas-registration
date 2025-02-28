"""
Signal handlers for the common app.
"""

from django.dispatch import receiver
from events.signals import report_submitted
import logging

logger = logging.getLogger(__name__)


@receiver(report_submitted)
def log_report_submission(sender, **kwargs):
    """
    Example handler that logs when a report is submitted.

    Args:
        sender: The class that sent the signal
        **kwargs: Signal arguments including version_id and user_guid
    """
    version_id = kwargs.get('version_id')
    user_guid = kwargs.get('user_guid')

    logger.info(f"Report version {version_id} was submitted by user {user_guid}")
