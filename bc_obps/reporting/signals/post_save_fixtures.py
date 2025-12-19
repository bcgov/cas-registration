import logging
from typing import Any, Type
from django.conf import settings
from django.core.files.base import ContentFile
from django.db.models.signals import post_save
from django.dispatch import receiver
from reporting.models.report_attachment import ReportAttachment
from django.core.files.storage import default_storage

logger = logging.getLogger(__name__)


def setup_signal() -> None:
    logger.critical("Setting up post-save signal: Declaring task")

    @receiver(post_save, sender=ReportAttachment)
    def handle_save_report_attachment_fixture(
        sender: Type[ReportAttachment], instance: ReportAttachment, **kwargs: dict[str, Any]
    ) -> None:
        """
        Handler that creates attachments on the storage medium (cloud or local storage)
        when the fixture is loaded
        """
        logger.critical(f"Post-save: Attachment saved: {instance.attachment.name}")

        if not kwargs['raw']:
            logger.critical(f"Post-save: Exiting kwargs['raw']={kwargs["raw"]}")
            # raw=True is passed only for a fixture
            # https://docs.djangoproject.com/en/5.2/topics/db/fixtures/#how-fixtures-are-saved-to-the-database
            return

        logger.critical(f"Post-save: uploading file with {type(default_storage).__name__}")
        default_storage.save(
            instance.attachment.name,
            content=ContentFile(f"Attachment Fixture {instance.attachment.name}".encode('utf-8')),
        )


if settings.ENVIRONMENT != 'prod':
    setup_signal()
