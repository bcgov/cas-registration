from typing import Any, Callable, Dict, Optional

from django.conf import settings
from django.db import transaction
from django.http import HttpRequest, HttpResponse, JsonResponse
from ninja import Schema
from django.utils import timezone
from decimal import Decimal

from compliance.models import (
    ComplianceEarnedCredit,
    ComplianceReport,
    ComplianceReportVersion,
    ComplianceObligation,
)
from compliance.models.compliance_period import CompliancePeriod
from compliance.service.compliance_report_version_service import (
    ComplianceReportVersionService,
)
from reporting.models.report_version import ReportVersion
from reporting.service.compliance_service import ComplianceService
from rls.utils.manager import RlsManager

from compliance.models import ElicensingInvoice
from compliance.models.elicensing_client_operator import ElicensingClientOperator

from .router import router


class ScenarioPayload(Schema):
    """
    Generic payload for all E2E scenarios.

    - scenario: name of the scenario handler to run
    - compliance_report_version_id: CRV id when needed
    - payload: arbitrary extra data
      (report_version_id, user_guid, sign_off_data, etc.)
    """

    scenario: str
    compliance_report_version_id: Optional[int] = None
    payload: Dict[str, Any] = {}


# ---------------------------------------------------------------------------
# Scenario handlers
# ---------------------------------------------------------------------------


def _scenario_earned_credits_request_issuance(
    data: ScenarioPayload,
) -> Dict[str, Any]:
    """
    Simulate an industry user clicking 'Request issuance' without hitting BCCR.

    - Sets trading name + holding account (from payload if provided)
    - Sets issuance_status to ISSUANCE_REQUESTED
    """
    if data.compliance_report_version_id is None:
        raise ValueError("compliance_report_version_id is required for this scenario")

    earned = ComplianceEarnedCredit.objects.get(compliance_report_version_id=data.compliance_report_version_id)

    payload = data.payload or {}
    bccr_trading_name = payload.get("bccr_trading_name", earned.bccr_trading_name)
    bccr_holding_account_id = payload.get("bccr_holding_account_id", earned.bccr_holding_account_id)

    earned.bccr_trading_name = bccr_trading_name
    earned.bccr_holding_account_id = bccr_holding_account_id
    earned.issuance_status = ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED
    earned.save(
        update_fields=[
            "issuance_status",
            "bccr_trading_name",
            "bccr_holding_account_id",
        ]
    )

    return {
        "id": earned.id,
        "compliance_report_version_id": data.compliance_report_version_id,
        "bccr_trading_name": earned.bccr_trading_name,
        "bccr_holding_account_id": earned.bccr_holding_account_id,
        "issuance_status": earned.issuance_status,
    }


def _get_or_create_compliance_report(
    report_version: ReportVersion,
) -> ComplianceReport:
    compliance_report, _ = ComplianceReport.objects.get_or_create(
        report_id=report_version.report_id,
        defaults={
            "report": report_version.report,
            "compliance_period": CompliancePeriod.objects.get(reporting_year=report_version.report.reporting_year),
        },
    )
    return compliance_report


def _scenario_submit_report(data: ScenarioPayload) -> Dict[str, Any]:
    """
    Simulate submitting a report and creating a compliance report version
    (and a fake invoice for obligation scenarios) WITHOUT calling external
    services like eLicensing.
    """
    payload = data.payload or {}

    # Prefer an explicit report_version_id in payload; fall back to compliance_report_version_id
    report_version_id = payload.get("report_version_id") or data.compliance_report_version_id
    if report_version_id is None:
        raise ValueError("report_version_id is required for submit_report scenario")

    # Fetch report version
    report_version = ReportVersion.objects.select_related(
        "report",
        "report__operation",
    ).get(pk=report_version_id)

    # Save compliance data for regulated operations
    is_regulated_operation = report_version.report.operation.is_regulated_operation
    if is_regulated_operation:
        ComplianceService.save_compliance_data(report_version_id)

    # Mark any previous latest-submitted version as not latest
    from pgtrigger import ignore as pgtrigger_ignore

    with pgtrigger_ignore("reporting.ReportVersion:set_updated_audit_columns"):
        ReportVersion.objects.filter(
            report=report_version.report,
            status=ReportVersion.ReportVersionStatus.Submitted,
            is_latest_submitted=True,
        ).update(is_latest_submitted=False)

    # Mark this version as latest submitted + submitted status
    report_version.is_latest_submitted = True
    report_version.status = ReportVersion.ReportVersionStatus.Submitted
    report_version.save(update_fields=["is_latest_submitted", "status"])

    # Ensure a ComplianceReport exists
    compliance_report = _get_or_create_compliance_report(report_version)

    # Create a ComplianceReportVersion
    compliance_report_version = ComplianceReportVersionService.create_compliance_report_version(
        compliance_report_id=compliance_report.id,
        report_version_id=report_version.id,
    )

    # For obligation scenarios, create a fake invoice and link it
    if compliance_report_version.status == ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET:
        obligation = ComplianceObligation.objects.filter(compliance_report_version=compliance_report_version).first()

        if obligation is not None and obligation.elicensing_invoice is None:
            # Create a fake invoice that satisfies model constraints but
            # does NOT depend on eLicensing API.
            invoice_number = f"E2E-{compliance_report_version.id}"

            qs = ElicensingClientOperator.objects.all()
            if not qs.exists():
                raise RuntimeError(
                    "No ElicensingClientOperator exists. "
                    "Seed one for E2E tests or look it up from the obligation's operator."
                )

            # ✅ qs[0] is typed as ElicensingClientOperator, not Optional
            client_operator = qs[0]

            invoice = ElicensingInvoice.objects.create(
                invoice_number=invoice_number,
                elicensing_client_operator=client_operator,
                due_date=timezone.now().date(),
                outstanding_balance=Decimal("0.00"),
                invoice_fee_balance=Decimal("0.00"),
                invoice_interest_balance=Decimal("0.00"),
                last_refreshed=timezone.now(),
            )
            obligation.elicensing_invoice = invoice
            obligation.save(update_fields=["elicensing_invoice"])

    # Return a compact payload for Playwright / route stub
    return {
        "report_version_id": report_version.id,
        "report_status": report_version.status,
        "compliance_report_id": compliance_report.id,
        "compliance_report_version_id": compliance_report_version.id,
        "compliance_status": compliance_report_version.status,
        "invoice_number": invoice_number,
    }


# Registry of scenarios
SCENARIO_HANDLERS: Dict[str, Callable[[ScenarioPayload], Dict[str, Any]]] = {
    "earned_credits_request_issuance": _scenario_earned_credits_request_issuance,
    "submit_report": _scenario_submit_report,
}


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------


@router.post(
    "/e2e-integration-stub",
    description=(
        "Run a test integration scenario to mock API call but still mutate DB state for E2E tests."
        "Only available in local/CI environments."
    ),
)
def run_e2e_integration_stub(
    request: HttpRequest,
    data: ScenarioPayload,
) -> HttpResponse:
    if settings.CI != "true" and settings.ENVIRONMENT != "local":
        return HttpResponse(
            "This endpoint only exists in the local/CI environments.",
            status=404,
        )

    handler = SCENARIO_HANDLERS.get(data.scenario)
    if handler is None:
        return HttpResponse(f"Unknown scenario: {data.scenario}", status=400)

    with RlsManager.bypass_rls(), transaction.atomic():
        result = handler(data)
    return JsonResponse(result, status=200)
