from typing import Any, Optional, cast
from django.http import HttpRequest
from compliance.models import (
    ComplianceObligation,
    ComplianceReport,
    ComplianceReportVersion,
)
from ..schemas import ScenarioPayload
from ..utils import extract_user_guid
from .base import ScenarioHandler


class SubmitReportScenario(ScenarioHandler):
    def execute(self, request: HttpRequest, data: ScenarioPayload) -> dict[str, Any]:
        payload: dict[str, Any] = data.payload or {}
        user_guid = extract_user_guid(request, payload)

        report_version_id = payload.get("report_version_id") or data.compliance_report_version_id
        if report_version_id is None:
            raise ValueError("report_version_id is required for submit_report scenario")

        supplementary = payload.get("supplementary")
        ack_new_version: Optional[bool] = None
        ack_corrections: Optional[bool] = None
        if supplementary is not None:
            if not isinstance(supplementary, dict):
                raise ValueError("payload.supplementary must be an object")

            ack_new_version = cast(Optional[bool], supplementary.get("acknowledgement_of_new_version"))
            ack_corrections = cast(Optional[bool], supplementary.get("acknowledgement_of_corrections"))

        # Local imports to avoid circular deps with reporting services
        from reporting.service.report_submission_service import ReportSubmissionService
        from reporting.service.report_sign_off_service import (
            ReportSignOffAcknowledgements,
            ReportSignOffData,
        )

        signoff = ReportSignOffData(
            acknowledgements=ReportSignOffAcknowledgements(
                acknowledgement_of_review=cast(bool, payload.get("acknowledgement_of_review")),
                acknowledgement_of_certification=cast(bool, payload.get("acknowledgement_of_certification")),
                acknowledgement_of_records=cast(bool, payload.get("acknowledgement_of_records")),
                acknowledgement_of_information=cast(bool, payload.get("acknowledgement_of_information")),
                acknowledgement_of_possible_costs=cast(bool, payload.get("acknowledgement_of_possible_costs")),
                acknowledgement_of_new_version=ack_new_version,
                acknowledgement_of_corrections=ack_corrections,
                acknowledgement_of_errors=cast(bool, payload.get("acknowledgement_of_errors")),
            ),
            signature=cast(str, payload.get("signature")),
        )

        # Submit report - triggers validations, record creations, signal, and api integrations that are intercepted and mocked
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

        # If obligation not met, get obligation invoice (set from mocked obligation integration-./mocking/http_mocks.py)
        if compliance_report_version.status == ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET:
            obligation = ComplianceObligation.objects.filter(
                compliance_report_version=compliance_report_version
            ).first()

            if obligation is not None:

                obligation.refresh_from_db()
                if obligation.elicensing_invoice:
                    invoice_number = obligation.elicensing_invoice.invoice_number

        return {
            "report_version_id": report_version.id,
            "report_status": report_version.status,
            "compliance_report_id": compliance_report.id,
            "compliance_report_version_id": compliance_report_version.id,
            "compliance_status": compliance_report_version.status,
            "invoice_number": invoice_number,
        }
