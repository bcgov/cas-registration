from django.http import HttpRequest, StreamingHttpResponse
from ninja import File, UploadedFile
from common.permissions import authorize
from reporting.service.verification_statement.service import analyze_stream
from .router import router

VERIFICATION_STATEMENT_TAGS = ["Verification Statement Analysis"]


@router.post(
    "verification-statement-analysis-stream",
    tags=VERIFICATION_STATEMENT_TAGS,
    description=(
        "Stream VS-check criteria results as NDJSON. Each line is a JSON object with a 'type' field: "
        "'ready' (PDF parsed), 'criterion' (one criterion answered), or 'error' (not parseable). "
        "The PDF is parsed in-memory and discarded."
    ),
    auth=authorize("authorized_irc_user"),
)
def stream_verification_statement(request: HttpRequest, file: UploadedFile = File(...)):
    content = file.read()
    return StreamingHttpResponse(analyze_stream(content), content_type="application/x-ndjson")
