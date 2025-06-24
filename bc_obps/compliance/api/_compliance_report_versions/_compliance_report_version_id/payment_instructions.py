import json
from django.http import HttpRequest, StreamingHttpResponse
from compliance.service.payment_instructions_service import PaymentInstructionsService
from common.permissions import authorize
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.schema.generic import Message
from ...router import router


@router.get(
    "/compliance-report-versions/{compliance_report_version_id}/payment_instructions/pdf",
    response={200: None, custom_codes_4xx: Message},
    tags=["Compliance"],
    description="Generate a PDF payment instructions for a compliance summary and stream it to the client",
    auth=authorize("approved_industry_user"),
)
def generate_payment_instructions(request: HttpRequest, compliance_report_version_id: int) -> StreamingHttpResponse:
    """
    Generate a PDF payment instructions for a compliance summary and stream it to the client.

    Args:
        request: The HTTP request
        compliance_report_version_id: ID of the compliance summary

    Returns:
        A streaming response containing the PDF
    """
    result = PaymentInstructionsService.generate_payment_instructions_pdf(compliance_report_version_id)

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
