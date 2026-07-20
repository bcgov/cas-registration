from django.db import models
from common.enums import Schemas
from registration.enums.enums import RegistrationTableNames
from registration.models import TimeStampedModel
from simple_history.models import HistoricalRecords
from registration.models.rls_configs.pdf_document_contents import Rls as PDFDocumentContentsRls
from django.core.files.storage import default_storage


class PDFDocumentContents(TimeStampedModel):
    extracted_text = models.TextField(
        blank=True,
        null=True,
        db_comment="The extracted text contents of the PDF document. This field may be null if the PDF could not be processed."
    )
    report_attachment = models.ForeignKey(
        "reporting.ReportAttachment",
        related_name="pdf_contents",
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        db_comment="The document this PDF content is associated with. Foreign key to erc.report_attachment",
    )
    history = HistoricalRecords(
        table_name='erc_history"."pdf_document_contents_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta(TimeStampedModel.Meta):
        db_table_comment = (
            "Table that contains extracted text contents of uploaded PDF documents."
        )
        db_table = f'{Schemas.ERC.value}"."{RegistrationTableNames.PDF_DOCUMENT_CONTENTS.value}'

    Rls = PDFDocumentContentsRls



