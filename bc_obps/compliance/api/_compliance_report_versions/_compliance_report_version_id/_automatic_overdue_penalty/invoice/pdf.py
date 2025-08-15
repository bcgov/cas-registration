from django.http import HttpRequest, StreamingHttpResponse
from compliance.service.compliance_invoice_service import ComplianceInvoiceService
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.schema.generic import Message
from compliance.api.router import router
from compliance.constants import COMPLIANCE
from compliance.api.permissions import approved_industry_user_compliance_report_version_composite_auth


@router.get(
    "/compliance-report-versions/{compliance_report_version_id}/automatic-overdue-penalty/invoice/pdf",
    response={200: None, custom_codes_4xx: Message},
    tags=COMPLIANCE,
    description="Generate a PDF invoice for a compliance report version's automatic penalty and stream it to the client",
    auth=approved_industry_user_compliance_report_version_composite_auth,
)
def generate_compliance_report_version_automatic_overdue_penalty_invoice(
    request: HttpRequest, compliance_report_version_id: int
) -> StreamingHttpResponse:
    """
    Generate a PDF invoice for a compliance report version's automatic penalty and stream it to the client.
    Delegates all context-building and error handling to ComplianceInvoiceService.generate_automatic_overdue_penalty_invoice_pdf.
    """
    # Call the refactored service method; it returns either a PDF tuple or an errors dict
    result = ComplianceInvoiceService.generate_automatic_overdue_penalty_invoice_pdf(compliance_report_version_id)

    return ComplianceInvoiceService.create_pdf_response(result)
