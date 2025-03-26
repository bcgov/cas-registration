from django.db import models
from registration.models.time_stamped_model import TimeStampedModel
from reporting.models.report_version import ReportVersion
from reporting.models.triggers import immutable_report_version_trigger
from reporting.models.rls_configs.report_sign_off import Rls as ReportSignOffRls


class ReportSignOff(TimeStampedModel):
    """
    A model storing the sign-off information for a report.
    """

    report_version = models.ForeignKey(
        ReportVersion,
        on_delete=models.CASCADE,
        related_name="report_sign_off",
        db_comment="The report this sign-off information relates to",
    )

    acknowledgement_of_review = models.BooleanField(
        default=False,
        db_comment="Whether the user has certified that they have reviewed the report, and that they have ensured that the information included in this report is true and complete.",
    )
    acknowledgement_of_records = models.BooleanField(
        default=False,
        db_comment="Whether the user has understood that the information provided in the report may require records from the Operator evidencing the truth of this report.",
    )
    acknowledgement_of_information = models.BooleanField(
        null=True,
        blank=True,
        db_comment="Whether the user has understood that this information is being collected for the purpose of emission reporting under the Greenhouse Gas Industrial Reporting and Control Act and may be disclosed to the Ministry responsible for the administration and enforcement of the Carbon Tax Act.",
    )
    acknowledgement_of_possible_costs = models.BooleanField(
        default=False,
        db_comment="Whether the user has understood that the information provided in this report can impact any compliance obligation of this operation and that any errors, omissions, or misstatements can lead to an additional compliance obligation or administrative penalties.",
    )
    acknowledgement_of_new_version = models.BooleanField(
        null=True,
        blank=True,
        db_comment="Whether the user has understood that the sign-off is creating a new report version that will be the report for the reporting or compliance period that it pertains to.",
    )
    signature = models.TextField(
        db_comment="The signature of the user who signed off the report",
    )

    signing_date = models.DateTimeField(
        db_comment="The date and time the report was signed off",
    )

    class Meta(TimeStampedModel.Meta):
        db_table = 'erc"."report_sign_off'
        app_label = "reporting"
        db_table_comment = (
            "Stores information about the sign-off of a report, including the user's certification of due diligence, "
            "understanding of the report's purpose, and the impact of the information provided. "
            "Also stores the user's signature and the date and time of the sign-off."
        )
        triggers = [
            *TimeStampedModel.Meta.triggers,
            immutable_report_version_trigger(),
        ]

    Rls = ReportSignOffRls
