import json
from django.http import HttpRequest, StreamingHttpResponse
from compliance.service.compliance_invoice_service import ComplianceInvoiceService
from compliance.service.elicensing.schema import InvoiceQueryResponse
from compliance.service.elicensing.obligation_elicensing_service import ObligationELicensingService
from compliance.service.invoice_service import InvoiceService
from common.permissions import authorize
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.schema.generic import Message
from compliance.api.router import router
from compliance.constants import COMPLIANCE


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
    Delegates all context-building and error handling to ComplianceInvoiceService.generate_invoice_pdf.
    """
    # Call the refactored service method; it returns either a PDF tuple or an errors dict
    result = ComplianceInvoiceService.generate_invoice_pdf(compliance_report_version_id)

    # If result is an error dictionary, stream it back with status 400
    if isinstance(result, dict) and "errors" in result:
        err_payload = json.dumps({"errors": result["errors"]}).encode("utf-8")
        return StreamingHttpResponse(
            streaming_content=iter([err_payload]),
            content_type="application/json",
            status=400,
        )

    # Otherwise, unpack the PDF generator, filename, and total size
    pdf_generator, filename, total_size = result

    response = StreamingHttpResponse(streaming_content=pdf_generator, content_type="application/pdf")
    response["Content-Disposition"] = f'attachment; filename="{filename}"'
    response["Content-Length"] = str(total_size)
    return response


@router.get(
    "/invoice/{summary_id}",
    response={200: InvoiceQueryResponse, custom_codes_4xx: Message},
    tags=COMPLIANCE,
    description="Returns invoice info for a compliance summary id",
    auth=authorize("approved_industry_user"),
)
def get_invoice(request: HttpRequest, summary_id: int) -> InvoiceQueryResponse:
    """
    Returns invoice info for a given compliance summary id.

    Args:
        request: The HTTP request
        summary_id: ID of the compliance summary

    Returns:
        Invoice information
    """
    response = ObligationELicensingService.get_invoice_from_summary_id(summary_id)
    return response
