import logging
from typing import Any, Type
from django.core.files.base import ContentFile
from django.db.models.signals import post_save
from django.dispatch import receiver
from reporting.models.report_attachment import ReportAttachment
from django.core.files.storage import default_storage

logger = logging.getLogger(__name__)


@receiver(post_save, sender=ReportAttachment)
def handle_save_report_attachment_fixture(
    sender: Type[ReportAttachment], instance: ReportAttachment, **kwargs: dict[str, Any]
) -> None:
    """
    Handler that creates attachments on the storage medium (cloud or local storage)
    when the fixture is loaded
    """

    if not kwargs['raw']:
        # raw=True is passed only for a fixture
        # https://docs.djangoproject.com/en/5.2/topics/db/fixtures/#how-fixtures-are-saved-to-the-database
        return

    logger.info(f"Post-save: saving file fixture to storage {instance.attachment.name}")
    default_storage.save(
        instance.attachment.name,
        content=ContentFile(f"Attachment Fixture {instance.attachment.name}".encode('utf-8')),
    )
