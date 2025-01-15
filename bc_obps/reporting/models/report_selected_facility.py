from django.db import models
from registration.models.facility import Facility
from registration.models.time_stamped_model import TimeStampedModel
from reporting.models import ReportVersion


class ReportSelectedFacility(TimeStampedModel):
    '''
    Model representing a the facilities selected for a report.
    A report (each report version) may contain multiple facilities.
    '''

    facility = models.ForeignKey(
        Facility,
        on_delete=models.CASCADE,
        db_comment="The facility selected to be included in the report",
        related_name="report_selected_facilities",
    )

    report_version = models.ForeignKey(
        ReportVersion,
        on_delete=models.CASCADE,
        db_comment="The report this facility is selected for",
        related_name="reprot_selected_facilities",
    )

    class Meta:
        db_table_comment = "A table to store the facilities selected for a report"
        db_table = 'erc"."report_selected_facility'
        app_label = 'reporting'
        constraints = [
            models.UniqueConstraint(
                fields=['report_version', 'facility_id'],
                name="unique_selected_facility_per_facility_and_report_version",
            )
        ]
