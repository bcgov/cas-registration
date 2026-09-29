from typing import Annotated
from uuid import UUID

from common.constants import AUDIT_FIELDS
from ninja import Field, FilterSchema, ModelSchema
from registry.models.project import Project

class ProjectOut(ModelSchema):
    id: int

    class Meta:
        model = Project
        exclude = [*AUDIT_FIELDS]

class ProjectFilterSchema(FilterSchema):
    name: Annotated[str | None, Field(q='name__icontains')] = None
    status: Annotated[str | None, Field(q='status')] = None
    project_type: Annotated[str | None, Field(q='project_type')] = None
    category: Annotated[str | None, Field(q='category')] = None
    operation: Annotated[UUID | None, Field(q='operation_id')] = None
    program: Annotated[int | None, Field(q='program_id')] = None