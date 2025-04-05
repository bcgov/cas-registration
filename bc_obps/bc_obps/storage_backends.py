import os
from typing import Any
from django.conf import settings
from django.core.files.storage import FileSystemStorage
from storages.backends.gcloud import GoogleCloudStorage  # type: ignore
from django.core.files.base import ContentFile


class SimpleLocal(FileSystemStorage):
    """Local file storage that is always considered as using the clean bucket."""

    location = os.path.join(settings.MEDIA_ROOT)

    def get_file_bucket(self, name: str) -> str | None:
        return "Clean"


class UnifiedGcsStorage(GoogleCloudStorage):
    """
    A storage backend for the clean, quarantined, and unscanned buckets.
    - `_save` always saves to the unscanned bucket.
    - `exists` checks if the file exists in any of the three buckets.
    - `delete` removes the file from all three buckets.
    """

    def __init__(self: Any, *args: Any, **kwargs: Any) -> None:
        self._unscanned_bucket_name = settings.GS_UNSCANNED_BUCKET_NAME
        self._quarantined_bucket_name = settings.GS_QUARANTINED_BUCKET_NAME
        self._clean_bucket_name = settings.GS_CLEAN_BUCKET_NAME

        # Defaults to the clean bucket
        super().__init__(bucket_name=self._clean_bucket_name, *args, **kwargs)

    def _quarantined_handler(self) -> GoogleCloudStorage:
        return GoogleCloudStorage(bucket_name=self._quarantined_bucket_name)

    def _unscanned_handler(self) -> GoogleCloudStorage:
        return GoogleCloudStorage(bucket_name=self._unscanned_bucket_name)

    def _clean_handler(self) -> GoogleCloudStorage:
        return GoogleCloudStorage(bucket_name=self._clean_bucket_name)

    def _save(self, name: str, content: ContentFile) -> Any:
        """Always save to the unscanned bucket."""
        return self._unscanned_handler()._save(name, content)

    def delete(self, name: str) -> None:
        """Delete the file from all three buckets."""
        self._unscanned_handler().delete(name)
        self._quarantined_handler().delete(name)
        self._clean_handler().delete(name)

    def _exists_in_quarantined_bucket(self, name: str) -> bool:
        return self._quarantined_handler().exists(name)  # type: ignore[no-any-return]

    def _exists_in_clean_bucket(self, name: str) -> bool:
        return self._clean_handler().exists(name)  # type: ignore[no-any-return]

    def _exists_in_unscanned_bucket(self, name: str) -> bool:
        return self._unscanned_handler().exists(name)  # type: ignore[no-any-return]

    def exists(self, name: str) -> bool:
        return (
            self._exists_in_quarantined_bucket(name)
            or self._exists_in_clean_bucket(name)
            or self._exists_in_unscanned_bucket(name)
        )

    def get_file_bucket(self, name: str) -> str | None:
        if self._exists_in_quarantined_bucket(name):
            return "Quarantined"
        elif self._exists_in_unscanned_bucket(name):
            return "Unscanned"
        elif self._exists_in_clean_bucket(name):
            return "Clean"
        else:
            return None
