from typing import Any, Dict, Optional
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
    def execute(self, request: HttpRequest, data: ScenarioPayload) -> Dict[str, Any]:
        payload = data.payload or {}

        report_version_id = payload.get("report_version_id") or data.compliance_report_version_id
        if report_version_id is None:
            raise ValueError("report_version_id is required for submit_report scenario")

        user_guid = extract_user_guid(request, payload)

        from reporting.service.report_submission_service import ReportSubmissionService
        from reporting.service.report_sign_off_service import ReportSignOffAcknowledgements, ReportSignOffData

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

        # Process obligation integration using existing service if obligation not met
        if compliance_report_version.status == ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET:
            obligation = ComplianceObligation.objects.filter(
                compliance_report_version=compliance_report_version
            ).first()

            if obligation is not None:
                from compliance.service.elicensing.elicensing_obligation_service import (
                    ElicensingObligationService,
                )

                # Use existing service - external calls are mocked by e2e_sandbox
                ElicensingObligationService.process_obligation_integration(obligation.id)

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
