from uuid import UUID

from django.db.models import QuerySet
from ninja.types import DictStrAny

from registry.models import Project
from service.data_access_service.unit_service import UnitDataAccessService


class ProjectDataAccessService:
    @classmethod
    def get_by_id(cls, project_id: int) -> Project:
        return UnitDataAccessService.with_unit_quantities(
            Project.objects.filter(id=project_id), "unit"
        ).get()

    @classmethod
    def get_all_projects(cls) -> QuerySet[Project]:
        return UnitDataAccessService.with_unit_quantities(Project.objects.select_related("account").all(), "unit")

    @classmethod
    def create_project(cls, user_guid: UUID, project_data: DictStrAny) -> Project:
        return Project.objects.create(
            **project_data,
            created_by_id=user_guid,
        )