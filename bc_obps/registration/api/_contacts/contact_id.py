from typing import Literal, Optional, Tuple
from common.permissions import authorize
from django.http import HttpRequest
from registration.constants import CONTACT_TAGS
from registration.models.contact import Contact
from registration.schema import ContactIn, ContactOut, Message
from common.api.utils import get_current_user_guid
from registration.api.router import router
from service.contact_service import ContactService
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.schema import ContactWithPlacesAssigned


@router.get(
    "/contacts/{contact_id}",
    response={200: ContactWithPlacesAssigned, custom_codes_4xx: Message},
    tags=CONTACT_TAGS,
    description="""Retrieves the details of a specific contact by its ID. The endpoint checks if the current user is authorized to access the contact.
    Industry users can only access contacts that are associated with their own operator. If an unauthorized user attempts to access the contact, an error is raised.""",
    exclude_none=True,  # To exclude None values from the response(used for address fields)
    auth=authorize("approved_authorized_roles"),
)
def get_contact(request: HttpRequest, contact_id: int) -> Tuple[Literal[200], Optional[ContactWithPlacesAssigned]]:
    return 200, ContactService.get_with_places_assigned(contact_id)


@router.put(
    "/contacts/{contact_id}",
    response={200: ContactOut, custom_codes_4xx: Message},
    tags=CONTACT_TAGS,
    description="""Updates the details of a specific contact by its ID. The endpoint checks if the current user is authorized to access the contact.""",
    auth=authorize("approved_industry_user"),
)
def update_contact(request: HttpRequest, contact_id: int, payload: ContactIn) -> Tuple[Literal[200], Contact]:
    return 200, ContactService.update_contact(get_current_user_guid(request), contact_id, payload)
