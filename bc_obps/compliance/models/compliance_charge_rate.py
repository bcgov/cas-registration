from django.db import models
from registration.models.time_stamped_model import TimeStampedModel
from reporting.models.reporting_year import ReportingYear
from .rls_configs.compliance_charge_rate import Rls as ComplianceChargeRateRls


class ComplianceChargeRate(TimeStampedModel):
    """
    Model to store compliance charge rates by reporting year.
    These rates are used to calculate fees for excess emissions.
    """

    reporting_year = models.OneToOneField(
        ReportingYear,
        on_delete=models.PROTECT,
        related_name='compliance_charge_rate',
        db_comment="The associated reporting year for this compliance charge rate. References erc.reporting_year",
    )
    rate = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        db_comment="The compliance charge rate in CAD dollars per tCO2e (tonnes of carbon dioxide equivalent). These rates are defined by GGIRCA https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/14029_01",
    )

    class Meta(TimeStampedModel.Meta):
        app_label = "compliance"
        db_table_comment = "A table to store compliance charge rates by reporting year"
        db_table = 'erc"."compliance_charge_rate'
        ordering = ['reporting_year']

    Rls = ComplianceChargeRateRls
