from django.db import models
from reporting.models import report_version
from reporting.models.facility_report import FacilityReport
from registration.models.time_stamped_model import TimeStampedModel
from reporting.models.emission_category import EmissionCategory
from reporting.models.report_product import ReportProduct


class ReportProductEmissionAllocation(TimeStampedModel):
    """
    A model to store the allocated ammount of emissions for a given product
    """

    report_version = models.ForeignKey(
        report_version.ReportVersion,
        on_delete=models.PROTECT,
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
        on_delete=models.PROTECT,
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
        max_digits=10,
        decimal_places=4,
        db_comment="The quantity of emissions allocated to this product in tonnes of CO2 equivalent(tCO2e)",
    )

    class Meta:
        db_table = 'erc"."report_product_emission_allocation'
        db_table_comment = "A table to store the allocated ammount of emissions for a given product"
