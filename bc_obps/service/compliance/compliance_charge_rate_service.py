from decimal import Decimal

from compliance.models.compliance_charge_rate import ComplianceChargeRate
from reporting.models.reporting_year import ReportingYear


class ComplianceChargeRateService:
    """
    Service for handling compliance charge rates.
    """

    @classmethod
    def get_rate_for_year(cls, reporting_year: ReportingYear) -> Decimal:
        """
        Get the compliance charge rate for a given reporting year.

        Args:
            reporting_year: The reporting year to get the rate for

        Returns:
            The compliance charge rate as a Decimal

        Raises:
            ComplianceChargeRate.DoesNotExist: If no rate exists for the reporting year
        """
        charge_rate = ComplianceChargeRate.objects.get(reporting_year=reporting_year)
        return charge_rate.rate
