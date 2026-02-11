from dataclasses import dataclass
from decimal import Decimal

from reporting.models.naics_regulatory_override import NaicsRegulatoryOverride
from reporting.models.naics_regulatory_value import NaicsRegulatoryValue
from reporting.models.report_version import ReportVersion


@dataclass
class RegulatoryValues:
    initial_compliance_period: int
    compliance_period: int
    reduction_factor: Decimal
    tightening_rate: Decimal


@dataclass
class RegulatoryValuesOverride:
    reduction_factor_override: Decimal | None = None
    tightening_rate_override: Decimal | None = None


def get_industry_regulatory_values(report_version: ReportVersion) -> RegulatoryValues:
    """
    Returns the regulatory values setup for the industry, for a specific report version.
    If specific exemptions exist for some products, this method won't be reflecting them.
    """
    naics_code_id = report_version.report.operation.naics_code_id
    compliance_year = report_version.report.reporting_year.reporting_year

    regulatory_values = NaicsRegulatoryValue.objects.get(
        naics_code_id=naics_code_id,
        valid_from__lte=report_version.report.reporting_year.reporting_window_start,
        valid_to__gte=report_version.report.reporting_year.reporting_window_end,
    )

    return RegulatoryValues(
        initial_compliance_period=2024,
        compliance_period=compliance_year,
        reduction_factor=regulatory_values.reduction_factor,
        tightening_rate=regulatory_values.tightening_rate,
    )


def get_product_regulatory_values_override(
    report_version: ReportVersion, regulated_product_id: int
) -> RegulatoryValuesOverride:
    """
    Returns the product-specific regulatory values, defaulting to the industry values if no exception exists.
    """

    try:
        regulatory_values_overrides = NaicsRegulatoryOverride.objects.get(
            naics_code_id=report_version.report.operation.naics_code_id,
            regulated_product_id=regulated_product_id,
            valid_from__lte=report_version.report.reporting_year.reporting_window_start,
            valid_to__gte=report_version.report.reporting_year.reporting_window_end,
        )
        return RegulatoryValuesOverride(
            reduction_factor_override=regulatory_values_overrides.reduction_factor,
            tightening_rate_override=regulatory_values_overrides.tightening_rate,
        )
    except NaicsRegulatoryOverride.DoesNotExist:
        return RegulatoryValuesOverride()
