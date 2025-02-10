from django.db import models
from registration.models.time_stamped_model import TimeStampedModel
from reporting.models.report_version import ReportVersion
from reporting.models.triggers import immutable_report_version_trigger


class ReportNewEntrant(TimeStampedModel):
    report_version = models.ForeignKey(
        ReportVersion,
        on_delete=models.CASCADE,
        related_name="report_new_entrant",
        db_comment="The associated report version for this new entrant record",
    )
    authorization_date = models.DateTimeField(
        db_comment="Date of authorization for emission reporting",
    )
    first_shipment_date = models.DateTimeField(
        db_comment="Date of the first shipment related to this report (if applicable)",
    )
    new_entrant_period_start = models.DateTimeField(
        db_comment="Start date of the new entrant reporting period",
    )
    assertion_statement = models.BooleanField(
        db_comment="Indicates if the assertion statement is certified",
    )

    class Meta(TimeStampedModel.Meta):
        db_table = 'erc"."report_new_entrant'
        app_label = "reporting"
        db_table_comment = "Table storing new entrant emissions data for the reporting system"
        triggers = [
            *TimeStampedModel.Meta.triggers,
            immutable_report_version_trigger(),
        ]
