from django.db import models
from registration.models.time_stamped_model import TimeStampedModel
from reporting.models.report_version import ReportVersion
from reporting.models.triggers import immutable_report_version_trigger
from reporting.models.rls_configs.report_attachment_confirmation import Rls as ReportAttachmentConfirmationRls


class ReportAttachmentConfirmation(TimeStampedModel):
    """
    A model storing the attachment confirmation information for a report.
    """

    report_version = models.ForeignKey(
        ReportVersion,
        on_delete=models.CASCADE,
        related_name="report_attachment_confirmation",
        db_comment="The report this attachment confirmation information relates to",
    )

    confirm_supplementary_required_attachments_uploaded = models.BooleanField(
        null=True,
        blank=True,
        db_comment="Whether the user confirmed that any attachments required for the supplementary report were uploaded.",
    )
    confirm_supplementary_existing_attachments_relevant = models.BooleanField(
        null=True,
        blank=True,
        db_comment="Whether the user confirmed that previously uploaded attachments that have not been updated are still relevant to the supplementary report.",
    )

    class Meta(TimeStampedModel.Meta):
        db_table = 'erc"."report_attachment_confirmation'
        app_label = "reporting"
        db_table_comment = "Table containing attachment confirmation information for the report version"
        triggers = [
            *TimeStampedModel.Meta.triggers,
            immutable_report_version_trigger(),
        ]

    Rls = ReportAttachmentConfirmationRls
