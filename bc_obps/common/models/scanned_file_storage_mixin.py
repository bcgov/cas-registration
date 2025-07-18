import typing

from common.lib import pgtrigger
from django.core.files import File
from django.db import models
from django.core.files.storage import default_storage
from django.db.models.fields.files import FieldFile


class ScannedFileStorageMixin(models.Model):
    class Meta:
        abstract = True

    """
    Base class to add the bucket scanning feature to any django model
    with a FileField.
    Current implementation doesn't support multiple FileFields on a model.

    Requires:
    - The class extending this mixin will need to override `get_file_field()` to return the field on the model (e.g. self.file or self.attachment)
    """

    class FileStatus(models.TextChoices):
        UNSCANNED = "Unscanned"
        CLEAN = "Clean"
        QUARANTINED = "Quarantined"

    status = models.CharField(max_length=100, choices=FileStatus.choices, default=FileStatus.UNSCANNED)

    # Additional remote file methods

    def get_file_field(self) -> FieldFile:
        """
        Models implementing the base file upload will need to override this method to point at the right field
        """
        raise NotImplementedError

    def get_file_url(self) -> str:
        """Get the file url for the document from the proper storage backend."""
        return default_storage.url(self.get_file_field().name)

    def get_file_content(self) -> File | None:
        """Get the file content of the document from the proper storage backend."""
        file_name = self.get_file_field().name
        return default_storage.open(file_name) if file_name else None

    def sync_file_status(self) -> FileStatus:
        """
        Syncs the file status with the bucket, depending on remote malware scanning results
        """
        file_name = self.get_file_field().name

        file_bucket = default_storage.get_file_bucket(file_name)  # type: ignore
        if file_bucket:
            self.status = ScannedFileStorageMixin.FileStatus(file_bucket)
        else:
            raise FileNotFoundError(f"File {file_name} not found in storage.")

        # Ignore the audit columns triggers, we're not changing anything about the document itself
        with pgtrigger.ignore(f"{self._meta.app_label}.{self._meta.object_name}:set_updated_audit_columns"):
            self.save(update_fields=['status'])
        return self.status

    # Django method overrides

    @typing.no_type_check
    def delete(self, *args, **kwargs):
        # Delete the file from Google Cloud Storage before deleting the model instance
        if self.get_file_field():
            default_storage.delete(self.get_file_field().name)

        return super().delete(*args, **kwargs)
