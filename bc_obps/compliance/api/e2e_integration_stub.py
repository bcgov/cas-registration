"""
E2E integration stub endpoint.

Goal:
- Mutate DB state for Playwright scenarios
- Reuse service logic where possible
- Avoid calling external systems (eLicensing/BCCR) by mocking outbound HTTP
  AND by patching service-layer sync methods so no real HTTP is ever attempted.
"""

from __future__ import annotations

import json
from contextlib import contextmanager
from decimal import Decimal
from typing import Any, Callable, Dict, Iterator, Optional
from unittest.mock import patch
from uuid import UUID

import requests
from django.conf import settings
from django.db import transaction
from django.http import HttpRequest, HttpResponse, JsonResponse
from django.utils import timezone
from ninja import Schema
from pydantic import Field
from requests.models import Response  # requests.Response (intentional)

from compliance.dataclass import ComplianceEarnedCreditsUpdate
from compliance.models import (
    ComplianceEarnedCredit,
    ComplianceObligation,
    ComplianceReport,
    ComplianceReportVersion,
    ElicensingInvoice,
)
from compliance.models.elicensing_client_operator import ElicensingClientOperator
from compliance.service.elicensing.elicensing_operator_service import ElicensingOperatorService
from rls.utils.manager import RlsManager


from typing import Union

from .router import router


# ---------------------------------------------------------------------------
# Payload schema
# ---------------------------------------------------------------------------


class ScenarioPayload(Schema):
    """
    Generic payload for all E2E scenarios.

    - scenario: name of the scenario handler to run
    - compliance_report_version_id: CRV id when needed
    - payload: arbitrary extra data
      (report_version_id, sign_off_data, etc.)
    """

    scenario: str
    compliance_report_version_id: Optional[int] = None
    payload: Dict[str, Any] = Field(default_factory=dict)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _json_response(status: int, payload: Any, url: str) -> Response:
    r = Response()
    r.status_code = status
    r._content = json.dumps(payload).encode("utf-8")
    r.headers["Content-Type"] = "application/json"
    r.url = url
    return r


def _base_url(setting_name: str) -> str:
    return str(getattr(settings, setting_name, "") or "").rstrip("/")


def _is_external_url(url: str, base: str) -> bool:
    return bool(base) and url.startswith(base)


def _is_local_url(url: str) -> bool:
    return url.startswith("http://localhost") or url.startswith("http://127.0.0.1")


def _extract_user_guid_from_authorization_header(request: HttpRequest) -> Optional[UUID]:
    auth_header = request.headers.get("Authorization") or request.META.get("HTTP_AUTHORIZATION")
    if not auth_header:
        return None
    try:
        auth_obj = json.loads(auth_header)
    except json.JSONDecodeError:
        return None

    user_guid_raw = auth_obj.get("user_guid")
    if not user_guid_raw:
        return None
    try:
        return UUID(str(user_guid_raw))
    except ValueError:
        return None


def _extract_user_guid(request: HttpRequest, payload: Dict[str, Any]) -> UUID:
    # 1) middleware-provided current_user
    try:
        current_user = getattr(request, "current_user", None)
        user_guid = getattr(current_user, "user_guid", None)
        if user_guid:
            return UUID(str(user_guid))
    except (ValueError, TypeError):
        # invalid UUID format -> fall through to other strategies
        ...

    # 2) payload.user_guid
    user_guid_raw = payload.get("user_guid")
    if user_guid_raw:
        return UUID(str(user_guid_raw))

    # 3) Authorization header JSON
    guid_from_auth = _extract_user_guid_from_authorization_header(request)
    if guid_from_auth:
        return guid_from_auth

    raise ValueError(
        "user_guid could not be resolved. Expected request.current_user.user_guid, "
        "payload.user_guid, or Authorization header."
    )


# ---------------------------------------------------------------------------
# External HTTP mocking (requests-layer) + hard block
# ---------------------------------------------------------------------------


class UnmockedExternalCall(RuntimeError):
    pass


def _mock_elicensing_response(method: str, url: str, *_: Any, **__: Any) -> Response:
    """
    eLicensing stubs
    """
    # POST /client  (create client)
    if method == "POST" and url.rstrip("/").endswith("/client"):
        return _json_response(
            200,
            {
                "clientObjectId": 123,
                "clientGUID": "00000000-0000-0000-0000-000000000000",
            },
            url=url,
        )

    # POST /client/{id}/fees
    if method == "POST" and "/fees" in url:
        return _json_response(
            200,
            {
                "clientObjectId": 123,
                "clientGUID": "guid-1",
                "fees": [
                    {
                        "feeGUID": "E2E-FEE-GUID-123",
                        "feeObjectId": "FEE-123",
                    }
                ],
            },
            url=url,
        )

    # POST /client/{id}/invoice
    if method == "POST" and "/invoice" in url:
        return _json_response(200, {"invoiceNumber": "INV-999"}, url=url)

    raise UnmockedExternalCall(f"[E2E] Unmocked eLicensing call: {method} {url}")


def _mock_bccr_response(method: str, url: str, *_: Any, **__: Any) -> Response:
    """
    BCCR stubs
    """
    raise UnmockedExternalCall(f"[E2E] Unmocked BCCR call: {method} {url}")


@contextmanager
def mock_external_http_for_e2e() -> Iterator[None]:
    """
    Patch requests at BOTH:
      - Session.request
      - requests.api.request
    so any outbound HTTP to external systems is mocked or blocked.

    Important behavior:
    - If URL is http(s) and not local, we block by default.
    - If it matches configured eLicensing/BCCR base URLs, return stub responses.
    """
    elicensing_base = _base_url("ELICENSING_API_URL")
    bccr_base = _base_url("BCCR_API_URL")

    real_session_request = requests.sessions.Session.request
    real_requests_request = requests.api.request  # underlying for requests.request()

    def _dispatch(method: str, url: str, **kwargs: Any) -> Optional[Response]:
        method_u = method.upper()

        # Hard block: never allow outbound http(s) to non-local hosts during E2E
        if url.startswith(("http://", "https://")) and not _is_local_url(url):
            raise UnmockedExternalCall(f"[E2E] Outbound HTTP blocked: {method_u} {url}")

        # Mock known external integrations when base URLs are configured
        if _is_external_url(url, elicensing_base):
            return _mock_elicensing_response(method_u, url, **kwargs)

        if _is_external_url(url, bccr_base):
            return _mock_bccr_response(method_u, url, **kwargs)

        return None  # allow non-http(s) or local URLs to proceed

    def patched_session_request(self: requests.Session, method: str, url: str, **kwargs: Any) -> Response:
        resp = _dispatch(method, url, **kwargs)
        if resp is not None:
            return resp
        return real_session_request(self, method, url, **kwargs)

    def patched_requests_request(method: str, url: str, **kwargs: Any) -> Response:
        resp = _dispatch(method, url, **kwargs)
        if resp is not None:
            return resp
        return real_requests_request(method, url, **kwargs)

    with (
        patch.object(requests.sessions.Session, "request", patched_session_request),
        patch.object(requests.api, "request", patched_requests_request),
    ):
        yield


# ---------------------------------------------------------------------------
# Side-effects bypass (emails, retryables, etc.)
# ---------------------------------------------------------------------------


def _noop_execute(*args: Any, **kwargs: Any) -> None:
    return None


@contextmanager
def bypass_nonessential_side_effects_for_e2e() -> Iterator[None]:
    """
    E2E goal: mutate DB for Playwright, not run external integrations/emails.
    """
    patches = []

    try:
        from compliance.tasks import (
            retryable_process_obligation_integration,
            retryable_send_notice_of_obligation_email,
            retryable_send_notice_of_obligation_due_email,
            retryable_notice_of_supplementary_report_post_deadline_increases_emissions,
            retryable_send_notice_of_credits_requested_email,
            retryable_send_notice_of_earned_credits_email,
        )

        patches = [
            patch.object(retryable_process_obligation_integration, "execute", _noop_execute),
            patch.object(retryable_send_notice_of_obligation_email, "execute", _noop_execute),
            patch.object(retryable_send_notice_of_obligation_due_email, "execute", _noop_execute),
            patch.object(
                retryable_notice_of_supplementary_report_post_deadline_increases_emissions,
                "execute",
                _noop_execute,
            ),
            patch.object(retryable_send_notice_of_credits_requested_email, "execute", _noop_execute),
            patch.object(retryable_send_notice_of_earned_credits_email, "execute", _noop_execute),
        ]
    except Exception:
        patches = []

    if not patches:
        yield
        return

    with patches[0]:
        started = []
        try:
            for p in patches[1:]:
                p.start()
                started.append(p)
            yield
        finally:
            for p in reversed(started):
                p.stop()


# ---------------------------------------------------------------------------
# Service-layer mocks (strong guarantee: no external sync calls)
# ---------------------------------------------------------------------------


def _fake_sync_client_with_elicensing(operator_id: Union[int, UUID], *_: Any, **__: Any) -> ElicensingClientOperator:
    """
    Create/return a local ElicensingClientOperator without calling eLicensing.
    """
    defaults: Dict[str, Any] = {
        "client_object_id": 123,
        "client_guid": "00000000-0000-0000-0000-000000000000",
    }

    obj, created = ElicensingClientOperator.objects.get_or_create(
        operator_id=operator_id,
        defaults=defaults,
    )
    return obj


@contextmanager
def mock_external_services_for_e2e() -> Iterator[None]:
    """
    Patch service calls that would otherwise attempt external sync/integration.
    """
    with patch.object(
        ElicensingOperatorService,
        "sync_client_with_elicensing",
        side_effect=_fake_sync_client_with_elicensing,
    ):
        yield


@contextmanager
def e2e_sandbox() -> Iterator[None]:
    """
    One consistent sandbox for all scenarios.
    """
    with (
        mock_external_http_for_e2e(),  # requests-layer safety net
        mock_external_services_for_e2e(),  # service-layer safety net
        bypass_nonessential_side_effects_for_e2e(),
        RlsManager.bypass_rls(),
        transaction.atomic(),
    ):
        yield


# ---------------------------------------------------------------------------
# Scenario handlers
# ---------------------------------------------------------------------------


def _scenario_submit_report(request: HttpRequest, data: ScenarioPayload) -> Dict[str, Any]:
    """
    Trigger report submission logic (validation, sign-off save, compliance save, signals),
    then return IDs for Playwright.

    All external calls are blocked/mocked by e2e_sandbox().
    """
    payload = data.payload or {}

    report_version_id = payload.get("report_version_id") or data.compliance_report_version_id
    if report_version_id is None:
        raise ValueError("report_version_id is required for submit_report scenario")

    user_guid = _extract_user_guid(request, payload)

    # Import here to avoid cycles
    from reporting.service.report_submission_service import ReportSubmissionService
    from reporting.service.report_sign_off_service import ReportSignOffAcknowledgements, ReportSignOffData

    # Validate expected fields early so failures are clearer
    if "signature" not in payload:
        raise ValueError("payload.signature is required")
    if "acknowledgement_of_records" not in payload:
        raise ValueError("payload.acknowledgement_of_records is required")

    signoff = ReportSignOffData(
        acknowledgements=ReportSignOffAcknowledgements(
            payload.get("acknowledgement_of_review"),
            payload.get("acknowledgement_of_certification"),
            payload["acknowledgement_of_records"],
            payload.get("acknowledgement_of_information"),
            payload.get("acknowledgement_of_possible_costs"),
            payload.get("acknowledgement_of_errors"),
            payload.get("acknowledgement_of_new_version"),
            payload.get("acknowledgement_of_corrections"),
        ),
        signature=payload["signature"],
    )

    report_version = ReportSubmissionService.submit_report(
        version_id=int(report_version_id),
        user_guid=user_guid,
        sign_off_data=signoff,
    )

    compliance_report = ComplianceReport.objects.filter(report_id=report_version.report_id).first()
    if compliance_report is None:
        raise RuntimeError("ComplianceReport was not created after report submission")

    compliance_report_version = (
        ComplianceReportVersion.objects.filter(compliance_report=compliance_report)
        .order_by("-created_at", "-id")
        .first()
    )
    if compliance_report_version is None:
        raise RuntimeError("ComplianceReportVersion was not created after report submission")

    invoice_number: Optional[str] = None

    # Create fake invoice (no external calls)
    if compliance_report_version.status == ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET:
        obligation = ComplianceObligation.objects.filter(compliance_report_version=compliance_report_version).first()
        if obligation is not None and obligation.elicensing_invoice is None:
            invoice_number = f"E2E-{compliance_report_version.id}"

            operator_id = compliance_report_version.compliance_report.report.operator_id

            # Ensure local client operator exists; do NOT call external sync
            client_operator = ElicensingClientOperator.objects.filter(operator_id=operator_id).first()
            if client_operator is None:
                client_operator = _fake_sync_client_with_elicensing(operator_id)

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

    return {
        "report_version_id": report_version.id,
        "report_status": report_version.status,
        "compliance_report_id": compliance_report.id,
        "compliance_report_version_id": compliance_report_version.id,
        "compliance_status": compliance_report_version.status,
        "invoice_number": invoice_number,
    }


def _scenario_earned_credits_request_issuance(request: HttpRequest, data: ScenarioPayload) -> Dict[str, Any]:
    """
    Simulate an industry user clicking 'Request issuance' without hitting BCCR.

    - Uses ComplianceEarnedCreditsService._handle_industry_user_update
    - Mocks BCCarbonRegistryAccountService.get_account_details
    - Mocks retryable_send_notice_of_credits_requested_email.execute
    """
    if data.compliance_report_version_id is None:
        raise ValueError("compliance_report_version_id is required for this scenario")

    payload = data.payload or {}

    earned = ComplianceEarnedCredit.objects.get(compliance_report_version_id=data.compliance_report_version_id)

    # Import inside to avoid cycles
    from compliance.service.earned_credits_service import ComplianceEarnedCreditsService
    from compliance.service.bc_carbon_registry.account_service import BCCarbonRegistryAccountService
    from compliance.tasks import retryable_send_notice_of_credits_requested_email

    update_payload = ComplianceEarnedCreditsUpdate(**payload)

    with (
        patch.object(
            BCCarbonRegistryAccountService,
            "get_account_details",
            return_value={"id": payload.get("bccr_holding_account_id")},
        ),
        patch.object(retryable_send_notice_of_credits_requested_email, "execute", _noop_execute),
    ):
        ComplianceEarnedCreditsService._handle_industry_user_update(earned, update_payload)  # noqa: SLF001

    earned.refresh_from_db()

    return {
        "id": earned.id,
        "compliance_report_version_id": data.compliance_report_version_id,
        "bccr_trading_name": earned.bccr_trading_name,
        "bccr_holding_account_id": earned.bccr_holding_account_id,
        "issuance_status": earned.issuance_status,
    }


def _scenario_earned_credits_director_approve(request: HttpRequest, data: ScenarioPayload) -> Dict[str, Any]:
    if data.compliance_report_version_id is None:
        raise ValueError("compliance_report_version_id is required")

    payload = data.payload or {}

    from common.api.utils.current_user_utils import get_current_user
    from compliance.service.earned_credits_service import ComplianceEarnedCreditsService
    from compliance.service.bc_carbon_registry.project_service import BCCarbonRegistryProjectService
    from compliance.service.bc_carbon_registry.credit_issuance_service import BCCarbonRegistryCreditIssuanceService

    user = get_current_user(request)

    def _fake_project(*args: Any, **kwargs: Any) -> Dict[str, Any]:
        return {"id": "E2E-PROJECT-1"}

    def _fake_issue(*args: Any, **kwargs: Any) -> Dict[str, Any]:
        return {"id": "E2E-ISSUANCE-1"}

    with (
        patch.object(BCCarbonRegistryProjectService, "create_project", side_effect=_fake_project),
        patch.object(BCCarbonRegistryCreditIssuanceService, "issue_credits", side_effect=_fake_issue),
    ):
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


SCENARIO_HANDLERS: Dict[str, Callable[[HttpRequest, ScenarioPayload], Dict[str, Any]]] = {
    "earned_credits_request_issuance": _scenario_earned_credits_request_issuance,
    "submit_report": _scenario_submit_report,
    "earned_credits_director_approve": _scenario_earned_credits_director_approve,
}


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------


@router.post(
    "/e2e-integration-stub",
    description=(
        "Run a test integration scenario to mutate DB state for E2E tests, while blocking/mocking "
        "outbound HTTP to external systems (eLicensing/BCCR). Only available in local/CI environments."
    ),
)
def run_e2e_integration_stub(request: HttpRequest, data: ScenarioPayload) -> HttpResponse:
    if settings.CI != "true" and settings.ENVIRONMENT != "local":
        return HttpResponse("This endpoint only exists in the local/CI environments.", status=404)

    handler = SCENARIO_HANDLERS.get(data.scenario)
    if handler is None:
        return HttpResponse(f"Unknown scenario: {data.scenario}", status=400)

    with e2e_sandbox():
        result = handler(request, data)

    return JsonResponse(result, status=200)
