from django.http import HttpRequest, StreamingHttpResponse
from compliance.service.elicensing.elicensing_data_refresh_service import ElicensingDataRefreshService
from compliance.service.compliance_invoice_service import ComplianceInvoiceService
from common.permissions import authorize
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.schema.generic import Message
from compliance.api.router import router
from compliance.constants import COMPLIANCE
from compliance.schema.elicensing_invoice import ElicensingInvoiceOut
from compliance.models.elicensing_invoice import ElicensingInvoice


@router.get(
    "/compliance-report-versions/{compliance_report_version_id}/invoice/pdf",
    response={200: None, custom_codes_4xx: Message},
    tags=COMPLIANCE,
    description="Generate a PDF invoice for a compliance report version and stream it to the client",
    auth=authorize("approved_industry_user"),
)
def generate_compliance_report_version_invoice(
    request: HttpRequest, compliance_report_version_id: int
) -> StreamingHttpResponse:
    """
    Generate a PDF invoice for a compliance report version's obligation and stream it to the client.
    Delegates all context-building and error handling to ComplianceInvoiceService.generate_obligation_invoice_pdf.
    """
    # Call the refactored service method; it returns either a PDF tuple or an errors dict
    result = ComplianceInvoiceService.generate_obligation_invoice_pdf(compliance_report_version_id)

    return ComplianceInvoiceService.create_pdf_response(result)


@router.get(
    "/compliance-report-versions/{compliance_report_version_id}/invoice",
    response={200: ElicensingInvoiceOut, custom_codes_4xx: Message},
    tags=COMPLIANCE,
    description="Returns invoice info for a compliance report version id",
    auth=authorize("approved_industry_user"),
)
def get_invoice(request: HttpRequest, compliance_report_version_id: int) -> ElicensingInvoice:
    """
    Returns invoice info for a given compliance report version id.

    Args:
        request: The HTTP request
        compliance_report_version_id: ID of the compliance report version

    Returns:
        Invoice information
    """
    invoice = ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id(
        compliance_report_version_id
    ).invoice

    return invoice
