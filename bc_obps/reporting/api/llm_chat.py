from common.permissions import authorize
from reporting.service.llm_service import LLMService
from service.error_service.custom_codes_4xx import custom_codes_4xx
from .router import router
from django.http import HttpRequest
from typing import Tuple
from registration.schema import Message
import json
import logging


DEFAULT_VERIFICATION_STATEMENT_ATTACHMENT_PATH = (
    "/Users/awilliam/Documents/cas-registration/bc_obps/"
    "report_attachments_2026_BC-OBPS_Verification_Report__Statement_ISH_Energy_2025RY.pdf"
)


logger = logging.getLogger(__name__)


##### POST #####


@router.post(
    "/llm-chat",
    response={200: str, custom_codes_4xx: Message},
    auth=authorize("authorized_irc_user"),
)
def llm_chat(
    request: HttpRequest,
) -> Tuple[int, str]:
    try:
        body = json.loads(request.body)
        prompt = body.get("prompt", "").strip()
        attachment_path = body.get("attachment_path")
        if isinstance(attachment_path, str):
            attachment_path = attachment_path.strip()
        if not attachment_path:
            attachment_path = DEFAULT_VERIFICATION_STATEMENT_ATTACHMENT_PATH
        if not prompt:
            return 400, Message(message="prompt field is required in request body")
        logger.info("/llm-chat received prompt_len=%s attachment_path=%s", len(prompt), attachment_path)
        response_text = LLMService.ask_llm_with_pdf(prompt, attachment_path=attachment_path)
        logger.info("/llm-chat returning response_len=%s", len(response_text or ""))
        return 200, response_text
    except json.JSONDecodeError:
        return 400, Message(message="Invalid JSON in request body")
