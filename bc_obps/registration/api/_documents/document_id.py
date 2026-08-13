from typing import Literal, Tuple

from common.api.utils.current_user_utils import get_current_user_guid
from common.permissions import authorize
from django.http import HttpRequest
from registration.api.router import router
from registration.constants import DOCUMENT_TAGS
from registration.schema import Message
from service.document_service import DocumentService
from service.error_service import custom_codes_4xx


@router.get(
    "/documents/{document_id}",
    response={200: str, custom_codes_4xx: Message},
    tags=DOCUMENT_TAGS,
    description="""Retrieves an external URL for a document, specified by its ID.""",
    auth=authorize("approved_authorized_roles"),
)
def get_document_url(request: HttpRequest, document_id: int) -> Tuple[Literal[200], str]:
    return 200, DocumentService.get_document_url_if_authorized(get_current_user_guid(request), document_id)
