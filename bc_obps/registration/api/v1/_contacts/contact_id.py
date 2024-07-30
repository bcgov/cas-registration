from typing import Literal, Optional, Tuple
from django.http import HttpRequest
from registration.constants import CONTACT_TAGS
from registration.models.app_role import AppRole
from registration.models.contact import Contact
from registration.models.user_operator import UserOperator
from registration.schema.v1.contact import ContactIn, ContactOut
from service.contact_service import ContactService
from registration.api.utils.current_user_utils import get_current_user_guid
from registration.decorators import authorize, handle_http_errors
from registration.api.router import router
from registration.schema.generic import Message
from service.error_service.custom_codes_4xx import custom_codes_4xx


@router.get(
    "/contacts/{contact_id}",
    response={200: ContactOut, custom_codes_4xx: Message},
    tags=CONTACT_TAGS,
    description="""Retrieves the details of a specific contact by its ID. The endpoint checks if the current user is authorized to access the contact.
    Industry users can only access contacts that are associated with their own operator. If an unauthorized user attempts to access the contact, an error is raised.""",
)
@authorize(AppRole.get_all_authorized_app_roles(), UserOperator.get_all_industry_user_operator_roles())
@handle_http_errors()
def get_contact(request: HttpRequest, contact_id: int) -> Tuple[Literal[200], Optional[Contact]]:
    return 200, ContactService.get_if_authorized(get_current_user_guid(request), contact_id)


@router.put(
    "/contacts/{contact_id}",
    response={200: ContactOut, custom_codes_4xx: Message},
    tags=CONTACT_TAGS,
    description="""Updates the details of a specific contact by its ID. The endpoint checks if the current user is authorized to access the contact.""",
)
@authorize(["industry_user"], ["admin"])
@handle_http_errors()
def update_contact(request: HttpRequest, contact_id: int, payload: ContactIn) -> Tuple[Literal[200], Contact]:
    return 200, ContactService.update_contact(get_current_user_guid(request), contact_id, payload)
