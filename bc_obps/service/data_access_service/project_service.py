from typing import List
from uuid import UUID

from ninja.types import DictStrAny

from registry.models import Project


class ProjectDataAccessService:
    # TODO: add prefetch_related to GET methods
    @classmethod
    def get_by_id(cls, project_id: int) -> Project:
        return Project.objects.get(id=project_id)

    @classmethod
    def get_all_projects(cls) -> List[Project]:
        return Project.objects.all()

    @classmethod
    def create_project(cls, user_guid: UUID, project_data: DictStrAny) -> Project:
        return Project.objects.create(
            **project_data,
            created_by_id=user_guid,
        )