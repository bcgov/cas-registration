from django.db import models
from registration.models.time_stamped_model import TimeStampedModel
from reporting.models.report_product import ReportProduct
from simple_history.models import HistoricalRecords
from .compliance_summary import ComplianceSummary
from compliance.enums import ComplianceTableNames
from rls.enums import RlsRoles, RlsOperations
from rls.utils.helpers import generate_rls_grants


class ComplianceProduct(TimeStampedModel):
    """Model to store per-product compliance data"""

    compliance_summary = models.ForeignKey(
        ComplianceSummary,
        on_delete=models.PROTECT,
        related_name="products",
        db_comment="The compliance summary this product data belongs to",
    )
    report_product = models.ForeignKey(
        ReportProduct,
        on_delete=models.PROTECT,
        related_name="compliance_products",
        db_comment="The report product this compliance data is for",
    )
    annual_production = models.DecimalField(max_digits=20, decimal_places=4, db_comment="Annual production amount")
    apr_dec_production = models.DecimalField(
        max_digits=20, decimal_places=4, db_comment="April-December production amount"
    )
    emission_intensity = models.DecimalField(
        max_digits=20, decimal_places=4, db_comment="Product weighted average emission intensity"
    )
    allocated_industrial_process_emissions = models.DecimalField(
        max_digits=20, decimal_places=4, db_comment="Allocated industrial process emissions in tCO2e"
    )
    allocated_compliance_emissions = models.DecimalField(
        max_digits=20, decimal_places=4, db_comment="Allocated emissions for compliance in tCO2e"
    )

    history = HistoricalRecords(
        table_name='erc_history"."compliance_product_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Rls:
        role_grants_mapping = {
            # Industry users can view their own compliance products
            RlsRoles.INDUSTRY_USER: [RlsOperations.SELECT],
            # CAS staff can manage compliance products
            RlsRoles.CAS_DIRECTOR: [
                RlsOperations.SELECT,
                RlsOperations.INSERT,
                RlsOperations.UPDATE,
                RlsOperations.DELETE,
            ],
            RlsRoles.CAS_ADMIN: [
                RlsOperations.SELECT,
                RlsOperations.INSERT,
                RlsOperations.UPDATE,
            ],
            RlsRoles.CAS_ANALYST: [
                RlsOperations.SELECT,
                RlsOperations.INSERT,
                RlsOperations.UPDATE,
            ],
            RlsRoles.CAS_VIEW_ONLY: [RlsOperations.SELECT],
        }
        grants = generate_rls_grants(role_grants_mapping, ComplianceTableNames.COMPLIANCE_PRODUCT)

    class Meta(TimeStampedModel.Meta):
        db_table_comment = "A table to store per-product compliance data"
        db_table = 'erc"."compliance_product'
        constraints = [
            models.UniqueConstraint(
                fields=["compliance_summary", "report_product"],
                name="unique_product_per_compliance_summary",
            )
        ]
