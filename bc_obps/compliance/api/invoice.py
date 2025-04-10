from django.http import HttpRequest, StreamingHttpResponse
from compliance.services.invoice_service import InvoiceService
from .router import router


@router.get("/invoice/generate/{summary_id}")
def generate_invoice(request: HttpRequest, summary_id: int) -> StreamingHttpResponse:
    """
    Generate a PDF invoice for a compliance summary and stream it to the client.

    Args:
        request: The HTTP request
        summary_id: ID of the compliance summary

    Returns:
        A streaming response containing the PDF
    """
    pdf_generator, filename, total_size = InvoiceService.generate_invoice_pdf(summary_id)

    response = StreamingHttpResponse(streaming_content=pdf_generator, content_type='application/pdf')

    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    response['Content-Length'] = str(total_size)

    return response
