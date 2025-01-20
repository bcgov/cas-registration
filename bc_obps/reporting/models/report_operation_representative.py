from django.db import models
from registration.models.time_stamped_model import TimeStampedModel
from reporting.models.report_version import ReportVersion


class ReportOperationRepresentative(TimeStampedModel):
    """
    Represents an operation representative associated with a specific report version.
    """

    report_version = models.ForeignKey(
        ReportVersion,
        on_delete=models.CASCADE,
        related_name="report_operation_representatives",
        db_comment="The report version associated with this operation representative.",
    )
    representative_name = models.CharField(
        max_length=1000,
        db_comment="The name of the operation representative.",
    )
    selected_for_report = models.BooleanField(
        default=True,
        db_comment="Indicates whether this representative is selected for reporting.",
    )

    class Meta:
        db_table = 'erc"."report_operation_representative'
        app_label = 'reporting'
        db_table_comment = (
            "Stores information about operation representatives linked to report versions, "
            "including their selection status for reports."
        )
