import logging
from typing import Any, Type
from django.core.files.base import ContentFile
from django.db.models.signals import post_save
from django.dispatch import receiver
from registration.models.document import Document
from django.core.files.storage import default_storage

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Document)
def handle_save_registration_document_fixture(
    sender: Type[Document], instance: Document, **kwargs: dict[str, Any]
) -> None:
    """
    Handler that creates registration documents on the storage medium (cloud or local storage)
    when the fixture is loaded
    """

    if not kwargs['raw']:
        # raw=True is passed only for a fixture
        # https://docs.djangoproject.com/en/5.2/topics/db/fixtures/#how-fixtures-are-saved-to-the-database
        return

    logger.info(f"Post-save: saving file fixture to storage {instance.file.name}")
    default_storage.save(
        instance.file.name, content=ContentFile(f"Document Fixture {instance.file.name}".encode("utf-8"))
    )
