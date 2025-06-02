from django.http import HttpRequest, StreamingHttpResponse
from compliance.service.invoice_service import InvoiceService
from common.permissions import authorize
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.schema.generic import Message
from .router import router
from compliance.constants import COMPLIANCE


@router.get(
    "/invoice/generate/{compliance_report_version_id}",
    response={200: None, custom_codes_4xx: Message},
    tags=COMPLIANCE,
    description="Generate a PDF invoice for a compliance report version and stream it to the client",
    auth=authorize("approved_industry_user"),
)
def generate_invoice(request: HttpRequest, compliance_report_version_id: int) -> StreamingHttpResponse:
    """
    Generate a PDF invoice for a a compliance report version and stream it to the client.

    Args:
        request: The HTTP request
        compliance_report_version_id: ID of the a compliance report version

    Returns:
        A streaming response containing the PDF
    """
    pdf_generator, filename, total_size = InvoiceService.generate_invoice_pdf(compliance_report_version_id)

    response = StreamingHttpResponse(streaming_content=pdf_generator, content_type='application/pdf')

    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    response['Content-Length'] = str(total_size)

    return response
