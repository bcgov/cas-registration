import logging
from compliance.dataclass import ComplianceEarnedCreditsUpdate
from compliance.models import ComplianceEarnedCredit, ComplianceReportVersion
from typing import Dict, Optional
from common.exceptions import UserError
from compliance.service.bc_carbon_registry.project_service import BCCarbonRegistryProjectService
from compliance.service.bc_carbon_registry.credit_issuance_service import BCCarbonRegistryCreditIssuanceService
from registration.models.user import User


logger = logging.getLogger(__name__)

bccr_project_service = BCCarbonRegistryProjectService()
bccr_credit_issuance_service = BCCarbonRegistryCreditIssuanceService()


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
    def _handle_industry_user_update(
        cls, earned_credit: ComplianceEarnedCredit, update_payload: ComplianceEarnedCreditsUpdate
    ) -> None:
        """
        Handles the update of earned credits by an industry user
        """
        if not update_payload.bccr_trading_name or not update_payload.bccr_holding_account_id:
            raise UserError("BCCR Trading Name and Holding Account ID are required to update earned credits")

        industry_allowed_statuses = [
            ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED,
            ComplianceEarnedCredit.IssuanceStatus.CHANGES_REQUIRED,
        ]
        if earned_credit.issuance_status not in industry_allowed_statuses:
            raise UserError(
                "Credits can only be updated by industry users when the user has requested issuance or changes are required"
            )

        earned_credit.bccr_trading_name = update_payload.bccr_trading_name
        earned_credit.bccr_holding_account_id = update_payload.bccr_holding_account_id
        earned_credit.issuance_status = ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED
        earned_credit.save(update_fields=["issuance_status", "bccr_trading_name", "bccr_holding_account_id"])

    @classmethod
    def _handle_cas_analyst_update(
        cls, earned_credit: ComplianceEarnedCredit, update_payload: ComplianceEarnedCreditsUpdate
    ) -> None:
        """
        Handles the update of earned credits by a CAS analyst
        """

        analyst_allowed_statuses = [
            ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED,
            ComplianceEarnedCredit.IssuanceStatus.CHANGES_REQUIRED,
        ]
        if earned_credit.issuance_status not in analyst_allowed_statuses:
            raise UserError("Credits can only be updated by CAS analysts when the user has requested issuance")

        earned_credit.analyst_suggestion = update_payload.analyst_suggestion
        earned_credit.analyst_comment = update_payload.analyst_comment

        # Map analyst suggestions to issuance statuses
        suggestion_to_status = {
            ComplianceEarnedCredit.AnalystSuggestion.REQUIRING_CHANGE_OF_BCCR_HOLDING_ACCOUNT_ID.value: ComplianceEarnedCredit.IssuanceStatus.CHANGES_REQUIRED,
            ComplianceEarnedCredit.AnalystSuggestion.REQUIRING_SUPPLEMENTARY_REPORT.value: ComplianceEarnedCredit.IssuanceStatus.DECLINED,
            ComplianceEarnedCredit.AnalystSuggestion.READY_TO_APPROVE.value: ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED,
        }

        if update_payload.analyst_suggestion in suggestion_to_status:
            earned_credit.issuance_status = suggestion_to_status[update_payload.analyst_suggestion]

        earned_credit.save(update_fields=["issuance_status", "analyst_suggestion", "analyst_comment"])

    @classmethod
    def _handle_cas_director_update(
        cls, earned_credit: ComplianceEarnedCredit, update_payload: ComplianceEarnedCreditsUpdate
    ) -> None:
        """
        Handles the update of earned credits by a CAS director
        """
        if not earned_credit.bccr_trading_name or not earned_credit.bccr_holding_account_id:
            raise UserError("BCCR Trading Name and Holding Account ID are required to update earned credits")

        if earned_credit.analyst_suggestion != ComplianceEarnedCredit.AnalystSuggestion.READY_TO_APPROVE:
            raise UserError("Credits cannot be issued until analyst has reviewed and approved")

        # CAS directors can only update the status if it's ISSUANCE_REQUESTED
        if earned_credit.issuance_status != ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED:
            raise UserError("Credits can only be updated by CAS directors when the user has requested issuance")

        earned_credit.director_comment = update_payload.director_comment
        director_decision = update_payload.director_decision
        if director_decision not in ComplianceEarnedCredit.IssuanceStatus.values:
            raise UserError("Invalid director decision provided")
        earned_credit.issuance_status = ComplianceEarnedCredit.IssuanceStatus(director_decision)

        if director_decision == ComplianceEarnedCredit.IssuanceStatus.APPROVED:
            new_project_data = bccr_project_service.create_project(
                earned_credit.bccr_holding_account_id, earned_credit.compliance_report_version
            )
            bccr_credit_issuance_service.issue_credits(earned_credit, new_project_data)
        earned_credit.save(update_fields=["issuance_status", "director_comment"])

    @classmethod
    def update_earned_credit(
        cls, compliance_report_version_id: int, payload: Dict, user: User
    ) -> ComplianceEarnedCredit:
        """
        Updates earned credits based on user role and permissions:

        - Industry users: Can update BCCR trading name and holding account ID, then we set status to ISSUANCE_REQUESTED
        - CAS Analysts: Can update analyst suggestion and comment, may set status to CHANGES_REQUIRED
        - CAS Directors: Can update director comment and decision (approved/declined)

        Args:
            compliance_report_version_id: The ID of the compliance report version
            payload: The payload containing fields to update based on user role
            user: The user making the request (determines what fields can be updated)
        """
        earned_credit = ComplianceEarnedCreditsService.get_earned_credit_data_by_report_version(
            compliance_report_version_id
        )

        if not earned_credit:
            raise UserError("No earned credit record found for this compliance report version")

        update_payload = ComplianceEarnedCreditsUpdate(**payload)
        # Industry user can only update the BCCR trading name and holding account ID
        if user.is_industry_user():
            logger.info(
                f"Industry user is updating earned credits for compliance report version {compliance_report_version_id} with payload {update_payload}"
            )
            cls._handle_industry_user_update(earned_credit, update_payload)
        elif user.is_cas_analyst():
            logger.info(
                f"CAS analyst is updating earned credits for compliance report version {compliance_report_version_id} with payload {update_payload}"
            )
            cls._handle_cas_analyst_update(earned_credit, update_payload)
        # Director can only update the director comment and update the issuance status to approved or declined
        elif user.is_cas_director():
            logger.info(
                f"CAS director is updating earned credits for compliance report version {compliance_report_version_id} with payload {update_payload}"
            )
            cls._handle_cas_director_update(earned_credit, update_payload)
        else:
            raise UserError("This user is not authorized to update earned credit")

        earned_credit.refresh_from_db()
        return earned_credit
