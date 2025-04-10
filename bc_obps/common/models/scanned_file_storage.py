import typing

from django.db import models
from django.core.files.storage import storages


class ScannedFileStorage(
    models.Model,
):
    """
    Base class to

    Implements:
    - A custom save method saving
    """

    class FileStatus(models.TextChoices):
        UNSCANNED = "Unscanned"
        CLEAN = "Clean"
        QUARANTINED = "Quarantined"

    status = models.CharField(
        max_length=100, choices=FileStatus.choices, default=FileStatus.UNSCANNED
    )

    def get_file_field(self) -> models.FileField:
        """
        Models implementing the base file upload will need to override this method to point at the right field
        """
        raise NotImplementedError

    @typing.no_type_check
    def get_storage_handler(self):
        if self.status == ScannedFileStorage.FileStatus.CLEAN:
            return storages["clean"]
        elif self.status == ScannedFileStorage.FileStatus.QUARANTINED:
            return storages["quarantined"]
        elif self.status == ScannedFileStorage.FileStatus.UNSCANNED:
            return storages["default"]
        else:
            return storages["default"]

    @typing.no_type_check
    def save(self, *args, **kwards):
        """Make sure the correct storage backend is set for save based on the malware scanning status."""
        self.get_file_field().storage = self.get_storage_handler()
        super().save(*args, **kwards)

    @typing.no_type_check
    def get_file_url(self) -> str:
        """Get the file url for the document from the proper storage backend."""
        return self.get_storage_handler().url(self.get_file_field().name)

    @typing.no_type_check
    def get_file_content(self) -> str:
        """Get the file content of the document from the proper storage backend."""
        return self.get_storage_handler().open(self.get_file_field().name)

    @typing.no_type_check
    def delete(self, *args, **kwargs):
        # Delete the file from Google Cloud Storage before deleting the model instance
        if self.get_file_field():
            self.get_storage_handler().delete(self.get_file_field().name)

        super().delete(*args, **kwargs)

    class Meta:
        abstract = True
