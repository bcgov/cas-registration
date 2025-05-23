from compliance.models import ComplianceEarnedCredits
from typing import Optional


class ComplianceEarnedCreditsService:
    """
    Service for managing earned credits
    """

    @classmethod
    def get_earned_credits_data_by_report_version(
        cls, compliance_report_version_id: int
    ) -> Optional[ComplianceEarnedCredits]:
        """
        Fetches earned credits data for a specific compliance compliance_report_version

        Args:
            compliance_report_version_id: The ID of the compliance compliance_report_version to retrieve earned credits data for

        Returns:
            The EarnedCredits object if it exists
        """
        earned_credits_record = ComplianceEarnedCredits.objects.filter(
            compliance_report_version_id=compliance_report_version_id
        ).first()
        return earned_credits_record
