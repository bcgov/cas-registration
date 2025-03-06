from datetime import date
from compliance.models import CompliancePeriod


class CompliancePeriodService:
    """
    Service for managing compliance periods
    """

    @classmethod
    def get_compliance_period(cls, reporting_year_id: int) -> CompliancePeriod:
        """
        Gets an existing compliance period for a reporting year

        Args:
            reporting_year_id (int): The reporting year ID (year value)

        Returns:
            CompliancePeriod: The retrieved compliance period

        Raises:
            CompliancePeriod.DoesNotExist: If no compliance period exists for the year
        """
        return CompliancePeriod.objects.get(reporting_year_id=reporting_year_id)

    @classmethod
    def get_compliance_deadline(cls, year: int) -> date:
        """
        Gets the standard compliance report deadline for a year (May 31 of following year)

        Args:
            year (int): The compliance period year

        Returns:
            date: The compliance deadline (May 31 of following year)
        """
        # Per section 19(1)(a) of BC Greenhouse Gas Emission Reporting Regulation
        return date(year + 1, 5, 31)

    @classmethod
    def get_compliance_period_for_year(cls, year: int) -> CompliancePeriod:
        """
        Gets the compliance period for a specific year

        Args:
            year (int): The year to get the compliance period for

        Returns:
            CompliancePeriod: The compliance period for the specified year

        Raises:
            CompliancePeriod.DoesNotExist: If no compliance period exists for the year
        """
        return CompliancePeriod.objects.get(reporting_year_id=year) 