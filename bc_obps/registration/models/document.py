import typing
from django.db import models
from common.enums import Schemas
from registration.enums.enums import RegistrationTableNames
from registration.models import DocumentType, TimeStampedModel
from simple_history.models import HistoricalRecords
from django.core.files.storage import default_storage
from registration.models.rls_configs.document import Rls as DocumentRls


class Document(TimeStampedModel):
    file = models.FileField(upload_to="documents", db_comment="The file format, metadata, etc.")
    type = models.ForeignKey(
        DocumentType,
        on_delete=models.DO_NOTHING,
        related_name="documents",
        db_comment="Type of document, e.g., boundary map",
    )
    description = models.CharField(max_length=1000, blank=True, null=True, db_comment="Description of the document")
    operation = models.ForeignKey(
        'registration.Operation',
        blank=True,
        null=True,
        on_delete=models.DO_NOTHING,
        related_name="documents",
        db_comment="The operation that the document is about",
    )
    history = HistoricalRecords(
        table_name='erc_history"."document_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta(TimeStampedModel.Meta):
        db_table_comment = (
            "Table that contains information about documents such as file metadata, type, and description."
        )
        db_table = f'{Schemas.ERC.value}"."{RegistrationTableNames.DOCUMENT.value}'

    Rls = DocumentRls

    @typing.no_type_check
    def delete(self, *args, **kwargs):
        # Delete the file from Google Cloud Storage before deleting the model instance
        if self.file:
            default_storage.delete(self.file.name)

        super().delete(*args, **kwargs)
