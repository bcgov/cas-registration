from django.db import models
from django.db.models import CharField, FileField, ForeignKey
from registration.models.time_stamped_model import TimeStampedModel
from reporting.models.report_version import ReportVersion

FOLDER_NAME = 'report_attachments/%Y/'


class ReportAttachment(TimeStampedModel):

    class ReportAttachmentType(models.TextChoices):
        verification_statement = "verification_statement"
        wci_352_362 = "wci_352_362"
        additional_reportable_information = "additional_reportable_information"
        confidentiality_request = "confidentiality_request"

    report_version = ForeignKey(
        ReportVersion,
        on_delete=models.CASCADE,
        related_name="report_attachments",
        db_comment="The report version this attachment belongs to",
    )
    attachment = FileField(upload_to=FOLDER_NAME, db_comment="A file uploaded as an attachment to a report")
    attachment_type = CharField(
        max_length=1000,
        choices=ReportAttachmentType.choices,
        db_comment="The type of attachment this record represents",
    )

    class Meta:
        db_table_comment = "Table containing the file information for the report attachments"
        db_table = 'erc"."report_attachment'
        app_label = "reporting"
        constraints = [
            # Check that only one attachment type is present, except if the attachment type is 'other'
            models.UniqueConstraint(
                name="unique_attachment_type_per_report_version",
                fields=['report_version', 'attachment_type'],
            )
        ]
