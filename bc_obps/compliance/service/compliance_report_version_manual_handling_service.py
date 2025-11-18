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
    - Keeping the ComplianceReportVersion.requires_manual_handling flag in sync
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
    def _get_crv(cls, compliance_report_version_id: int) -> ComplianceReportVersion:
        try:
            return ComplianceReportVersion.objects.get(id=compliance_report_version_id)
        except ComplianceReportVersion.DoesNotExist:
            raise UserError("No compliance report version found for the given ID")

    @classmethod
    def _ensure_manual_handling_record(
        cls, crv: ComplianceReportVersion
    ) -> ComplianceReportVersionManualHandling:
        """
        Ensure there is a manual handling record for the given CRV.
        """
        record, created = ComplianceReportVersionManualHandling.objects.get_or_create(
            compliance_report_version=crv
        )
        if created:
            logger.info(
                "Created manual handling record for compliance_report_version %s",
                crv.id,
            )
        return record


    @classmethod
    def update_manual_handling(
        cls, compliance_report_version_id: int, payload: Dict, user: User
    ) -> ComplianceReportVersionManualHandling:
        """
        Update manual handling data based on user role:

        - CAS Analyst:
            * May update `analyst_comment`
            * Keeps / sets CRV.requires_manual_handling = True
            * Cannot change director_decision

        - CAS Director:
            * May update `director_comment`
            * Must provide a valid `director_decision`
            * Updates CRV.requires_manual_handling based on decision:
                - ISSUE_RESOLVED → requires_manual_handling = False
                - PENDING_MANUAL_HANDLING → requires_manual_handling = True

        Other users are not allowed to update manual handling data.
        """
        crv = cls._get_crv(compliance_report_version_id)
        record = cls._ensure_manual_handling_record(crv)
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

        # Ensure the CRV remains flagged as requiring manual handling
        crv = record.compliance_report_version
        if not crv.requires_manual_handling:
            crv.requires_manual_handling = True
            crv.save(update_fields=["requires_manual_handling"])

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
        - Director may also update director_comment
        - Decision controls the CRV.requires_manual_handling flag:
            * ISSUE_RESOLVED → False
            * PENDING_MANUAL_HANDLING → True
        """
        if update_payload.director_decision is None:
            raise UserError("Director decision is required to update manual handling")

        valid_decisions = ComplianceReportVersionManualHandling.DirectorDecision.values
        if update_payload.director_decision not in valid_decisions:
            raise UserError("Invalid director decision provided")

        record.director_decision = update_payload.director_decision

        if update_payload.director_comment is not None:
            record.director_comment = update_payload.director_comment

        record.save(update_fields=["director_decision", "director_comment"])

        # Sync the CRV.requires_manual_handling flag with the decision
        crv = record.compliance_report_version
        if record.director_decision == ComplianceReportVersionManualHandling.DirectorDecision.ISSUE_RESOLVED:
            crv.requires_manual_handling = False
        else:
            crv.requires_manual_handling = True

        crv.save(update_fields=["requires_manual_handling"])
