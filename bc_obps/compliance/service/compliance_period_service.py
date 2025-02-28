from datetime import date
from django.core.exceptions import ValidationError
from compliance.models import CompliancePeriod
from reporting.models import ReportingYear


class CompliancePeriodService:
    """
    Service for managing compliance periods
    """

    @classmethod
    def get_or_create_compliance_period(cls, reporting_year_id: int) -> CompliancePeriod:
        """
        Gets an existing compliance period for a reporting year or creates a new one
        
        Args:
            reporting_year_id (int): The reporting year ID (year value)
            
        Returns:
            CompliancePeriod: The retrieved or created compliance period
            
        Raises:
            ValidationError: If the reporting year doesn't exist
        """
        try:
            return CompliancePeriod.objects.get(reporting_year_id=reporting_year_id)
        except CompliancePeriod.DoesNotExist:
            return cls.create_compliance_period(reporting_year_id)

    @classmethod
    def create_compliance_period(cls, reporting_year_id: int) -> CompliancePeriod:
        """
        Creates a new compliance period for a reporting year
        
        Args:
            reporting_year_id (int): The reporting year ID (year value)
            
        Returns:
            CompliancePeriod: The created compliance period
            
        Raises:
            ValidationError: If the reporting year doesn't exist or validation fails
        """
        # Get the reporting year
        try:
            reporting_year = ReportingYear.objects.get(reporting_year=reporting_year_id)
        except ReportingYear.DoesNotExist:
            raise ValidationError(f"Reporting year {reporting_year_id} does not exist")
        
        # Create compliance period for the reporting year
        start_date = date(reporting_year_id, 1, 1)
        end_date = date(reporting_year_id, 12, 31)
        
        # Set compliance deadline according to regulation (May 31 of following year)
        # Per section 19(1)(a) of BC Greenhouse Gas Emission Reporting Regulation
        compliance_deadline = cls.get_compliance_deadline(reporting_year_id)
        
        # Validate that reporting year matches compliance period end date
        if reporting_year.reporting_year != end_date.year:
            raise ValidationError(
                f"Reporting year ({reporting_year.reporting_year}) must match the year of the compliance period end date ({end_date.year})."
            )
        
        # Create and save the compliance period
        compliance_period = CompliancePeriod.objects.create(
            start_date=start_date,
            end_date=end_date,
            compliance_deadline=compliance_deadline,
            reporting_year=reporting_year
        )
        
        return compliance_period
    
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