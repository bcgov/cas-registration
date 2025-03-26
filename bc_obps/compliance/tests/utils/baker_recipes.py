from decimal import Decimal
from model_bakery.recipe import Recipe, foreign_key
from compliance.models import (
    CompliancePeriod,
    ComplianceSummary,
    ComplianceProduct,
    ComplianceObligation,
)
from reporting.tests.utils.baker_recipes import report, report_version, report_product
from reporting.models import ReportingYear

# CompliancePeriod recipe
compliance_period = Recipe(
    CompliancePeriod,
    start_date="2024-01-01",
    end_date="2024-12-31",
    compliance_deadline="2025-06-30",
    reporting_year=foreign_key(Recipe(ReportingYear)),
)

# ComplianceSummary recipe
compliance_summary = Recipe(
    ComplianceSummary,
    report=foreign_key(report),
    current_report_version=foreign_key(report_version),
    compliance_period=foreign_key(compliance_period),
    emissions_attributable_for_reporting=Decimal("100.0"),
    reporting_only_emissions=Decimal("10.0"),
    emissions_attributable_for_compliance=Decimal("90.0"),
    emission_limit=Decimal("80.0"),
    excess_emissions=Decimal("10.0"),
    credited_emissions=Decimal("0.0"),
    reduction_factor=Decimal("0.95"),
    tightening_rate=Decimal("0.01"),
)

# ComplianceProduct recipe
compliance_product = Recipe(
    ComplianceProduct,
    compliance_summary=foreign_key(compliance_summary),
    report_product=foreign_key(report_product),
    annual_production=Decimal("1000.0"),
    apr_dec_production=Decimal("750.0"),
    emission_intensity=Decimal("0.1"),
    allocated_industrial_process_emissions=Decimal("50.0"),
    allocated_compliance_emissions=Decimal("40.0"),
)

# ComplianceObligation recipe
compliance_obligation = Recipe(
    ComplianceObligation,
    compliance_summary=foreign_key(compliance_summary),
    emissions_amount_tco2e=Decimal("10.0"),
    status=ComplianceObligation.ObligationStatus.OBLIGATION_NOT_MET,
    penalty_status=ComplianceObligation.PenaltyStatus.NONE,
    obligation_deadline="2025-11-30",
    obligation_id="21-0001-1-1",  # Default test obligation ID in format YY-OOOO-R-V
)
