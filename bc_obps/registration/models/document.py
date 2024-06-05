import typing
from django.db import models
from registration.models import DocumentType, TimeStampedModel
from simple_history.models import HistoricalRecords
from django.core.files.storage import default_storage


class Document(TimeStampedModel):
    """Document model"""

    file = models.FileField(upload_to="documents", db_comment="The file format, metadata, etc.")
    type = models.ForeignKey(
        DocumentType,
        on_delete=models.DO_NOTHING,
        related_name="documents",
        db_comment="Type of document, e.g., boundary map",
    )
    description = models.CharField(max_length=1000, blank=True, null=True, db_comment="Description of the document")
    history = HistoricalRecords(
        table_name='erc_history"."document_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = (
            "Table that contains information about documents such as file metadata, type, and description."
        )
        db_table = 'erc"."document'
        indexes = [
            models.Index(fields=["type"], name="document_type_idx"),
        ]

    @typing.no_type_check
    def delete(self, *args, **kwargs):
        # Delete the file from Google Cloud Storage before deleting the model instance
        if self.file:
            default_storage.delete(self.file.name)

        super().delete(*args, **kwargs)
