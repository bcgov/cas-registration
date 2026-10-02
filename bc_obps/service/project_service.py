from datetime import date
from typing import Optional
from uuid import UUID

from django.db.models import QuerySet
from ninja import Query
from ninja.types import DictStrAny
from dataclasses import dataclass
from django.db import transaction

from registry.models.project import Project
from registry.schema.project import ProjectFilterSchema
from service.data_access_service.project_service import ProjectDataAccessService

@dataclass
class ProjectData:
    name: str
    project_type: str
    category: str
    project_start_date: Optional[date]
    project_end_date: Optional[date]
    description: Optional[str]
    status: str
    operation_id: UUID
    contact_id: int
    address_id: int
    account_id: int
    program_id: int
    verifier_id: UUID

class ProjectService:
    @classmethod
    def list_projects(cls, sort_field: Optional[str], sort_order: Optional[str], filters: ProjectFilterSchema = Query(...),) -> QuerySet[Project]:
        sort_direction = "-" if sort_order == "desc" else ""
        sort_by = f"{sort_direction}{sort_field or 'name'}"
        base_qs = ProjectDataAccessService.get_all_projects()

        for project in base_qs:
            print(project.__dict__)

        return filters.filter(base_qs).order_by(sort_by)

    @classmethod
    @transaction.atomic()
    def create_project(cls, user_guid: UUID, project_data: ProjectData | DictStrAny) -> Project:
        return ProjectDataAccessService.create_project(user_guid, project_data)
