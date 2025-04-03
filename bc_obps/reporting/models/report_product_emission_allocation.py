from django.db import models
from reporting.models import report_version
from reporting.models.triggers import immutable_report_version_trigger
from registration.models.time_stamped_model import TimeStampedModel
from reporting.models.emission_category import EmissionCategory
from reporting.models.report_product import ReportProduct
from reporting.models.rls_configs.report_product_emission_allocation import Rls as ReportProductEmissionAllocationRls
from reporting.models.report_emission_allocation import ReportEmissionAllocation


class ReportProductEmissionAllocation(TimeStampedModel):
    """
    A model to store the allocated amount of emissions for a given product
    """

    report_emission_allocation = models.ForeignKey(
        ReportEmissionAllocation,
        on_delete=models.CASCADE,
        related_name="%(class)s_records",
        db_comment="The report emission allocation this emission data belongs to",
    )
    report_version = models.ForeignKey(
        report_version.ReportVersion,
        on_delete=models.CASCADE,
        related_name="%(class)s_records",
        db_comment="The report version this data is associated with",
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

    class Meta(TimeStampedModel.Meta):
        db_table = 'erc"."report_product_emission_allocation'
        db_table_comment = "A table to store the allocated amount of emissions for a given product"
        app_label = "reporting"
        constraints = [
            models.UniqueConstraint(
                fields=[
                    "report_emission_allocation",
                    "report_version",
                    "report_product",
                    "emission_category",
                ],
                name="unique_report_product_emission_allocation",
                violation_error_message="A FacilityReport can only have one ReportProductEmissionAllocation per Report Product and Emission Category",
            ),
        ]
        triggers = [
            *TimeStampedModel.Meta.triggers,
            immutable_report_version_trigger(),
        ]

    Rls = ReportProductEmissionAllocationRls
