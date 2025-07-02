from compliance.models import ComplianceEarnedCredit, ComplianceReportVersion
from typing import Optional
from common.exceptions import UserError


class ComplianceEarnedCreditsService:
    """
    Service for managing earned credits
    """

    @classmethod
    def get_earned_credit_data_by_report_version(
        cls, compliance_report_version_id: int
    ) -> Optional[ComplianceEarnedCredit]:
        """
        Fetches earned credit data for a specific compliance report version

        Args:
            compliance_report_version_id: The ID of the compliance report version to retrieve earned credits data for

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
            compliance_report_version: The compliance report version to create an earned credits record for

        Returns:
            The EarnedCredits object if it exists
        """
        earned_credits_record = ComplianceEarnedCredit.objects.create(
            compliance_report_version=compliance_report_version,
            earned_credits_amount=int(compliance_report_version.report_compliance_summary.credited_emissions),
        )
        return earned_credits_record

    @classmethod
    def validate_earned_credit_for_bccr_project(cls, compliance_report_version_id: int) -> None:
        """
        Validates that earned credit is in the correct state for BCCR project creation

        Args:
            compliance_report_version_id: The ID of the compliance report version

        Raises:
            UserError: If earned credit is not in CREDITS_NOT_ISSUED state or already has a bccr_trading_name
        """
        earned_credit = ComplianceEarnedCreditsService.get_earned_credit_data_by_report_version(
            compliance_report_version_id
        )

        if not earned_credit:
            raise UserError("No earned credit record found for this compliance report version")

        # Validate that earned credit is in the correct state
        if earned_credit.issuance_status != ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED:
            raise UserError(
                f"Earned credit must be in '{ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED}' state. Current state: {earned_credit.issuance_status}"
            )

        # Validate that earned credit doesn't already have a bccr_trading_name
        if earned_credit.bccr_trading_name:
            raise UserError("Earned credit already has a BCCR trading name")

    @classmethod
    def update_earned_credit_for_bccr_project(cls, compliance_report_version_id: int, bccr_trading_name: str) -> None:
        """
        Updates earned credits with BCCR trading name and changes issuance status to ISSUANCE_REQUESTED

        Note: This method assumes validation has already been performed by validate_earned_credit_for_bccr_project

        Args:
            compliance_report_version_id: The ID of the compliance report version
            bccr_trading_name: The BCCR trading name to set
        """
        earned_credit = ComplianceEarnedCreditsService.get_earned_credit_data_by_report_version(
            compliance_report_version_id
        )

        if not earned_credit:
            raise UserError("No earned credit record found for this compliance report version")

        # Update the earned credits record with the bccr_trading_name and change the issuance status
        earned_credit.bccr_trading_name = bccr_trading_name
        earned_credit.issuance_status = ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED
        earned_credit.save(update_fields=["bccr_trading_name", "issuance_status"])
