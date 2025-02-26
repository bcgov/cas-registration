from django.db import models
from registration.models.time_stamped_model import TimeStampedModel
from reporting.models.report import Report
from reporting.models.report_version import ReportVersion
from simple_history.models import HistoricalRecords
from .compliance_period import CompliancePeriod


class ComplianceSummary(TimeStampedModel):
    """Model to store compliance summaries for reports"""

    class ComplianceStatus(models.TextChoices):
        OBLIGATION_NOT_MET = "OBLIGATION_NOT_MET", "Obligation Not Met"
        OBLIGATION_FULLY_MET = "OBLIGATION_FULLY_MET", "Obligation Fully Met"
        EARNED_CREDITS = "EARNED_CREDITS", "Earned Credits"

    report = models.ForeignKey(
        Report,
        on_delete=models.PROTECT,
        related_name="compliance_summaries",
        db_comment="The report this compliance summary is for",
    )
    current_report_version = models.ForeignKey(
        ReportVersion,
        on_delete=models.PROTECT,
        related_name="compliance_summaries",
        db_comment="The current version of the report this summary is based on",
    )
    compliance_period = models.ForeignKey(
        CompliancePeriod,
        on_delete=models.PROTECT,
        related_name="compliance_summaries",
        db_comment="The compliance period this summary belongs to",
    )
    emissions_attributable_for_reporting = models.DecimalField(
        max_digits=20, decimal_places=4, db_comment="Total emissions attributable for reporting in tCO2e"
    )
    reporting_only_emissions = models.DecimalField(
        max_digits=20, decimal_places=4, db_comment="Emissions that are for reporting only in tCO2e"
    )
    emissions_attributable_for_compliance = models.DecimalField(
        max_digits=20, decimal_places=4, db_comment="Total emissions attributable for compliance in tCO2e"
    )
    emission_limit = models.DecimalField(max_digits=20, decimal_places=4, db_comment="The emission limit in tCO2e")
    excess_emissions = models.DecimalField(
        max_digits=20, decimal_places=4, db_comment="The excess emissions in tCO2e (positive if over limit)"
    )
    credited_emissions = models.DecimalField(
        max_digits=20, decimal_places=4, db_comment="The credited emissions in tCO2e (positive if under limit)"
    )
    reduction_factor = models.DecimalField(
        max_digits=10, decimal_places=4, db_comment="The reduction factor from NAICS regulatory values"
    )
    tightening_rate = models.DecimalField(
        max_digits=10, decimal_places=4, db_comment="The tightening rate from NAICS regulatory values"
    )
    compliance_status = models.CharField(
        max_length=50,
        choices=ComplianceStatus.choices,
        db_comment="The compliance status (e.g., OBLIGATION_NOT_MET, OBLIGATION_FULLY_MET, EARNED_CREDITS)",
    )

    history = HistoricalRecords(
        table_name='erc_history"."compliance_summary_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta(TimeStampedModel.Meta):
        db_table_comment = "A table to store compliance summaries for reports"
        db_table = 'erc"."compliance_summary'
        constraints = [
            models.UniqueConstraint(
                fields=["report", "current_report_version"],
                name="unique_compliance_summary_per_report_version",
            )
        ]
