from typing import Any, Dict
from django.http import HttpRequest
from compliance.models import ComplianceEarnedCredit
from ..schemas import ScenarioPayload
from .base import ScenarioHandler
from common.api.utils.current_user_utils import get_current_user
from compliance.service.earned_credits_service import ComplianceEarnedCreditsService


class EarnedCreditsRequestIssuanceScenario(ScenarioHandler):
    def execute(self, request: HttpRequest, data: ScenarioPayload) -> Dict[str, Any]:
        if data.compliance_report_version_id is None:
            raise ValueError("compliance_report_version_id is required for earned_credits_request_issuance")

        payload = data.payload or {}
        earned = ComplianceEarnedCredit.objects.get(compliance_report_version_id=data.compliance_report_version_id)
        user = get_current_user(request)

        # BCCR API calls are now mocked at HTTP layer via e2e_sandbox
        ComplianceEarnedCreditsService.update_earned_credit(
            compliance_report_version_id=data.compliance_report_version_id, payload=payload, user=user
        )

        earned.refresh_from_db()

        return {
            "id": earned.id,
            "compliance_report_version_id": data.compliance_report_version_id,
            "bccr_trading_name": earned.bccr_trading_name,
            "bccr_holding_account_id": earned.bccr_holding_account_id,
            "issuance_status": earned.issuance_status,
        }


class EarnedCreditsDirectorApproveScenario(ScenarioHandler):
    def execute(self, request: HttpRequest, data: ScenarioPayload) -> Dict[str, Any]:
        if data.compliance_report_version_id is None:
            raise ValueError("compliance_report_version_id is required for earned_credits_director_approve")

        payload = data.payload or {}
        user = get_current_user(request)

        # BCCR API calls are now mocked at HTTP layer via e2e_sandbox
        earned = ComplianceEarnedCreditsService.update_earned_credit(
            compliance_report_version_id=data.compliance_report_version_id,
            payload=payload,
            user=user,
        )

        earned.refresh_from_db()

        return {
            "id": earned.id,
            "compliance_report_version_id": data.compliance_report_version_id,
            "issuance_status": earned.issuance_status,
            "bccr_project_id": earned.bccr_project_id,
            "bccr_issuance_id": earned.bccr_issuance_id,
        }
