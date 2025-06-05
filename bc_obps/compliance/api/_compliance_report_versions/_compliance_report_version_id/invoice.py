import json
from django.http import HttpRequest, StreamingHttpResponse
from compliance.service.compliance_invoice_service import ComplianceInvoiceService
from common.permissions import authorize
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.schema.generic import Message
from compliance.api.router import router
from compliance.constants import COMPLIANCE

from typing import Dict, Any


@router.get(
    "/compliance-report-versions/{compliance_report_version_id}/invoice",
    response={200: None, custom_codes_4xx: Message},
    tags=COMPLIANCE,
    description="Generate a PDF invoice for a compliance report version and stream it to the client",
    auth=authorize("approved_industry_user"),
)
def generate_compliance_report_version_invoice(
    request: HttpRequest, compliance_report_version_id: int
) -> StreamingHttpResponse:
    """
    Generate a PDF invoice for a compliance report version and stream it to the client.
    If prepare_invoice_context returns an errors dict, return that JSON instead.
    """
    # Run the context‐builder and check for errors
    context_or_errors: Dict[str, Any] = ComplianceInvoiceService.prepare_invoice_context(compliance_report_version_id)
    if "errors" in context_or_errors:
        # Build a JSON string and wrap it in a StreamingHttpResponse
        err_payload = json.dumps({"errors": context_or_errors["errors"]}).encode("utf-8")
        return StreamingHttpResponse(
            streaming_content=iter([err_payload]),
            content_type="application/json",
            status=400,
        )

    # Proceed to generate the PDF
    pdf_generator, filename, total_size = ComplianceInvoiceService.generate_invoice_pdf(
        compliance_report_version_id, context_or_errors
    )

    response = StreamingHttpResponse(streaming_content=pdf_generator, content_type="application/pdf")
    response["Content-Disposition"] = f'attachment; filename="{filename}"'
    response["Content-Length"] = str(total_size)
    return response
