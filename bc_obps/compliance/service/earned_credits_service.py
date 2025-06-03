from compliance.models import ComplianceEarnedCredit, ComplianceReportVersion
from typing import Optional


class ComplianceEarnedCreditsService:
    """
    Service for managing earned credits
    """

    @classmethod
    def get_earned_credits_data_by_report_version(
        cls, compliance_report_version_id: int
    ) -> Optional[ComplianceEarnedCredit]:
        """
        Fetches earned credits data for a specific compliance compliance_report_version

        Args:
            compliance_report_version_id: The ID of the compliance compliance_report_version to retrieve earned credits data for

        Returns:
            The EarnedCredits object if it exists
        """
        earned_credits_record = ComplianceEarnedCredit.objects.filter(
            compliance_report_version_id=compliance_report_version_id
        ).first()
        return earned_credits_record

    @classmethod
    def create_earned_credits_record(cls, compliance_report_version: ComplianceReportVersion) -> ComplianceEarnedCredit:
        """
        Creates an earned credits record for the specific compliance compliance_report_version

        Args:
            compliance_report_version_id: The ID of the compliance compliance_report_version to retrieve earned credits data for

        Returns:
            The EarnedCredits object if it exists
        """
        earned_credits_record = ComplianceEarnedCredit.objects.create(
            compliance_report_version=compliance_report_version,
            earned_credits_amount=int(compliance_report_version.report_compliance_summary.credited_emissions),
        )
        return earned_credits_record
