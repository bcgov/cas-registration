from decimal import Decimal
from reporting.models.reporting_year import ReportingYear


class ComplianceChargeRateService:

    @classmethod
    def get_rate_for_year(cls, reporting_year: ReportingYear) -> Decimal:
        """
        Get the compliance charge rate for a given reporting year.

        Args:
            reporting_year: The reporting year to get the rate for

        Returns:
            The compliance charge rate as a Decimal
        """
        charge_rate = reporting_year.compliance_charge_rate
        return charge_rate.rate
