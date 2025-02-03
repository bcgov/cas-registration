from django.db import models
from django.db.models import Q
from reporting.models import report_version
from reporting.models.facility_report import FacilityReport
from registration.models.time_stamped_model import TimeStampedModel
from reporting.models.emission_category import EmissionCategory
from reporting.models.report_product import ReportProduct


class ReportProductEmissionAllocation(TimeStampedModel):
    """
    A model to store the allocated ammount of emissions for a given product
    """

    class AllocationMethodologyChoices(models.TextChoices):
        CALCULATOR = ("Calculator",)
        OTHER = "Other"

    report_version = models.ForeignKey(
        report_version.ReportVersion,
        on_delete=models.CASCADE,
        related_name="%(class)s_records",
        db_comment="The report version this emission data is associated with",
    )
    facility_report = models.ForeignKey(
        FacilityReport,
        on_delete=models.CASCADE,
        related_name="%(class)s_records",
        db_comment="The facility report this production information belongs to",
    )
    report_product = models.ForeignKey(
        ReportProduct,
        on_delete=models.CASCADE,
        related_name="%(class)s_records",
        db_comment="The regulated product this emission data has been allocated to",
    )
    emission_category = models.ForeignKey(
        EmissionCategory,
        on_delete=models.PROTECT,
        related_name="%(class)s_records",
        db_comment="The emission category that this emission data belongs to",
    )
    allocated_quantity = models.DecimalField(
        max_digits=20,
        decimal_places=4,
        db_comment="The quantity of emissions allocated to this product in tonnes of CO2 equivalent(tCO2e)",
    )
    allocation_methodology = models.CharField(
        max_length=255,
        choices=AllocationMethodologyChoices.choices,
        default=AllocationMethodologyChoices.CALCULATOR,
        db_comment="The methodology used to calculate the allocated emissions",
    )
    allocation_other_methodology_description = models.TextField(
        blank=True,
        null=True,
        db_comment="A description of the methodology used if 'Other' is selected",
    )

    class Meta(TimeStampedModel.Meta):
        db_table = 'erc"."report_product_emission_allocation'
        db_table_comment = "A table to store the allocated amount of emissions for a given product"
        app_label = 'reporting'
        constraints = [
            models.UniqueConstraint(
                fields=["report_version", "facility_report", "report_product", "emission_category"],
                name="unique_report_product_emission_allocation",
                violation_error_message="A FacilityReport can only have one ReportProductEmissionAllocation per Report Product and Emission Category",
            ),
            models.CheckConstraint(
                name="allocation_other_methodology_must_have_description",
                check=~Q(allocation_methodology="Other", allocation_other_methodology_description__isnull=True),
                violation_error_message="A value for allocation_other_methodology_description must be provided if the allocation_methodology is 'Other'",
            ),
        ]
