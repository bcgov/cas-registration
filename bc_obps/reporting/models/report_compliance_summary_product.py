from django.db import models
from registration.models import RegulatedProduct
from reporting.models import ReportVersion, ReportComplianceSummary
from reporting.models.rls_configs.report_compliance_summary_product import Rls as ReportComplianceSummaryProductRls
from registration.models.time_stamped_model import TimeStampedModel
from reporting.models.triggers import immutable_report_version_trigger


class ReportComplianceSummaryProduct(TimeStampedModel):
    """Reporting Compliance Summary Product model"""

    report_version = models.ForeignKey(
        ReportVersion,
        on_delete=models.CASCADE,
        related_name="report_compliance_summary_products",
        db_comment="The version of the report this compliance summary data relates to",
    )
    report_compliance_summary = models.ForeignKey(
        ReportComplianceSummary,
        on_delete=models.CASCADE,
        related_name="report_compliance_summary_products",
        db_comment="The report_compliance_summary parent object this product data relates to",
    )
    product = models.ForeignKey(
        RegulatedProduct,
        on_delete=models.CASCADE,
        related_name="+",
        db_comment="The id of the regulated_product record this product data is for",
    )
    annual_production = models.DecimalField(
        db_comment="Amount of product produced for the year",
        decimal_places=4,
        max_digits=20,
    )
    apr_dec_production = models.DecimalField(
        db_comment="Amount of product produced between April & December",
        decimal_places=4,
        max_digits=20,
    )
    emission_intensity = models.DecimalField(
        db_comment="The published B.C. productionweighted average emission intensity (PWAEI) for that product found in Schedule A.1 of the GGERR. https://www.bclaws.gov.bc.ca/civix/document/id/lc/statreg/249_2015#ScheduleA",
        decimal_places=4,
        max_digits=10,
    )
    allocated_industrial_process_emissions = models.DecimalField(
        db_comment="Total amount of emissions allocated to this product that are categorised as Industrial Process emissions",
        decimal_places=4,
        max_digits=20,
    )
    allocated_compliance_emissions = models.DecimalField(
        db_comment="Total amount of emissions allocated to this product that are considered as part of the compliance obligation",
        decimal_places=4,
        max_digits=20,
    )

    class Meta:
        db_table_comment = (
            "This table contains the compliance summary data for each product calculated for a regulated operation."
        )
        db_table = 'erc"."report_compliance_summary_product'
        triggers = [
            *TimeStampedModel.Meta.triggers,
            immutable_report_version_trigger(),
        ]

    Rls = ReportComplianceSummaryProductRls
