from typing import List, Literal, Optional, Tuple
from common.permissions import authorize
from django.http import HttpRequest
from registration.schema import ContactFilterSchemaV2, ContactListOut, ContactIn, ContactOut, Message
from registration.utils import CustomPagination
from registration.constants import CONTACT_TAGS
from ninja.pagination import paginate
from common.api.utils import get_current_user_guid
from registration.models.contact import Contact
from service.contact_service import ContactService
from registration.api.router import router
from service.error_service.custom_codes_4xx import custom_codes_4xx
from ninja import Query
from django.db.models import QuerySet


@router.get(
    "/contacts",
    response={200: List[ContactListOut], custom_codes_4xx: Message},
    tags=CONTACT_TAGS,
    description="""Retrieves a paginated list of contacts based on the provided filters.
    The endpoint allows authorized users to view and sort contacts associated to an operator filtered by various criteria such as first name, last name and email.""",
    auth=authorize("approved_authorized_roles"),
)
@paginate(CustomPagination)
def list_contacts(
    request: HttpRequest,
    filters: ContactFilterSchemaV2 = Query(...),
    sort_field: Optional[str] = "created_at",
    sort_order: Optional[Literal["desc", "asc"]] = "desc",
    paginate_result: bool = Query(True, description="Whether to paginate the results"),
) -> QuerySet[Contact]:
    # NOTE: PageNumberPagination raises an error if we pass the response as a tuple (like 200, ...)
    return ContactService.list_contacts(get_current_user_guid(request), sort_field, sort_order, filters)


#### POST #####
@router.post(
    "/contacts",
    response={201: ContactOut, custom_codes_4xx: Message},
    tags=CONTACT_TAGS,
    description="""Creates a new contact for the current user and associate it to the operator the user is associated with.""",
    auth=authorize("approved_industry_user"),
)
def create_contact(request: HttpRequest, payload: ContactIn) -> Tuple[Literal[201], Contact]:
    return 201, ContactService.create_contact(get_current_user_guid(request), payload)
