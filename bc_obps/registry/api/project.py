from typing import List, Literal, Optional, Tuple

from common.api.utils import get_current_user_guid
from common.permissions import authorize
from django.db.models import QuerySet
from django.http import HttpRequest
from ninja import Query
from ninja.pagination import paginate
from ninja.types import DictStrAny

from registration.schema import Message
from registration.utils import CustomPagination
from registry.api.router import router
from registry.models import Project
from registry.schema.project import ProjectOut, ProjectFilterSchema
from service.error_service.custom_codes_4xx import custom_codes_4xx
from service.project_service import ProjectService


@router.get(
    "/projects",
    response={200: List[ProjectOut], custom_codes_4xx: Message},
    auth=authorize("approved_authorized_roles"),
)
@paginate(CustomPagination)
def list_projects(
    request: HttpRequest,
    filters: ProjectFilterSchema = Query(...),
    sort_order: Optional[Literal["desc", "asc"]] = "desc",
    sort_field: Optional[str] = None,
) -> QuerySet[Project]:
    return ProjectService.list_projects(sort_field, sort_order, filters)


@router.post(
    "/projects",
    response={201: ProjectOut, custom_codes_4xx: Message},
    auth=authorize("approved_authorized_roles"),
)
def create_project(request: HttpRequest, payload: DictStrAny) -> Tuple[Literal[201], Project]:
    return 201, ProjectService.create_project(get_current_user_guid(request), payload)
