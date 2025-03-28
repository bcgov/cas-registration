from decimal import Decimal
from model_bakery import baker
from compliance.models import CompliancePeriod, ComplianceSummary, ComplianceProduct, ComplianceObligation


def compliance_period_baker(**kwargs) -> CompliancePeriod:
    """
    Create a CompliancePeriod instance with default values.

    Args:
        **kwargs: Override default values for CompliancePeriod fields

    Returns:
        CompliancePeriod: A CompliancePeriod instance
    """
    defaults = {
        "start_date": "2024-01-01",
        "end_date": "2024-12-31",
        "compliance_deadline": "2025-06-30",
    }

    # If reporting_year is not provided, create one
    if "reporting_year" not in kwargs:
        from reporting.tests.utils.bakers import reporting_year_baker

        kwargs["reporting_year"] = reporting_year_baker()

    # Update defaults with provided kwargs
    defaults.update(kwargs)

    return baker.make(CompliancePeriod, **defaults)


def compliance_summary_baker(**kwargs) -> ComplianceSummary:
    """
    Create a ComplianceSummary instance with default values.

    Args:
        **kwargs: Override default values for ComplianceSummary fields

    Returns:
        ComplianceSummary: A ComplianceSummary instance
    """
    defaults = {
        "emissions_attributable_for_reporting": Decimal("100.0"),
        "reporting_only_emissions": Decimal("10.0"),
        "emissions_attributable_for_compliance": Decimal("90.0"),
        "emission_limit": Decimal("80.0"),
        "excess_emissions": Decimal("10.0"),
        "credited_emissions": Decimal("0.0"),
        "reduction_factor": Decimal("0.95"),
        "tightening_rate": Decimal("0.01"),
    }

    # If report is not provided, create one
    if "report" not in kwargs:
        from reporting.tests.utils.bakers import report_baker

        kwargs["report"] = report_baker()

    # If current_report_version is not provided, create one
    if "current_report_version" not in kwargs:
        from reporting.tests.utils.bakers import report_version_baker

        kwargs["current_report_version"] = report_version_baker(report=kwargs["report"])

    # If compliance_period is not provided, create one
    if "compliance_period" not in kwargs:
        kwargs["compliance_period"] = compliance_period_baker(reporting_year=kwargs["report"].reporting_year)

    # Update defaults with provided kwargs
    defaults.update(kwargs)

    return baker.make(ComplianceSummary, **defaults)


def compliance_product_baker(**kwargs) -> ComplianceProduct:
    """
    Create a ComplianceProduct instance with default values.

    Args:
        **kwargs: Override default values for ComplianceProduct fields

    Returns:
        ComplianceProduct: A ComplianceProduct instance
    """
    defaults = {
        "annual_production": Decimal("1000.0"),
        "apr_dec_production": Decimal("750.0"),
        "emission_intensity": Decimal("0.1"),
        "allocated_industrial_process_emissions": Decimal("50.0"),
        "allocated_compliance_emissions": Decimal("40.0"),
    }

    # If compliance_summary is not provided, create one
    if "compliance_summary" not in kwargs:
        kwargs["compliance_summary"] = compliance_summary_baker()

    # If report_product is not provided, create one
    if "report_product" not in kwargs:
        from reporting.tests.utils.bakers import report_product_baker

        kwargs["report_product"] = report_product_baker(
            report_version=kwargs["compliance_summary"].current_report_version
        )

    # Update defaults with provided kwargs
    defaults.update(kwargs)

    return baker.make(ComplianceProduct, **defaults)


def compliance_obligation_baker(**kwargs) -> ComplianceObligation:
    """
    Create a ComplianceObligation instance with default values.

    Args:
        **kwargs: Override default values for ComplianceObligation fields

    Returns:
        ComplianceObligation: A ComplianceObligation instance
    """
    defaults = {
        "emissions_amount_tco2e": Decimal("10.0"),
        "status": ComplianceObligation.ObligationStatus.OBLIGATION_NOT_MET,
        "penalty_status": ComplianceObligation.PenaltyStatus.NONE,
        "obligation_deadline": "2025-11-30",
        "obligation_id": "21-0001-1-1",  # Default test obligation ID in format YY-OOOO-R-V
    }

    # If compliance_summary is not provided, create one
    if "compliance_summary" not in kwargs:
        kwargs["compliance_summary"] = compliance_summary_baker()

    # Update defaults with provided kwargs
    defaults.update(kwargs)

    return baker.make(ComplianceObligation, **defaults)
