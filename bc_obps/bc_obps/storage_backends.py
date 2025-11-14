from datetime import datetime
import os
import re
import shutil
from typing import Any
from django.conf import settings
from django.core.files.storage import FileSystemStorage, Storage
from storages.backends.gcloud import GoogleCloudStorage  # type: ignore
from django.core.files.base import ContentFile


def add_filename_suffix(filename: str, suffix: str | None = None) -> str:
    """
    Small utility to add a suffix to a file name, before a potential extension.
    Defaults to a timestamp integer (YYYYMMDDHHmmSS)
    Example:
      the/path/the_file.txt -> the/path/the_file_20250522245133.txt
    """
    (name, extension) = os.path.splitext(filename)
    file_suffix = suffix if suffix is not None else f'_{datetime.now().strftime("%Y%m%d%H%M%S")}'

    # Remove the last 15 characters if we match a timestamp we inserted previously
    if re.search(r'_20\d{12}$', name) is not None:
        name = name[:-15]

    return f"{name}{file_suffix}{extension}"


def keep_deleted_items(storage_instance: Storage) -> Storage:
    """
    Wrapper function to make a storage instance keep deleted files on the storage.
    This is to allow compatibility with the `simple_history` module which assumes
    file references are kept on the storage medium.
    """
    setattr(storage_instance, "delete", lambda *_: None)
    return storage_instance


class SimpleLocal(FileSystemStorage):
    """Local file storage that is always considered as using the clean bucket."""

    location = os.path.join(settings.MEDIA_ROOT)

    def get_file_bucket(self, name: str) -> str | None:
        return "Clean"

    def duplicate_file(self, name: str) -> str:
        """
        Duplicate a file
        """
        new_file = add_filename_suffix(name)
        shutil.copy2(f"{self.location}/{name}", f"{self.location}/{new_file}")

        return new_file


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
            self._exists_in_clean_bucket(name)
            or self._exists_in_unscanned_bucket(name)
            or self._exists_in_quarantined_bucket(name)
        )

    def get_file_bucket(self, name: str) -> str | None:
        if self._exists_in_clean_bucket(name):
            return "Clean"

        if self._exists_in_unscanned_bucket(name):
            return "Unscanned"

        if self._exists_in_quarantined_bucket(name):
            return "Quarantined"

        return None

    def duplicate_file(self, name: str) -> str:
        """
        Duplicate a file
        """
        new_file = add_filename_suffix(name)

        if not self._exists_in_clean_bucket(name):
            raise Exception("Cannot duplicate an unscanned file")

        bucket = self._clean_handler().bucket
        blob = bucket.blob(name)

        # From the GCP API documentation: For a destination
        # object that does not yet exist, set the if_generation_match precondition to 0.
        blob_copy = bucket.copy_blob(blob, bucket, new_file, if_generation_match=0)

        return blob_copy.name  # type: ignore
