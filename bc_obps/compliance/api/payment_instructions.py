from django.http import HttpRequest, StreamingHttpResponse
from compliance.service.payment_instructions_service import PaymentInstructionsService
from common.permissions import authorize
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.schema.generic import Message
from .router import router


@router.get(
    "/payment-instructions/generate/{summary_id}",
    response={200: None, custom_codes_4xx: Message},
    tags=["Compliance"],
    description="Generate a PDF payment instructions for a compliance summary and stream it to the client",
    auth=authorize("approved_industry_user"),
)
def generate_payment_instructions(request: HttpRequest, summary_id: str) -> StreamingHttpResponse:
    """
    Generate a PDF payment instructions for a compliance summary and stream it to the client.

    Args:
        request: The HTTP request
        summary_id: ID of the compliance summary

    Returns:
        A streaming response containing the PDF
    """
    pdf_generator, filename, total_size = PaymentInstructionsService.generate_payment_instructions_pdf(summary_id)

    response = StreamingHttpResponse(streaming_content=pdf_generator, content_type='application/pdf')

    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    response['Content-Length'] = str(total_size)

    return response
