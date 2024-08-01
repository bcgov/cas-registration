from django.db import models
from registration.models import ReportingActivity, RegulatedProduct
from registration.models.facility import Facility
from registration.models.time_stamped_model import TimeStampedModel
from reporting.models import ReportVersion


class FacilityReport(TimeStampedModel):
    '''
    Model representing a report for a single facility.
    A report (each report version) may contain multiple facility reports.
    '''

    facility = models.ForeignKey(
        Facility,
        on_delete=models.DO_NOTHING,
        null=True,
        blank=True,
        db_comment="""The facility record this report was created for, at the time the report was filled out.
        This may be null in the future if the facility disappears or changes ownership.""",
        related_name="facility_reports",
    )

    report_version = models.ForeignKey(
        ReportVersion,
        on_delete=models.CASCADE,
        db_comment="The report this facility information is related to",
        related_name="facility_reports",
    )

    facility_name = models.CharField(
        max_length=1000,
        db_comment="The name of the facility as reported",
    )

    facility_type = models.CharField(
        max_length=1000,
        db_comment="The type of the facility as reported",
    )

    facility_bcghgid = models.CharField(
        max_length=1000,
        db_comment="The BC GHG ID of the facility as reported",
        blank=True,
        null=True,
    )

    # We don't create a backwards relation since these are registration models
    activities = models.ManyToManyField(ReportingActivity, related_name="+")
    products = models.ManyToManyField(RegulatedProduct, related_name="+")

    class Meta:
        db_table_comment = "A table to store individual facility information as part of a report"
        db_table = 'erc"."facility_report'
        app_label = 'reporting'
