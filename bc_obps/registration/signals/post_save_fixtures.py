import logging
from typing import Any, Type
from django.conf import settings
from django.core.files.base import ContentFile
from django.db.models.signals import post_save
from django.dispatch import receiver
from registration.models.document import Document
from django.core.files.storage import default_storage

logger = logging.getLogger(__name__)


def setup_signal() -> None:

    logger.critical("Setting up post-save signal: Declaring task")

    @receiver(post_save, sender=Document)
    def handle_save_registration_document_fixture(
        sender: Type[Document], instance: Document, **kwargs: dict[str, Any]
    ) -> None:
        """
        Handler that creates registration documents on the storage medium (cloud or local storage)
        when the fixture is loaded
        """
        logger.critical(f"Post-save: Document saved: {instance.file.name}")

        if not kwargs['raw']:
            logger.critical(f"Post-save: Exiting kwargs['raw']={kwargs["raw"]}")
            # raw=True is passed only for a fixture
            # https://docs.djangoproject.com/en/5.2/topics/db/fixtures/#how-fixtures-are-saved-to-the-database
            return

        logger.critical(f"Post-save: uploading file with {type(default_storage).__name__}")
        default_storage.save(instance.file.name, content=ContentFile(f"Document Fixture {instance.file.name}"))


logger.critical(f"Setting up post-save signal: Checking Environment {settings.ENVIRONMENT}")
if settings.ENVIRONMENT != 'prod':
    setup_signal()
