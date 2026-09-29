from typing import List, Literal, Optional
from django.http import HttpRequest
from registry.schema.project import ProjectOut, ProjectFilterSchema
from registry.models import Project
from registration.schema import Message
from registry.api.router import router
from service.error_service.custom_codes_4xx import custom_codes_4xx
from common.permissions import authorize
from django.db.models import QuerySet
from ninja.pagination import paginate
from ninja import Query
from registration.utils import CustomPagination

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
    