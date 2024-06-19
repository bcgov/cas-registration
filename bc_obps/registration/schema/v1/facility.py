from typing import Optional
from ninja import FilterSchema, ModelSchema, Field
from registration.models import Facility


class FacilityListOut(ModelSchema):
    class Config:
        model = Facility
        model_fields = ['id', 'name', 'type', 'bcghg_id']


class FacilityFilterSchema(FilterSchema):
    # NOTE: we could simply use the `q` parameter to filter by name and ... but,
    # due to this issue: https://github.com/vitalik/django-ninja/issues/1037 mypy is unhappy so I'm using the `json_schema_extra` parameter
    # If we want to achieve more by using the `q` parameter, we should use it and ignore the mypy error
    bcghg_id: Optional[str] = Field(None, json_schema_extra={'q': 'bcghg_id__icontains'})
    name: Optional[str] = Field(None, json_schema_extra={'q': 'name__icontains'})
    type: Optional[Facility.Types] = Field(None, json_schema_extra={'q': 'type'})
