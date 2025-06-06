from django.db import models
from django.db.models import Q
from reporting.models import report_version
from reporting.models.facility_report import FacilityReport
from registration.models.time_stamped_model import TimeStampedModel
from reporting.models.triggers import immutable_report_version_trigger
from reporting.models.rls_configs.report_emission_allocation import (
    Rls as ReportEmissionAllocationRls,
)


class ReportEmissionAllocation(TimeStampedModel):
    """
    A model to store the emission allocation information of a facility report
    """

    class AllocationMethodologyChoices(models.TextChoices):
        CALCULATOR = ("OBPS Allocation Calculator",)
        OTHER = "Other"
        NOT_APPLICABLE = "Not Applicable"

    report_version = models.ForeignKey(
        report_version.ReportVersion,
        on_delete=models.CASCADE,
        related_name="%(class)s_records",
        db_comment="The report version this data is associated with",
    )
    facility_report = models.ForeignKey(
        FacilityReport,
        on_delete=models.CASCADE,
        related_name="%(class)s_records",
        db_comment="The facility report this data belongs to",
    )
    allocation_methodology = models.CharField(
        max_length=255,
        choices=AllocationMethodologyChoices.choices,
        default=AllocationMethodologyChoices.NOT_APPLICABLE,
        db_comment="The methodology used to calculate the allocated emissions",
    )
    allocation_other_methodology_description = models.TextField(
        blank=True,
        null=True,
        db_comment="A description of the methodology used if 'Other' is selected",
    )

    class Meta(TimeStampedModel.Meta):
        db_table = 'erc"."report_emission_allocation'
        db_table_comment = "A table to store the emission allocation information of a facility report"
        app_label = "reporting"
        constraints = [
            models.UniqueConstraint(
                fields=[
                    "report_version",
                    "facility_report",
                ],
                name="unique_report_emission_allocation",
            ),
            models.CheckConstraint(
                name="allocation_other_methodology_must_have_description",
                check=~Q(
                    allocation_methodology="Other",
                    allocation_other_methodology_description__isnull=True,
                ),
                violation_error_message="A value for allocation_other_methodology_description must be provided if allocation_methodology is 'Other'",
            ),
        ]
        triggers = [
            *TimeStampedModel.Meta.triggers,
            immutable_report_version_trigger(),
        ]

    Rls = ReportEmissionAllocationRls
