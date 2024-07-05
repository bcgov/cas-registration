from common.models import BaseModel
from django.db import models
from registration.models import ReportingActivity, RegulatedProduct
from reporting.models import ReportVersion


class ReportFacility(BaseModel):

    report_version = models.ForeignKey(
        ReportVersion,
        on_delete=models.CASCADE,
        db_comment="The report this facility information is related to",
        related_name="report_facilities",
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
        db_table = 'erc"."report_facility'
        app_label = 'reporting'
