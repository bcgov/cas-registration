from typing import List, Literal, Optional
from django.http import HttpRequest
from registration.constants import CONTACT_TAGS
from registration.models.app_role import AppRole
from ninja.pagination import paginate, PageNumberPagination
from registration.api.utils.current_user_utils import get_current_user_guid
from registration.decorators import authorize, handle_http_errors
from registration.models.contact import Contact
from registration.schema.v1.contact import ContactFilterSchema, ContactListOut
from service.contact_service import ContactService
from ..router import router
from service.error_service.custom_codes_4xx import custom_codes_4xx
from ninja import Query
from django.db.models import QuerySet
from registration.models import UserOperator
from registration.schema.generic import Message


@router.get(
    "/contacts",
    response={200: List[ContactListOut], custom_codes_4xx: Message},
    tags=CONTACT_TAGS,
    description="""Retrieves a paginated list of facilities based on the provided filters.
    The endpoint allows authorized users to view and sort facilities associated to an operation filtered by various criteria such as facility name, type, and bcghg_id.""",
)
@authorize(AppRole.get_all_authorized_app_roles(), UserOperator.get_all_industry_user_operator_roles())
@handle_http_errors()
@paginate(PageNumberPagination)
def list_contacts(
    request: HttpRequest,
    filters: ContactFilterSchema = Query(...),
    sort_field: Optional[str] = "created_at",
    sort_order: Optional[Literal["desc", "asc"]] = "desc",
) -> QuerySet[Contact]:
    # NOTE: PageNumberPagination raises an error if we pass the response as a tuple (like 200, ...)
    return ContactService.list_contacts(get_current_user_guid(request), sort_field, sort_order, filters)
