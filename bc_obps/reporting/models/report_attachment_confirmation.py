from django.db import models
from registration.models.time_stamped_model import TimeStampedModel
from reporting.models.report_version import ReportVersion
from reporting.models.triggers import immutable_report_version_trigger
from reporting.models.rls_configs.report_attachment_confirmation import Rls as ReportAttachmentConfirmationRls


class ReportAttachmentConfirmation(TimeStampedModel):
    """
    A model storing the report attachment confirmation information for a report.
    """

    report_version = models.ForeignKey(
        ReportVersion,
        on_delete=models.CASCADE,
        related_name="report_attachment_confirmation",
        db_comment="The report this report attachment confirmation information relates to",
    )
  
    acknowledgement_of_information = models.BooleanField(
        null=True,
        blank=True,
        db_comment="Whether the user has understood that this information is being collected for the purpose of emission reporting under the Greenhouse Gas Industrial Reporting and Control Act and may be disclosed to the Ministry responsible for the administration and enforcement of the Carbon Tax Act.",
    )

    acknowledgement_of_information_2 = models.BooleanField(
        null=True,
        blank=True,
        db_comment="Whether the user has understood that this information is being collected for the purpose of emission reporting under the Greenhouse Gas Industrial Reporting and Control Act and may be disclosed to the Ministry responsible for the administration and enforcement of the Carbon Tax Act.",
    )


    class Meta(TimeStampedModel.Meta):
        db_table = 'erc"."report_attachment_confirmation'
        app_label = "reporting"
        db_table_comment = (
            "Stores information about the report attachment confirmation of a report, including the user's certification of due diligence, "
            "understanding of the report's purpose, and the impact of the information provided. "
            "Also stores the user's signature and the date and time of the report attachment confirmation."
        )
        triggers = [
            *TimeStampedModel.Meta.triggers,
            immutable_report_version_trigger(),
        ]

    Rls = ReportAttachmentConfirmationRls
