from django.http import HttpRequest, HttpResponse
from compliance.services.invoice_service import InvoiceService
from .router import router


@router.get("/invoice/generate/{summary_id}")
def generate_invoice(request: HttpRequest, summary_id: int) -> HttpResponse:

    pdf_bytes, filename = InvoiceService.generate_invoice_pdf(summary_id)

    response = HttpResponse(pdf_bytes, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response
