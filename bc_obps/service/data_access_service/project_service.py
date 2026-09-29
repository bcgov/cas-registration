from typing import List
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
    # TODO: finish this method
    def create_project(cls, project_data) -> Project:
        Project.objects.create(project_data)