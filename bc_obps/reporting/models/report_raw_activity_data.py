"""
Model for storing raw activity data before processing.
"""

from django.db import models
from registration.models.time_stamped_model import TimeStampedModel
from registration.models.activity import Activity
from reporting.models.facility_report import FacilityReport
from reporting.models.triggers import immutable_report_version_trigger


class ReportRawActivityData(TimeStampedModel):
    """
    A model to store raw activity data collected from forms before processing.
    This data is associated with a specific facility report and activity.
    """

    facility_report = models.ForeignKey(
        FacilityReport,
        on_delete=models.CASCADE,
        related_name="%(class)s_records",
        db_comment="The facility report this raw activity JSON data belongs to",
    )

    activity = models.ForeignKey(
        Activity,
        on_delete=models.PROTECT,
        related_name="%(class)s_records",
        db_comment="The reporting activity this raw activity JSON data applies to",
    )

    json_data = models.JSONField(
        db_comment="The raw activity JSON data collected from the form before processing",
    )

    class Meta(TimeStampedModel.Meta):
        """Meta class for ReportRawActivityData."""

        db_table = 'erc"."report_raw_activity_data'
        app_label = "reporting"
        db_table_comment = "Stores raw activity JSON data before processing into report activities"
        constraints = [
            models.UniqueConstraint(
                name="unique_raw_data_facility_report_activity",
                fields=["facility_report", "activity"],
            )
        ]
        triggers = [
            *TimeStampedModel.Meta.triggers,
            immutable_report_version_trigger(),
        ]

    def __str__(self) -> str:
        """String representation of the ReportRawActivityData instance."""
        return f"Raw Activity JSON Data for {self.facility_report} - {self.activity}"
