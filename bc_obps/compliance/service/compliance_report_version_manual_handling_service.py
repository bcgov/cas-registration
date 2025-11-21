import logging
from typing import Dict, Optional

from common.exceptions import UserError
from compliance.models import ComplianceReportVersion
from compliance.models.compliance_report_version_manual_handling import (
    ComplianceReportVersionManualHandling,
)
from registration.models.user import User

from compliance.dataclass import ManualHandlingUpdate

logger = logging.getLogger(__name__)


class ComplianceManualHandlingService:
    """
    Service for managing manual handling resolution for compliance report versions.

    Responsibilities:
    - Ensuring there is a manual-handling record for a ComplianceReportVersion
    - Letting CAS analysts add / update context comments for manual handling
    - Letting CAS directors record a decision and comment
    """

    @staticmethod
    def get_manual_handling_by_report_version(
        compliance_report_version_id: int,
    ) -> Optional[ComplianceReportVersionManualHandling]:
        return (
            ComplianceReportVersionManualHandling.objects
            .filter(compliance_report_version_id=compliance_report_version_id)
            .select_related("analyst_submitted_by", "director_decision_by")
            .first()
        )

    @classmethod
    def update_manual_handling(
        cls, compliance_report_version_id: int, payload: Dict, user: User
    ) -> ComplianceReportVersionManualHandling:
        """
        Update manual handling data based on user role:

        - CAS Analyst:
            * May update `analyst_comment`
            * Cannot change director_decision

        - CAS Director:
            * May update a valid `director_decision`

        Other users are not allowed to update manual handling data.
        """
        crv = ComplianceReportVersion.objects.get(id=compliance_report_version_id)
        record = ComplianceReportVersionManualHandling.objects.get(
            compliance_report_version=crv
        )
        update_payload = ManualHandlingUpdate(**payload)

        if user.is_cas_analyst():
            cls._handle_cas_analyst_update(record, update_payload)
        elif user.is_cas_director():
            cls._handle_cas_director_update(record, update_payload)
        else:
            raise UserError("This user is not authorized to update manual handling")

        record.refresh_from_db()
        return record

    @classmethod
    def _handle_cas_analyst_update(
        cls,
        record: ComplianceReportVersionManualHandling,
        update_payload: ManualHandlingUpdate,
    ) -> None:
        """
        Handle updates from a CAS analyst.

        Business rules:
        - Analysts can only update the analyst_comment
        - Analysts cannot change the director_decision
        - If a director has already resolved the issue, analyst edits are blocked
        """
        if (
            record.director_decision
            == ComplianceReportVersionManualHandling.DirectorDecision.ISSUE_RESOLVED
        ):
            raise UserError(
                "Analyst updates are not allowed after the director has marked the issue as resolved"
            )

        # Update analyst comment if provided
        if update_payload.analyst_comment is not None:
            record.analyst_comment = update_payload.analyst_comment
            record.save(update_fields=["analyst_comment"])


    @classmethod
    def _handle_cas_director_update(
        cls,
        record: ComplianceReportVersionManualHandling,
        update_payload: ManualHandlingUpdate,
    ) -> None:
        """
        Handle updates from a CAS director.

        Business rules:
        - Director must provide a valid director_decision
        """
        if update_payload.director_decision is None:
            raise UserError("Director decision is required to update manual handling")

        valid_decisions = ComplianceReportVersionManualHandling.DirectorDecision.values
        if update_payload.director_decision not in valid_decisions:
            raise UserError("Invalid director decision provided")

        record.director_decision = update_payload.director_decision

        record.save(update_fields=["director_decision"])