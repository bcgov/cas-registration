from typing import Literal

from common.api.utils import get_current_user_guid
from common.permissions import authorize
from common.service.error_service.custom_codes_4xx import custom_codes_4xx
from django.db.models import QuerySet
from django.http import HttpRequest
from ninja import Query
from ninja.pagination import paginate
from registration.api.router import router
from registration.constants import CONTACT_TAGS
from registration.models.contact import Contact
from registration.schema import (
    ContactFilterSchema,
    ContactIn,
    ContactListOut,
    ContactOut,
    Message,
)
from registration.service.contact_service import ContactService
from registration.service.data_access_service.user_operator_service import (
    UserDataAccessService,
)
from registration.utils import CustomPagination


@router.get(
    "/contacts",
    response={200: list[ContactListOut], custom_codes_4xx: Message},
    tags=CONTACT_TAGS,
    description="""Retrieves a paginated list of contacts based on the provided filters.
    The endpoint allows authorized users to view and sort contacts associated to an operator filtered by various criteria such as first name, last name and email.""",
    auth=authorize("approved_authorized_roles"),
)
@paginate(CustomPagination)
def list_contacts(
    request: HttpRequest,
    filters: ContactFilterSchema = Query(...),
    sort_field: str | None = "created_at",
    sort_order: Literal["desc", "asc"] | None = "desc",
    paginate_result: bool = Query(True, description="Whether to paginate the results"),
) -> QuerySet[Contact]:
    # NOTE: PageNumberPagination raises an error if we pass the response as a tuple (like 200, ...)
    return ContactService.list_contacts(
        get_current_user_guid(request), sort_field, sort_order, filters
    )


@router.get(
    "/contact",
    response={200: int | None, custom_codes_4xx: Message},
    tags=CONTACT_TAGS,
    description="""Retrieves the contact ID for the corresponding external user.""",
    auth=authorize("industry_user"),
)
def get_contact_id_for_current_user(request: HttpRequest) -> int | None:
    user_guid = get_current_user_guid(request)
    user = UserDataAccessService.get_by_guid(user_guid)
    if not user.user_operators.exists():
        return None
    contact_id = ContactService.get_contact_id_for_user(user_guid)
    return contact_id if contact_id else None


#### POST #####
@router.post(
    "/contacts",
    response={201: ContactOut, custom_codes_4xx: Message},
    tags=CONTACT_TAGS,
    description="""Creates a new contact for the current user and associate it to the operator the user is associated with.""",
    auth=authorize("approved_industry_user"),
)
def create_contact(
    request: HttpRequest, payload: ContactIn
) -> tuple[Literal[201], Contact]:
    return 201, ContactService.create_contact(get_current_user_guid(request), payload)
