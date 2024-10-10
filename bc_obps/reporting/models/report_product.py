from django.db import models
from registration.models.regulated_product import RegulatedProduct
from registration.models.time_stamped_model import TimeStampedModel
from reporting.models.facility_report import FacilityReport
from reporting.models.report_version import ReportVersion


class ReportProduct(TimeStampedModel):
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

    unit = models.CharField(max_length=1000, db_comment="The unit the production is reported in, e.g. kg, tonnes, etc.")
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
