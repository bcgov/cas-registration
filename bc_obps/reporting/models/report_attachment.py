from django.db import models
from django.db.models import CharField, FileField, ForeignKey
from registration.models.time_stamped_model import TimeStampedModel
from reporting.models.report_version import ReportVersion
from reporting.models.triggers import immutable_report_version_trigger
from reporting.models.rls_configs.report_attachment import Rls as ReportAttachmentRls

FOLDER_NAME = "report_attachments/%Y/"


class ReportAttachment(TimeStampedModel):
    class ReportAttachmentType(models.TextChoices):
        VERIFICATION_STATEMENT = "verification_statement"
        WCI_352_362 = "wci_352_362"
        ADDITIONAL_REPORTABLE_INFORMATION = "additional_reportable_information"
        CONFIDENTIALITY_REQUEST = "confidentiality_request"

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
    attachment_name = CharField(
        max_length=1000,
        db_comment="The name of the original file that was uploaded, since django adds a hash to avoid file name collisions",
    )

    class Meta(TimeStampedModel.Meta):
        db_table_comment = "Table containing the file information for the report attachments"
        db_table = 'erc"."report_attachment'
        app_label = "reporting"
        constraints = [
            # Check that only one attachment type is present per report version
            models.UniqueConstraint(
                name="unique_attachment_type_per_report_version",
                fields=["report_version", "attachment_type"],
            )
        ]
        triggers = [
            *TimeStampedModel.Meta.triggers,
            immutable_report_version_trigger(),
        ]

    Rls = ReportAttachmentRls
