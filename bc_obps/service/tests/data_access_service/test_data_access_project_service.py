import pytest
from model_bakery import baker

from registry.models import Issuance, Project, Unit
from service.data_access_service.project_service import ProjectDataAccessService

pytestmark = pytest.mark.django_db


def test_project_getters_include_unit_quantities():
    project = baker.make(Project)
    project_without_units = baker.make(Project)
    issuance = baker.make(Issuance, project=project)
    baker.make(Unit, project=project, issuance=issuance, status=Unit.Status.ISSUED, quantity=7)
    baker.make(Unit, project=project, issuance=issuance, status=Unit.Status.ACTIVE, quantity=4)
    baker.make(Unit, project=project, issuance=issuance, status=Unit.Status.RETIRED, quantity=3)
    baker.make(Unit, project=project, issuance=issuance, status=Unit.Status.CANCELLED, quantity=2)

    project_with_totals = ProjectDataAccessService.get_by_id(project.id)
    assert project_with_totals.issued_quantity == 7
    assert project_with_totals.active_quantity == 4
    assert project_with_totals.retired_quantity == 3

    all_projects = {item.id: item for item in ProjectDataAccessService.get_all_projects()}
    assert all_projects[project.id].issued_quantity == 7
    assert all_projects[project.id].active_quantity == 4
    assert all_projects[project.id].retired_quantity == 3
    assert all_projects[project_without_units.id].issued_quantity == 0
    assert all_projects[project_without_units.id].active_quantity == 0
    assert all_projects[project_without_units.id].retired_quantity == 0
