from django.db import models
from registration.models.regulated_product import RegulatedProduct
from registration.models.time_stamped_model import TimeStampedModel
from reporting.models.facility_report import FacilityReport
from reporting.models.report_version import ReportVersion


class ReportProduct(TimeStampedModel):
    """
    A model storing production information for a single product.
    It belongs to a facility report.
    """

    report_version = models.ForeignKey(
        ReportVersion,
        on_delete=models.CASCADE,
        related_name="report_products",
        db_comment="The report this production information relates to",
    )

    facility_report = models.ForeignKey(
        FacilityReport,
        on_delete=models.CASCADE,
        related_name='report_products',
        db_comment="The facility report this production information belongs to",
    )

    product = models.ForeignKey(
        RegulatedProduct,
        on_delete=models.PROTECT,
        related_name='report_products',
        db_comment="The product this production information is about",
    )
    annual_production = models.FloatField(
        db_comment="The total annual production for the product, expressed in the unit of this same model."
    )
    production_data_apr_dec = models.FloatField(
        db_comment="The total production amount for April to December period, expressed in the unit of this same model."
    )
    production_methodology = models.CharField(
        max_length=10000, db_comment="The production methodlogy used to make this product"
    )
    storage_quantity_start_of_period = models.FloatField(
        db_comment="The quantity of product in storage at the beginning of the compliance period, if applicable",
        null=True,
        blank=True,
    )
    storage_quantity_end_of_period = models.FloatField(
        db_comment="The quantity of product in storage at the end of the compliance period, if applicable",
        null=True,
        blank=True,
    )
    quantity_sold_during_period = models.FloatField(
        db_comment="The quantity of product sold during the compliance period, if applicable", null=True, blank=True
    )
    quantity_throughput_during_period = models.FloatField(
        db_comment="The quantity of throughput at point of sale during the compliance period, if applicable",
        null=True,
        blank=True,
    )

    class Meta:
        db_table_comment = (
            "A table storing the production information for a single product, as part of a facility report"
        )
        db_table = 'erc"."report_product'
        app_label = 'reporting'
        constraints = [
            models.UniqueConstraint(
                fields=['facility_report', 'product'],
                name="unique_report_product_per_product_and_facility_report",
                violation_error_message="A FacilityReport can only have one ReportProduct per product",
            ),
        ]