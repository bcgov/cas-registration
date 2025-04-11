from compliance.models import CompliancePeriod


class CompliancePeriodService:
    """
    Service for managing compliance periods
    """

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
